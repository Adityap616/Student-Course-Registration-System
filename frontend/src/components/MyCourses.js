import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function MyCourses() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [registeredCourses, setRegisteredCourses] = useState([]);

  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: { "x-auth-token": token }
  });

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    api.get("/courses/my-courses")
      .then(res => setRegisteredCourses(res.data))
      .catch(err => {
        console.error("Failed to fetch my courses:", err);
        alert("Failed to fetch your courses");
      });
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  const handleBack = () => {
    navigate("/main");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>My Registered Courses</h2>

      <div style={{ marginBottom: "20px" }}>
        <button onClick={handleBack} style={{ marginRight: "10px", padding: "8px 12px" }}>
          Back to Registration
        </button>
        <button onClick={handleLogout} style={{ padding: "8px 12px" }}>
          Logout
        </button>
      </div>

      {registeredCourses.length === 0 ? (
        <p>You have not registered for any courses yet.</p>
      ) : (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Course</th>
              <th>Credits</th>
              <th>Timeslot</th>
            </tr>
          </thead>
          <tbody>
            {registeredCourses.map(course => (
              <tr key={course._id}>
                <td>{course.name}</td>
                <td>{course.credits}</td>
                <td>{course.timeslot}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MyCourses;
