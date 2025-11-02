import React, { useState, useEffect, useRef } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { Toaster, toast } from 'react-hot-toast'
import axios from 'axios'
import Todo from './components/Todo'
import Login from './components/Login'
import Signup from './components/Signup'
import { AuthProvider, useAuth } from './context/AuthContext'

function AppContent() {
  const [todos, setTodos] = useState([])
  const [input, setInput] = useState('')
  const [category, setCategory] = useState('General')
  const [dueDate, setDueDate] = useState('')
  const [filter, setFilter] = useState('all')
  const [darkMode, setDarkMode] = useState(false)
  const [authMode, setAuthMode] = useState('login') // 'login' or 'signup'
  const inputRef = useRef(null)
  const { user, logout, loading } = useAuth()

  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
    try {
      const response = await axios.get('http://localhost:5000/todos')
      setTodos(response.data)
    } catch (error) {
      console.error('Error fetching todos:', error)
      toast.error('Failed to load todos')
    }
  }

  const addTodo = async () => {
    if (input.trim() === '') {
      toast.error("Enter a task!")
      return
    }
    try {
      const response = await axios.post('http://localhost:5000/todos', {
        text: input,
        completed: false,
        category: category,
        dueDate: dueDate || null
      })
      setTodos(prev => [response.data, ...prev])
      setInput('')
      setDueDate('')
      toast.success("Task added!")
    } catch (error) {
      console.error('Error adding todo:', error)
      toast.error('Failed to add task')
    }
  }

  const toggleComplete = async (id) => {
    const todo = todos.find(t => t._id === id)
    if (!todo) return
    try {
      await axios.put(`http://localhost:5000/todos/${id}`, {
        completed: !todo.completed
      })
      setTodos(todos.map(t => t._id === id ? { ...t, completed: !t.completed } : t))
    } catch (error) {
      console.error('Error toggling todo:', error)
      toast.error('Failed to update task')
    }
  }

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/todos/${id}`)
      setTodos(todos.filter(t => t._id !== id))
    } catch (error) {
      console.error('Error deleting todo:', error)
      toast.error('Failed to delete task')
    }
  }

  const clearAll = async () => {
    try {
      await Promise.all(todos.map(todo => axios.delete(`http://localhost:5000/todos/${todo._id}`)))
      setTodos([])
      toast('Cleared all tasks')
    } catch (error) {
      console.error('Error clearing all todos:', error)
      toast.error('Failed to clear all tasks')
    }
  }

  const clearCompleted = async () => {
    try {
      const completedTodos = todos.filter(t => t.completed)
      await Promise.all(completedTodos.map(todo => axios.delete(`http://localhost:5000/todos/${todo._id}`)))
      setTodos(todos.filter(t => !t.completed))
      toast('Cleared completed tasks')
    } catch (error) {
      console.error('Error clearing completed todos:', error)
      toast.error('Failed to clear completed tasks')
    }
  }

  const remindTask = () => {
    if (Notification.permission === "granted") {
      new Notification("Reminder", { body: "Hey! Complete your tasks!" })
    } else {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification("Reminder", { body: "Hey! Complete your tasks!" })
        }
      })
    }
  }

  const handleDragEnd = async (result) => {
    if (!result.destination) return
    const reordered = Array.from(todos)
    const [moved] = reordered.splice(result.source.index, 1)
    reordered.splice(result.destination.index, 0, moved)
    setTodos(reordered)
    // Note: Drag and drop reordering is not persisted to backend as it's not implemented in the API
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (!user) {
    return (
      <div className={`app ${darkMode ? 'dark' : ''}`}>
        <button className="toggle-mode" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? '☀️' : '🌙'}
        </button>
        {authMode === 'login' ? (
          <Login onSwitchToSignup={() => setAuthMode('signup')} />
        ) : (
          <Signup onSwitchToLogin={() => setAuthMode('login')} />
        )}
      </div>
    )
  }

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      <Toaster />
      <button className="toggle-mode" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? '☀️' : '🌙'}
      </button>
      <div className="main">
        <div className="header">
          <h1>📝 TO-DO LIST</h1>
          <div className="user-info">
            <span>Welcome, {user.name}!</span>
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>
        </div>
        <div className="add-section">
          <input
            ref={inputRef}
            type="text"
            placeholder="Add new task..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="General">General</option>
            <option value="Work">Work</option>
            <option value="Personal">Personal</option>
            <option value="Shopping">Shopping</option>
            <option value="Health">Health</option>
          </select>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            placeholder="Due date"
          />
          <button onClick={addTodo}>Add</button>
        </div>

        <div className="actions">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>
          <button onClick={clearCompleted}>Clear Completed</button>
          <button onClick={clearAll}>Clear All</button>
          <button onClick={remindTask}>🔔 Remind</button>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="todos">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="todo-list">
                {todos
                  .filter(todo => {
                    if (filter === 'pending') return !todo.completed
                    if (filter === 'completed') return todo.completed
                    if (filter === 'overdue') return todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed
                    return true
                  })
                  .map((todo, index) => (
                    <Draggable key={todo._id} draggableId={todo._id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <Todo
                            todo={todo}
                            toggleComplete={() => toggleComplete(todo._id)}
                            deleteTodo={() => deleteTodo(todo._id)}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
