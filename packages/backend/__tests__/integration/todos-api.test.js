const request = require('supertest');
const { app, db } = require('../../src/app');

afterAll(() => {
  if (db) {
    db.close();
  }
});

describe('TODO API integration tests', () => {
  test('GET /api/items returns seeded tasks', async () => {
    const response = await request(app).get('/api/items');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('title');
  });

  test('POST /api/items creates a task with a due date', async () => {
    const response = await request(app)
      .post('/api/items')
      .send({ title: 'Integration task', dueDate: '2026-07-01' });

    expect(response.status).toBe(201);
    expect(response.body.title).toBe('Integration task');
    expect(response.body.due_date).toBe('2026-07-01');
    expect(response.body.completed).toBe(false);
  });

  test('PUT /api/items/:id updates an existing task', async () => {
    const createResponse = await request(app)
      .post('/api/items')
      .send({ title: 'Editable task' });

    const response = await request(app)
      .put(`/api/items/${createResponse.body.id}`)
      .send({ completed: true, title: 'Editable task updated' });

    expect(response.status).toBe(200);
    expect(response.body.completed).toBe(true);
    expect(response.body.title).toBe('Editable task updated');
  });
});
