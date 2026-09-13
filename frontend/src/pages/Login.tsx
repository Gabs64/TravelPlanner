import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaPlane } from "react-icons/fa";
import API_BASE from "../apiConfig";
import "./Login.css";

const FaPlaneIcon = FaPlane as any;
const FaCheckIcon = FaCheckCircle as any;

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
  const [isSuccessTransition, setIsSuccessTransition] = useState(false);

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

          // Await user profile settings sync so dark mode is set BEFORE navigating
          try {
            const profileRes = await fetch(`${API_BASE}/profile/${data.userId}`, {
              headers: { Authorization: `Bearer ${data.token}` },
            });
            if (profileRes.ok) {
              const profile = await profileRes.json();
              const settings = profile.settings || {};
              const isDark = Boolean(settings.darkMode);

              localStorage.setItem("darkMode", isDark.toString());
              localStorage.setItem("notifications", (settings.notifications ?? true).toString());
              localStorage.setItem("language", settings.language || "en");
              localStorage.setItem("privacy", settings.privacy || "public");

              if (isDark) {
                document.documentElement.classList.add("dark-mode");
                document.body.classList.add("dark-mode-body");
              } else {
                document.documentElement.classList.remove("dark-mode");
                document.body.classList.remove("dark-mode-body");
              }
              window.dispatchEvent(new Event("darkModeChanged"));
            }
          } catch (profileErr) {
            console.error("Error syncing profile settings on login:", profileErr);
          }
        }

        // Trigger top-tier login success animation transition
        setIsSuccessTransition(true);

        setTimeout(() => {
          navigate("/home");
        }, 1300);
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
      <div className="login-blob blob-1"></div>
      <div className="login-blob blob-2"></div>
      <div className="login-blob blob-3"></div>

      <div className="login-shell">
        <div className="login-logo-wrapper">
          <img className="login-logo" src="/TPLogo.png" alt="TravelPlanner logo" />
        </div>

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

      {isSuccessTransition && (
        <div className="login-success-overlay">
          <div className="warp-portal-ring"></div>
          <div className="warp-portal-ring ring-2"></div>
          
          <div className="particles-container">
            <span className="p-particle p1">✨</span>
            <span className="p-particle p2">✈️</span>
            <span className="p-particle p3">🌟</span>
            <span className="p-particle p4">🏝️</span>
            <span className="p-particle p5">✨</span>
          </div>

          <div className="flying-plane-wrapper">
            <FaPlaneIcon className="warp-plane-icon" />
            <div className="plane-jet-trail"></div>
          </div>

          <div className="success-content-card">
            <div className="success-icon-badge">
              <FaCheckIcon />
            </div>
            <h3>Authentication Successful</h3>
            <p>Taking off to your personalized Travel Dashboard...</p>

            <div className="warp-loader-bar">
              <div className="warp-loader-fill"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
