import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Admin() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [courses, setCourses] = useState([]);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form, setForm] = useState({
    name: "",
    credits: "",
    timeslot: "",
    seats: "",
    prerequisites: ""
  });

  const api = axios.create({
    baseURL: "http://localhost:5000/api/admin",
    headers: { "x-auth-token": token }
  });

  // Fetch all courses
  useEffect(() => {
    if (!token) navigate("/login");

    api.get("/courses")
      .then(res => setCourses(res.data))
      .catch(err => alert("Failed to fetch courses"));
  }, [token, navigate]);

  const resetForm = () => {
    setEditingCourse(null);
    setForm({ name: "", credits: "", timeslot: "", seats: "", prerequisites: "" });
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    const payload = {
      ...form,
      credits: Number(form.credits),
      seats: Number(form.seats),
      prerequisites: form.prerequisites ? form.prerequisites.split(",").map(s => s.trim()) : []
    };

    if (editingCourse) {
      // Update
      api.put(`/courses/${editingCourse._id}`, payload)
        .then(res => {
          setCourses(courses.map(c => c._id === editingCourse._id ? res.data.course : c));
          resetForm();
        })
        .catch(err => alert(err.response?.data?.msg || "Update failed"));
    } else {
      // Create
      api.post("/courses", payload)
        .then(res => {
          setCourses([...courses, res.data.course]);
          resetForm();
        })
        .catch(err => alert(err.response?.data?.msg || "Create failed"));
    }
  };

  const handleEdit = course => {
    setEditingCourse(course);
    setForm({
      name: course.name,
      credits: course.credits,
      timeslot: course.timeslot,
      seats: course.seats,
      prerequisites: course.prerequisites ? course.prerequisites.join(", ") : ""
    });
  };

  const handleDelete = id => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    api.delete(`/courses/${id}`)
      .then(() => setCourses(courses.filter(c => c._id !== id)))
      .catch(err => alert(err.response?.data?.msg || "Delete failed"));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Panel</h2>
      <button onClick={handleLogout}>Logout</button>

      <h3 style={{ marginTop: "20px" }}>{editingCourse ? "Edit Course" : "Add New Course"}</h3>
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          name="name"
          placeholder="Course Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="credits"
          placeholder="Credits"
          value={form.credits}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="timeslot"
          placeholder="Timeslot (e.g., Mon 9-11)"
          value={form.timeslot}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="seats"
          placeholder="Seats"
          value={form.seats}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="prerequisites"
          placeholder="Prerequisites (comma-separated IDs)"
          value={form.prerequisites}
          onChange={handleChange}
        />
        <button type="submit" style={{ marginLeft: "10px" }}>
          {editingCourse ? "Update" : "Add"}
        </button>
        {editingCourse && <button type="button" onClick={resetForm} style={{ marginLeft: "10px" }}>Cancel</button>}
      </form>

      <h3>All Courses</h3>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Name</th>
            <th>Credits</th>
            <th>Timeslot</th>
            <th>Seats</th>
            <th>Prerequisites</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map(course => (
            <tr key={course._id}>
              <td>{course.name}</td>
              <td>{course.credits}</td>
              <td>{course.timeslot}</td>
              <td>{course.seats}</td>
              <td>{course.prerequisites ? course.prerequisites.join(", ") : "-"}</td>
              <td>
                <button onClick={() => handleEdit(course)}>Edit</button>
                <button onClick={() => handleDelete(course._id)} style={{ marginLeft: "5px" }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Admin;
