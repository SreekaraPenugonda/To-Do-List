import React, { useState } from 'react'
import axios from 'axios'

function Todo({ todo, toggleComplete, deleteTodo }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(todo.text)
  const [editCategory, setEditCategory] = useState(todo.category || 'General')
  const [editDueDate, setEditDueDate] = useState(todo.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : '')

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:5000/todos/${todo._id}`, {
        text: editText,
        category: editCategory,
        dueDate: editDueDate || null
      })
      setIsEditing(false)
      // Refresh todos or update local state
      window.location.reload() // Simple refresh for now
    } catch (error) {
      console.error('Error updating todo:', error)
    }
  }

  const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed

  return (
    <div className={`todo ${todo.completed ? 'done' : ''} ${isOverdue ? 'overdue' : ''}`}>
      {isEditing ? (
        <div className="edit-form">
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
          />
          <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)}>
            <option value="General">General</option>
            <option value="Work">Work</option>
            <option value="Personal">Personal</option>
            <option value="Shopping">Shopping</option>
            <option value="Health">Health</option>
          </select>
          <input
            type="date"
            value={editDueDate}
            onChange={(e) => setEditDueDate(e.target.value)}
          />
          <button onClick={handleSave}>Save</button>
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      ) : (
        <>
          <div className="todo-content">
            <span onClick={() => toggleComplete(todo._id)}>
              {todo.completed ? '✅' : '⬜'} {todo.text}
            </span>
            <div className="todo-meta">
              <span className="category">{todo.category}</span>
              {todo.dueDate && (
                <span className={`due-date ${isOverdue ? 'overdue' : ''}`}>
                  Due: {new Date(todo.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          <div className="todo-actions">
            <button onClick={() => setIsEditing(true)} className="edit-btn">✏️</button>
            <button onClick={() => deleteTodo(todo._id)}>❌</button>
          </div>
        </>
      )}
    </div>
  )
}

export default Todo
