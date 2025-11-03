import React, { useState } from 'react';

const STORAGE_USERS = 'offline_todo_users';
const STORAGE_TOKEN = 'offline_todo_token';

function getUsers() {
  return JSON.parse(localStorage.getItem(STORAGE_USERS) || '[]');
}
function saveUsers(users) {
  localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
}
function saveToken(email) {
  localStorage.setItem(STORAGE_TOKEN, email);
}

export default function Signup({ onAuth }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!email || !password) return 'Email and password required';
    if (password.length < 4) return 'Password must be at least 4 characters';
    if (password !== confirm) return 'Passwords do not match';
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErr('');
    const v = validate();
    if (v) return setErr(v);

    setLoading(true);
    try {
      const users = getUsers();
      if (users.some(u => u.email === email)) {
        setErr('User already exists — please login');
        return;
      }
      const newUser = { name: name || email.split('@')[0], email, password };
      users.push(newUser);
      saveUsers(users);
      // auto-login
      saveToken(email);
      onAuth({ name: newUser.name, email: newUser.email });
    } catch (err) {
      setErr('Could not register');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h2>Create account</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Name (optional)" value={name} onChange={e => setName(e.target.value)} />
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <input placeholder="Confirm password" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} />
        <div className="row">
          <button className="btn" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Register'}</button>
        </div>
        {err && <div className="error">{err}</div>}
        <small className="hint">Accounts are stored in your browser only.</small>
      </form>
    </div>
  );
}
