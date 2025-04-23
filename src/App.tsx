import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import Register from "./components/Register/Register";
import Login from "./components/Login/Login";
import AuthNav from "./components/AuthNav/AuthNav";
import Dashboard from "./components/Dashboard/Dashboard";
import TaskList from "./components/TaskList/TaskList";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";

function App() {
  return (
    <Router>
      <AuthNav />
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/lists/:listId"
          element={
            <PrivateRoute>
              <TaskList />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
