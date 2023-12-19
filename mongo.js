const mongoose = require('mongoose');

if (process.argv.length < 3) {
  console.log('give password as argument');
  process.exit(1);
}

const password = process.argv[2];
const mongoURL = `mongodb+srv://fullstack-edu:${password}@fullstackopen-dbs.lkau9pm.mongodb.net/phonebook?retryWrites=true&w=majority`;

mongoose.set('strictQuery', false);
mongoose.connect(mongoURL);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = new mongoose.model('Person', personSchema);

if (process.argv.length === 5) {
  const tempPerson = new Person({
    name: process.argv[3],
    number: process.argv[4],
  });

  tempPerson.save().then((result) => {
    console.log('Person saved!');
    mongoose.connection.close();
  });
} else {
  Person.find({}).then((result) => {
    result.forEach((person) => {
      console.log(person);
    });
    mongoose.connection.close();
  });
}
