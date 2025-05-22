// backend/index.js

const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let todos = [];

// Get all todos
app.get('/todos', (req, res) => {
  res.json(todos);
});

// Add a new todo
app.post('/todos', (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Todo text required' });
  const newTodo = { id: Date.now().toString(), text };
  todos.push(newTodo);
  res.status(201).json(newTodo);
});

// Delete a todo
app.delete('/todos/:id', (req, res) => {
  const { id } = req.params;
  todos = todos.filter(todo => todo.id !== id);
  res.status(204).end();
});

// Summarize todos and send to Slack
app.post('/summarize', async (req, res) => {
  try {
    const todoTexts = todos.map(t => `- ${t.text}`).join('\n');
    const prompt = `Summarize the following to-do list:\n${todoTexts}`;

    const openaiRes = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const summary = openaiRes.data.choices[0].message.content;

    // Send to Slack
    await axios.post(process.env.SLACK_WEBHOOK_URL, {
      text: `📝 *Todo Summary:*
${summary}`
    });

    res.json({ message: 'Summary sent to Slack successfully!' });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to summarize or send to Slack' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
