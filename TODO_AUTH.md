# User Authentication Implementation TODO

## Backend Changes
- [x] Create backend/models/User.js with email, password, name fields
- [x] Create backend/routes/auth.js for register and login routes (bcrypt for hashing, basic auth)
- [x] Create backend/middleware/auth.js for basic auth middleware
- [x] Update backend/server.js to include auth routes and middleware
- [x] Update backend/package.json to add bcryptjs dependency (removed jsonwebtoken)
- [x] Update backend/routes/todos.js to use user lookup from basic auth

## Frontend Changes
- [x] Create Todo/src/components/Login.jsx component
- [x] Create Todo/src/components/Signup.jsx component
- [x] Create Todo/src/context/AuthContext.jsx for auth state management (basic auth)
- [x] Update Todo/src/App.jsx to handle auth state and show login/signup if not authenticated
- [x] Update Todo/package.json if additional dependencies needed (none needed)

## Additional Features
- [x] Update Todo model to include userId, category, dueDate fields with MongoDB indexes
- [x] Update backend/routes/todos.js to handle user-specific todos, categories, due dates
- [x] Update Todo/src/App.jsx for category/dueDate inputs, filter dropdown, filtering logic
- [x] Recreate Todo/src/components/Todo.jsx with edit functionality, category/dueDate display, overdue styling
- [x] Recreate Todo/src/styles/app.css with modern UI/UX styles

## Followup Steps
- [x] Install new dependencies in backend and frontend
- [x] Test registration, login, and protected routes
- [x] Update Todo model to include userId for user-specific todos
- [x] Fix MongoDB connection by updating dotenv config in server.js
- [x] Start backend server (running on port 5000)
- [x] Start frontend server (running on port 5176)
- [ ] Test full integration: register user, login, create todos with categories/due dates, filter, edit, delete
- [ ] Verify user-specific todos (todos only visible to their owner)
- [ ] Test overdue indicators and reminder functionality
