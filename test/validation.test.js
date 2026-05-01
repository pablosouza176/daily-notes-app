/**
 * Testes para validação de dados
 */

const validateNoteText = (text) => {
  if (!text || text.trim() === '') {
    return { valid: false, error: 'Texto não pode estar vazio' };
  }
  if (text.length > 500) {
    return { valid: false, error: 'Texto muito longo (máximo 500 caracteres)' };
  }
  return { valid: true };
};

const validatePriority = (priority) => {
  const validPriorities = ['low', 'normal', 'high'];
  if (!validPriorities.includes(priority)) {
    return { valid: false, error: 'Prioridade inválida' };
  }
  return { valid: true };
};

describe('Validação de Dados', () => {
  describe('validateNoteText', () => {
    it('deve aceitar texto válido', () => {
      const result = validateNoteText('Minha tarefa');
      expect(result.valid).toBe(true);
    });

    it('deve rejeitar texto vazio', () => {
      const result = validateNoteText('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Texto não pode estar vazio');
    });

    it('deve rejeitar apenas espaços', () => {
      const result = validateNoteText('   ');
      expect(result.valid).toBe(false);
    });

    it('deve rejeitar texto muito longo', () => {
      const longText = 'a'.repeat(501);
      const result = validateNoteText(longText);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Texto muito longo (máximo 500 caracteres)');
    });

    it('deve aceitar texto no limite de 500 caracteres', () => {
      const text = 'a'.repeat(500);
      const result = validateNoteText(text);
      expect(result.valid).toBe(true);
    });
  });

  describe('validatePriority', () => {
    it('deve aceitar prioridade "low"', () => {
      const result = validatePriority('low');
      expect(result.valid).toBe(true);
    });

    it('deve aceitar prioridade "normal"', () => {
      const result = validatePriority('normal');
      expect(result.valid).toBe(true);
    });

    it('deve aceitar prioridade "high"', () => {
      const result = validatePriority('high');
      expect(result.valid).toBe(true);
    });

    it('deve rejeitar prioridade inválida', () => {
      const result = validatePriority('urgente');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Prioridade inválida');
    });
  });
});
