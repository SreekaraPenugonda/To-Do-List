const express = require('express');
const Todo = require('../models/Todo');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// GET /todos - Get all todos for authenticated user
router.get('/', auth, async (req, res) => {
  try {
    // Find user by email from basic auth
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const todos = await Todo.find({ userId: user._id }).sort({ createdAt: -1 });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /todos - Create a new todo
router.post('/', auth, async (req, res) => {
  try {
    // Find user by email from basic auth
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const todo = new Todo({
      text: req.body.text,
      completed: req.body.completed || false,
      category: req.body.category || 'General',
      dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,
      userId: user._id
    });

    const newTodo = await todo.save();
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /todos/:id - Update a todo
router.put('/:id', auth, async (req, res) => {
  try {
    // Find user by email from basic auth
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    // Check if todo belongs to user
    if (todo.userId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (req.body.text != null) {
      todo.text = req.body.text;
    }
    if (req.body.completed != null) {
      todo.completed = req.body.completed;
    }
    if (req.body.category != null) {
      todo.category = req.body.category;
    }
    if (req.body.dueDate != null) {
      todo.dueDate = req.body.dueDate ? new Date(req.body.dueDate) : null;
    }

    const updatedTodo = await todo.save();
    res.json(updatedTodo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /todos/:id - Delete a todo
router.delete('/:id', auth, async (req, res) => {
  try {
    // Find user by email from basic auth
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    // Check if todo belongs to user
    if (todo.userId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Todo.findByIdAndDelete(req.params.id);
    res.json({ message: 'Todo deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
