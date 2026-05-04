import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const API_BASE = "";

function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUserId = localStorage.getItem("userId");

    if (storedToken && storedUserId) {
      navigate("/");
    }
  }, [navigate]);

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFullName("");
    setNickname("");
    setPhone("");
  };

  const handleLogin = async () => {
    clearMessages();

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        setSuccess("Login successful");
        localStorage.setItem("token", data.token);

        if (data.userId) {
          localStorage.setItem("userId", data.userId);
        }

        setTimeout(() => {
          navigate("/home");
        }, 1200);
      } else {
        setError(data.message || "Login failed");
        setLoading(false);
      }
    } catch (err) {
      console.error("login error", err);
      setError("Error connecting to server");
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    clearMessages();

    if (!email || !password || !confirmPassword || !fullName || !nickname || !phone) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (fullName.trim().length < 2) {
      setError("Full name must be at least 2 characters");
      return;
    }

    if (nickname.trim().length < 2) {
      setError("Nickname must be at least 2 characters");
      return;
    }

    const phoneDigits = phone.replace(/\D/g, "");

    if (phoneDigits.length < 10) {
      setError("Phone number must be at least 10 digits");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName, nickname, phone }),
      });

      const data = await response.json();

      if (response.ok) {
        const msg = data.message || "Registration successful";
        setSuccess(msg.charAt(0).toUpperCase() + msg.slice(1));
        resetForm();

        setTimeout(() => {
          setIsLogin(true);
          setSuccess("");
          navigate("/login");
        }, 1200);
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      console.error("register error", err);
      setError("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    clearMessages();
    resetForm();
  };

  return (
    <div className="login-page-container">
      <div className="auth-card">
        <h2>{isLogin ? "Welcome Back" : "Create Account"}</h2>

        {error && <div className="status-banner error-banner">{error}</div>}
        {success && <div className="status-banner success-banner">{success}</div>}

        <div className="input-group">
          <input
            className="auth-input"
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="auth-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {!isLogin && (
            <div className="fade-in register-fields">
              <input
                className="auth-input"
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <input
                className="auth-input"
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />

              <input
                className="auth-input"
                type="text"
                placeholder="Nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />

              <input
                className="auth-input"
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="button-group">
          <button
            className="btn-primary button-ripple"
            onClick={isLogin ? handleLogin : handleRegister}
            disabled={loading}
          >
            {loading ? "Processing..." : isLogin ? "Login" : "Register"}
          </button>

          <button
            className="btn-secondary button-ripple"
            onClick={toggleMode}
            disabled={loading}
          >
            {isLogin ? "Need an account? Register" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
