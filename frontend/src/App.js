import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Main from "./components/Main";
import MyCourses from "./components/MyCourses";
import Admin from "./components/Admin";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem("isAdmin") === "true");

  const handleLogin = () => {
    setIsLoggedIn(true);
    setIsAdmin(localStorage.getItem("isAdmin") === "true"); // update isAdmin after login
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isLoggedIn ? (
              isAdmin ? <Navigate to="/admin" /> : <Navigate to="/main" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/main"
          element={isLoggedIn && !isAdmin ? <Main /> : <Navigate to="/login" />}
        />
        <Route
          path="/my-courses"
          element={isLoggedIn && !isAdmin ? <MyCourses /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin"
          element={isLoggedIn && isAdmin ? <Admin /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;