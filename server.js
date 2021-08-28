'use strict';

const express = require('express');
const path = require('path');
const fs = require('fs');
// Helper method for generating unique ids
const uuid = require('./helpers/uuid');

// EXPRESS APP SETUP
const app = express();
const PORT = process.env.PORT || 3006;

let notesData = require('./db/db.json');

// Middleware for parsing JSON and urlencoded form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static('public'));

// GET Route for Loading Page
app.get('/', async (req, res) => {
  const user = await path.join(__dirname, 'public/index.html');
  res.sendFile(user);
});

// GET Route for Notes Page
app.get('/notes', async (req, res) => {
  const user = await path.join(__dirname, 'public/notes.html');
  res.sendFile(user);
});

app.get('/api/notes', async (req, res) => {
  const user = await fs.readFileSync('./db/db.json');
  res.send(user);
});

// POST Route for a new UX/UI note
app.post('/api/notes', async (req, res) => {
  // Log that a POST request was received
  console.info(`${req.method} request received to submit note`);

  const { title, text, textSnip, date } = await req.body;

  if (req.body) {
    const newNote = {
      title,
      text,
      textSnip,
      date,
      id: uuid(),
    };

    notesData.push(newNote);
    fs.writeFileSync('./db/db.json', JSON.stringify(notesData));

    const response = {
      status: 'success',
      body: newNote,
    };

    res.json(response);
  } else {
    res.error('Error in adding Note');
  }
});

// DELETE Route for a specific note
app.delete('/api/notes/:id', async (req, res) => {
  console.info(`${req.method} request received to delete note`);
  const noteId = await req.params.id;
  const newArray = await notesData.filter((data) => data.id != noteId);
  notesData = newArray;
  fs.writeFileSync('./db/db.json', JSON.stringify(newArray));

  const response = {
    status: 'success',
    body: newArray,
  };

  res.json(response);
});

// To Start Our App On PORT
app.listen(PORT, () => console.log(`App listening at http://localhost:${PORT} 🚀`));
