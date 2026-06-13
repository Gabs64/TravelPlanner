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
  
  // Bohol - Chocolate Hills
  if (kw.includes("bohol") || kw.includes("chocolate")) {
    return "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=500&q=80";
  }
  // Palawan & Coron - Lagoons & Limestone Cliffs
  if (kw.includes("palawan") || kw.includes("lagoon") || kw.includes("coron") || kw.includes("el nido")) {
    return "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=500&q=80";
  }
  // Siargao - Surfing & Surf Breaks
  if (kw.includes("siargao") || kw.includes("surf") || kw.includes("waves")) {
    return "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=500&q=80";
  }
  // Vigan - Calle Crisologo Cobblestone streets
  if (kw.includes("vigan") || kw.includes("heritage") || kw.includes("streets") || kw.includes("colonial") || kw.includes("crisologo")) {
    return "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=500&q=80";
  }
  // Batanes - Green Rolling Hills & Cliffs
  if (kw.includes("batanes") || kw.includes("hills")) {
    return "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=500&q=80";
  }
  // Volcanoes - Legazpi (Mayon) / Camiguin
  if (kw.includes("legazpi") || kw.includes("mayon") || kw.includes("camiguin") || kw.includes("volcano") || kw.includes("crater")) {
    return "https://images.unsplash.com/photo-1580258169129-c8526b1f2eb0?auto=format&fit=crop&w=500&q=80";
  }
  // Sagada / Davao / Mountains / Hiking
  if (kw.includes("sagada") || kw.includes("davao") || kw.includes("mountain") || kw.includes("hiking") || kw.includes("banaue") || kw.includes("apo")) {
    return "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=500&q=80";
  }
  // Siquijor - Waterfalls
  if (kw.includes("siquijor") || kw.includes("waterfall") || kw.includes("falls")) {
    return "https://images.unsplash.com/photo-1432406776043-698612709636?auto=format&fit=crop&w=500&q=80";
  }
  // Iloilo - Heritage Churches
  if (kw.includes("iloilo") || kw.includes("church") || kw.includes("cathedral")) {
    return "https://images.unsplash.com/photo-1548625361-155de0cbb3e5?auto=format&fit=crop&w=500&q=80";
  }
  // Dumaguete - Apo Island Sea Turtles
  if (kw.includes("dumaguete") || kw.includes("turtle") || kw.includes("marine")) {
    return "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?auto=format&fit=crop&w=500&q=80";
  }
  // Tagaytay - Taal Lake Views
  if (kw.includes("tagaytay") || kw.includes("lake") || kw.includes("taal")) {
    return "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=500&q=80";
  }
  // Generic Beach / Puerto Galera / Boracay / Cebu
  if (kw.includes("beach") || kw.includes("island") || kw.includes("sea") || kw.includes("boracay") || kw.includes("puerto") || kw.includes("cebu")) {
    return "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=500&q=80";
  }

  const fallbacks = [
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=500&q=80"
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
  const [recentDestinations, setRecentDestinations] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("Philippines");

  const fetchAiDestinations = async (currentHistory = recentDestinations, country = selectedCountry) => {
    setAiLoading(true);
    const token = localStorage.getItem("token");
    const excludeParam = currentHistory.join(",");
    try {
      const res = await fetch(`${API_BASE}/ai/popular-destinations?exclude=${encodeURIComponent(excludeParam)}&country=${encodeURIComponent(country)}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setAiDestinations(data);
        const newNames = data.map(d => d.name);
        setRecentDestinations(prev => {
          const nextHistory = [...prev.filter(name => !newNames.includes(name)), ...newNames];
          if (nextHistory.length > 20) {
            return nextHistory.slice(nextHistory.length - 20);
          }
          return nextHistory;
        });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchAiDestinations([], selectedCountry);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry]);

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
            <div className="ai-controls">
              <select
                className="country-select"
                value={selectedCountry}
                onChange={(e) => {
                  setSelectedCountry(e.target.value);
                  setRecentDestinations([]);
                }}
                disabled={aiLoading}
              >
                <option value="Philippines">Philippines 🇵🇭</option>
                <option value="Japan">Japan 🇯🇵</option>
                <option value="Italy">Italy 🇮🇹</option>
                <option value="Indonesia">Indonesia 🇮🇩</option>
                <option value="France">France 🇫🇷</option>
                <option value="Switzerland">Switzerland 🇨🇭</option>
                <option value="USA">USA 🇺🇸</option>
              </select>
              <button 
                className="refresh-ai-btn button-ripple" 
                onClick={() => fetchAiDestinations(recentDestinations, selectedCountry)} 
                disabled={aiLoading}
              >
                🔄 Refresh Recommendations
              </button>
            </div>
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
