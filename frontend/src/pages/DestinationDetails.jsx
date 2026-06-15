import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { flushSync } from "react-dom";
import {
  FaArrowLeft,
  FaRoute,
  FaMapPin,
  FaWallet,
  FaRegClock,
  FaClipboardList,
  FaMapMarkedAlt
} from "react-icons/fa";
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

const getCategoryBadge = (name) => {
  const n = name.toLowerCase();
  if (n.includes("boracay") || n.includes("beach") || n.includes("island") || n.includes("lagoon") || n.includes("coron") || n.includes("palawan") || n.includes("siargao")) {
    return "🏝️ Island Paradise";
  }
  if (n.includes("baguio") || n.includes("mountain") || n.includes("hiking") || n.includes("hills") || n.includes("batanes") || n.includes("sagada")) {
    return "🌲 Mountain Escape";
  }
  if (n.includes("vigan") || n.includes("heritage") || n.includes("culture") || n.includes("cebu") || n.includes("church") || n.includes("iloilo")) {
    return "🏛️ Cultural Heritage";
  }
  return "✈️ Scenic Adventure";
};

const getUnsplashImage = (keyword) => {
  const kw = (keyword || "").toLowerCase();
  
  if (kw.includes("bohol") || kw.includes("chocolate")) {
    return "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80";
  }
  if (kw.includes("palawan") || kw.includes("lagoon") || kw.includes("coron") || kw.includes("el nido")) {
    return "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=800&q=80";
  }
  if (kw.includes("siargao") || kw.includes("surf") || kw.includes("waves")) {
    return "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=800&q=80";
  }
  if (kw.includes("vigan") || kw.includes("heritage") || kw.includes("streets") || kw.includes("colonial") || kw.includes("crisologo")) {
    return "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80";
  }
  if (kw.includes("batanes") || kw.includes("hills")) {
    return "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80";
  }
  if (kw.includes("legazpi") || kw.includes("mayon") || kw.includes("camiguin") || kw.includes("volcano") || kw.includes("crater")) {
    return "https://images.unsplash.com/photo-1580258169129-c8526b1f2eb0?auto=format&fit=crop&w=800&q=80";
  }
  if (kw.includes("sagada") || kw.includes("davao") || kw.includes("mountain") || kw.includes("hiking") || kw.includes("banaue") || kw.includes("apo")) {
    return "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80";
  }
  if (kw.includes("siquijor") || kw.includes("waterfall") || kw.includes("falls")) {
    return "https://images.unsplash.com/photo-1432406776043-698612709636?auto=format&fit=crop&w=800&q=80";
  }
  if (kw.includes("iloilo") || kw.includes("church") || kw.includes("cathedral")) {
    return "https://images.unsplash.com/photo-1548625361-155de0cbb3e5?auto=format&fit=crop&w=800&q=80";
  }
  if (kw.includes("dumaguete") || kw.includes("turtle") || kw.includes("marine")) {
    return "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?auto=format&fit=crop&w=800&q=80";
  }
  if (kw.includes("tagaytay") || kw.includes("lake") || kw.includes("taal")) {
    return "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80";
  }
  if (kw.includes("beach") || kw.includes("island") || kw.includes("sea") || kw.includes("boracay") || kw.includes("puerto") || kw.includes("cebu")) {
    return "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=800&q=80";
  }

  const fallbacks = [
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80"
  ];
  const charSum = kw.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return fallbacks[charSum % fallbacks.length];
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
      {/* Dynamic Destination Hero Banner */}
      <div 
        className="destination-hero" 
        style={{ 
          backgroundImage: `url(${getUnsplashImage(destination.imageKeyword || destination.name)})`,
          viewTransitionName: "dest-image"
        }}
      >
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <button 
            className="back-btn-premium button-ripple" 
            onClick={() => {
              if (document.startViewTransition) {
                document.startViewTransition(() => {
                  flushSync(() => {
                    navigate("/home");
                  });
                });
              } else {
                navigate("/home");
              }
            }}
          >
            <FaArrowLeft /> Dashboard
          </button>
          <span className="destination-category">{getCategoryBadge(destination.name)}</span>
          <h1>{destination.name}</h1>
          <p>{destination.desc}</p>
        </div>
      </div>

      <div className="destination-content">
        <section className="destination-layout">
          {/* Left Panel: Plan & Prep */}
          <div
            className="destination-panel"
            style={{ viewTransitionName: "dest-card" }}
          >
            <div className="panel-section-header">
              <FaRoute className="panel-icon" />
              <h3>Trip Planning</h3>
            </div>
            
            <p className="location-info">
              <strong>Location:</strong> {destination.location}
            </p>
            <p className="helper-text">Select your preferred travel dates and lock in your adventure.</p>

            <div className="destination-actions">
              <div className="trip-dates">
                <label>
                  <span>Start Date</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </label>

                <label>
                  <span>End Date</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </label>
              </div>

              <button className="button-ripple primary-btn" onClick={handleSaveTrip} disabled={saving}>
                {saving ? "Saving Trip..." : "Save Trip to Database"}
              </button>

              <button
                className="button-ripple secondary-btn"
                onClick={() => setMapQuery(destination.location)}
              >
                Focus Primary Map
              </button>
            </div>

            {message && <div className="status-banner success-banner">{message}</div>}
            {error && <div className="status-banner error-banner">{error}</div>}

            <div className="checklist-card">
              <div className="mini-card-header">
                <h4>
                  <FaClipboardList className="header-icon" /> Preparation Checklist
                </h4>
                <span className="checklist-progress">{completedItems}/4 done</span>
              </div>
              
              <div className="progress-bar-container">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${(completedItems / 4) * 100}%` }}
                ></div>
              </div>

              <div className="checklist-options">
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={checklist.validId}
                    onChange={() => toggleChecklist("validId")}
                  />
                  <span className="checkbox-custom"></span>
                  Valid ID / Passport ready
                </label>

                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={checklist.hotel}
                    onChange={() => toggleChecklist("hotel")}
                  />
                  <span className="checkbox-custom"></span>
                  Hotel reservation selected
                </label>

                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={checklist.transport}
                    onChange={() => toggleChecklist("transport")}
                  />
                  <span className="checkbox-custom"></span>
                  Transport ticket/route booked
                </label>

                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={checklist.budget}
                    onChange={() => toggleChecklist("budget")}
                  />
                  <span className="checkbox-custom"></span>
                  Trip budget prepared
                </label>
              </div>
            </div>
          </div>

          {/* Right Panel: Map, Facts, & Activities */}
          <div className="destination-main">
            {/* Interactive Mapbox Container */}
            <div className="map-card-wrapper">
              <div className="map-header">
                <div className="map-title-row">
                  <FaMapMarkedAlt />
                  <h4>Interactive Explorer Map</h4>
                </div>
                {mapQuery && (
                  <span className="map-focus-label">
                    Focus: <strong>{mapQuery.split(",")[0]}</strong>
                  </span>
                )}
              </div>
              <div
                className="map-card"
                ref={mapContainerRef}
              >
                {!MAPBOX_TOKEN && (
                  <div className="mapbox-missing-token-overlay">
                    <p>🗺️ Mapbox Access Token is missing</p>
                    <span>Please configure <code>REACT_APP_MAPBOX_ACCESS_TOKEN</code> in your <code>.env</code> file in the <code>frontend/</code> directory.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Facts Grid */}
            <div className="quick-info-grid">
              <div className="quick-info-card best-for">
                <div className="fact-icon-container">
                  <FaRoute />
                </div>
                <div className="fact-details">
                  <span>Best For</span>
                  <strong>{destination.bestFor}</strong>
                </div>
              </div>

              <div className="quick-info-card budget">
                <div className="fact-icon-container">
                  <FaWallet />
                </div>
                <div className="fact-details">
                  <span>Est. Budget Range</span>
                  <strong>{destination.budget}</strong>
                </div>
              </div>

              <div className="quick-info-card duration">
                <div className="fact-icon-container">
                  <FaRegClock />
                </div>
                <div className="fact-details">
                  <span>Suggested Stay</span>
                  <strong>{destination.duration}</strong>
                </div>
              </div>
            </div>

            {/* Suggested Activities */}
            <div className="activities-card">
              <div className="mini-card-header">
                <h4>🎉 Suggested Local Activities</h4>
                <button
                  className="reset-map-btn button-ripple"
                  onClick={() => setMapQuery(destination.location)}
                >
                  Reset Map View
                </button>
              </div>

              <p className="activities-hint">Click any pill to geocode and locate it on the map:</p>

              <div className="activity-list">
                {(destination.activities || []).map((activity) => (
                  <button
                    className="activity-pill button-ripple"
                    key={activity}
                    onClick={() => setMapQuery(`${activity}, ${destination.name}`)}
                  >
                    <FaMapPin className="pin-icon" /> {activity}
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
