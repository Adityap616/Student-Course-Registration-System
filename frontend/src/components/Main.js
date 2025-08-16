import React from "react";
import { useNavigate } from "react-router-dom";

function Main() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <div>
      <h2>Welcome, {username}!</h2>
      <button onClick={handleLogout}>Logout</button>
      <p>This is the protected main page.</p>
    </div>
  );
}

export default Main;
