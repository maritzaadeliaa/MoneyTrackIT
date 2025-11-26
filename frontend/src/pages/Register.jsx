// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/auth/register", form);
      // setelah register, langsung arahkan ke login
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Register gagal");
    }
  };

  return (
    <div className="register-page" style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#eef2ff" }}>
      <form
        onSubmit={handleSubmit}
        style={{
          background: "white",
          padding: "24px",
          borderRadius: "8px",
          minWidth: "300px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}>
          Daftar Akun
        </h1>

        {error && (
          <p style={{ color: "red", marginBottom: "8px", fontSize: "14px" }}>
            {error}
          </p>
        )}

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", fontSize: "14px", marginBottom: "4px" }}>
            Nama
          </label>
          <input
            name="name"
            type="text"
            onChange={handleChange}
            value={form.name}
            required
            style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #d1d5db" }}
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", fontSize: "14px", marginBottom: "4px" }}>
            Email
          </label>
          <input
            name="email"
            type="email"
            onChange={handleChange}
            value={form.email}
            required
            style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #d1d5db" }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "14px", marginBottom: "4px" }}>
            Password
          </label>
          <input
            name="password"
            type="password"
            onChange={handleChange}
            value={form.password}
            required
            style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #d1d5db" }}
          />
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            background: "#4f46e5",
            color: "white",
            padding: "8px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Register
        </button>

        <p style={{ marginTop: "12px", fontSize: "14px" }}>
          Sudah punya akun?{" "}
          <Link to="/login" style={{ color: "#4f46e5" }}>
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
