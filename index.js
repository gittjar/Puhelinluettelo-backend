const express = require('express')
const app = express()
const morgan = require('morgan');
const cors = require('cors')

app.use(cors())

// Use the "tiny" format for logging
app.use(morgan('tiny'));

app.use(express.json())




let persons = [
  {
    id: 1,
    name: "Arto Fellas",
    puhelin: "040-1234567"
  },
  {
    id: 2,
    name: "Ada Lovelace",
    puhelin: "03-903490"
  },
  {
    id: 3,
    name: "Jack Sparrow",
    puhelin: "044-1234567"
  },
  {
    id: 4,
    name: "Mikko Mallikas",
    puhelin: "0500-6667770"
  }
]

app.get('/', (req, res) => {
    res.send('<h1>Puhelinluettelo Backend</h1>')
  })
  
  app.get('/api/persons', (req, res) => {
    res.json(persons)
  })

  /*persons by id*/
  app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
  })

  /* delete person by id */
  app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
  
    response.status(204).end()
  })


    /* generates +1 id number above */
    const generateId = () => {
        const maxId = persons.length > 0
          ? Math.max(...persons.map(n => n.id))
          : 0
        return maxId + 1
      }

  app.post('/api/persons', (request, response) => {
    const body = request.body;
  
    if (!body.name) {
      return response.status(400).json({
        error: 'Name is missing',
      });
    }
  
    if (!body.phonenumber) {
      return response.status(400).json({
        error: 'Phonenumber is missing',
      });
    }
  
    const nameExists = persons.some((person) => person.name === body.name);
    if (nameExists) {
      return response.status(400).json({
        error: 'Name already exists in the list',
      });
    }
  
    const person = {
      name: body.name,
      phonenumber: body.phonenumber,
      id: generateId(),
    };

    // Log the POST data using Morgan
    console.log('Received POST request data:', request.body);
  
    persons = persons.concat(person);
    response.json(person);
  });
  

  /*Information of count of persons and local time*/
  app.get('/info', (req, res) => {
    const personCount = persons.length;
    const currentTime = new Date().toString();
  
    res.send(`
      <p>Phonebook has info for ${personCount} people</p>
      <p>${currentTime}</p>
    `);
  });
  

  // const PORT = 3001
  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })