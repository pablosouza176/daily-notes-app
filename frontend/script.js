const API_URL = 'http://localhost:3000/api';
const noteInput = document.getElementById('noteInput');
const prioritySelect = document.getElementById('prioritySelect');
const addNoteBtn = document.getElementById('addNoteBtn');
const notesList = document.getElementById('notesList');
const filterBtns = document.querySelectorAll('.filter-btn');
const themeToggle = document.getElementById('themeToggle');
const toast = document.getElementById('toast');

let notes = [];
let currentFilter = 'all';

// Dark Mode - Carregar preferência salva
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark-mode');
    updateThemeIcon();
  }
}

// Toggle Dark Mode
themeToggle.addEventListener('click', () => {
  document.documentElement.classList.toggle('dark-mode');
  const isDark = document.documentElement.classList.contains('dark-mode');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  updateThemeIcon();
});

function updateThemeIcon() {
  const isDark = document.documentElement.classList.contains('dark-mode');
  themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

// Event Listeners
addNoteBtn.addEventListener('click', addNote);

noteInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && e.ctrlKey) {
    e.preventDefault();
    addNote();
  }
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderNotes();
  });
});

// Atalhos de teclado
document.addEventListener('keydown', (e) => {
  // Ctrl+D para marcar primeira nota como concluída
  if (e.ctrlKey && e.key === 'd') {
    e.preventDefault();
    const firstIncompleteNote = notes.find(n => !n.completed);
    if (firstIncompleteNote) {
      toggleNote(firstIncompleteNote.id);
    }
  }
});

// Funções
async function addNote() {
  const text = noteInput.value.trim();
  if (!text) {
    showToast('Digite algo antes de adicionar!', 'error');
    return;
  }

  const priority = prioritySelect.value;

  try {
    const response = await fetch(`${API_URL}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, priority })
    });

    if (response.ok) {
      noteInput.value = '';
      prioritySelect.value = 'normal';
      await loadNotes();
      noteInput.focus();
      showToast('✨ Nota adicionada com sucesso!', 'success');
    }
  } catch (error) {
    console.error('Erro ao adicionar nota:', error);
    showToast('Erro ao adicionar nota', 'error');
  }
}

async function loadNotes() {
  try {
    const response = await fetch(`${API_URL}/notes`);
    notes = await response.json();
    renderNotes();
  } catch (error) {
    console.error('Erro ao carregar notas:', error);
    showToast('Erro ao carregar notas', 'error');
  }
}

function renderNotes() {
  notesList.innerHTML = '';

  let filteredNotes = notes;

  if (currentFilter === 'pending') {
    filteredNotes = notes.filter(n => !n.completed);
  } else if (currentFilter === 'completed') {
    filteredNotes = notes.filter(n => n.completed);
  }

  if (filteredNotes.length === 0) {
    notesList.innerHTML = `
      <p class="empty-state">
        <i class="fas fa-inbox"></i>
        <br>
        ${currentFilter === 'completed' ? 'Nenhuma tarefa concluída ainda.' : 'Nenhuma anotação aqui.'}
      </p>
    `;
    return;
  }

  filteredNotes.forEach((note) => {
    const noteEl = document.createElement('div');
    noteEl.className = `note-item ${note.priority} ${note.completed ? 'completed' : ''}`;

    const createdAt = new Date(note.createdAt).toLocaleString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    const priorityLabel = {
      high: 'Alta',
      normal: 'Normal',
      low: 'Baixa'
    }[note.priority];

    const priorityIcon = {
      high: '🔴',
      normal: '📌',
      low: '🟢'
    }[note.priority];

    noteEl.innerHTML = `
      <input 
        type="checkbox" 
        class="note-checkbox" 
        ${note.completed ? 'checked' : ''}
        onchange="toggleNote(${note.id})"
        title="Marcar como ${note.completed ? 'pendente' : 'concluída'}"
      >
      <div class="note-content">
        <div class="note-text">${escapeHtml(note.text)}</div>
        <div class="note-meta">
          <div class="note-time">
            <i class="fas fa-clock"></i>
            ${createdAt}
          </div>
          <div class="note-priority ${note.priority}">
            ${priorityIcon} ${priorityLabel}
          </div>
        </div>
      </div>
      <div class="note-actions">
        <button class="btn-icon btn-delete" onclick="deleteNote(${note.id})" title="Deletar nota">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;

    notesList.appendChild(noteEl);
  });
}

async function toggleNote(id) {
  const note = notes.find(n => n.id === id);
  if (!note) return;

  try {
    await fetch(`${API_URL}/notes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !note.completed })
    });

    await loadNotes();
    showToast(
      note.completed ? '✔️ Tarefa marcada como pendente' : '✅ Tarefa concluída!',
      'success'
    );
  } catch (error) {
    console.error('Erro ao atualizar nota:', error);
    showToast('Erro ao atualizar nota', 'error');
  }
}

async function deleteNote(id) {
  if (!confirm('Tem certeza que quer deletar? Essa ação não pode ser desfeita.')) {
    return;
  }

  try {
    await fetch(`${API_URL}/notes/${id}`, { method: 'DELETE' });
    await loadNotes();
    showToast('🗑️ Nota deletada', 'success');
  } catch (error) {
    console.error('Erro ao deletar nota:', error);
    showToast('Erro ao deletar nota', 'error');
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showToast(message, type = 'success') {
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Inicializar
initTheme();
loadNotes();
