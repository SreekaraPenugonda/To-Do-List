import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import Login from './components/Login';
import Signup from './components/Signup';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/login" element={<Login onAuth={...} />} />
      <Route path="/signup" element={<Signup onAuth={...} />} />
    </Routes>
  </BrowserRouter>
);
