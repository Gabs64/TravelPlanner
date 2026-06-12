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

const getUnsplashImage = (keyword) => {
  const kw = (keyword || "").toLowerCase();
  if (kw.includes("palawan") || kw.includes("lagoon") || kw.includes("coron")) {
    return "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=400&q=80";
  }
  if (kw.includes("siargao") || kw.includes("surf") || kw.includes("waves")) {
    return "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=400&q=80";
  }
  if (kw.includes("vigan") || kw.includes("heritage") || kw.includes("streets") || kw.includes("colonial")) {
    return "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80";
  }
  if (kw.includes("mountain") || kw.includes("hiking") || kw.includes("banaue")) {
    return "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80";
  }
  if (kw.includes("beach") || kw.includes("island") || kw.includes("sea")) {
    return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80";
  }
  const fallbacks = [
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=400&q=80"
  ];
  const charSum = kw.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return fallbacks[charSum % fallbacks.length];
};

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

  const [aiDestinations, setAiDestinations] = useState([]);
  const [aiLoading, setAiLoading] = useState(true);

  const fetchAiDestinations = async () => {
    setAiLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/ai/popular-destinations`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setAiDestinations(data);
      }
    } catch (err) {
      console.error("Error fetching AI destinations:", err);
    } finally {
      setAiLoading(false);
    }
  };

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
    fetchAiDestinations();
  }, []);

  return (
    <main className="home-container">
      <div className="home-content">
        <div className="navbar">
          <input type="text" placeholder="Search destinations..." />

          <div className="user" onClick={() => navigate('/profile')}>
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

        <section className="section ai-section">
          <div className="ai-section-header">
            <h2>✨ AI Recommended Destinations</h2>
            <button 
              className="refresh-ai-btn button-ripple" 
              onClick={fetchAiDestinations} 
              disabled={aiLoading}
            >
              🔄 Refresh Recommendations
            </button>
          </div>

          <div className="destinations">
            {aiLoading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <div className="destination-card skeleton-card" key={idx}>
                  <div className="skeleton skeleton-img"></div>
                  <div className="skeleton skeleton-title"></div>
                  <div className="skeleton skeleton-desc"></div>
                  <div className="skeleton skeleton-btn"></div>
                </div>
              ))
            ) : (
              aiDestinations.map((dest) => {
                const slug = slugify(dest.name);
                const img = getUnsplashImage(dest.imageKeyword || dest.name);

                return (
                  <div
                    className="destination-card ai-card"
                    key={dest.name}
                    style={{ viewTransitionName: `dest-card-${slug}` }}
                  >
                    <img
                      src={img}
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
              })
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

export default Home;
