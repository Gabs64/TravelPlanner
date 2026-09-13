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
  FaCog,
  FaUserFriends,
  FaLock
} from "react-icons/fa";
import "./Settings.css";
import API_BASE from "../apiConfig";
import { useLanguage } from "../context/LanguageContext";
import CustomSelect from "../components/CustomSelect";

const Settings = () => {
  const navigate = useNavigate();
  const { language, setLanguage: setGlobalLanguage, t } = useLanguage();
  const [darkMode, setDarkMode] = useState(false);

  const languageOptions = [
    { value: "en", label: "English", icon: <img src="https://flagcdn.com/w40/us.png" alt="US" className="flag-icon-img" /> },
    { value: "es", label: "Español (Spanish)", icon: <img src="https://flagcdn.com/w40/es.png" alt="ES" className="flag-icon-img" /> },
    { value: "fr", label: "Français (French)", icon: <img src="https://flagcdn.com/w40/fr.png" alt="FR" className="flag-icon-img" /> },
    { value: "de", label: "Deutsch (German)", icon: <img src="https://flagcdn.com/w40/de.png" alt="DE" className="flag-icon-img" /> },
    { value: "ja", label: "日本語 (Japanese)", icon: <img src="https://flagcdn.com/w40/jp.png" alt="JP" className="flag-icon-img" /> },
    { value: "ph", label: "Filipino (Tagalog)", icon: <img src="https://flagcdn.com/w40/ph.png" alt="PH" className="flag-icon-img" /> },
  ];

  const privacyOptions = [
    { value: "public", label: t("settings_public", "Public - Everyone can see"), icon: <FaGlobe style={{ color: "#3b82f6" }} /> },
    { value: "friends", label: t("settings_friends", "Friends Only"), icon: <FaUserFriends style={{ color: "#10b981" }} /> },
    { value: "private", label: t("settings_private", "Private - Only me"), icon: <FaLock style={{ color: "#f59e0b" }} /> },
  ];
  const [notifications, setNotifications] = useState(true);
  const [privacy, setPrivacy] = useState("public");
  const [loading, setLoading] = useState(true);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

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
        if (settings.language) {
          setGlobalLanguage(settings.language);
        }
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
  }, [navigate, setGlobalLanguage]);

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

    localStorage.setItem("darkMode", newDarkMode.toString());

    if (newDarkMode) {
      document.documentElement.classList.add("dark-mode");
      document.body.classList.add("dark-mode-body");
    } else {
      document.documentElement.classList.remove("dark-mode");
      document.body.classList.remove("dark-mode-body");
    }

    window.dispatchEvent(new Event("darkModeChanged"));

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
    setGlobalLanguage(lang);

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

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("darkMode");
    document.documentElement.classList.remove("dark-mode");
    document.body.classList.remove("dark-mode-body");
    window.dispatchEvent(new Event("darkModeChanged"));
    setLogoutModalOpen(false);
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
        <div className="page-header settings-header">
          <div className="header-title-wrapper">
            <div className="header-icon-badge">
              <FaCog />
            </div>
            <div>
              <h2>{t("settings_title", "Settings")}</h2>
              <p>{t("settings_subtitle", "Manage your preferences and account settings.")}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>{t("loading", "Loading settings...")}</p>
          </div>
        ) : (
          <div className="settings-container">
            <section className="settings-section">
              <div className="section-title">
                <span className="section-icon">{darkMode ? <FaMoon /> : <FaSun />}</span>
                <h3>{t("settings_appearance", "Appearance")}</h3>
              </div>

              <div className="settings-item">
                <div className="item-label">
                  <span className="item-title">{t("settings_dark_mode", "Dark Mode")}</span>
                  <span className="item-description">
                    {darkMode ? t("settings_enabled", "Enabled") : t("settings_disabled", "Disabled")} - {t("settings_dark_mode_desc", "Switch to a darker theme")}
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
                <h3>{t("settings_notifications", "Notifications")}</h3>
              </div>

              <div className="settings-item">
                <div className="item-label">
                  <span className="item-title">{t("settings_push_notifications", "Push Notifications")}</span>
                  <span className="item-description">
                    {notifications ? t("settings_enabled", "Enabled") : t("settings_disabled", "Disabled")} - {t("settings_push_desc", "Receive trip and booking updates")}
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
                <h3>{t("settings_language_region", "Language & Region")}</h3>
              </div>

              <div className="settings-item">
                <div className="item-label">
                  <span className="item-title">{t("settings_language", "Language")}</span>
                  <span className="item-description">{t("settings_language_desc", "Choose your preferred language")}</span>
                </div>
                <CustomSelect
                  value={language}
                  onChange={handleLanguageChange}
                  options={languageOptions}
                />
              </div>
            </section>

            <section className="settings-section">
              <div className="section-title">
                <span className="section-icon"><FaShieldAlt /></span>
                <h3>{t("settings_privacy_security", "Privacy & Security")}</h3>
              </div>

              <div className="settings-item">
                <div className="item-label">
                  <span className="item-title">{t("settings_profile_visibility", "Profile Visibility")}</span>
                  <span className="item-description">{t("settings_profile_visibility_desc", "Control who can see your trips and profile")}</span>
                </div>
                <CustomSelect
                  value={privacy}
                  onChange={handlePrivacyChange}
                  options={privacyOptions}
                />
              </div>
            </section>

            <section className="settings-section danger-section">
              <div className="section-title">
                <span className="section-icon danger-icon"><FaTrashAlt /></span>
                <h3>{t("settings_delete_account", "Delete Account")}</h3>
              </div>

              <div className="settings-item">
                <div className="item-label">
                  <span className="item-title">{t("settings_permanent_delete", "Permanent Account Deletion")}</span>
                  <span className="item-description">
                    {t("settings_permanent_delete_desc", "Delete your profile and saved account data from the database.")}
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
                  {t("settings_delete_account", "Delete Account")}
                </button>
              </div>
            </section>

            <section className="settings-section logout-section">
              <button
                onClick={() => setLogoutModalOpen(true)}
                className="logout-btn button-ripple"
              >
                <FaSignOutAlt /> {t("settings_logout", "Logout")}
              </button>
            </section>

            <section className="settings-section info-section">
              <div className="info-item">
                <span className="info-label">{t("settings_app_version", "App Version")}</span>
                <span className="info-value">1.0.0</span>
              </div>
              <div className="info-item">
                <span className="info-label">{t("settings_last_updated", "Last Updated")}</span>
                <span className="info-value">May 6, 2026</span>
              </div>
            </section>
          </div>
        )}
      </div>

      {logoutModalOpen && (
        <div className="delete-modal-overlay" onClick={() => setLogoutModalOpen(false)}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Logout?</h3>
            <p>Are you sure you want to log out of your TravelPlanner account?</p>

            <div className="delete-modal-actions">
              <button className="confirm-logout-btn button-ripple" onClick={confirmLogout}>
                Yes, Logout
              </button>

              <button
                className="cancel-delete-btn button-ripple"
                onClick={() => setLogoutModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
