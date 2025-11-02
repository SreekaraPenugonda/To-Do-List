const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    default: 'General',
    trim: true
  },
  dueDate: {
    type: Date,
    default: null
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Create indexes for better performance
todoSchema.index({ userId: 1, createdAt: -1 });
todoSchema.index({ userId: 1, category: 1 });
todoSchema.index({ userId: 1, dueDate: 1 });

module.exports = mongoose.model('Todo', todoSchema);
