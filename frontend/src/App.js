// frontend/src/App.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000'; // Change this to your backend URL if hosted

function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const res = await axios.get(`${API_BASE}/todos`);
    setTodos(res.data);
  };

  const addTodo = async () => {
    if (!input.trim()) return;
    await axios.post(`${API_BASE}/todos`, { text: input });
    setInput('');
    fetchTodos();
  };

  const deleteTodo = async (id) => {
    await axios.delete(`${API_BASE}/todos/${id}`);
    fetchTodos();
  };

  const summarizeTodos = async () => {
    try {
      const res = await axios.post(`${API_BASE}/summarize`);
      setMessage(res.data.message);
    } catch {
      setMessage('❌ Failed to send summary to Slack.');
    }
  };

  return (
    <div className="App" style={{ padding: 20 }}>
      <h1>📝 Todo Summary Assistant</h1>

      <input
        type="text"
        placeholder="Add todo..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={addTodo}>Add</button>

      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            {todo.text} <button onClick={() => deleteTodo(todo.id)}>❌</button>
          </li>
        ))}
      </ul>

      <button onClick={summarizeTodos}>Summarize & Send to Slack</button>

      {message && <p>{message}</p>}
    </div>
  );
}

export default App;
