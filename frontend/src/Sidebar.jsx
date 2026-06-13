import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaHome, FaMapMarkedAlt, FaBook, FaPlane, FaCog, FaRobot } from "react-icons/fa";
import API_BASE from "./apiConfig";
import "./Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    nickname: "",
    photoUrl: "",
  });
  const [aiActive, setAiActive] = useState(true);
  const [aiMode, setAiMode] = useState("live");

  const menuItems = [
    { name: "Home", path: "/home", icon: <FaHome /> },
    { name: "AI Suggester", path: "/ai-suggester", icon: <FaRobot /> },
    { name: "Explore", path: "/explore", icon: <FaMapMarkedAlt /> },
    { name: "Bookings", path: "/bookings", icon: <FaBook /> },
    { name: "My Trips", path: "/mytrips", icon: <FaPlane /> },
    { name: "Settings", path: "/settings", icon: <FaCog /> },
  ];

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) return;

    try {
      const res = await fetch(`${API_BASE}/profile/${encodeURIComponent(userId)}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        const photoUrl =
          data.photoUrl && !data.photoUrl.includes("localhost")
            ? `${data.photoUrl}?t=${Date.now()}`
            : data.hasPhoto
              ? `${API_BASE}/profile/${encodeURIComponent(userId)}/photo?t=${Date.now()}`
              : "";

        setUser({
          nickname: data.nickname || data.fullName || "User",
          photoUrl,
        });
      }
    } catch (err) {
      console.error("Error fetching profile in sidebar:", err);
    }
  };

  const fetchAiStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/ai/status`);
      if (res.ok) {
        const data = await res.json();
        setAiActive(Boolean(data.active));
        setAiMode(data.mode);
      }
    } catch (err) {
      console.error("Error fetching AI status:", err);
      setAiActive(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchAiStatus();

    // Listen to custom window events for profile updates
    const handleProfileUpdate = () => {
      fetchProfile();
    };
    window.addEventListener("profileUpdated", handleProfileUpdate);

    // Poll AI status changes periodically (every 15 seconds)
    const interval = setInterval(fetchAiStatus, 15000);

    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
      clearInterval(interval);
    };
  }, []);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src="/TPLogo.png" alt="TravelPlanner logo" />
        <span>TravelPlanner</span>
      </div>

      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <li key={item.name}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                isActive ? "menu-item active" : "menu-item"
              }
            >
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-text">{item.name}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="sidebar-footer">
        <div className={`ai-status-indicator ${aiActive ? "active" : "inactive"}`}>
          <span className="status-dot"></span>
          <span className="status-label">
            {aiActive ? "AI Active" : aiMode === "demo" ? "Demo Mode" : "AI Offline"}
          </span>
        </div>

        <div className="sidebar-profile" onClick={() => navigate("/profile")}>
          <img
            src={user.photoUrl || "https://via.placeholder.com/40?text=User"}
            alt="profile avatar"
            className="profile-avatar"
          />
          <div className="profile-info">
            <span className="profile-name">{user.nickname || "User"}</span>
            <span className="profile-subtext">View Profile</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
