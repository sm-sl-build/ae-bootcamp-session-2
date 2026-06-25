const { isValidTitle, isValidDueDate, normalizeTask } = require('../../src/app');

describe('Task validation helpers', () => {
  test('accepts non-empty task titles', () => {
    expect(isValidTitle('Write tests')).toBe(true);
    expect(isValidTitle('   ')).toBe(false);
    expect(isValidTitle('')).toBe(false);
    expect(isValidTitle(123)).toBe(false);
  });

  test('accepts valid due dates and rejects invalid ones', () => {
    expect(isValidDueDate('2026-06-30')).toBe(true);
    expect(isValidDueDate('')).toBe(true);
    expect(isValidDueDate(null)).toBe(true);
    expect(isValidDueDate('06-30-2026')).toBe(false);
    expect(isValidDueDate('not-a-date')).toBe(false);
  });
});

describe('normalizeTask', () => {
  test('maps database rows into API-friendly task objects', () => {
    const row = { id: 7, title: 'Ship feature', completed: 1, due_date: '2026-07-01', created_at: '2026-06-25' };

    expect(normalizeTask(row)).toEqual({
      id: 7,
      title: 'Ship feature',
      completed: true,
      due_date: '2026-07-01',
      created_at: '2026-06-25',
    });
  });
});
