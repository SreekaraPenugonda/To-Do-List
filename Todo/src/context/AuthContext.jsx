import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const email = localStorage.getItem('email');
    const password = localStorage.getItem('password');
    if (email && password) {
      setUser({ email, password });
      // Set up basic auth header
      const credentials = btoa(`${email}:${password}`);
      axios.defaults.headers.common['Authorization'] = `Basic ${credentials}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('https://to-do-list-backend-8hji.onrender.com', {
        email,
        password
      });

      const { user: userData } = response.data;
      localStorage.setItem('email', email);
      localStorage.setItem('password', password);
      const credentials = btoa(`${email}:${password}`);
      axios.defaults.headers.common['Authorization'] = `Basic ${credentials}`;
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post('https://to-do-list-backend-8hji.onrender.com', {
        name,
        email,
        password
      });

      const { user: userData } = response.data;
      localStorage.setItem('email', email);
      localStorage.setItem('password', password);
      const credentials = btoa(`${email}:${password}`);
      axios.defaults.headers.common['Authorization'] = `Basic ${credentials}`;
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('email');
    localStorage.removeItem('password');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
