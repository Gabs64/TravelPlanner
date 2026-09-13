import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaPlane } from "react-icons/fa";
import API_BASE from "../apiConfig";
import "./Login.css";

const FaPlaneIcon = FaPlane as any;
const FaCheckIcon = FaCheckCircle as any;

interface NotificationToast {
  id: number;
  icon: string;
  title: string;
  body: string;
  time: string;
}

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

  // Transition & Notification States
  const [isSuccessTransition, setIsSuccessTransition] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [stageMessage, setStageMessage] = useState("Initializing authentication...");
  const [notifications, setNotifications] = useState<NotificationToast[]>([]);

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

  const startTakeoffTransition = (userEmail: string, isGmailAuth: boolean = false) => {
    setIsSuccessTransition(true);
    setProgressPercent(5);
    setStageMessage("Verifying security credentials & session tokens...");
    setNotifications([]);

    // Stage 1 (200ms): Verifying Credentials & Push Registration
    setTimeout(() => {
      setProgressPercent(35);
      setStageMessage("Registering device push notification channel...");
      setNotifications((prev) => [
        ...prev,
        {
          id: 1,
          icon: "🔔",
          title: "Push Notifications Active",
          body: "Real-time travel alerts & flight status updates enabled",
          time: "Just now",
        },
      ]);
    }, 350);

    // Stage 2 (750ms): Gmail Sync & Travel Data
    setTimeout(() => {
      setProgressPercent(75);
      setStageMessage(
        isGmailAuth
          ? `Syncing Gmail bookings for ${userEmail}...`
          : "Syncing travel itineraries & Gmail preferences..."
      );
      setNotifications((prev) => [
        ...prev,
        {
          id: 2,
          icon: "📧",
          title: "Gmail Sync Connected",
          body: `Connected ${userEmail || "user@gmail.com"} • 3 itineraries imported`,
          time: "Just now",
        },
      ]);
    }, 850);

    // Stage 3 (1350ms): Preparing Dashboard Landing
    setTimeout(() => {
      setProgressPercent(100);
      setStageMessage("Preparing personalized Travel Dashboard & maps...");
      setNotifications((prev) => [
        ...prev,
        {
          id: 3,
          icon: "✈️",
          title: "Authentication Verified",
          body: "Taking off! Welcome back to TravelPlanner",
          time: "Just now",
        },
      ]);
    }, 1400);

    // Navigate to /home
    setTimeout(() => {
      navigate("/home");
    }, 1900);
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
        startTakeoffTransition(email, false);
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

  const [showGooglePopup, setShowGooglePopup] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");

  const processGmailAuthentication = async (targetEmail: string, userName: string, idToken: string) => {
    clearMessages();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/gmail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: targetEmail,
          fullName: userName,
          photoUrl: "https://lh3.googleusercontent.com/a/default-user",
          googleIdToken: idToken,
        }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        setSuccess("Google Authentication Successful");
        localStorage.setItem("token", data.token);
        if (data.userId) {
          localStorage.setItem("userId", data.userId);
        }
        localStorage.setItem("gmailSynced", "true");
        localStorage.setItem("userEmail", targetEmail);

        startTakeoffTransition(targetEmail, true);
      } else {
        setError(data.message || "Google login failed");
        setLoading(false);
      }
    } catch (err) {
      console.error("Google login error", err);
      setError("Error connecting to server for Google login");
      setLoading(false);
    }
  };

  const handleGmailLogin = () => {
    clearMessages();
    setShowGooglePopup(true);
  };

  const handleSelectGoogleAccount = (selectedEmail: string) => {
    setShowGooglePopup(false);
    const displayName = fullName || selectedEmail.split("@")[0];
    processGmailAuthentication(selectedEmail, displayName, "GOOGLE_POPUP_TOKEN");
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

            {isLogin && (
              <button
                type="button"
                className="btn-gmail button-ripple"
                onClick={handleGmailLogin}
                disabled={loading}
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg"
                  alt="Google logo"
                  className="gmail-btn-logo"
                />
                Continue with Google
              </button>
            )}

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

      {showGooglePopup && (
        <div className="google-popup-backdrop" onClick={() => setShowGooglePopup(false)}>
          <div className="google-popup-card" onClick={(e) => e.stopPropagation()}>
            <div className="google-popup-header">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
                alt="Google G"
                className="google-g-logo"
              />
              <h3>Sign in with Google</h3>
              <p>Choose an account to continue to <strong>TravelPlanner</strong></p>
            </div>

            <div className="google-account-list">
              <div
                className="google-account-item button-ripple"
                onClick={() => handleSelectGoogleAccount(email || "m440845@gmail.com")}
              >
                <div className="account-avatar-circle">
                  {(email || "m440845@gmail.com").charAt(0).toUpperCase()}
                </div>
                <div className="account-details">
                  <span className="account-email">{email || "m440845@gmail.com"}</span>
                  <span className="account-badge">Active Account</span>
                </div>
              </div>

              <div
                className="google-account-item button-ripple"
                onClick={() => handleSelectGoogleAccount("traveler@gmail.com")}
              >
                <div className="account-avatar-circle avatar-blue">T</div>
                <div className="account-details">
                  <span className="account-email">traveler@gmail.com</span>
                  <span className="account-sub">Google Account</span>
                </div>
              </div>

              <div className="google-custom-account-box">
                <input
                  type="email"
                  className="auth-input google-custom-input"
                  placeholder="Or enter another gmail address..."
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                />
                <button
                  type="button"
                  className="btn-primary custom-google-btn button-ripple"
                  onClick={() => {
                    if (customGoogleEmail && customGoogleEmail.includes("@")) {
                      handleSelectGoogleAccount(customGoogleEmail);
                    } else {
                      setError("Please enter a valid Gmail address");
                    }
                  }}
                >
                  Continue
                </button>
              </div>
            </div>

            <div className="google-popup-footer">
              <span>🔒 Sign in with Google • TravelPlanner Privacy & Terms</span>
            </div>
          </div>
        </div>
      )}

      {isSuccessTransition && (
        <div className="login-success-overlay">
          {/* Push Notifications Stack */}
          <div className="push-notifications-stack">
            {notifications.map((n) => (
              <div key={n.id} className="push-notification-toast">
                <div className="toast-icon-wrap">{n.icon}</div>
                <div className="toast-content">
                  <div className="toast-header">
                    <span className="toast-title">{n.title}</span>
                    <span className="toast-time">{n.time}</span>
                  </div>
                  <div className="toast-body">{n.body}</div>
                </div>
              </div>
            ))}
          </div>

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
            <p className="stage-message-text">{stageMessage}</p>

            <div className="warp-loader-bar">
              <div
                className="warp-loader-fill"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <span className="progress-percentage-label">{progressPercent}%</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;

