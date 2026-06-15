import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { flushSync } from "react-dom";
import {
  FaRoute,
  FaCalendarAlt,
  FaMapMarkedAlt,
  FaCompass,
  FaRobot,
  FaSearch,
  FaSync
} from "react-icons/fa";
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

const getCategoryBadge = (name) => {
  const n = name.toLowerCase();
  if (n.includes("boracay") || n.includes("beach") || n.includes("island") || n.includes("lagoon") || n.includes("coron") || n.includes("palawan") || n.includes("siargao")) {
    return "🏝️ Island";
  }
  if (n.includes("baguio") || n.includes("mountain") || n.includes("hiking") || n.includes("hills") || n.includes("batanes") || n.includes("sagada")) {
    return "🌲 Nature";
  }
  if (n.includes("vigan") || n.includes("heritage") || n.includes("culture") || n.includes("cebu") || n.includes("church") || n.includes("iloilo")) {
    return "🏛️ Culture";
  }
  return "✈️ Explore";
};

const getUnsplashImage = (keyword) => {
  const kw = (keyword || "").toLowerCase();
  
  if (kw.includes("bohol") || kw.includes("chocolate")) {
    return "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=500&q=80";
  }
  if (kw.includes("palawan") || kw.includes("lagoon") || kw.includes("coron") || kw.includes("el nido")) {
    return "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=500&q=80";
  }
  if (kw.includes("siargao") || kw.includes("surf") || kw.includes("waves")) {
    return "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=500&q=80";
  }
  if (kw.includes("vigan") || kw.includes("heritage") || kw.includes("streets") || kw.includes("colonial") || kw.includes("crisologo")) {
    return "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=500&q=80";
  }
  if (kw.includes("batanes") || kw.includes("hills")) {
    return "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=500&q=80";
  }
  if (kw.includes("legazpi") || kw.includes("mayon") || kw.includes("camiguin") || kw.includes("volcano") || kw.includes("crater")) {
    return "https://images.unsplash.com/photo-1580258169129-c8526b1f2eb0?auto=format&fit=crop&w=500&q=80";
  }
  if (kw.includes("sagada") || kw.includes("davao") || kw.includes("mountain") || kw.includes("hiking") || kw.includes("banaue") || kw.includes("apo")) {
    return "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=500&q=80";
  }
  if (kw.includes("siquijor") || kw.includes("waterfall") || kw.includes("falls")) {
    return "https://images.unsplash.com/photo-1432406776043-698612709636?auto=format&fit=crop&w=500&q=80";
  }
  if (kw.includes("iloilo") || kw.includes("church") || kw.includes("cathedral")) {
    return "https://images.unsplash.com/photo-1548625361-155de0cbb3e5?auto=format&fit=crop&w=500&q=80";
  }
  if (kw.includes("dumaguete") || kw.includes("turtle") || kw.includes("marine")) {
    return "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?auto=format&fit=crop&w=500&q=80";
  }
  if (kw.includes("tagaytay") || kw.includes("lake") || kw.includes("taal")) {
    return "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=500&q=80";
  }
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

  const [stats, setStats] = useState({
    tripsPlanned: 0,
    upcomingTrips: 0,
    visitedPlaces: 0,
  });

  const [greeting, setGreeting] = useState("Hello");
  const [userName, setUserName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
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

    const fetchUserProfile = async () => {
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
          const name = data.nickname || data.fullName || "";
          setUserName(name);
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };

    const determineGreeting = () => {
      const hrs = new Date().getHours();
      if (hrs < 12) return "Good morning";
      if (hrs < 18) return "Good afternoon";
      return "Good evening";
    };

    setGreeting(determineGreeting());
    fetchTripStats();
    fetchUserProfile();
  }, []);

  useEffect(() => {
    fetchAiDestinations([], selectedCountry);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry]);

  // Filtering destinations locally based on the search query
  const filteredStaticDestinations = destinations.filter(dest =>
    dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dest.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAiDestinations = aiDestinations.filter(dest =>
    dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dest.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="home-container">
      <div className="home-content">
        
        {/* Dynamic Welcome Header */}
        <header className="welcome-header">
          <div className="welcome-text">
            <h2>{greeting}, {userName || "Traveler"}! 👋</h2>
            <p>Ready to map out your next adventure?</p>
          </div>
        </header>

        {/* Hero Banner Section */}
        <section className="hero-banner">
          <div className="hero-glow"></div>
          <div className="hero-badge">✨ AI-Powered Planner</div>
          <h1>Explore the World, Smarter</h1>
          <p>
            Create fully customized day-by-day itineraries, discover trending local sights, and sync dynamically with Mapbox navigation using our AI virtual agent.
          </p>
          
          <div className="hero-search-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search destinations (e.g. Boracay, Baguio...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="hero-actions">
            <button
              className="cta-btn primary button-ripple"
              onClick={() => navigateWithTransition(navigate, "/ai-suggester")}
            >
              <FaRobot /> Try AI Suggester
            </button>
            <button
              className="cta-btn secondary button-ripple"
              onClick={() => navigateWithTransition(navigate, "/explore")}
            >
              <FaCompass /> Browse All
            </button>
          </div>
        </section>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stats-card planned-trips">
            <div className="stats-icon-container">
              <FaRoute />
            </div>
            <div className="stats-info">
              <h3>Trips Planned</h3>
              <p>{stats.tripsPlanned}</p>
            </div>
          </div>

          <div className="stats-card upcoming">
            <div className="stats-icon-container">
              <FaCalendarAlt />
            </div>
            <div className="stats-info">
              <h3>Upcoming Trips</h3>
              <p>{stats.upcomingTrips}</p>
            </div>
          </div>

          <div className="stats-card visited">
            <div className="stats-icon-container">
              <FaMapMarkedAlt />
            </div>
            <div className="stats-info">
              <h3>Visited Places</h3>
              <p>{stats.visitedPlaces}</p>
            </div>
          </div>
        </div>

        {/* Popular Destinations */}
        <section className="section">
          <div className="section-header">
            <h2>🔥 Popular Destinations</h2>
            <p>Timeless locations travelers love visiting</p>
          </div>

          {filteredStaticDestinations.length === 0 ? (
            <div className="empty-results">No destinations match "{searchQuery}"</div>
          ) : (
            <div className="destinations-grid">
              {filteredStaticDestinations.map((dest) => {
                const slug = slugify(dest.name);
                const category = getCategoryBadge(dest.name);

                return (
                  <div
                    className="destination-card-premium"
                    key={dest.name}
                    style={{ viewTransitionName: `dest-card-${slug}` }}
                  >
                    <div className="card-image-wrapper">
                      <img
                        src={dest.img}
                        alt={dest.name}
                        style={{ viewTransitionName: `dest-image-${slug}` }}
                      />
                      <span className="card-badge">{category}</span>
                    </div>
                    <div className="card-content">
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
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* AI Recommended Destinations */}
        <section className="section ai-section">
          <div className="ai-section-header">
            <div>
              <h2>✨ AI Recommended Destinations</h2>
              <p>Personalized recommendations curated dynamically</p>
            </div>
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
                <FaSync className={aiLoading ? "spin-animation" : ""} /> Refresh
              </button>
            </div>
          </div>

          {aiLoading ? (
            <div className="destinations-grid">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div className="destination-card-premium skeleton-card" key={idx}>
                  <div className="skeleton skeleton-img"></div>
                  <div className="skeleton skeleton-title"></div>
                  <div className="skeleton skeleton-desc"></div>
                  <div className="skeleton skeleton-btn"></div>
                </div>
              ))}
            </div>
          ) : filteredAiDestinations.length === 0 ? (
            <div className="empty-results">No AI recommendations match "{searchQuery}"</div>
          ) : (
            <div className="destinations-grid">
              {filteredAiDestinations.map((dest) => {
                const slug = slugify(dest.name);
                const img = getUnsplashImage(dest.imageKeyword || dest.name);
                const category = getCategoryBadge(dest.name);

                return (
                  <div
                    className="destination-card-premium ai-card-glowing"
                    key={dest.name}
                    style={{ viewTransitionName: `dest-card-${slug}-ai` }}
                  >
                    <div className="card-image-wrapper">
                      <img
                        src={img}
                        alt={dest.name}
                        style={{ viewTransitionName: `dest-image-${slug}-ai` }}
                      />
                      <span className="card-badge">{category}</span>
                      <span className="ai-label-pill">AI Suggested</span>
                    </div>
                    <div className="card-content">
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
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default Home;
