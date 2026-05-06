import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { flushSync } from "react-dom";
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
    img: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=400&q=80",
  },
];

const slugify = (text) => text.toLowerCase().replace(/\s+/g, "-");

const navigateWithTransition = (navigate, path) => {
  if (document.startViewTransition) {
    document.startViewTransition(() => {
      flushSync(() => {
        navigate(path);
      });
    });
  } else {
    navigate(path);
  }
};


const Home = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    nickname: "",
    hasPhoto: false,
    photoUrl: "",
  });
  const [stats, setStats] = useState({
    tripsPlanned: 0,
    upcomingTrips: 0,
    visitedPlaces: 0,
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
          const photoUrl =
            data.photoUrl && !data.photoUrl.includes("localhost")
              ? data.photoUrl
              : data.hasPhoto
                ? `${API_BASE}/profile/${encodeURIComponent(userId)}/photo`
                : "";

          setUser({
            nickname: data.nickname || data.fullName || "User",
            hasPhoto: Boolean(data.hasPhoto),
            photoUrl,
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    const fetchTripStats = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) return;

      try {
        const res = await fetch(`${API_BASE}/trips/${encodeURIComponent(userId)}/stats`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setStats({
            tripsPlanned: data.tripsPlanned || 0,
            upcomingTrips: data.upcomingTrips || 0,
            visitedPlaces: data.visitedPlaces || 0,
          });
        }
      } catch (err) {
        console.error("Error fetching trip stats:", err);
      }
    };

    fetchProfile();
    fetchTripStats();
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
            <p>{stats.tripsPlanned}</p>
          </div>

          <div className="card">
            <h3>Upcoming Trips</h3>
            <p>{stats.upcomingTrips}</p>
          </div>

          <div className="card">
            <h3>Visited Places</h3>
            <p>{stats.visitedPlaces}</p>
          </div>
        </div>

        <section className="section">
          <h2>Popular Destinations</h2>

          <div className="destinations">
            {destinations.map((dest) => {
              const slug = slugify(dest.name);

              return (
                <div
                  className="destination-card"
                  key={dest.name}
                  style={{ viewTransitionName: `dest-card-${slug}` }}
                >
                  <img
                    src={dest.img}
                    alt={dest.name}
                    style={{ viewTransitionName: `dest-image-${slug}` }}
                  />
                  <h3>{dest.name}</h3>
                  <p>{dest.desc}</p>
                  <button
                    className="button-ripple"
                    onClick={() =>
                      navigateWithTransition(navigate, `/destination/${slug}`)
                    }
                  >
                    Plan Trip
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
};

export default Home;
