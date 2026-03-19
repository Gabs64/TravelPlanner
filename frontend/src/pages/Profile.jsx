import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

// Use CRA dev server proxy (see package.json) to avoid CORS issues
const API_BASE = "";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    fullName: "",
    email: "",
    phone: "",
    hasPhoto: false,
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const redirectToLogin = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setLoading(false);
    navigate("/login");
  };

  const fetchProfile = async () => {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      redirectToLogin();
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/profile/${encodeURIComponent(userId)}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401 || res.status === 403) {
        setError("Session expired. Please log in again.");
        redirectToLogin();
        return;
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Failed to load profile");
      }

      const data = await res.json();
      setUser({
        fullName: data.fullName || "",
        email: data.email || "",
        phone: data.phone || "",
        hasPhoto: Boolean(data.hasPhoto),
      });
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Unable to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save profile
  const handleSave = async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      redirectToLogin();
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/profile/${encodeURIComponent(userId)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: user.fullName,
          phone: user.phone,
        }),
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.message || "Failed to update profile");
      }

      alert(body.message || "Profile updated successfully!");
      setEditing(false);
      fetchProfile();
    } catch (err) {
      console.error("Error updating profile:", err);
      alert(err.message || "Failed to update profile");
    }
  };

  // Logout
  const handleLogout = () => {
    redirectToLogin();
  };

  if (loading) return <div className="loading">LOADING PROFILE...</div>;

  return (
    <div className="profile-page">
      <h2>My Profile</h2>

      {error && <div className="status-banner error-banner">{error}</div>}

      <div className="profile-card">
        <div className="avatar-section">
          <img src="https://i.pravatar.cc/150" alt="Avatar" />
        </div>

        {!editing ? (
          <div className="profile-details">
            <h3>{user.fullName || "Your Name"}</h3>
            <p className="email">{user.email}</p>
            {user.phone && <p>📞 {user.phone}</p>}

            <div className="button-group">
              <button onClick={() => setEditing(true)} className="edit-btn">
                Edit Profile
              </button>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="edit-form">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={user.fullName}
              onChange={(e) => setUser({ ...user, fullName: e.target.value })}
            />

            <label>Phone</label>
            <input
              type="text"
              name="phone"
              value={user.phone}
              onChange={(e) => setUser({ ...user, phone: e.target.value })}
            />

            <div className="button-group">
              <button onClick={handleSave} className="save-btn">
                Save Changes
              </button>
              <button
                onClick={() => setEditing(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;