import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDueDate, setEditDueDate] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/items');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      setTasks(result);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tasks: ' + err.message);
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTaskTitle, dueDate: newTaskDueDate || null }),
      });

      if (!response.ok) {
        throw new Error('Failed to add task');
      }

      const result = await response.json();
      setTasks((currentTasks) => [result, ...currentTasks]);
      setNewTaskTitle('');
      setNewTaskDueDate('');
      setError(null);
    } catch (err) {
      setError('Error adding task: ' + err.message);
      console.error('Error adding task:', err);
    }
  };

  const handleDelete = async (taskId) => {
    try {
      const response = await fetch(`/api/items/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
      setError(null);
    } catch (err) {
      setError('Error deleting task: ' + err.message);
      console.error('Error deleting task:', err);
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      const response = await fetch(`/api/items/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed, title: task.title, dueDate: task.due_date }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const updatedTask = await response.json();
      setTasks((currentTasks) => currentTasks.map((item) => (item.id === task.id ? updatedTask : item)));
      setError(null);
    } catch (err) {
      setError('Error updating task: ' + err.message);
      console.error('Error updating task:', err);
    }
  };

  const startEditing = (task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDueDate(task.due_date || '');
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditTitle('');
    setEditDueDate('');
  };

  const handleSaveEdit = async (taskId) => {
    try {
      const response = await fetch(`/api/items/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle, dueDate: editDueDate || null }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const updatedTask = await response.json();
      setTasks((currentTasks) => currentTasks.map((item) => (item.id === taskId ? updatedTask : item)));
      cancelEditing();
      setError(null);
    } catch (err) {
      setError('Error updating task: ' + err.message);
      console.error('Error updating task:', err);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>To Do App</h1>
        <p>Keep track of your tasks</p>
      </header>

      <main>
        <section className="add-item-section">
          <h2>Add New Task</h2>
          <form onSubmit={handleSubmit} className="task-form">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Enter task title"
            />
            <input
              type="date"
              value={newTaskDueDate}
              onChange={(e) => setNewTaskDueDate(e.target.value)}
            />
            <button type="submit">Add Task</button>
          </form>
        </section>

        <section className="items-section">
          <h2>Tasks</h2>
          {loading && <p>Loading tasks...</p>}
          {error && <p className="error">{error}</p>}
          {!loading && !error && (
            <ul>
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <li key={task.id} className={task.completed ? 'completed' : ''}>
                    <div className="task-content">
                      <label className="task-checkbox">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => handleToggleComplete(task)}
                        />
                        {editingTaskId === task.id ? (
                          <div className="edit-fields">
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                            />
                            <input
                              type="date"
                              value={editDueDate}
                              onChange={(e) => setEditDueDate(e.target.value)}
                            />
                          </div>
                        ) : (
                          <div className="task-text">
                            <span>{task.title}</span>
                            {task.due_date && <small>Due {task.due_date}</small>}
                          </div>
                        )}
                      </label>
                    </div>
                    <div className="task-actions">
                      {editingTaskId === task.id ? (
                        <>
                          <button type="button" onClick={() => handleSaveEdit(task.id)}>Save</button>
                          <button type="button" className="secondary-btn" onClick={cancelEditing}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button type="button" onClick={() => startEditing(task)}>Edit</button>
                          <button type="button" className="delete-btn" onClick={() => handleDelete(task.id)}>Delete</button>
                        </>
                      )}
                    </div>
                  </li>
                ))
              ) : (
                <p>No tasks found. Add some!</p>
              )}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;