const request = require('supertest');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Mock do arquivo de notas
const TEST_NOTES_FILE = path.join(__dirname, 'test-notes.json');

// Criar app de teste
const createTestApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const NOTES_FILE = TEST_NOTES_FILE;

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

  return app;
};

describe('Daily Notes API', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
    // Limpar arquivo de teste
    if (fs.existsSync(TEST_NOTES_FILE)) {
      fs.unlinkSync(TEST_NOTES_FILE);
    }
  });

  afterEach(() => {
    // Limpar arquivo de teste após cada teste
    if (fs.existsSync(TEST_NOTES_FILE)) {
      fs.unlinkSync(TEST_NOTES_FILE);
    }
  });

  describe('GET /api/notes', () => {
    it('deve retornar array vazio inicialmente', async () => {
      const res = await request(app).get('/api/notes');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    it('deve retornar todas as notas', async () => {
      // Adicionar duas notas
      await request(app).post('/api/notes').send({
        text: 'Tarefa 1',
        priority: 'high'
      });

      await request(app).post('/api/notes').send({
        text: 'Tarefa 2',
        priority: 'normal'
      });

      const res = await request(app).get('/api/notes');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0].text).toBe('Tarefa 1');
      expect(res.body[1].text).toBe('Tarefa 2');
    });
  });

  describe('POST /api/notes', () => {
    it('deve adicionar uma nova nota com sucesso', async () => {
      const res = await request(app).post('/api/notes').send({
        text: 'Minha primeira nota',
        priority: 'high'
      });

      expect(res.status).toBe(201);
      expect(res.body.text).toBe('Minha primeira nota');
      expect(res.body.priority).toBe('high');
      expect(res.body.completed).toBe(false);
      expect(res.body.id).toBeDefined();
    });

    it('deve usar prioridade "normal" como padrão', async () => {
      const res = await request(app).post('/api/notes').send({
        text: 'Nota sem prioridade'
      });

      expect(res.status).toBe(201);
      expect(res.body.priority).toBe('normal');
    });

    it('deve retornar erro se texto estiver vazio', async () => {
      const res = await request(app).post('/api/notes').send({
        text: '',
        priority: 'high'
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Texto não pode estar vazio');
    });

    it('deve retornar erro se texto não for fornecido', async () => {
      const res = await request(app).post('/api/notes').send({
        priority: 'high'
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Texto não pode estar vazio');
    });

    it('deve remover espaços em branco', async () => {
      const res = await request(app).post('/api/notes').send({
        text: '  Nota com espaços  '
      });

      expect(res.status).toBe(201);
      expect(res.body.text).toBe('Nota com espaços');
    });
  });

  describe('PUT /api/notes/:id', () => {
    it('deve marcar nota como concluída', async () => {
      const createRes = await request(app).post('/api/notes').send({
        text: 'Tarefa para completar'
      });

      const id = createRes.body.id;

      const updateRes = await request(app).put(`/api/notes/${id}`).send({
        completed: true
      });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.completed).toBe(true);
      expect(updateRes.body.text).toBe('Tarefa para completar');
    });

    it('deve atualizar prioridade', async () => {
      const createRes = await request(app).post('/api/notes').send({
        text: 'Tarefa',
        priority: 'normal'
      });

      const id = createRes.body.id;

      const updateRes = await request(app).put(`/api/notes/${id}`).send({
        priority: 'high'
      });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.priority).toBe('high');
    });

    it('deve retornar erro se nota não existir', async () => {
      const res = await request(app).put('/api/notes/99999').send({
        completed: true
      });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Nota não encontrada');
    });

    it('deve atualizar múltiplos campos', async () => {
      const createRes = await request(app).post('/api/notes').send({
        text: 'Tarefa original',
        priority: 'low'
      });

      const id = createRes.body.id;

      const updateRes = await request(app).put(`/api/notes/${id}`).send({
        completed: true,
        priority: 'high'
      });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.completed).toBe(true);
      expect(updateRes.body.priority).toBe('high');
    });
  });

  describe('DELETE /api/notes/:id', () => {
    it('deve deletar uma nota', async () => {
      const createRes = await request(app).post('/api/notes').send({
        text: 'Nota para deletar'
      });

      const id = createRes.body.id;

      const deleteRes = await request(app).delete(`/api/notes/${id}`);
      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.message).toBe('Nota deletada');

      const listRes = await request(app).get('/api/notes');
      expect(listRes.body.length).toBe(0);
    });

    it('deve manter outras notas ao deletar uma', async () => {
      const note1 = await request(app).post('/api/notes').send({ text: 'Nota 1' });
      const note2 = await request(app).post('/api/notes').send({ text: 'Nota 2' });
      const note3 = await request(app).post('/api/notes').send({ text: 'Nota 3' });

      await request(app).delete(`/api/notes/${note2.body.id}`);

      const listRes = await request(app).get('/api/notes');
      expect(listRes.body.length).toBe(2);
      expect(listRes.body[0].text).toBe('Nota 1');
      expect(listRes.body[1].text).toBe('Nota 3');
    });
  });
});
