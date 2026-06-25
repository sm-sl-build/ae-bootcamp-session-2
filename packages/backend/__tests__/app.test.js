const request = require('supertest');
const { app, db } = require('../src/app');

afterAll(() => {
  if (db) {
    db.close();
  }
});

const createItem = async (title = 'Temp Task') => {
  const response = await request(app)
    .post('/api/items')
    .send({ title })
    .set('Accept', 'application/json');

  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('id');
  return response.body;
};

describe('API Endpoints', () => {
  describe('GET /api/items', () => {
    it('should return all tasks with task metadata', async () => {
      const response = await request(app).get('/api/items');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      const task = response.body[0];
      expect(task).toHaveProperty('id');
      expect(task).toHaveProperty('title');
      expect(task).toHaveProperty('completed');
      expect(task).toHaveProperty('created_at');
    });
  });

  describe('POST /api/items', () => {
    it('should create a new task with a due date', async () => {
      const newTask = { title: 'Test Task', dueDate: '2026-06-30' };
      const response = await request(app)
        .post('/api/items')
        .send(newTask)
        .set('Accept', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(newTask.title);
      expect(response.body.due_date).toBe(newTask.dueDate);
      expect(response.body.completed).toBe(false);
    });

    it('should return 400 if title is missing', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({})
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Task title is required');
    });
  });

  describe('PUT /api/items/:id', () => {
    it('should update an existing task', async () => {
      const task = await createItem('Task to Update');

      const response = await request(app)
        .put(`/api/items/${task.id}`)
        .send({ title: 'Updated Task', completed: true, dueDate: '2026-07-01' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated Task');
      expect(response.body.completed).toBe(true);
      expect(response.body.due_date).toBe('2026-07-01');
    });
  });

  describe('DELETE /api/items/:id', () => {
    it('should delete an existing task', async () => {
      const task = await createItem('Task To Be Deleted');

      const deleteResponse = await request(app).delete(`/api/items/${task.id}`);
      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body).toEqual({ message: 'Task deleted successfully', id: task.id });

      const deleteAgain = await request(app).delete(`/api/items/${task.id}`);
      expect(deleteAgain.status).toBe(404);
      expect(deleteAgain.body).toHaveProperty('error', 'Task not found');
    });
  });
});