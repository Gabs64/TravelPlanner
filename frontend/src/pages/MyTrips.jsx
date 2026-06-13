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

  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [tripToDelete, setTripToDelete] = useState(null);

  const isCompletedTrip = selectedTrip?.status?.toLowerCase() === "completed";

  const handleDragStart = (e, index) => {
    if (isCompletedTrip) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    if (isCompletedTrip) return;
    e.preventDefault();
  };

  const handleDrop = (e, targetIndex) => {
    if (isCompletedTrip || draggedIndex === null) return;
    e.preventDefault();
    if (draggedIndex === targetIndex) return;

    const newItinerary = [...selectedTrip.itinerary];
    const [draggedItem] = newItinerary.splice(draggedIndex, 1);
    newItinerary.splice(targetIndex, 0, draggedItem);

    const updatedTrip = {
      ...selectedTrip,
      itinerary: newItinerary,
    };

    setSelectedTrip(updatedTrip);
    setTrips((prev) =>
      prev.map((t) => (t.id === updatedTrip.id ? updatedTrip : t))
    );
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleDelete = async (tripId) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_BASE}/trips/${tripId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete trip");
      }

      setTrips((prev) => prev.filter((trip) => trip.id !== tripId));
    } catch (err) {
      console.error("Error deleting trip:", err);
      alert(err.message || "Failed to delete trip");
    }
  };

  const markAsComplete = async () => {
    if (!selectedTrip) return;
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_BASE}/trips/${selectedTrip.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "Completed" }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update status");
      }

      const updatedTrip = {
        ...selectedTrip,
        status: "Completed",
      };
      setSelectedTrip(updatedTrip);
      setTrips((prev) =>
        prev.map((t) => (t.id === updatedTrip.id ? updatedTrip : t))
      );
    } catch (err) {
      console.error("Error updating status:", err);
      alert(err.message || "Failed to mark trip as complete");
    }
  };

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
            startDate: trip.startDate,
            endDate: trip.endDate,
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
    setAiSuggestions(null);
  };

  const generateAIItinerary = async () => {
    if (!selectedTrip) return;
    setGeneratingAI(true);
    setAiSuggestions(null);
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/ai/generate-itinerary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          destination: selectedTrip.name,
          startDate: selectedTrip.startDate,
          endDate: selectedTrip.endDate,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate AI itinerary");
      const data = await res.json();
      setAiSuggestions(data);
    } catch (err) {
      console.error(err);
      alert("Error generating AI itinerary: " + err.message);
    } finally {
      setGeneratingAI(false);
    }
  };

  const applyAIItinerary = () => {
    if (!selectedTrip || !aiSuggestions) return;
    const updatedTrip = {
      ...selectedTrip,
      itinerary: aiSuggestions,
    };
    setSelectedTrip(updatedTrip);
    setTrips((prev) =>
      prev.map((trip) => (trip.id === updatedTrip.id ? updatedTrip : trip))
    );
    setAiSuggestions(null);
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

  const confirmSaveOrder = async () => {
    if (!selectedTrip || isCompletedTrip) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/trips/${selectedTrip.id}/itinerary`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(selectedTrip.itinerary),
      });

      if (!res.ok) throw new Error("Failed to save itinerary order");

      setConfirmSaveOpen(false);
      setSaveSuccessOpen(true);
    } catch (err) {
      console.error(err);
      alert("Error saving itinerary order: " + err.message);
    }
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

                <div className="card-actions">
                  <button
                    className="itinerary-btn button-ripple"
                    onClick={() => setSelectedTrip(trip)}
                  >
                    View Itinerary
                  </button>
                  <button
                    className="delete-btn button-ripple"
                    onClick={() => setTripToDelete(trip.id)}
                    title="Delete trip"
                  >
                    🗑️
                  </button>
                </div>
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
                <div
                  className={`itinerary-item ${draggedIndex === index ? "dragging" : ""}`}
                  key={`${item.id}-${index}`}
                  draggable={!isCompletedTrip}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  {!isCompletedTrip && (
                    <div className="drag-handle" title="Drag to reorder">
                      ⋮⋮
                    </div>
                  )}
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

            {!isCompletedTrip && (
              <div className="ai-modal-section" style={{ marginTop: "20px", padding: "16px", border: "1px dashed var(--border-color)", borderRadius: "14px", background: "rgba(255,255,255,0.02)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                  <h4 style={{ margin: 0, fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>🤖 AI Itinerary Suggester</h4>
                  <button
                    className="button-ripple"
                    onClick={generateAIItinerary}
                    disabled={generatingAI}
                    style={{ padding: "6px 12px", borderRadius: "10px", border: "none", background: "var(--gradient-primary)", color: "#fff", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                  >
                    {generatingAI ? "Generating..." : "Generate AI Suggestions"}
                  </button>
                </div>

                {aiSuggestions && (
                  <div className="ai-preview-container" style={{ marginTop: "14px" }}>
                    <p style={{ margin: "0 0 8px", fontSize: "12.5px", color: "var(--text-secondary)", fontWeight: "600" }}>Preview Suggested Activities:</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "160px", overflowY: "auto", background: "var(--bg-input)", border: "1px solid var(--border-color)", padding: "10px", borderRadius: "8px", marginBottom: "12px" }}>
                      {aiSuggestions.map((item, index) => (
                        <div key={index} style={{ fontSize: "13px", lineHeight: "1.4" }}>
                          <strong>{item.time}:</strong> {item.title}
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        className="button-ripple"
                        onClick={applyAIItinerary}
                        style={{ padding: "6px 12px", borderRadius: "8px", border: "none", background: "#10b981", color: "#fff", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                      >
                        Apply to Trip
                      </button>
                      <button
                        className="button-ripple"
                        onClick={() => setAiSuggestions(null)}
                        style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid var(--border-color)", background: "transparent", color: "var(--text-primary)", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                      >
                        Discard
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="trip-modal-actions" style={{ marginTop: "24px", display: "flex", gap: "10px" }}>
              {!isCompletedTrip && (
                <>
                  <button
                    className="complete-btn button-ripple"
                    onClick={markAsComplete}
                  >
                    Mark as Complete
                  </button>
                  <button
                    className="save-itinerary-btn button-ripple"
                    onClick={requestSaveItineraryOrder}
                  >
                    Save Order
                  </button>
                </>
              )}

              <button className="modal-secondary-btn button-ripple" onClick={closeModal}>
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {confirmSaveOpen && !isCompletedTrip && (
        <div className="delete-modal-overlay" onClick={cancelSaveOrder}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Save Itinerary Order?</h3>
            <p>This will save the current order of your trip activities.</p>

            <div className="delete-modal-actions">
              <button className="confirm-logout-btn button-ripple" onClick={confirmSaveOrder}>
                Yes, Save
              </button>
              <button className="cancel-delete-btn button-ripple" onClick={cancelSaveOrder}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {saveSuccessOpen && (
        <div className="delete-modal-overlay" onClick={closeSuccessMessage}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: "#10b981" }}>Success!</h3>
            <p>Your itinerary order has been updated for this trip.</p>

            <div className="delete-modal-actions">
              <button
                className="confirm-logout-btn button-ripple"
                onClick={closeSuccessMessage}
                style={{
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  boxShadow: "0 10px 20px rgba(16, 185, 129, 0.24)",
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {tripToDelete && (
        <div className="delete-modal-overlay" onClick={() => setTripToDelete(null)}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Trip?</h3>
            <p>Are you sure you want to delete this trip? This action cannot be undone.</p>

            <div className="delete-modal-actions">
              <button
                className="confirm-delete-btn button-ripple"
                onClick={() => {
                  handleDelete(tripToDelete);
                  setTripToDelete(null);
                }}
              >
                Yes, Delete
              </button>
              <button className="cancel-delete-btn button-ripple" onClick={() => setTripToDelete(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default MyTrips;
