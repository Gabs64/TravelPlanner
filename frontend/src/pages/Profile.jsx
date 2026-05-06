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
      const photoUrl =
        data.photoUrl && !data.photoUrl.includes("localhost")
          ? data.photoUrl
          : data.hasPhoto
            ? `${API_BASE}/profile/${encodeURIComponent(userId)}/photo`
            : "";

      setUser({
        fullName: data.fullName || "",
        nickname: data.nickname || "",
        email: data.email || "",
        phone: data.phone || "",
        hasPhoto: Boolean(data.hasPhoto),
        photoUrl,
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

  const handleCancel = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setAvatarFile(null);
    setPreviewUrl("");
    setEditing(false);
    fetchProfile();
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
        <div className="page-header profile-page-header">
          <h2>My Profile</h2>
          <p>Manage your account details and travel identity.</p>
        </div>

        {error && <div className="profile-alert">{error}</div>}

        <section className="profile-shell">
          <aside className="profile-hero-card">
            <div className="profile-avatar-wrap">
              <img
                src={previewUrl || user.photoUrl || "https://via.placeholder.com/150?text=User"}
                alt="Avatar"
              />
            </div>

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

            <h3>{user.fullName || "Your Name"}</h3>
            <p>{user.nickname ? `@${user.nickname}` : "No nickname set"}</p>

            <div className="profile-status-pill">Active Account</div>
          </aside>

          <section className="profile-main-card">
            <div className="profile-section-title">
              <h3>{editing ? "Edit Profile" : "Account Information"}</h3>
              <p>
                {editing
                  ? "Update your visible profile information."
                  : "Your saved contact and profile details."}
              </p>
            </div>

            {!editing ? (
              <div className="profile-detail-list">
                <div className="profile-detail-row">
                  <span>Email Address</span>
                  <strong>{user.email || "Not provided"}</strong>
                </div>

                <div className="profile-detail-row">
                  <span>Phone Number</span>
                  <strong>{user.phone || "Not provided"}</strong>
                </div>

                <div className="profile-detail-row">
                  <span>Display Name</span>
                  <strong>{user.fullName || "Not provided"}</strong>
                </div>

                <div className="profile-detail-row">
                  <span>Nickname</span>
                  <strong>{user.nickname || "Not provided"}</strong>
                </div>
              </div>
            ) : (
              <div className="profile-detail-list">
                <div className="profile-detail-row readonly-row">
                  <span>Email Address</span>
                  <strong>{user.email || "Not provided"}</strong>
                </div>

                <label className="profile-edit-row">
                  <span>Phone Number</span>
                  <input
                    type="text"
                    name="phone"
                    value={user.phone}
                    onChange={(e) => setUser({ ...user, phone: e.target.value })}
                  />
                </label>

                <label className="profile-edit-row">
                  <span>Display Name</span>
                  <input
                    type="text"
                    name="fullName"
                    value={user.fullName}
                    onChange={(e) => setUser({ ...user, fullName: e.target.value })}
                  />
                </label>

                <label className="profile-edit-row">
                  <span>Nickname</span>
                  <input
                    type="text"
                    name="nickname"
                    value={user.nickname}
                    onChange={(e) => setUser({ ...user, nickname: e.target.value })}
                  />
                </label>
              </div>
            )}

            <div className="profile-actions">
              {!editing ? (
                <button onClick={() => setEditing(true)} className="edit-btn button-ripple">
                  Edit Profile
                </button>
              ) : (
                <>
                  <button onClick={handleSave} className="save-btn button-ripple">
                    Save Changes
                  </button>
                  <button onClick={handleCancel} className="cancel-btn button-ripple">
                    Cancel
                  </button>
                </>
              )}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
};

export default Profile;
