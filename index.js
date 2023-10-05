require('dotenv').config()
const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
const Phonebook = require('./models/phonebook');

app.use(cors())
app.use(morgan('tiny'));
app.use(express.static('build'))
app.use(express.json())

// Connect to your MongoDB database using the provided URI in .env
const url = process.env.MONGODB_URI;

console.log('connecting to', url);

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connection to MongoDB is open...');
});

// GET persons
app.get('/api/persons', (req, res) => {
  Phonebook.find({})
    .then((persons) => {
      res.json(persons);
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

// GET persons by id
app.get('/api/persons/:id', (req, res, next) => {
  const id = req.params.id;

  Phonebook.findById(id)
    .then((person) => {
      if (!person) {
        return res.status(404).json({ error: 'Person not found' });
      }
      res.json(person);
    })
    .catch(error => next(error))
});

// DELETE Persons
app.delete('/api/persons/:id', (req, res) => {
  const id = req.params.id;

  Phonebook.findByIdAndRemove(id)
    .then((deletedPerson) => {
      if (!deletedPerson) {
        return res.status(404).json({ error: 'Person not found' });
      }
      res.status(204).end();
    })
    .catch((error) => {
      console.error('Error deleting data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

// PUT
app.put('/api/persons/:id', (req, res) => {
  const id = req.params.id;
  const updatedPerson = req.body;

  Phonebook.findByIdAndUpdate(id, updatedPerson, { new: true })
    .then((person) => {
      if (!person) {
        return res.status(404).json({ error: 'Person not found' });
      }
      res.json(person);
    })
    .catch((error) => {
      console.error('Error updating data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error.message);
  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  next(error);
});

app.post('/api/persons', (req, res, next) => {
  const body = req.body;

  if (!body.name || !body.phonenumber) {
    return res.status(400).json({
      error: 'Name or phonenumber is missing',
    });
  }

  const person = new Phonebook({
    name: body.name,
    phonenumber: body.phonenumber,
  });

  person
    .save()
    .then((savedPerson) => {
      console.log(`Added ${savedPerson.name} number ${savedPerson.phonenumber} to phonebook.`);
      res.json(savedPerson);
    })
    .catch((error) => next(error));
});

app.get('/info', (req, res) => {
  Phonebook.countDocuments({})
    .then((personCount) => {
      const currentTime = new Date().toString();
      res.send(`
        <div style="background-color: navy; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
          <h2 style="color: fuchsia;">Phonebook has info for ${personCount} people</h2>
          <span style="font-size: 1.4rem; color: green; background-color: black;">Today is: ${currentTime}</span>
        </div>
      `);
    })
    .catch((error) => next(error));
});


// Define a middleware to handle unknown endpoints
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Define a middleware to handle errors
app.use((error, req, res, next) => {
  console.error('Error:', error.message);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});