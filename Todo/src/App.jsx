import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';

const STORAGE_USERS = 'offline_todo_users';
const STORAGE_TOKEN = 'offline_todo_token'; // stores logged-in user email
// todos stored as "todos_<email>"

function getUsers() {
  return JSON.parse(localStorage.getItem(STORAGE_USERS) || '[]');
}
function saveUsers(users) {
  localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
}

function saveToken(email) {
  localStorage.setItem(STORAGE_TOKEN, email);
}
function getToken() {
  return localStorage.getItem(STORAGE_TOKEN);
}
function clearToken() {
  localStorage.removeItem(STORAGE_TOKEN);
}

function getTodosFor(email) {
  return JSON.parse(localStorage.getItem(`todos_${email}`) || '[]');
}
function saveTodosFor(email, todos) {
  localStorage.setItem(`todos_${email}`, JSON.stringify(todos));
}

function AuthForm({ onLogin }) {
  const [mode, setMode] = useState('login'); // or 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => setErr(''), [mode, name, email, password]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErr('');
    const users = getUsers();

    if (mode === 'register') {
      if (!email || !password) return setErr('Email and password required');
      if (users.find(u => u.email === email)) return setErr('User already exists');
      users.push({ name: name || email.split('@')[0], email, password });
      saveUsers(users);
      saveToken(email);
      onLogin({ name: name || email.split('@')[0], email });
    } else {
      // login
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) return setErr('Invalid credentials');
      saveToken(user.email);
      onLogin({ name: user.name, email: user.email });
    }
  };

  return (
    <div className="auth-card">
      <h2>{mode === 'register' ? 'Create account' : 'Welcome back'}</h2>
      <form onSubmit={handleSubmit}>
        {mode === 'register' && (
          <input placeholder="Name (optional)"
                 value={name}
                 onChange={e => setName(e.target.value)} />
        )}
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <div className="row">
          <button type="submit" className="btn">{mode === 'register' ? 'Register' : 'Login'}</button>
          <button type="button" className="btn ghost" onClick={() => setMode(mode === 'register' ? 'login' : 'register')}>
            {mode === 'register' ? 'Have an account? Login' : "New user? Register"}
          </button>
        </div>
        {err && <div className="error">{err}</div>}
      </form>
      <small className="hint">This app stores everything in your browser (localStorage).</small>
    </div>
  );
}

function TodoApp({ user, onLogout }) {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState('');
  const [category, setCategory] = useState('General');
  const [dueDate, setDueDate] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    const list = getTodosFor(user.email);
    setTodos(list);
  }, [user.email]);

  useEffect(() => {
    saveTodosFor(user.email, todos);
  }, [todos, user.email]);

  const resetForm = () => {
    setText('');
    setCategory('General');
    setDueDate('');
    setEditingId(null);
    setError('');
  };

  const addOrUpdate = (e) => {
    e.preventDefault();
    setError('');
    if (!text.trim()) return setError('Please enter todo text');

    if (editingId) {
      setTodos(prev => prev.map(t => t.id === editingId ? { ...t, text: text.trim(), category, dueDate: dueDate || null } : t));
      resetForm();
      return;
    }

    const newTodo = {
      id: Date.now().toString(),
      text: text.trim(),
      completed: false,
      category: category || 'General',
      dueDate: dueDate || null,
      createdAt: new Date().toISOString()
    };
    setTodos(prev => [newTodo, ...prev]);
    resetForm();
  };

  const startEdit = (t) => {
    setEditingId(t.id);
    setText(t.text);
    setCategory(t.category || 'General');
    setDueDate(t.dueDate ? dayjs(t.dueDate).format('YYYY-MM-DD') : '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = (id) => {
    if (!confirm('Delete this todo?')) return;
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const toggle = (id) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const filtered = todos.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const categories = Array.from(new Set(['General', ...todos.map(t => t.category || 'General')]));

  return (
    <div className="app-wrap">
      <header className="top">
        <h1>Todo — {user.name}</h1>
        <div>
          <button className="btn small" onClick={() => { clearToken(); onLogout(); }}>Logout</button>
        </div>
      </header>

      <main>
        <form className="todo-form" onSubmit={addOrUpdate}>
          <input placeholder="What do you want to do?"
                 value={text}
                 onChange={e => setText(e.target.value)} />
          <div className="row">
            <select value={category} onChange={e => setCategory(e.target.value)}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            <button className="btn" type="submit">{editingId ? 'Update' : 'Add'}</button>
            {editingId && <button type="button" className="btn ghost" onClick={resetForm}>Cancel</button>}
          </div>
          {error && <div className="error">{error}</div>}
        </form>

        <div className="controls">
          <div>
            <strong>{filtered.length}</strong> todos
          </div>
          <div>
            <select value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <ul className="todo-list">
          {filtered.map(t => (
            <li key={t.id} className={t.completed ? 'done' : ''}>
              <div className="left">
                <input type="checkbox" checked={t.completed} onChange={() => toggle(t.id)} />
                <div className="meta">
                  <div className="text">{t.text}</div>
                  <div className="sub">
                    <span className="cat">{t.category}</span>
                    {t.dueDate && <span className="due">Due: {dayjs(t.dueDate).format('MMM D, YYYY')}</span>}
                  </div>
                </div>
              </div>

              <div className="actions">
                <button className="btn small" onClick={() => startEdit(t)}>Edit</button>
                <button className="btn small danger" onClick={() => remove(t.id)}>Delete</button>
              </div>
            </li>
          ))}
          {filtered.length === 0 && <li className="empty">No todos yet — add one above ✨</li>}
        </ul>
      </main>

      <footer className="foot">
        <small>Stored in your browser. No backend required.</small>
      </footer>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const email = getToken();
    if (email) {
      const users = getUsers();
      const u = users.find(x => x.email === email);
      if (u) setUser({ name: u.name, email: u.email });
      else clearToken();
    }
  }, []);

  if (!user) return <div className="centerwrap"><AuthForm onLogin={(u) => setUser(u)} /></div>;

  return <TodoApp user={user} onLogout={() => setUser(null)} />;
}
