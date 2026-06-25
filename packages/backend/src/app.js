const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Database = require('better-sqlite3');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const db = new Database(':memory:');

const createTables = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      due_date TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

const seedInitialTasks = () => {
  const existingTasks = db.prepare('SELECT COUNT(*) AS count FROM items').get();
  if (existingTasks.count > 0) {
    return;
  }

  const initialTasks = [
    { title: 'Review project requirements', completed: 0, due_date: '2026-06-26' },
    { title: 'Prepare implementation notes', completed: 0, due_date: null },
    { title: 'Share progress update', completed: 1, due_date: null },
  ];

  const insertStmt = db.prepare('INSERT INTO items (title, completed, due_date) VALUES (?, ?, ?)');
  initialTasks.forEach((task) => {
    insertStmt.run(task.title, task.completed, task.due_date);
  });
};

createTables();
seedInitialTasks();

const normalizeTask = (row) => ({
  id: row.id,
  title: row.title,
  completed: Boolean(row.completed),
  due_date: row.due_date,
  created_at: row.created_at,
});

const isValidTitle = (title) => typeof title === 'string' && title.trim() !== '';

const isValidDueDate = (dueDate) => {
  if (dueDate === null || dueDate === undefined || dueDate === '') {
    return true;
  }

  if (typeof dueDate !== 'string') {
    return false;
  }

  const trimmedDate = dueDate.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmedDate)) {
    return false;
  }

  const parsedDate = new Date(`${trimmedDate}T00:00:00`);
  return !Number.isNaN(parsedDate.getTime());
};

app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend server is running' });
});

app.get('/api/items', (req, res) => {
  try {
    const items = db.prepare(
      'SELECT * FROM items ORDER BY completed ASC, CASE WHEN due_date IS NULL THEN 1 ELSE 0 END, due_date ASC, created_at DESC'
    ).all();
    res.json(items.map(normalizeTask));
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

app.post('/api/items', (req, res) => {
  try {
    const { title, dueDate } = req.body;

    if (!isValidTitle(title)) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    if (!isValidDueDate(dueDate)) {
      return res.status(400).json({ error: 'Due date must be a valid YYYY-MM-DD value' });
    }

    const insertStmt = db.prepare('INSERT INTO items (title, completed, due_date) VALUES (?, ?, ?)');
    const result = insertStmt.run(title.trim(), 0, dueDate || null);
    const newTask = db.prepare('SELECT * FROM items WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(normalizeTask(newTask));
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.put('/api/items/:id', (req, res) => {
  try {
    const { id } = req.params;
    if (!id || Number.isNaN(parseInt(id, 10))) {
      return res.status(400).json({ error: 'Valid item ID is required' });
    }

    const existingTask = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const { title, completed, dueDate } = req.body;
    const nextTitle = title === undefined ? existingTask.title : title;
    const nextCompleted = completed === undefined ? existingTask.completed : completed;
    const nextDueDate = dueDate === undefined ? existingTask.due_date : dueDate || null;

    if (!isValidTitle(nextTitle)) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    if (!isValidDueDate(nextDueDate)) {
      return res.status(400).json({ error: 'Due date must be a valid YYYY-MM-DD value' });
    }

    const updateStmt = db.prepare('UPDATE items SET title = ?, completed = ?, due_date = ? WHERE id = ?');
    updateStmt.run(nextTitle.trim(), nextCompleted ? 1 : 0, nextDueDate, id);

    const updatedTask = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    res.json(normalizeTask(updatedTask));
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

app.delete('/api/items/:id', (req, res) => {
  try {
    const { id } = req.params;

    if (!id || Number.isNaN(parseInt(id, 10))) {
      return res.status(400).json({ error: 'Valid item ID is required' });
    }

    const existingTask = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const deleteStmt = db.prepare('DELETE FROM items WHERE id = ?');
    const result = deleteStmt.run(id);

    if (result.changes > 0) {
      res.json({ message: 'Task deleted successfully', id: parseInt(id, 10) });
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = {
  app,
  db,
  insertStmt: db.prepare('INSERT INTO items (title, completed, due_date) VALUES (?, ?, ?)'),
  normalizeTask,
  isValidTitle,
  isValidDueDate,
};