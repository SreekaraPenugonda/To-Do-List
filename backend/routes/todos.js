const express = require('express');
const Todo = require('../models/Todo');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// GET /api/todos - Get all todos for authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user && req.user.email });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const todos = await Todo.find({ userId: user._id }).sort({ createdAt: -1 });
    return res.json(todos);
  } catch (error) {
    console.error('GET /api/todos error:', error);
    return res.status(500).json({ error: error.message || 'Server error' });
  }
});

// POST /api/todos - Create a new todo
router.post('/', auth, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user && req.user.email });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const { text, completed, category, dueDate } = req.body;
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'text is required and must be a non-empty string' });
    }

    const todo = new Todo({
      text: text.trim(),
      completed: completed === true,
      category: category || 'General',
      dueDate: dueDate ? new Date(dueDate) : null,
      userId: user._id
    });

    const newTodo = await todo.save();
    return res.status(201).json(newTodo);
  } catch (error) {
    console.error('POST /api/todos error:', error);
    return res.status(400).json({ error: error.message || 'Could not create todo' });
  }
});

// PUT /api/todos/:id - Update a todo
router.put('/:id', auth, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user && req.user.email });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    if (todo.userId.toString() !== user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { text, completed, category, dueDate } = req.body;
    if (text != null) todo.text = text;
    if (completed != null) todo.completed = !!completed;
    if (category != null) todo.category = category;
    if (dueDate != null) todo.dueDate = dueDate ? new Date(dueDate) : null;

    const updatedTodo = await todo.save();
    return res.json(updatedTodo);
  } catch (error) {
    console.error('PUT /api/todos/:id error:', error);
    return res.status(400).json({ error: error.message || 'Could not update todo' });
  }
});

// DELETE /api/todos/:id - Delete a todo
router.delete('/:id', auth, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user && req.user.email });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    if (todo.userId.toString() !== user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await Todo.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Todo deleted' });
  } catch (error) {
    console.error('DELETE /api/todos/:id error:', error);
    return res.status(500).json({ error: error.message || 'Could not delete todo' });
  }
});

module.exports = router;
