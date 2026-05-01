const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const NOTES_FILE = path.join(__dirname, 'notes.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Funções auxiliares
function loadNotes() {
  try {
    if (fs.existsSync(NOTES_FILE)) {
      return JSON.parse(fs.readFileSync(NOTES_FILE, 'utf8'));
    }
  } catch (err) {
    console.error('Erro ao carregar notas:', err);
  }
  return [];
}

function saveNotes(notes) {
  fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2));
}

// Rotas
app.get('/api/notes', (req, res) => {
  const notes = loadNotes();
  res.json(notes);
});

app.post('/api/notes', (req, res) => {
  const { text, priority } = req.body;
  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Texto não pode estar vazio' });
  }

  const notes = loadNotes();
  const newNote = {
    id: Date.now(),
    text: text.trim(),
    priority: priority || 'normal',
    completed: false,
    createdAt: new Date().toISOString()
  };

  notes.push(newNote);
  saveNotes(notes);
  res.status(201).json(newNote);
});

app.put('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  const { completed, priority } = req.body;
  const notes = loadNotes();

  const note = notes.find(n => n.id === parseInt(id));
  if (!note) {
    return res.status(404).json({ error: 'Nota não encontrada' });
  }

  if (completed !== undefined) note.completed = completed;
  if (priority !== undefined) note.priority = priority;

  saveNotes(notes);
  res.json(note);
});

app.delete('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  let notes = loadNotes();

  notes = notes.filter(n => n.id !== parseInt(id));
  saveNotes(notes);
  res.json({ message: 'Nota deletada' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
