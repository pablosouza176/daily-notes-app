# 📋 Testes Unitários

Este diretório contém os testes unitários e de integração para o Daily Notes App.

## 📂 Estrutura

- **api.test.js** - Testes de integração dos endpoints da API
- **validation.test.js** - Testes de validação de dados

## 🚀 Executar Testes

### Rodar todos os testes
```bash
npm run test
```

### Rodar testes em modo watch (monitora mudanças)
```bash
npm run test:watch
```

### Testes com cobertura de código
Os testes automaticamente geram um relatório de cobertura em `coverage/`

## 📊 Cobertura Esperada

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## ✅ O que é testado

### API Endpoints
- ✔️ GET `/api/notes` - Listar todas as notas
- ✔️ POST `/api/notes` - Adicionar nota
- ✔️ PUT `/api/notes/:id` - Atualizar nota
- ✔️ DELETE `/api/notes/:id` - Deletar nota

### Validações
- ✔️ Texto vazio
- ✔️ Comprimento máximo
- ✔️ Prioridades válidas
- ✔️ Casos extremos

## 💡 Exemplos de Testes

```javascript
// Teste básico
it('deve retornar array vazio inicialmente', async () => {
  const res = await request(app).get('/api/notes');
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
});

// Teste com dados
it('deve adicionar uma nova nota com sucesso', async () => {
  const res = await request(app).post('/api/notes').send({
    text: 'Minha primeira nota',
    priority: 'high'
  });
  expect(res.status).toBe(201);
});
```

## 🛠️ Ferramentas Utilizadas

- **Jest** - Framework de testes
- **Supertest** - Teste de APIs HTTP
