import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaRobot,
  FaMapMarkedAlt,
  FaCloudSun,
  FaRoute,
  FaShieldAlt,
  FaStar,
  FaArrowRight,
  FaCompass,
  FaCheckCircle,
  FaSignInAlt
} from "react-icons/fa";
import "./Intro.css";

const popularDestinations = [
  {
    name: "Boracay",
    tag: "🏝️ Island Paradise",
    img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
    desc: "Powdery white sand beaches, crystal sunset sailing, and vibrant nightlife."
  },
  {
    name: "Baguio",
    tag: "🌲 Mountain Escape",
    img: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=600&q=80",
    desc: "Cool pine breezes, scenic parklands, cozy cafes, and local night markets."
  },
  {
    name: "Cebu",
    tag: "🏛️ Cultural Heritage",
    img: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=600&q=80",
    desc: "Historic temples, island hopping adventures, and world-famous lechon."
  },
  {
    name: "Palawan",
    tag: "🌊 Emerald Lagoons",
    img: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=600&q=80",
    desc: "Towering limestone cliffs, turquoise lagoons, and underground rivers."
  }
];

function Intro() {
  const navigate = useNavigate();
  const [isFadingOut, setIsFadingOut] = useState(false);

  const handleNavigateToLogin = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      navigate("/login");
    }, 320);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className={`landing-page ${isFadingOut ? "landing-fade-out" : ""}`}>
      {/* Background Blobs */}
      <div className="landing-blob blob-1"></div>
      <div className="landing-blob blob-2"></div>
      <div className="landing-blob blob-3"></div>

      {/* Top Navbar */}
      <header className="landing-navbar">
        <div className="nav-container">
          <div className="nav-brand">
            <img src="/TPLogo.png" alt="TravelPlanner logo" className="brand-logo" />
            <span className="brand-name">TravelPlanner</span>
          </div>

          <nav className="nav-links">
            <button onClick={() => scrollToSection("features")}>Features</button>
            <button onClick={() => scrollToSection("destinations")}>Destinations</button>
            <button onClick={() => scrollToSection("ai-agent")}>AI Agent</button>
            <button onClick={() => scrollToSection("why-us")}>Why Us</button>
          </nav>

          <div className="nav-actions">
            <button className="nav-login-btn button-ripple" onClick={handleNavigateToLogin}>
              <FaSignInAlt /> Sign In
            </button>
            <button className="nav-signup-btn button-ripple" onClick={handleNavigateToLogin}>
              Get Started Free
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-content-wrapper">
          <div className="hero-badge">
            <span className="badge-sparkle">✨</span>
            <span>Next-Gen AI Travel Assistant</span>
          </div>

          <h1 className="hero-headline">
            Plan Smarter. <br />
            <span className="gradient-text">Explore Further.</span> <br />
            Travel Effortlessly.
          </h1>

          <p className="hero-subtext">
            Transform your travel ideas into personalized day-by-day itineraries, interactive Mapbox navigation routes, and live weather insights in seconds.
          </p>

          <div className="hero-cta-group">
            <button className="cta-main-btn button-ripple" onClick={handleNavigateToLogin}>
              Start Planning Free <FaArrowRight />
            </button>
            <button className="cta-secondary-btn button-ripple" onClick={() => scrollToSection("destinations")}>
              <FaCompass /> Explore Destinations
            </button>
          </div>

          {/* Metrics & Trust Bar */}
          <div className="hero-stats-bar">
            <div className="stat-item">
              <span className="stat-value">100k+</span>
              <span className="stat-label">Trips Planned</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-value">4.9 <FaStar className="star-icon" /></span>
              <span className="stat-label">Traveler Rating</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-value">100+</span>
              <span className="stat-label">World Spots</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-value">100%</span>
              <span className="stat-label">AI Powered</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features Section */}
      <section id="features" className="landing-section features-section">
        <div className="section-header">
          <span className="section-subtitle">Everything You Need</span>
          <h2>Built for Modern Travelers</h2>
          <p>Supercharge your journeys with intelligent planning tools built into one seamless platform.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper ai-icon">
              <FaRobot />
            </div>
            <h3>🤖 Conversational AI Agent</h3>
            <p>
              Chat in real time with your virtual travel assistant. Ask for hotel spots, food recommendations, and local secrets that update your itinerary instantly.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper map-icon">
              <FaMapMarkedAlt />
            </div>
            <h3>🗺️ Mapbox Route Navigation</h3>
            <p>
              Visualize your itinerary on interactive Mapbox vector maps with real-time pin markers, driving directions, and distance optimization.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper weather-icon">
              <FaCloudSun />
            </div>
            <h3>🌦️ Weather & Packing Tips</h3>
            <p>
              Get accurate 3-day local weather forecasts for your destination alongside an automated smart packing checklist tailored to the forecast.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper route-icon">
              <FaRoute />
            </div>
            <h3>📅 Day-by-Day Itineraries</h3>
            <p>
              Generate structured morning, afternoon, and evening travel schedules customizable down to your exact dates and personal travel style.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper shield-icon">
              <FaShieldAlt />
            </div>
            <h3>🔒 Persistent Account Sync</h3>
            <p>
              Save all your planned trips, bookings, and custom preferences securely to your cloud profile and access them from any device anytime.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper star-icon-wrapper">
              <FaStar />
            </div>
            <h3>🎨 Personal Preference Themes</h3>
            <p>
              Seamlessly toggle between ultra-sleek Dark Mode and vibrant Light Mode themes tailored to your preferred reading comfort.
            </p>
          </div>
        </div>
      </section>

      {/* Popular Destinations Showcase */}
      <section id="destinations" className="landing-section destinations-section">
        <div className="section-header">
          <span className="section-subtitle">Trending Places</span>
          <h2>Explore Popular Destinations</h2>
          <p>Discover top-rated destinations ready for your next getaway.</p>
        </div>

        <div className="destinations-showcase-grid">
          {popularDestinations.map((dest, idx) => (
            <div key={idx} className="dest-showcase-card">
              <div className="dest-img-wrapper">
                <img src={dest.img} alt={dest.name} />
                <span className="dest-tag-badge">{dest.tag}</span>
              </div>
              <div className="dest-card-body">
                <h3>{dest.name}</h3>
                <p>{dest.desc}</p>
                <button className="dest-plan-btn button-ripple" onClick={handleNavigateToLogin}>
                  Plan Trip <FaArrowRight />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Agent Highlight Banner */}
      <section id="ai-agent" className="landing-section ai-highlight-section">
        <div className="ai-highlight-card">
          <div className="ai-highlight-badge">
            <FaRobot /> Smart AI Virtual Assistant
          </div>
          <h2>Your Personal Travel Concierge, Available 24/7</h2>
          <p>
            No more hours spent copying links and browsing endless tabs. Simply tell TravelPlanner where you want to go, and let AI generate complete itineraries, place markers, and weather forecasts instantly.
          </p>
          <div className="ai-benefits-list">
            <div className="benefit-item"><FaCheckCircle className="check-icon" /> Instant Day-by-Day Schedules</div>
            <div className="benefit-item"><FaCheckCircle className="check-icon" /> Automatic Mapbox Pin Sync</div>
            <div className="benefit-item"><FaCheckCircle className="check-icon" /> Curated Dining & Hotel Recommendations</div>
          </div>
          <button className="cta-main-btn button-ripple" onClick={handleNavigateToLogin}>
            Try AI Assistant Free <FaArrowRight />
          </button>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="why-us" className="landing-section why-us-section">
        <div className="section-header">
          <span className="section-subtitle">Why TravelPlanner</span>
          <h2>Designed for Effortless Journeys</h2>
        </div>

        <div className="why-us-grid">
          <div className="why-card">
            <div className="why-number">01</div>
            <h3>Zero Stress Planning</h3>
            <p>Say goodbye to complex spreadsheets. Organize activities, hotels, and schedules in one clean visual timeline.</p>
          </div>
          <div className="why-card">
            <div className="why-number">02</div>
            <h3>Real-Time Location Mapping</h3>
            <p>Every place in your itinerary is automatically mapped with exact Mapbox coordinates so you never get lost.</p>
          </div>
          <div className="why-card">
            <div className="why-number">03</div>
            <h3>Tailored Weather & Packing</h3>
            <p>Know what to pack before you leave. Automatic weather forecasts ensure you arrive prepared for any climate.</p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="landing-cta-banner">
        <div className="cta-banner-card">
          <h2>Ready to Map Out Your Next Adventure?</h2>
          <p>Join thousands of travelers planning smarter, faster trips today.</p>
          <button className="cta-main-btn banner-btn button-ripple" onClick={handleNavigateToLogin}>
            Create Free Account <FaArrowRight />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="brand-group">
              <img src="/TPLogo.png" alt="TravelPlanner logo" className="footer-logo" />
              <span className="footer-title">TravelPlanner</span>
            </div>
            <p>Your ultimate next-gen AI-powered travel companion.</p>
          </div>

          <div className="footer-links">
            <div className="footer-col">
              <h4>Navigation</h4>
              <button onClick={() => scrollToSection("features")}>Features</button>
              <button onClick={() => scrollToSection("destinations")}>Destinations</button>
              <button onClick={() => scrollToSection("ai-agent")}>AI Agent</button>
            </div>
            <div className="footer-col">
              <h4>Account</h4>
              <button onClick={handleNavigateToLogin}>Sign In</button>
              <button onClick={handleNavigateToLogin}>Register</button>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} TravelPlanner. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Intro;
