const express = require('express');
const morgan = require('morgan');
let persons = require('./data.json');

const app = express();
const PORT = 3001;

app.use(express.json());

morgan.token('data', function (req, res) {
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

app.get('/api/persons', (req, res) => {
  return res.json({ persons });
});

app.get('/api/persons/:id', (req, res) => {
  const id = +req.params.id;
  const personInfo = persons.find((person) => person.id === id);

  if (!personInfo) {
    return res.status(404).json({
      error: `Person with id ${id} was not found`,
    });
  }

  res.json(personInfo);
});

app.get('/api/info', (req, res) => {
  const peopleNumber = persons.length;
  const timestamp = new Date().toUTCString();

  return res.send(`
    <div>
      <p>This phonebook has currently the info of ${peopleNumber} people </p>
      <br />
      <p>${timestamp}</p>
    </div>
    `);
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

  const personExists = persons.find(
    (person) => String(person.name) === String(req.body.name)
  );

  if (personExists) {
    return res.status(400).json({
      error: 'The person name already exists',
    });
  }

  const id = Math.floor(Math.random() * (100000 - 1) + 1);

  const person = {
    id: id,
    name: req.body.name,
    number: req.body.number,
  };

  persons = persons.concat(person);

  return res.status(201).json({
    message: 'Person created correctly',
    person: person,
  });
});

app.delete('/api/persons/:id', (req, res) => {
  const id = +req.params.id;

  persons = persons.filter((person) => person.id !== id);

  return res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
