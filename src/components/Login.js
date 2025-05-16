import { useState } from "react";
import { School } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Import jwt-decode to decode the token
import api from "../api";

export default function Login() {
  const [tab, setTab] = useState("login");
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false); // Add loading state for better UX
  const [loginError, setLoginError] = useState(""); // Separate error state for login
  const [registerError, setRegisterError] = useState(""); // Separate error state for registration

  // Validation for registration form
  const validateRegister = () => {
    const newErrors = {};
    if (!registerData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!registerData.username.trim()) newErrors.username = "Username is required";
    if (!registerData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(registerData.email)) newErrors.email = "Email is invalid";
    if (!registerData.password) newErrors.password = "Password is required";
    else if (registerData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (registerData.password !== registerData.confirmPassword) newErrors.confirmPassword = "Passwords must match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle login with role-based redirection
 const handleLogin = async (e) => {
  e.preventDefault();
  setLoginError(""); // Reset error state
  setIsLoading(true); // Show loading state

  try {
    const response = await api.post("/auth/login", {
      username: loginData.username,
      password: loginData.password,
    });

    const token = response.data.token;
    localStorage.setItem("token", token);

    // Decode token to get user role
    const decoded = jwtDecode(token);
    const userRole = decoded.role;

    // Redirect based on role
    if (userRole === "admin") {
      navigate("/analytics-page");
    } else if (userRole === "lecturer") {
      navigate("/home-lecturer");
    } else if (userRole === "student") {
      navigate("/logged-home");
    } else {
      localStorage.removeItem("token"); // Clear invalid token
      setLoginError("Invalid user role");
    }
  } catch (error) {
    setLoginError(error.response?.data?.error || "Login failed. Please check your credentials.");
  } finally {
    setIsLoading(false); // Stop loading
  }
};
  // Handle registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError(""); // Reset error state
    if (!validateRegister()) return;

    setIsLoading(true); // Show loading state
    try {
      const response = await api.post("/auth/register", {
        fullName: registerData.fullName,
        username: registerData.username,
        email: registerData.email,
        password: registerData.password,
        role: registerData.role,
      });

      localStorage.setItem("token", response.data.token);

      // Decode token to get user role
      const decoded = jwtDecode(response.data.token);
      const userRole = decoded.role;

      // Redirect based on role
      if (userRole === "admin") {
        navigate("/analytics-page");
      } else if (userRole === "lecturer") {
        navigate("/home-lecturer");
      } else if (userRole === "student") {
        navigate("/logged-home");
      } else {
        localStorage.removeItem("token"); // Clear invalid token
        setRegisterError("Invalid user role");
      }

      // Reset form only if navigation happens (successful registration)
      setRegisterData({
        fullName: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "student",
      });
      setErrors({});
    } catch (error) {
      setRegisterError(error.response?.data?.error || "Registration failed. Please try again.");
      setRegisterData((prev) => ({ ...prev, email: "" })); // Reset email field on error
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="row w-100 shadow rounded overflow-hidden" style={{ maxWidth: "900px" }}>
        <div className="col-lg-6 p-5 bg-white">
          <div className="text-center mb-4">
            <School size={40} className="text-primary mb-3" />
            <h2 className="fw-bold">Campus Connect Services</h2>
            <p className="text-muted">Sign In or Register to continue</p>
          </div>

          <ul className="nav nav-tabs mb-4 justify-content-center">
            <li className="nav-item">
              <button
                className={`nav-link ${tab === "login" ? "active" : ""}`}
                onClick={() => {
                  setTab("login");
                  setLoginError("");
                  setRegisterError("");
                }}
                disabled={isLoading}
              >
                Login
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${tab === "register" ? "active" : ""}`}
                onClick={() => {
                  setTab("register");
                  setLoginError("");
                  setRegisterError("");
                }}
                disabled={isLoading}
              >
                Register
              </button>
            </li>
          </ul>

          {tab === "login" && (
            <form onSubmit={handleLogin}>
              {loginError && (
                <div className="alert alert-danger" role="alert">
                  {loginError}
                </div>
              )}
              <div className="mb-3">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className="form-control"
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  required
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
              </div>
              <button type="submit" className="btn btn-primary w-100 mt-3" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </form>
          )}

          {tab === "register" && (
            <form onSubmit={handleRegister}>
              {registerError && (
                <div className="alert alert-danger" role="alert">
                  {registerError}
                </div>
              )}
              <div className="mb-3">
                <label className="form-label">Full Name</label>
                <input
                  className={`form-control ${errors.fullName ? "is-invalid" : ""}`}
                  value={registerData.fullName}
                  onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                  disabled={isLoading}
                />
                {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  disabled={isLoading}
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label">Username</label>
                <input
                  className={`form-control ${errors.username ? "is-invalid" : ""}`}
                  value={registerData.username}
                  onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                  disabled={isLoading}
                />
                {errors.username && <div className="invalid-feedback">{errors.username}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className={`form-control ${errors.password ? "is-invalid" : ""}`}
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  disabled={isLoading}
                />
                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                  disabled={isLoading}
                />
                {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label">Role</label>
                <select
                  className="form-select"
                  value={registerData.role}
                  onChange={(e) => setRegisterData({ ...registerData, role: e.target.value })}
                  disabled={isLoading}
                >
                  <option value="student">Student</option>
                  <option value="lecturer">Lecturer</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
                {isLoading ? "Registering..." : "Register"}
              </button>
            </form>
          )}
        </div>

        <div className="col-lg-6 d-none d-lg-flex align-items-center justify-content-center bg-primary text-white p-5">
          <div>
            <h3 className="fw-bold">Welcome to Campus Connect Services</h3>
            <p className="mt-3">
              Manage room bookings, class schedules, maintenance requests, announcements, and more—all in one place.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}