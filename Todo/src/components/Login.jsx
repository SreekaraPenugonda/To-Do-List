import React, { useState } from 'react';

const STORAGE_USERS = 'offline_todo_users';
const STORAGE_TOKEN = 'offline_todo_token';

function getUsers() {
  return JSON.parse(localStorage.getItem(STORAGE_USERS) || '[]');
}
function saveToken(email) {
  localStorage.setItem(STORAGE_TOKEN, email);
}

export default function Login({ onAuth }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErr('');
    if (!email || !password) return setErr('Email and password required');

    setLoading(true);
    try {
      const users = getUsers();
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) {
        setErr('Invalid credentials');
        return;
      }
      saveToken(user.email);
      onAuth({ name: user.name, email: user.email });
    } catch (err) {
      setErr('Login failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h2>Welcome back</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <div className="row">
          <button className="btn" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
        </div>
        {err && <div className="error">{err}</div>}
        <small className="hint">This is an offline demo — data stays in your browser.</small>
      </form>
    </div>
  );
}
