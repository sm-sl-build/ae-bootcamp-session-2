import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

const server = setupServer(
  rest.get('/api/items', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: 1, title: 'Test Task 1', completed: false, due_date: '2026-06-20', created_at: '2023-01-01T00:00:00.000Z' },
        { id: 2, title: 'Test Task 2', completed: true, due_date: null, created_at: '2023-01-02T00:00:00.000Z' },
      ])
    );
  }),

  rest.post('/api/items', (req, res, ctx) => {
    const { title } = req.body;

    if (!title || title.trim() === '') {
      return res(ctx.status(400), ctx.json({ error: 'Task title is required' }));
    }

    return res(
      ctx.status(201),
      ctx.json({
        id: 3,
        title,
        completed: false,
        due_date: req.body.dueDate || null,
        created_at: new Date().toISOString(),
      })
    );
  }),

  rest.put('/api/items/:id', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ id: Number(req.params.id), title: 'Updated Task', completed: true, due_date: '2026-07-01' }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('App Component', () => {
  test('renders the header and task form', async () => {
    await act(async () => {
      render(<App />);
    });

    expect(screen.getByText('To Do App')).toBeInTheDocument();
    expect(screen.getByText('Keep track of your tasks')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter task title')).toBeInTheDocument();
  });

  test('loads and displays tasks', async () => {
    await act(async () => {
      render(<App />);
    });

    expect(screen.getByText('Loading tasks...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
      expect(screen.getByText('Test Task 2')).toBeInTheDocument();
    });
  });

  test('adds a new task', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Enter task title');
    await act(async () => {
      await user.type(input, 'New Test Task');
    });

    const submitButton = screen.getByRole('button', { name: 'Add Task' });
    await act(async () => {
      await user.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText('New Test Task')).toBeInTheDocument();
    });
  });

  test('allows editing a task', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });

    const editButton = screen.getAllByRole('button', { name: 'Edit' })[0];
    await act(async () => {
      await user.click(editButton);
    });

    const titleInput = screen.getByDisplayValue('Test Task 1');
    await act(async () => {
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Task');
    });

    const saveButton = screen.getByRole('button', { name: 'Save' });
    await act(async () => {
      await user.click(saveButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Updated Task')).toBeInTheDocument();
    });
  });

  test('handles API error', async () => {
    server.use(
      rest.get('/api/items', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch tasks/)).toBeInTheDocument();
    });
  });
});
