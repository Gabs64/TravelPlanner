import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE from "../apiConfig";
import "./MyTrips.css";

const createDefaultItinerary = (destinationName) => [
  { id: 1, time: "Day 1", title: `Arrive in ${destinationName} and check in` },
  { id: 2, time: "Day 2", title: `Explore popular spots in ${destinationName}` },
  { id: 3, time: "Day 3", title: "Free time, food trip, and souvenir shopping" },
];

const MyTrips = () => {
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [saveSuccessOpen, setSaveSuccessOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isCompletedTrip = selectedTrip?.status?.toLowerCase() === "completed";

  useEffect(() => {
    const fetchTrips = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API_BASE}/trips/${encodeURIComponent(userId)}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Unable to load trips");
        }

        const mappedTrips = data.map((trip) => {
          const destinationName = trip.destinationName || "Unnamed Trip";

          return {
            id: trip.id,
            name: destinationName,
            date: `${trip.startDate || "No start date"} - ${trip.endDate || "No end date"}`,
            status: trip.status || "Upcoming",
            itinerary:
              Array.isArray(trip.itinerary) && trip.itinerary.length > 0
                ? trip.itinerary
                : createDefaultItinerary(destinationName),
          };
        });

        setTrips(mappedTrips);
      } catch (err) {
        console.error("Error loading trips:", err);
        setError(err.message || "Failed to load trips");
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [navigate]);

  const closeModal = () => {
    setSelectedTrip(null);
    setConfirmSaveOpen(false);
    setSaveSuccessOpen(false);
  };

  const moveItineraryItem = (itemIndex, direction) => {
    if (!selectedTrip || isCompletedTrip) return;

    const newIndex = itemIndex + direction;
    if (newIndex < 0 || newIndex >= selectedTrip.itinerary.length) return;

    const updatedItinerary = [...selectedTrip.itinerary];
    const [movedItem] = updatedItinerary.splice(itemIndex, 1);
    updatedItinerary.splice(newIndex, 0, movedItem);

    const updatedTrip = {
      ...selectedTrip,
      itinerary: updatedItinerary,
    };

    setSelectedTrip(updatedTrip);
    setTrips((prev) =>
      prev.map((trip) => (trip.id === updatedTrip.id ? updatedTrip : trip))
    );
  };

  const requestSaveItineraryOrder = () => {
    if (isCompletedTrip) return;
    setConfirmSaveOpen(true);
  };

  const cancelSaveOrder = () => {
    setConfirmSaveOpen(false);
  };

  const confirmSaveOrder = () => {
  if (!selectedTrip || isCompletedTrip) return;

  setConfirmSaveOpen(false);
  setSaveSuccessOpen(true);
};


  const closeSuccessMessage = () => {
    setSaveSuccessOpen(false);
    closeModal();
  };

  return (
    <main className="trips-page">
      <div className="trips-content">
        <div className="page-header">
          <h2>My Trips</h2>
          <p>View your upcoming and completed travel plans.</p>
        </div>

        {loading ? (
          <div className="loading">Loading trips...</div>
        ) : error ? (
          <div className="status-banner error-banner">{error}</div>
        ) : trips.length === 0 ? (
          <div className="empty-state">No trips found yet. Save a destination first.</div>
        ) : (
          <div className="trips-grid">
            {trips.map((trip) => (
              <div className="trip-card" key={trip.id}>
                <div>
                  <h3>{trip.name}</h3>
                  <p>{trip.date}</p>
                </div>

                <span className={`status ${trip.status.toLowerCase()}`}>
                  {trip.status}
                </span>

                <button
                  className="itinerary-btn button-ripple"
                  onClick={() => setSelectedTrip(trip)}
                >
                  View Itinerary
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedTrip && (
        <div className="trip-modal-overlay" onClick={closeModal}>
          <div className="trip-modal" onClick={(e) => e.stopPropagation()}>
            <div className="trip-modal-header">
              <div>
                <h3>{selectedTrip.name} Itinerary</h3>
                <p>{selectedTrip.date}</p>
              </div>

              <button className="modal-close-btn" onClick={closeModal}>
                ×
              </button>
            </div>

            {isCompletedTrip && (
              <div className="locked-itinerary-banner">
                This trip is completed. The itinerary is now read-only.
              </div>
            )}

            <div className="itinerary-list">
              {selectedTrip.itinerary.map((item, index) => (
                <div className="itinerary-item" key={`${item.id}-${index}`}>
                  <div className="itinerary-order">{index + 1}</div>

                  <div className="itinerary-info">
                    <span>{item.time}</span>
                    <strong>{item.title}</strong>
                  </div>

                  {!isCompletedTrip && (
                    <div className="itinerary-controls">
                      <button
                        onClick={() => moveItineraryItem(index, -1)}
                        disabled={index === 0}
                      >
                        Up
                      </button>
                      <button
                        onClick={() => moveItineraryItem(index, 1)}
                        disabled={index === selectedTrip.itinerary.length - 1}
                      >
                        Down
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="trip-modal-actions">
              {!isCompletedTrip && (
                <button
                  className="save-itinerary-btn button-ripple"
                  onClick={requestSaveItineraryOrder}
                >
                  Save Order
                </button>
              )}

              <button className="modal-secondary-btn button-ripple" onClick={closeModal}>
                Close
              </button>
            </div>

            {confirmSaveOpen && !isCompletedTrip && (
              <div className="confirm-panel">
                <h4>Save itinerary order?</h4>
                <p>This will save the current order of your trip activities.</p>

                <div className="confirm-actions">
                  <button className="confirm-yes-btn button-ripple" onClick={confirmSaveOrder}>
                    Yes, Save
                  </button>
                  <button className="confirm-no-btn button-ripple" onClick={cancelSaveOrder}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {saveSuccessOpen && (
              <div className="success-panel">
                <h4>Order saved successfully</h4>
                <p>Your itinerary order has been updated for this trip.</p>

                <button className="confirm-yes-btn button-ripple" onClick={closeSuccessMessage}>
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default MyTrips;
