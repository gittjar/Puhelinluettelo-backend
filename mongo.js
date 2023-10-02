// npm i mongoose
const mongoose = require('mongoose');

if (process.argv.length < 3) {
  console.log('Usage: node mongo.js <password> "Etunimi Sukunimi" 000-0000000');
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://fullstack:${password}@cluster0.gegyszb.mongodb.net/PhonebookApp?retryWrites=true&w=majority`;

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

const phonebookSchema = new mongoose.Schema({
  name: String,
  puhelin: String,
});

const Phonebook = mongoose.model('Phonebook', phonebookSchema);

if (process.argv.length === 3) {
  // If only password is provided, print all phonebook entries
  Phonebook.find({}).then((result) => {
    console.log('Phonebook entries:');
    result.forEach((entry) => {
      console.log(entry.name, entry.puhelin);
    });
    mongoose.connection.close();
  });
} else if (process.argv.length === 5) {
  // If password, name, and phone are provided, add a new entry
  const name = process.argv[3];
  const puhelin = process.argv[4];

  const phonebook = new Phonebook({
    name,
    puhelin,
  });

  phonebook.save().then(() => {
    console.log(`Added ${name} number ${puhelin} to phonebook.`);
    mongoose.connection.close();
  });
} else {
  console.log('Invalid number of arguments.');
  mongoose.connection.close();
}
