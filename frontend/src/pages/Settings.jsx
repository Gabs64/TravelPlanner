import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaMoon,
  FaSun,
  FaBell,
  FaGlobe,
  FaShieldAlt,
  FaSignOutAlt,
  FaTrashAlt,
} from "react-icons/fa";
import "./Settings.css";

const Settings = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState("en");
  const [privacy, setPrivacy] = useState("public");
  const [loading, setLoading] = useState(true);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const API_BASE =
    process.env.REACT_APP_API_BASE || "https://travelplanner-backend-rp6r.onrender.com";

  const loadSettings = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_BASE}/profile/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const profile = await response.json();
        const settings = profile.settings || {};

        setDarkMode(Boolean(settings.darkMode));
        setNotifications(settings.notifications ?? true);
        setLanguage(settings.language || "en");
        setPrivacy(settings.privacy || "public");

        localStorage.setItem("darkMode", Boolean(settings.darkMode).toString());
        localStorage.setItem("notifications", (settings.notifications ?? true).toString());
        localStorage.setItem("language", settings.language || "en");
        localStorage.setItem("privacy", settings.privacy || "public");

        if (settings.darkMode) {
          document.documentElement.classList.add("dark-mode");
          document.body.classList.add("dark-mode-body");
        } else {
          document.documentElement.classList.remove("dark-mode");
          document.body.classList.remove("dark-mode-body");
        }
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  }, [navigate, API_BASE]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveSettings = async (updatedSettings) => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      await fetch(`${API_BASE}/profile/${userId}/settings`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedSettings),
      });
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  const handleDarkModeChange = async () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add("dark-mode");
      document.body.classList.add("dark-mode-body");
    } else {
      document.documentElement.classList.remove("dark-mode");
      document.body.classList.remove("dark-mode-body");
    }

    await saveSettings({
      darkMode: newDarkMode,
      notifications,
      language,
      privacy,
    });
  };

  const handleNotificationsChange = async () => {
    const newNotifications = !notifications;
    setNotifications(newNotifications);

    await saveSettings({
      darkMode,
      notifications: newNotifications,
      language,
      privacy,
    });
  };

  const handleLanguageChange = async (e) => {
    const lang = e.target.value;
    setLanguage(lang);

    await saveSettings({
      darkMode,
      notifications,
      language: lang,
      privacy,
    });
  };

  const handlePrivacyChange = async (e) => {
    const priv = e.target.value;
    setPrivacy(priv);

    await saveSettings({
      darkMode,
      notifications,
      language,
      privacy: priv,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    setDeleteError("");

    if (!deletePassword.trim()) {
      setDeleteError("Please enter your password to confirm account deletion.");
      return;
    }

    try {
      setDeleting(true);

      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      const response = await fetch(`${API_BASE}/profile/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: deletePassword,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete account");
      }

      localStorage.clear();
      document.documentElement.classList.remove("dark-mode");
      document.body.classList.remove("dark-mode-body");
      navigate("/");
    } catch (err) {
      setDeleteError(err.message || "Failed to delete account");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="settings-page">
      <div className="settings-content">
        <div className="page-header">
          <h2>Settings</h2>
          <p>Manage your preferences and account settings.</p>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading settings...</p>
          </div>
        ) : (
          <div className="settings-container">
            <section className="settings-section">
              <div className="section-title">
                <span className="section-icon">{darkMode ? <FaMoon /> : <FaSun />}</span>
                <h3>Appearance</h3>
              </div>

              <div className="settings-item">
                <div className="item-label">
                  <span className="item-title">Dark Mode</span>
                  <span className="item-description">
                    {darkMode ? "Enabled" : "Disabled"} - Switch to a darker theme
                  </span>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={darkMode} onChange={handleDarkModeChange} />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </section>

            <section className="settings-section">
              <div className="section-title">
                <span className="section-icon"><FaBell /></span>
                <h3>Notifications</h3>
              </div>

              <div className="settings-item">
                <div className="item-label">
                  <span className="item-title">Push Notifications</span>
                  <span className="item-description">
                    {notifications ? "Enabled" : "Disabled"} - Receive trip and booking updates
                  </span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notifications}
                    onChange={handleNotificationsChange}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </section>

            <section className="settings-section">
              <div className="section-title">
                <span className="section-icon"><FaGlobe /></span>
                <h3>Language & Region</h3>
              </div>

              <div className="settings-item">
                <div className="item-label">
                  <span className="item-title">Language</span>
                  <span className="item-description">Choose your preferred language</span>
                </div>
                <select value={language} onChange={handleLanguageChange} className="select-input">
                  <option value="en">English</option>
                  <option value="es">Español (Spanish)</option>
                  <option value="fr">Français (French)</option>
                  <option value="de">Deutsch (German)</option>
                  <option value="ja">日本語 (Japanese)</option>
                  <option value="ph">Filipino (Tagalog)</option>
                </select>
              </div>
            </section>

            <section className="settings-section">
              <div className="section-title">
                <span className="section-icon"><FaShieldAlt /></span>
                <h3>Privacy & Security</h3>
              </div>

              <div className="settings-item">
                <div className="item-label">
                  <span className="item-title">Profile Visibility</span>
                  <span className="item-description">Control who can see your trips and profile</span>
                </div>
                <select value={privacy} onChange={handlePrivacyChange} className="select-input">
                  <option value="public">Public - Everyone can see</option>
                  <option value="friends">Friends Only</option>
                  <option value="private">Private - Only me</option>
                </select>
              </div>
            </section>

            <section className="settings-section danger-section">
              <div className="section-title">
                <span className="section-icon danger-icon"><FaTrashAlt /></span>
                <h3>Delete Account</h3>
              </div>

              <div className="settings-item">
                <div className="item-label">
                  <span className="item-title">Permanent Account Deletion</span>
                  <span className="item-description">
                    Delete your profile and saved account data from the database.
                  </span>
                </div>

                <button
                  className="delete-account-btn button-ripple"
                  onClick={() => {
                    setDeletePassword("");
                    setDeleteError("");
                    setDeleteModalOpen(true);
                  }}
                >
                  Delete Account
                </button>
              </div>
            </section>

            <section className="settings-section logout-section">
              <button onClick={handleLogout} className="logout-btn button-ripple">
                <FaSignOutAlt /> Logout
              </button>
            </section>

            <section className="settings-section info-section">
              <div className="info-item">
                <span className="info-label">App Version</span>
                <span className="info-value">1.0.0</span>
              </div>
              <div className="info-item">
                <span className="info-label">Last Updated</span>
                <span className="info-value">May 6, 2026</span>
              </div>
            </section>
          </div>
        )}
      </div>

      {deleteModalOpen && (
        <div className="delete-modal-overlay" onClick={() => setDeleteModalOpen(false)}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete your account?</h3>
            <p>
              This action is permanent. Your profile will be removed from the database.
              Enter your password to confirm.
            </p>

            <input
              type="password"
              placeholder="Enter password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
            />

            {deleteError && <div className="delete-error">{deleteError}</div>}

            <div className="delete-modal-actions">
              <button
                className="confirm-delete-btn button-ripple"
                onClick={handleDeleteAccount}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>

              <button
                className="cancel-delete-btn button-ripple"
                onClick={() => setDeleteModalOpen(false)}
                disabled={deleting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Settings;
