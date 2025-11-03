import express from "express";
import cors from "cors";
import path from "path";
import todosRouter from "./routes/todos.js";
import authRouter from "./routes/auth.js";

const app = express();

// Body parser
app.use(express.json());

// CORS - allow your frontend (local + deployed)
app.use(cors({
  origin: [
    "http://localhost:5173",          // Vite dev
    "http://localhost:3000",          // CRA dev
    "https://to-do-list-frontend-ftpr.onrender.com/" // replace with your Render frontend URL
  ],
  credentials: true
}));

// mount routers
app.use('/api/todos', todosRouter);
app.use('/api/auth', authRouter);

// health check
app.get('/health', (req, res) => res.json({ ok: true, time: Date.now() }));

// 404 handler (returns JSON so frontend sees clear message)
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
});

// global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack || err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
