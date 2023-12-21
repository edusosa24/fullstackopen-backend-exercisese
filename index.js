const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const Person = require('./src/database/models/person');
const { errorHandler } = require('./src/utils/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.static('build'));
app.use(express.json());
app.use(cors());

morgan.token('data', function (req) {
  if (Object.keys(req.body).length === 0) {
    return null;
  }
  return JSON.stringify(req.body);
});

app.use(
  morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'),
      '-',
      tokens['response-time'](req, res),
      'ms',
      tokens.data(req, res),
    ].join(' ');
  })
);

const dbConnection = () => {
  const mongoURL = process.env.MONGO_URI;
  mongoose.set('strictQuery', false);
  console.log('connecting to', mongoURL);

  mongoose
    .connect(mongoURL)
    .then(() => {
      console.log('connected to MongoDB');
    })
    .catch((error) => {
      console.log('error connecting to MongoDB:', error.message);
    });
};

dbConnection();

app.get('/api/persons', (req, res, next) => {
  Person.find({})
    .then((persons) => {
      return res.json(persons);
    })
    .catch((error) => next(error));
});

app.get('/api/persons/:id', (req, res, next) => {
  const id = req.params.id;
  Person.findById(id)
    .then((person) => {
      if (!person) {
        return res.status(404).json({
          error: `Person with id ${id} was not found`,
        });
      }
      return res.json(person);
    })
    .catch((error) => next(error));
});

app.get('/api/info', (req, res) => {
  Person.find({}).then((persons) => {
    const timestamp = new Date().toUTCString();
    return res.send(`
    <div>
      <p>This phonebook has currently the info of ${persons.length} people </p>
      <br />
      <p>${timestamp}</p>
    </div>
    `);
  });
});

app.post('/api/persons', (req, res) => {
  if (!req.body.name) {
    return res.status(400).json({
      error: 'A name is required',
    });
  }

  if (!req.body.number) {
    return res.status(400).json({
      error: 'A number is required',
    });
  }

  Person.findOne({ name: req.body.name })
    .then((person) => {
      if (person !== null) {
        return res.status(400).json({
          error: 'The person name already exists',
        });
      }

      const newPerson = new Person({
        name: req.body.name,
        number: req.body.number,
      });
      newPerson.save().then(() => {
        return res.status(201).json(newPerson);
      });
    })
    .catch((error) => console.log(error.message));
});

app.delete('/api/persons/:id', (req, res) => {
  const id = req.params.id;

  Person.findByIdAndDelete(id)
    .then(() => {
      return res.status(204).send();
    })
    .catch((error) => console.log(error.message));
});

app.put('/api/persons/:id', (req, res) => {
  const id = req.params.id;

  if (!req.body.number) {
    return res.status(400).json({ error: 'A number is required.' });
  }

  Person.findByIdAndUpdate(id, { number: req.body.number }, { new: true })
    .then((response) => {
      return res.status(200).json(response);
    })
    .catch((error) => console.log(error.message));
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
