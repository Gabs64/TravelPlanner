import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API_BASE from "../apiConfig";
import "./DestinationDetails.css";

const destinationData = {
  boracay: {
    name: "Boracay",
    desc: "White sand beaches, island activities, sunset views, and nightlife.",
    location: "Boracay, Malay, Aklan, Philippines",
    bestFor: "Beach trips, nightlife, water activities",
    budget: "PHP 8,000 - PHP 15,000",
    duration: "3 - 5 days",
    activities: ["Island hopping", "Sunset sailing", "Snorkeling", "White Beach walk"],
  },
  baguio: {
    name: "Baguio",
    desc: "Cool climate, mountain views, parks, cafes, and scenic attractions.",
    location: "Baguio City, Benguet, Philippines",
    bestFor: "Cool weather, cafes, sightseeing",
    budget: "PHP 5,000 - PHP 10,000",
    duration: "2 - 4 days",
    activities: ["Burnham Park", "Mines View", "Cafe hopping", "Night market"],
  },
  cebu: {
    name: "Cebu",
    desc: "A mix of city travel, beaches, heritage spots, and island adventures.",
    location: "Cebu City, Cebu, Philippines",
    bestFor: "Island tours, heritage, food trips",
    budget: "PHP 7,000 - PHP 14,000",
    duration: "3 - 5 days",
    activities: ["City tour", "Island hopping", "Temple of Leah", "Food crawl"],
  },
  palawan: {
    name: "Palawan",
    desc: "Lagoons, limestone cliffs, and island hopping.",
    location: "Palawan, Philippines",
    bestFor: "Island hopping, lagoons, nature trips",
    budget: "PHP 9,000 - PHP 18,000",
    duration: "4 - 6 days",
    activities: ["El Nido island hopping", "Underground River", "Kayaking", "Beach tour"],
  },
  siargao: {
    name: "Siargao",
    desc: "Surf breaks, lagoons, and laid-back island days.",
    location: "Siargao Island, Surigao del Norte, Philippines",
    bestFor: "Surfing, lagoons, island lifestyle",
    budget: "PHP 8,000 - PHP 16,000",
    duration: "4 - 6 days",
    activities: ["Cloud 9 surfing", "Sugba Lagoon", "Island hopping", "Maasin River"],
  },
  vigan: {
    name: "Vigan",
    desc: "Historic streets and preserved Spanish-era architecture.",
    location: "Vigan City, Ilocos Sur, Philippines",
    bestFor: "Heritage tours, history, local food",
    budget: "PHP 5,000 - PHP 10,000",
    duration: "2 - 3 days",
    activities: ["Calle Crisologo", "Heritage walk", "Kalesa ride", "Food tour"],
  },
  bohol: {
    name: "Bohol",
    desc: "Chocolate Hills, beaches, and countryside tours.",
    location: "Bohol, Philippines",
    bestFor: "Nature tours, beaches, countryside trips",
    budget: "PHP 7,000 - PHP 14,000",
    duration: "3 - 5 days",
    activities: ["Chocolate Hills", "Panglao Beach", "Loboc River", "Tarsier Sanctuary"],
  },
  tagaytay: {
    name: "Tagaytay",
    desc: "Cool weather, lake views, and weekend escapes.",
    location: "Tagaytay City, Cavite, Philippines",
    bestFor: "Weekend trips, cool weather, lake views",
    budget: "PHP 3,000 - PHP 8,000",
    duration: "1 - 2 days",
    activities: ["Taal Lake view", "Picnic Grove", "Sky Ranch", "Cafe hopping"],
  },
};

const DestinationDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const today = new Date().toISOString().slice(0, 10);

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [mapQuery, setMapQuery] = useState("");
  const [checklist, setChecklist] = useState({
    validId: false,
    hotel: false,
    transport: false,
    budget: false,
  });

  const destination = destinationData[slug];

  if (!destination) {
    return (
      <main className="destination-page">
        <div className="destination-content">
          <button className="back-btn button-ripple" onClick={() => navigate("/home")}>
            Back
          </button>
          <h2>Destination not found</h2>
        </div>
      </main>
    );
  }

  const activeMapQuery = mapQuery || destination.location;
  const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    activeMapQuery
  )}&output=embed`;

  const handleSaveTrip = async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      navigate("/login");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch(`${API_BASE}/trips/${encodeURIComponent(userId)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          destinationSlug: slug,
          destinationName: destination.name,
          startDate,
          endDate,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Unable to save trip");

      setMessage("Trip saved successfully. You can see it in My Trips.");
    } catch (err) {
      console.error("Error saving trip:", err);
      setError(err.message || "Failed to save trip");
    } finally {
      setSaving(false);
    }
  };

  const toggleChecklist = (key) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const completedItems = Object.values(checklist).filter(Boolean).length;

  return (
    <main className="destination-page">
      <div className="destination-content">
        <div className="destination-topbar">
          <button className="back-btn button-ripple" onClick={() => navigate("/home")}>
            Back
          </button>
        </div>

        <div className="page-header">
          <h2>{destination.name}</h2>
          <p>{destination.desc}</p>
        </div>

        <section className="destination-layout">
          <div
            className="destination-panel"
            style={{ viewTransitionName: `dest-card-${slug}` }}
          >
            <h3>Trip Planning</h3>
            <p>
              <strong>Location:</strong> {destination.location}
            </p>
            <p>Choose your travel dates and save this destination to your trip list.</p>

            <div className="destination-actions">
              <div className="trip-dates">
                <label>
                  Start date
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </label>

                <label>
                  End date
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </label>
              </div>

              <button className="button-ripple" onClick={handleSaveTrip} disabled={saving}>
                {saving ? "Saving..." : "Save Trip"}
              </button>

              <button
                className="button-ripple secondary-action"
                onClick={() => setMapQuery(destination.location)}
              >
                Show Destination Map
              </button>
            </div>

            {message && <div className="status-banner success-banner">{message}</div>}
            {error && <div className="status-banner error-banner">{error}</div>}

            <div className="checklist-card">
              <div className="mini-card-header">
                <h4>Preparation</h4>
                <span>{completedItems}/4 done</span>
              </div>

              <label>
                <input
                  type="checkbox"
                  checked={checklist.validId}
                  onChange={() => toggleChecklist("validId")}
                />
                Valid ID ready
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={checklist.hotel}
                  onChange={() => toggleChecklist("hotel")}
                />
                Hotel selected
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={checklist.transport}
                  onChange={() => toggleChecklist("transport")}
                />
                Transport planned
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={checklist.budget}
                  onChange={() => toggleChecklist("budget")}
                />
                Budget prepared
              </label>
            </div>
          </div>

          <div className="destination-main">
            <div
              className="map-card"
              style={{ viewTransitionName: `dest-image-${slug}` }}
            >
              <iframe
                title={`${destination.name} Map`}
                src={mapUrl}
                loading="lazy"
                allowFullScreen
              />
            </div>

            <div className="quick-info-grid">
              <div className="quick-info-card">
                <span>Best For</span>
                <strong>{destination.bestFor}</strong>
              </div>

              <div className="quick-info-card">
                <span>Estimated Budget</span>
                <strong>{destination.budget}</strong>
              </div>

              <div className="quick-info-card">
                <span>Suggested Stay</span>
                <strong>{destination.duration}</strong>
              </div>
            </div>

            <div className="activities-card">
              <div className="mini-card-header">
                <h4>Suggested Activities</h4>
                <button
                  className="reset-map-btn"
                  onClick={() => setMapQuery(destination.location)}
                >
                  Reset Map
                </button>
              </div>

              <div className="activity-list">
                {destination.activities.map((activity) => (
                  <button
                    className="activity-pill"
                    key={activity}
                    onClick={() => setMapQuery(`${activity} near ${destination.location}`)}
                  >
                    {activity}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default DestinationDetails;
