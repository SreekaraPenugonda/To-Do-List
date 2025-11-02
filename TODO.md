# Integration Plan: Connect React Frontend to Express Backend

## Steps to Complete
- [x] Install axios in Todo folder for API calls
- [x] Update Todo/src/App.jsx: Remove localStorage logic and replace with API calls
  - [x] Remove useEffect for loading from localStorage
  - [x] Remove useEffect for saving to localStorage
  - [x] Add useEffect to fetch todos from backend on mount
  - [x] Modify addTodo to POST new todo to backend
  - [x] Modify toggleComplete to PUT update to backend
  - [x] Modify deleteTodo to DELETE from backend
  - [x] Update clearAll and clearCompleted to handle API
- [x] Ensure backend server is running
- [x] Test the integration by running both frontend and backend
