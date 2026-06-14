import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API_BASE from "../apiConfig";
import "./DestinationDetails.css";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN || "";

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

  const staticDest = destinationData[slug];
  const [destination, setDestination] = useState(staticDest || null);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const primaryCoordsRef = useRef(null);

  // Clean up map on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Geocoding and Map flying logic
  useEffect(() => {
    if (!window.mapboxgl || !MAPBOX_TOKEN || !destination) return;
    
    // Initialize map if not initialized
    if (!mapRef.current) {
      window.mapboxgl.accessToken = MAPBOX_TOKEN;
      mapRef.current = new window.mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [121.7740, 12.8797], // Philippines center
        zoom: 5,
      });
      // Add standard navigation controls
      mapRef.current.addControl(new window.mapboxgl.NavigationControl(), "top-right");
    }

    const optimizeActivityQuery = (query, destName) => {
      if (!destName) return query;
      if (query.toLowerCase() === destName.toLowerCase()) {
        return query;
      }
      
      let activity = query;
      if (query.toLowerCase().endsWith(`, ${destName.toLowerCase()}`)) {
        activity = query.slice(0, -(destName.length + 2)).trim();
      }

      const replacements = [
        { regex: /cafe\s+hopping/i, replacement: "cafe" },
        { regex: /coffee\s+hopping/i, replacement: "coffee shop" },
        { regex: /beach\s+hopping/i, replacement: "beach" },
        { regex: /island\s+hopping/i, replacement: "island" },
        { regex: /pub\s+crawl/i, replacement: "pub" },
        { regex: /bar\s+hopping/i, replacement: "bar" },
        { regex: /food\s+crawl/i, replacement: "restaurant" },
        { regex: /local\s+sightseeing/i, replacement: "tourist attraction" },
        { regex: /nature\s+walk/i, replacement: "park" },
        { regex: /souvenir\s+shopping/i, replacement: "market" },
        { regex: /shopping/i, replacement: "mall" },
        { regex: /sightseeing/i, replacement: "landmark" }
      ];

      let cleanedActivity = activity;
      for (const { regex, replacement } of replacements) {
        if (regex.test(cleanedActivity)) {
          cleanedActivity = cleanedActivity.replace(regex, replacement);
        }
      }

      return `${cleanedActivity}, ${destName}`;
    };

    const geocodeLocation = async () => {
      let targetQuery = mapQuery || destination.location;
      
      // If this is the initial destination loading, reset the primary coordinates ref
      if (targetQuery === destination.location) {
        primaryCoordsRef.current = null;
      } else {
        // Otherwise optimize the query string
        targetQuery = optimizeActivityQuery(targetQuery, destination.name);
      }

      try {
        const cleanQuery = targetQuery.replace(/[:.,;]+$/, "").trim();
        if (!cleanQuery) return;
        
        let proximityParam = "";
        if (mapRef.current) {
          const center = mapRef.current.getCenter();
          proximityParam = `&proximity=${center.lng},${center.lat}`;
        }

        let countryParam = "";
        const locLower = destination.location ? destination.location.toLowerCase() : "";
        if (locLower.includes("philippines")) {
          countryParam = "&country=ph";
        }

        let bboxParam = "";
        // Restrict to local bbox around primary coords (approx 15-20km bounding box)
        if (targetQuery !== destination.location && primaryCoordsRef.current) {
          const [pLng, pLat] = primaryCoordsRef.current;
          const minLng = pLng - 0.15;
          const minLat = pLat - 0.15;
          const maxLng = pLng + 0.15;
          const maxLat = pLat + 0.15;
          bboxParam = `&bbox=${minLng},${minLat},${maxLng},${maxLat}`;
        }

        let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(cleanQuery)}.json?access_token=${MAPBOX_TOKEN}${proximityParam}${countryParam}${bboxParam}`;
        let res = await fetch(url);
        let data = await res.json();
        
        // Fallback: If no results with bbox limit, try without bbox constraint (but keeping country limit)
        if ((!data.features || data.features.length === 0) && bboxParam) {
          url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(cleanQuery)}.json?access_token=${MAPBOX_TOKEN}${proximityParam}${countryParam}`;
          res = await fetch(url);
          data = await res.json();
        }

        if (data.features && data.features.length > 0) {
          const [lng, lat] = data.features[0].center;
          
          // Save primary destination coordinates on initial load
          if (targetQuery === destination.location) {
            primaryCoordsRef.current = [lng, lat];
          }

          // Move map camera smoothly
          mapRef.current.flyTo({
            center: [lng, lat],
            zoom: 12,
            essential: true
          });

          // Update marker position
          if (markerRef.current) {
            markerRef.current.setLngLat([lng, lat]);
          } else {
            markerRef.current = new window.mapboxgl.Marker({ color: "#ef4444" })
              .setLngLat([lng, lat])
              .addTo(mapRef.current);
          }
        } else {
          // If no matches at all, center back to default primary coordinates
          if (primaryCoordsRef.current) {
            const [lng, lat] = primaryCoordsRef.current;
            mapRef.current.flyTo({
              center: [lng, lat],
              zoom: 12,
              essential: true
            });
            if (markerRef.current) {
              markerRef.current.setLngLat([lng, lat]);
            } else {
              markerRef.current = new window.mapboxgl.Marker({ color: "#ef4444" })
                .setLngLat([lng, lat])
                .addTo(mapRef.current);
            }
          }
        }
      } catch (err) {
        console.error("Geocoding failed:", err);
      }
    };

    geocodeLocation();
  }, [mapQuery, destination]);
  const [loading, setLoading] = useState(!staticDest);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    if (staticDest) {
      setDestination(staticDest);
      setLoading(false);
      return;
    }

    const fetchDynamicDetails = async () => {
      setLoading(true);
      setErrorText("");
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${API_BASE}/ai/destination-details/${encodeURIComponent(slug)}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setDestination(data);
        } else {
          setErrorText("Unable to load travel suggestions for this destination.");
        }
      } catch (err) {
        console.error("Error fetching destination details:", err);
        setErrorText("Failed to connect to the backend server.");
      } finally {
        setLoading(false);
      }
    };

    fetchDynamicDetails();
  }, [slug, staticDest]);

  if (loading) {
    return (
      <main className="destination-page">
        <div className="destination-content loading-state">
          <div className="loading-wrapper">
            <div className="loading-spinner"></div>
            <p>✨ Consulting Gemini AI to map activities & details...</p>
          </div>
        </div>
      </main>
    );
  }

  if (errorText || !destination) {
    return (
      <main className="destination-page">
        <div className="destination-content">
          <div className="destination-topbar">
            <button className="back-btn button-ripple" onClick={() => navigate("/home")}>
              Back
            </button>
          </div>
          <div className="error-wrapper">
            <h2>Oops! Destination Details Unavailable</h2>
            <p>{errorText || "Could not retrieve info. Please verify your connection or try again."}</p>
            <button className="button-ripple" onClick={() => navigate("/home")}>
              Go Home
            </button>
          </div>
        </div>
      </main>
    );
  }



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
              ref={mapContainerRef}
            >
              {!MAPBOX_TOKEN && (
                <div className="mapbox-missing-token-overlay">
                  <p>🗺️ Mapbox Access Token is missing</p>
                  <span>Please configure <code>REACT_APP_MAPBOX_ACCESS_TOKEN</code> in your <code>.env</code> file in the <code>frontend/</code> directory.</span>
                </div>
              )}
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
                {(destination.activities || []).map((activity) => (
                  <button
                    className="activity-pill"
                    key={activity}
                    onClick={() => setMapQuery(`${activity}, ${destination.name}`)}
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
