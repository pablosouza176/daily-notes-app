# 📝 Daily Notes App

Uma aplicação web simples e prática para anotar suas demandas diárias. Sem burocracias, sem preenchimentos complexos. Perfeita para preparar sua apresentação na daily.

## 🎯 Features

- ✅ Adicionar anotações rapidamente
- 📌 Marcar prioridades (Alta, Normal, Baixa)
- ✔️ Marcar tarefas como concluídas
- 🗑️ Deletar notas
- 💾 Armazenamento persistente (JSON)
- 📱 Interface responsiva
- ⌨️ Atalho Ctrl+Enter para adicionar nota

## 🚀 Como começar

### Requisitos
- Node.js 14+ instalado

### Instalação

1. **Clone ou navegue para o projeto:**
```bash
cd daily-notes-app
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Inicie o servidor:**
```bash
npm start
```

4. **Abra no navegador:**
```
http://localhost:3000
```

### Modo desenvolvimento (com watch)
```bash
npm run dev
```

## 📂 Estrutura do Projeto

```
daily-notes-app/
├── backend/
│   ├── server.js          # API Express
│   └── notes.json         # Armazenamento (gerado automaticamente)
├── frontend/
│   ├── index.html         # Interface
│   ├── style.css          # Estilos
│   └── script.js          # Lógica do app
├── package.json
├── .gitignore
└── README.md
```

## 🎨 Como usar

1. **Abra o app** no navegador
2. **Digite sua demanda** na textarea
3. **Selecione a prioridade** (opcional)
4. **Clique "Adicionar"** ou use **Ctrl+Enter**
5. **Marque como concluída** quando terminar
6. **Delete** se não for mais necessário

## 🔌 API Endpoints

- `GET /api/notes` - Lista todas as notas
- `POST /api/notes` - Adiciona nova nota
- `PUT /api/notes/:id` - Atualiza nota (concluída/prioridade)
- `DELETE /api/notes/:id` - Deleta nota

## 📝 Exemplo de Nota

```json
{
  "id": 1714576234000,
  "text": "Revisar PR de autenticação",
  "priority": "high",
  "completed": false,
  "createdAt": "2024-05-01T10:30:34.000Z"
}
```

## 🔄 Próximos passos (opcional)

- [ ] Adicionar filtro por data
- [ ] Sincronizar com banco de dados (MongoDB/PostgreSQL)
- [ ] Autenticação de usuários
- [ ] Exportar como PDF para apresentação
- [ ] Notificações em tempo real

## 📄 Licença

MIT
