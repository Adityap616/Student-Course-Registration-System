import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Main() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [registeredCourseIds, setRegisteredCourseIds] = useState([]);

  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: { "x-auth-token": token }
  });

  // Fetch all courses and user's registered courses
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    api.get("/courses")
      .then(res => setCourses(res.data))
      .catch(() => alert("Failed to fetch courses"));

    api.get("/courses/my-courses")
      .then(res => {
        const ids = res.data.map(c => c._id);
        setRegisteredCourseIds(ids);
      })
      .catch(() => alert("Failed to fetch your registered courses"));
  }, [token, navigate]);

  const totalCredits = selectedCourses.reduce((acc, c) => acc + c.credits, 0);

  const handleSelect = (course) => {
    const isRegistered = registeredCourseIds.includes(course._id);

    // Check for timeslot conflict with registered courses
    const registeredTimes = courses
      .filter(c => registeredCourseIds.includes(c._id))
      .map(c => c.timeslot);
    const hasConflict = registeredTimes.includes(course.timeslot);

    // Check prerequisites
    const registeredSet = new Set(registeredCourseIds);
    const missingPrereqs = (course.prerequisites || []).some(prereq => !registeredSet.has(prereq));

    if (isRegistered || hasConflict || missingPrereqs) return;

    if (selectedCourses.find((c) => c._id === course._id)) {
      setSelectedCourses(selectedCourses.filter((c) => c._id !== course._id));
    } else {
      if (totalCredits + course.credits > 20) {
        alert("You cannot select more than 20 credits.");
        return;
      }
      if (course.seats <= 0) {
        alert("No seats left for this course.");
        return;
      }
      setSelectedCourses([...selectedCourses, course]);
    }
  };

  const handleSubmit = () => {
    if (selectedCourses.length === 0) {
      alert("Please select at least one course");
      return;
    }

    api.post("/courses/register", {
      courseIds: selectedCourses.map((c) => c._id)
    })
      .then((res) => {
        setCourses(res.data.updatedCourses);
        setSelectedCourses([]);
        const newIds = res.data.updatedCourses
          .filter(c => selectedCourses.some(s => s._id === c._id))
          .map(c => c._id);
        setRegisteredCourseIds(prev => [...prev, ...newIds]);

        navigate("/my-courses");
      })
      .catch((err) => {
        const msg = err.response?.data?.msg || "Error while registering";
        alert(msg);
      });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Welcome, {username}!</h2>
      <button onClick={handleLogout}>Logout</button>
      {" "}
      <button onClick={() => navigate("/my-courses")}>Go to My Courses</button>

      <h3>Course Registration</h3>
      <p>Total Credits: {totalCredits} / 20</p>

      <table border="1" cellPadding="10" style={{ marginTop: "10px" }}>
        <thead>
          <tr>
            <th>Select</th>
            <th>Course</th>
            <th>Credits</th>
            <th>Timeslot</th>
            <th>Seats Left</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => {
            const isRegistered = registeredCourseIds.includes(course._id);
            const hasConflict = courses
              .filter(c => registeredCourseIds.includes(c._id))
              .some(c => c.timeslot === course.timeslot);
            const missingPrereqs = (course.prerequisites || []).some(prereq => !registeredCourseIds.includes(prereq));

            let bgColor = "white";
            if (isRegistered) bgColor = "#d3ffd3";       // green
            else if (hasConflict) bgColor = "#ffd3d3";   // red
            else if (missingPrereqs) bgColor = "#fff0d3"; // orange

            return (
              <tr key={course._id} style={{ backgroundColor: bgColor }}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedCourses.some((c) => c._id === course._id)}
                    onChange={() => handleSelect(course)}
                    disabled={course.seats <= 0 || isRegistered || hasConflict || missingPrereqs}
                  />
                </td>
                <td>{course.name}</td>
                <td>{course.credits}</td>
                <td>{course.timeslot}</td>
                <td>{course.seats}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <button
        onClick={handleSubmit}
        disabled={selectedCourses.length === 0}
        style={{ marginTop: "20px", padding: "10px" }}
      >
        Confirm Registration
      </button>
    </div>
  );
}

export default Main;
