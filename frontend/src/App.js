import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Main from "./components/Main";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  return (
    <Router>
      <Routes>
        <Route path="/" element={isLoggedIn ? <Navigate to="/main" /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/main" element={isLoggedIn ? <Main /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
