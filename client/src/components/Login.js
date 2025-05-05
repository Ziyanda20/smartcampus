import { useState } from "react";
import { School } from "lucide-react";

export default function Login() {
  const [tab, setTab] = useState("login");

  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({
    fullName: "",
    username: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });

  const handleLogin = (e) => {
    e.preventDefault();
    alert("Login submitted:\n" + JSON.stringify(loginData, null, 2));
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    const { confirmPassword, ...data } = registerData;
    alert("Registration submitted:\n" + JSON.stringify(data, null, 2));
  };

  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="row w-100 shadow rounded overflow-hidden" style={{ maxWidth: "900px" }}>
        {/* Left Section (Form) */}
        <div className="col-lg-6 p-5 bg-white">
          <div className="text-center mb-4">
            <School size={40} className="text-primary mb-3" />
            <h2 className="fw-bold">Smart Campus Services</h2>
            <p className="text-muted">Sign In or Register to continue</p>
          </div>

          {/* Tabs */}
          <ul className="nav nav-tabs mb-4 justify-content-center">
            <li className="nav-item">
              <button
                className={`nav-link ${tab === "login" ? "active" : ""}`}
                onClick={() => setTab("login")}
              >
                Login
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${tab === "register" ? "active" : ""}`}
                onClick={() => setTab("register")}
              >
                Register
              </button>
            </li>
          </ul>

          {/* Login Form */}
          {tab === "login" && (
            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className="form-control"
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-100 mt-3">
                Login
              </button>
            </form>
          )}

          {/* Registration Form */}
          {tab === "register" && (
            <form onSubmit={handleRegister}>
            <div className="mb-3">
              <label className="form-label">Full Name</label>
              <input
                className="form-control form-control-sm"
                value={registerData.fullName}
                onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Username</label>
              <input
                className="form-control form-control-sm"
                value={registerData.username}
                onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control form-control-sm"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                className="form-control form-control-sm"
                value={registerData.confirmPassword}
                onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Role</label>
              <select
                className="form-select form-select-sm"
                value={registerData.role}
                onChange={(e) => setRegisterData({ ...registerData, role: e.target.value })}
              >
                <option value="student">Student</option>
                <option value="lecturer">Lecturer</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary btn-sm w-100">
              Register
            </button>
          </form>
          
          )}
        </div>

        {/* Right Section (Banner/Info) */}
        <div className="col-lg-6 d-none d-lg-flex align-items-center justify-content-center bg-primary text-white p-5">
          <div>
            <h3 className="fw-bold">Welcome to Smart Campus Services</h3>
            <p className="mt-3">
              Manage room bookings, class schedules, maintenance requests, announcements, and more—all in one place.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
