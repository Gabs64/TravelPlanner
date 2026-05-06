import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE from "../apiConfig";
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    fullName: "",
    nickname: "",
    email: "",
    phone: "",
    hasPhoto: false,
    photoUrl: "",
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

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
        nickname: data.nickname || "",
        email: data.email || "",
        phone: data.phone || "",
        hasPhoto: Boolean(data.hasPhoto),
        photoUrl:
          data.photoUrl ||
          (data.hasPhoto ? `${API_BASE}/profile/${encodeURIComponent(userId)}/photo` : ""),
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

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

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
          nickname: user.nickname,
          phone: user.phone,
        }),
      });

      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "Failed to update profile");

      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);

        const avatarRes = await fetch(`${API_BASE}/profile/${encodeURIComponent(userId)}/photo`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const avatarBody = await avatarRes.json();
        if (!avatarRes.ok) throw new Error(avatarBody.message || "Failed to upload avatar");
      }

      setAvatarFile(null);
      setPreviewUrl("");
      setEditing(false);
      fetchProfile();
    } catch (err) {
      console.error("Error updating profile:", err);
      alert(err.message || "Failed to update profile");
    }
  };

  const handleLogout = () => {
    redirectToLogin();
  };

  if (loading) {
    return (
      <main className="profile-page">
        <div className="profile-content">
          <div className="loading">Loading profile...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <div className="profile-content">
        <div className="page-header">
          <h2>My Profile</h2>
          <p>Manage your account details and travel identity.</p>
        </div>

        {error && <div className="status-banner error-banner">{error}</div>}

        <section className="profile-card">
          <div className="profile-summary">
            <div className="avatar-section">
              <img
                src={previewUrl || user.photoUrl || "https://via.placeholder.com/150?text=User"}
                alt="Avatar"
              />

              {editing && (
                <label className="avatar-upload">
                  Change Photo
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      if (previewUrl) {
                        URL.revokeObjectURL(previewUrl);
                      }

                      const url = URL.createObjectURL(file);
                      setAvatarFile(file);
                      setPreviewUrl(url);
                      setUser({ ...user, photoUrl: url, hasPhoto: true });
                    }}
                  />
                </label>
              )}
            </div>

            <div className="profile-identity">
              <h3>{user.fullName || "Your Name"}</h3>
              <p>{user.nickname ? `@${user.nickname}` : "No nickname set"}</p>
            </div>
          </div>

          {!editing ? (
            <>
              <div className="profile-info-grid">
                <div className="info-item">
                  <span>Email</span>
                  <strong>{user.email || "Not provided"}</strong>
                </div>

                <div className="info-item">
                  <span>Phone</span>
                  <strong>{user.phone || "Not provided"}</strong>
                </div>

                <div className="info-item">
                  <span>Account Status</span>
                  <strong>Active</strong>
                </div>
              </div>

              <div className="button-group">
                <button onClick={() => setEditing(true)} className="edit-btn button-ripple">
                  Edit Profile
                </button>
                <button onClick={handleLogout} className="logout-btn button-ripple">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="edit-form">
              <div className="form-grid">
                <label>
                  Full Name
                  <input
                    type="text"
                    name="fullName"
                    value={user.fullName}
                    onChange={(e) => setUser({ ...user, fullName: e.target.value })}
                  />
                </label>

                <label>
                  Nickname
                  <input
                    type="text"
                    name="nickname"
                    value={user.nickname}
                    onChange={(e) => setUser({ ...user, nickname: e.target.value })}
                  />
                </label>

                <label>
                  Phone
                  <input
                    type="text"
                    name="phone"
                    value={user.phone}
                    onChange={(e) => setUser({ ...user, phone: e.target.value })}
                  />
                </label>
              </div>

              <div className="button-group">
                <button onClick={handleSave} className="save-btn button-ripple">
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    if (previewUrl) {
                      URL.revokeObjectURL(previewUrl);
                    }
                    setAvatarFile(null);
                    setPreviewUrl("");
                    setEditing(false);
                    fetchProfile();
                  }}
                  className="cancel-btn button-ripple"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default Profile;
