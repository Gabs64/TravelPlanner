import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaRegClock, FaGlobe, FaArrowRight } from "react-icons/fa";
import API_BASE from "../apiConfig";
import "./SharedTrip.css";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN || "";

const calculateItemDate = (startDateStr, index) => {
  if (!startDateStr) return "";
  try {
    const parts = startDateStr.split("-");
    if (parts.length !== 3) return "";
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    date.setDate(date.getDate() + index);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  } catch (e) {
    return "";
  }
};

const SharedTrip = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${API_BASE}/trips/public/${tripId}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to load public trip details.");
        }
        setTrip(data);
      } catch (err) {
        console.error("Shared trip fetch failed:", err);
        setError(err.message || "Failed to load shared trip.");
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [tripId]);

  // Mapbox Geocoding and Rendering
  useEffect(() => {
    if (!window.mapboxgl || !MAPBOX_TOKEN || !trip) return;

    if (!mapRef.current) {
      window.mapboxgl.accessToken = MAPBOX_TOKEN;
      mapRef.current = new window.mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [121.7740, 12.8797],
        zoom: 5,
      });
      mapRef.current.addControl(new window.mapboxgl.NavigationControl(), "top-right");
    }

    const geocode = async () => {
      try {
        const query = trip.destinationName || "Philippines";
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=ph`
        );
        const data = await res.json();
        if (data.features && data.features.length > 0) {
          const [lng, lat] = data.features[0].center;
          mapRef.current.flyTo({
            center: [lng, lat],
            zoom: 11,
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
      } catch (e) {
        console.error("Shared page geocoding error:", e);
      }
    };

    geocode();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [trip]);

  if (loading) {
    return (
      <div className="shared-trip-loading">
        <div className="spinner"></div>
        <p>🗺️ Loading shared itinerary details...</p>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="shared-trip-error">
        <h2>Trip Unavailable</h2>
        <p>{error || "We could not find the trip you were looking for."}</p>
        <button className="button-ripple" onClick={() => navigate("/")}>
          Plan Your Own Trip
        </button>
      </div>
    );
  }

  return (
    <div className="shared-trip-container">
      {/* Marketing Header */}
      <header className="shared-trip-header">
        <div className="header-logo" onClick={() => navigate("/")}>
          <FaGlobe className="logo-icon" />
          <span>TravelPlanner</span>
        </div>
        <button className="cta-btn button-ripple" onClick={() => navigate("/")}>
          Create Your Own Trip <FaArrowRight />
        </button>
      </header>

      {/* Main Layout Grid */}
      <div className="shared-trip-content">
        <div className="shared-left-panel">
          <div className="trip-summary-card">
            <span className="shared-badge">🌍 Shared Itinerary</span>
            <h2>Trip to {trip.destinationName}</h2>
            <p className="trip-dates">
              <FaRegClock /> {trip.startDate} to {trip.endDate}
            </p>
          </div>

          <div className="shared-itinerary-list">
            <h4>📅 Trip Schedule</h4>
            {trip.itinerary && trip.itinerary.length > 0 ? (
              trip.itinerary.map((item, index) => (
                <div className="shared-itinerary-item" key={index}>
                  <div className="shared-order-circle">{index + 1}</div>
                  <div className="shared-item-details">
                    <span>
                      {calculateItemDate(trip.startDate, index)}{" "}
                      {item.time ? `(${item.time})` : ""}
                    </span>
                    <strong>{item.title}</strong>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-activities">No activities scheduled yet.</p>
            )}
          </div>
        </div>

        <div className="shared-right-panel">
          <div className="shared-map-header">
            <FaMapMarkerAlt />
            <h4>Destination Map</h4>
          </div>
          <div className="shared-map-container" ref={mapContainerRef}>
            {!MAPBOX_TOKEN && (
              <div className="mapbox-missing-token-overlay">
                <p>🗺️ Mapbox Access Token is missing</p>
                <span>Please configure <code>REACT_APP_MAPBOX_ACCESS_TOKEN</code> in your environment.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedTrip;
