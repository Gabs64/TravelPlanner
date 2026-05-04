import React, { useEffect, useState } from "react";
import API_BASE from "../apiConfig";
import "./Home.css";

const destinations = [
  {
    name: "Boracay",
    desc: "White sand beaches and nightlife",
    img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Baguio",
    desc: "Cool climate and scenic views",
    img: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Cebu",
    desc: "Urban and island adventure",
    img: "https://images.unsplash.com/photo-1581091012184-529d2f27a511?auto=format&fit=crop&w=400&q=80",
  },
];

const Home = () => {
  const [user, setUser] = useState({
    nickname: "",
    hasPhoto: false,
    photoUrl: "",
  });

  useEffect(() => {
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
          setUser({
            nickname: data.nickname || data.fullName || "User",
            hasPhoto: Boolean(data.hasPhoto),
            photoUrl: data.photoUrl || "",
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, []);

return (
  <main className="home-container">
    <div className="home-content">
      <div className="navbar">
        <input type="text" placeholder="Search destinations..." />

        <div className="user">
          <img
            src={user.photoUrl || "https://via.placeholder.com/40?text=User"}
            alt="user"
          />
          <span>{user.nickname || "User"}</span>
        </div>
      </div>

      <div className="stats">
        <div className="card">
          <h3>Trips Planned</h3>
          <p>12</p>
        </div>

        <div className="card">
          <h3>Upcoming Trips</h3>
          <p>3</p>
        </div>

        <div className="card">
          <h3>Visited Places</h3>
          <p>8</p>
        </div>
      </div>

      <section className="section">
        <h2>Popular Destinations</h2>

        <div className="destinations">
          {destinations.map((dest) => (
            <div className="destination-card" key={dest.name}>
              <img src={dest.img} alt={dest.name} />
              <h3>{dest.name}</h3>
              <p>{dest.desc}</p>
              <button className="button-ripple">Plan Trip</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  </main>
);

};

export default Home;
