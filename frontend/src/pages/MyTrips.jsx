import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE from "../apiConfig";
import "./MyTrips.css";

const createDefaultItinerary = (destinationName) => [
  { id: 1, time: "Day 1", title: `Arrive in ${destinationName} and check in` },
  { id: 2, time: "Day 2", title: `Explore popular spots in ${destinationName}` },
  { id: 3, time: "Day 3", title: "Free time, food trip, and souvenir shopping" },
];

const calculateItemDate = (startDateStr, index) => {
  if (!startDateStr) return "";
  try {
    const parts = startDateStr.split("-");
    if (parts.length !== 3) return "";
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 0-indexed month
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
  const [shareModalOpen, setShareModalOpen] = useState(null);

  // Tab & Budget states
  const [activeModalTab, setActiveModalTab] = useState("itinerary");
  const [expenses, setExpenses] = useState([]);
  const [tripBudget, setTripBudget] = useState(10000);
  const [expenseDesc, setExpenseDesc] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Food");

  const isCompletedTrip = selectedTrip?.status?.toLowerCase() === "completed";

  // Sync expenses and budget from localStorage on selected trip change
  useEffect(() => {
    if (selectedTrip) {
      const savedExpenses = localStorage.getItem(`expenses_${selectedTrip.id}`);
      if (savedExpenses) {
        setExpenses(JSON.parse(savedExpenses));
      } else {
        setExpenses([]);
      }

      const savedBudget = localStorage.getItem(`budget_${selectedTrip.id}`);
      if (savedBudget) {
        setTripBudget(parseFloat(savedBudget));
      } else {
        setTripBudget(10000); // default fallback
      }
    }
  }, [selectedTrip]);

  const saveExpenses = (newExpenses) => {
    if (!selectedTrip) return;
    setExpenses(newExpenses);
    localStorage.setItem(`expenses_${selectedTrip.id}`, JSON.stringify(newExpenses));
  };

  const saveBudget = (newBudget) => {
    if (!selectedTrip) return;
    setTripBudget(newBudget);
    localStorage.setItem(`budget_${selectedTrip.id}`, newBudget.toString());
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!expenseDesc.trim() || !expenseAmount) return;
    const amount = parseFloat(expenseAmount);
    if (isNaN(amount) || amount <= 0) return;

    const newExpense = {
      id: Date.now(),
      desc: expenseDesc.trim(),
      amount,
      category: expenseCategory,
    };

    const newExpenses = [...expenses, newExpense];
    saveExpenses(newExpenses);
    setExpenseDesc("");
    setExpenseAmount("");
  };

  const handleDeleteExpense = (id) => {
    const newExpenses = expenses.filter((exp) => exp.id !== id);
    saveExpenses(newExpenses);
  };

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
    setActiveModalTab("itinerary");
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

  const applyAIItinerary = async () => {
    if (!selectedTrip || !aiSuggestions) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/trips/${selectedTrip.id}/itinerary`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(aiSuggestions),
      });

      if (!res.ok) throw new Error("Failed to save AI itinerary");

      const updatedTrip = {
        ...selectedTrip,
        itinerary: aiSuggestions,
      };
      setSelectedTrip(updatedTrip);
      setTrips((prev) =>
        prev.map((trip) => (trip.id === updatedTrip.id ? updatedTrip : trip))
      );
      setAiSuggestions(null);
    } catch (err) {
      console.error(err);
      alert("Error applying AI itinerary: " + err.message);
    }
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

  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const remainingBalance = tripBudget - totalSpent;
  const spentPercentage = tripBudget > 0 ? Math.min((totalSpent / tripBudget) * 100, 100) : 0;

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

              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <button
                  className="print-btn button-ripple"
                  onClick={() => window.print()}
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-primary)",
                    padding: "6px 12px",
                    borderRadius: "10px",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                  title="Print this itinerary"
                >
                  🖨️ Print
                </button>
                <button
                  className="share-btn button-ripple"
                  onClick={() => setShareModalOpen(selectedTrip.id)}
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-primary)",
                    padding: "6px 12px",
                    borderRadius: "10px",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                  title="Share this trip publicly"
                >
                  🔗 Share
                </button>
                <button className="modal-close-btn" onClick={closeModal}>
                  ×
                </button>
              </div>
            </div>

            <div className="modal-tabs" style={{ display: "flex", gap: "10px", margin: "12px 0 20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px" }}>
              <button
                className={`modal-tab-toggle ${activeModalTab === "itinerary" ? "active" : ""}`}
                onClick={() => setActiveModalTab("itinerary")}
                style={{
                  background: activeModalTab === "itinerary" ? "var(--gradient-primary)" : "transparent",
                  color: activeModalTab === "itinerary" ? "#ffffff" : "var(--text-secondary)",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer"
                }}
              >
                📅 Schedule
              </button>
              <button
                className={`modal-tab-toggle ${activeModalTab === "budget" ? "active" : ""}`}
                onClick={() => setActiveModalTab("budget")}
                style={{
                  background: activeModalTab === "budget" ? "var(--gradient-primary)" : "transparent",
                  color: activeModalTab === "budget" ? "#ffffff" : "var(--text-secondary)",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer"
                }}
              >
                💵 Expenses
              </button>
            </div>

            {isCompletedTrip && (
              <div className="locked-itinerary-banner">
                This trip is completed. The details are now read-only.
              </div>
            )}

            {activeModalTab === "itinerary" && (
              <>
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
                        <span>{calculateItemDate(selectedTrip.startDate, index)} {item.time ? `(${item.time})` : ""}</span>
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
              </>
            )}

            {activeModalTab === "budget" && (
              <div className="budget-panel-content">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "18px" }}>
                  <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", padding: "12px", borderRadius: "14px" }}>
                    <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: "700" }}>Total Budget</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                      <span style={{ fontSize: "14px", fontWeight: "800", color: "var(--text-primary)" }}>PHP</span>
                      <input
                        type="number"
                        disabled={isCompletedTrip}
                        value={tripBudget}
                        onChange={(e) => saveBudget(Math.max(0, parseFloat(e.target.value) || 0))}
                        style={{
                          width: "100%",
                          background: "transparent",
                          border: "none",
                          borderBottom: "1px dashed var(--border-color)",
                          color: "var(--text-primary)",
                          fontWeight: "800",
                          fontSize: "15px",
                          padding: "2px 0",
                          outline: "none"
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", padding: "12px", borderRadius: "14px" }}>
                    <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: "700" }}>Total Spent</span>
                    <div style={{ fontSize: "15px", fontWeight: "800", marginTop: "4px", color: totalSpent > tripBudget ? "#ef4444" : "var(--text-primary)" }}>
                      PHP {totalSpent.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", padding: "12px", borderRadius: "14px" }}>
                    <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: "700" }}>Remaining</span>
                    <div style={{ fontSize: "15px", fontWeight: "800", marginTop: "4px", color: remainingBalance < 0 ? "#ef4444" : "#10b981" }}>
                      PHP {remainingBalance.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px", fontWeight: "700" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Budget Utilization</span>
                    <span style={{ color: totalSpent > tripBudget ? "#ef4444" : "var(--text-primary)" }}>{spentPercentage.toFixed(1)}%</span>
                  </div>
                  <div style={{ height: "8px", background: "var(--bg-input)", borderRadius: "4px", overflow: "hidden", border: "1px solid var(--border-color)" }}>
                    <div
                      style={{
                        width: `${spentPercentage}%`,
                        height: "100%",
                        background: totalSpent > tripBudget ? "linear-gradient(90deg, #f59e0b, #ef4444)" : "linear-gradient(90deg, #10b981, #3b82f6)",
                        transition: "width 0.3s ease"
                      }}
                    ></div>
                  </div>
                </div>

                {!isCompletedTrip && (
                  <form onSubmit={handleAddExpense} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: "8px", marginBottom: "18px", alignItems: "end" }}>
                    <div>
                      <input
                        type="text"
                        placeholder="Expense Item"
                        value={expenseDesc}
                        onChange={(e) => setExpenseDesc(e.target.value)}
                        required
                        style={{ width: "100%", boxSizing: "border-box", background: "var(--bg-input)", border: "1px solid var(--border-color)", color: "var(--text-primary)", padding: "8px 10px", borderRadius: "10px", fontSize: "12.5px" }}
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="PHP"
                        value={expenseAmount}
                        onChange={(e) => setExpenseAmount(e.target.value)}
                        required
                        min="0.01"
                        step="any"
                        style={{ width: "100%", boxSizing: "border-box", background: "var(--bg-input)", border: "1px solid var(--border-color)", color: "var(--text-primary)", padding: "8px 10px", borderRadius: "10px", fontSize: "12.5px" }}
                      />
                    </div>
                    <div>
                      <select
                        value={expenseCategory}
                        onChange={(e) => setExpenseCategory(e.target.value)}
                        style={{ width: "100%", boxSizing: "border-box", background: "var(--bg-input)", border: "1px solid var(--border-color)", color: "var(--text-primary)", padding: "7px 10px", borderRadius: "10px", fontSize: "12.5px", height: "34px" }}
                      >
                        <option value="Food">🍔 Food</option>
                        <option value="Lodging">🏨 Lodging</option>
                        <option value="Transport">🚗 Transport</option>
                        <option value="Activities">🎟️ Activities</option>
                        <option value="Shopping">🛍️ Shopping</option>
                        <option value="Others">📦 Others</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="button-ripple"
                      style={{ background: "var(--gradient-primary)", color: "#fff", border: "none", padding: "0 14px", borderRadius: "10px", fontWeight: "700", cursor: "pointer", height: "34px", fontSize: "12.5px" }}
                    >
                      Add
                    </button>
                  </form>
                )}

                <div style={{ border: "1px solid var(--border-color)", borderRadius: "14px", padding: "12px", background: "rgba(255,255,255,0.01)" }}>
                  <h4 style={{ margin: "0 0 10px", fontSize: "13px", fontWeight: "700" }}>Logged Expenses ({expenses.length})</h4>
                  {expenses.length === 0 ? (
                    <div style={{ fontSize: "12.5px", color: "var(--text-secondary)", textAlign: "center", padding: "20px 0" }}>No expenses logged yet.</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "200px", overflowY: "auto" }}>
                      {expenses.map((exp) => (
                        <div key={exp.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "var(--bg-input)", border: "1px solid var(--border-color)", borderRadius: "10px" }}>
                          <div>
                            <strong style={{ fontSize: "13px", color: "var(--text-primary)" }}>{exp.desc}</strong>
                            <span style={{ fontSize: "10.5px", color: "var(--text-secondary)", display: "block", marginTop: "1px" }}>{exp.category}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <strong style={{ fontSize: "13px", color: "var(--text-primary)" }}>PHP {exp.amount.toLocaleString()}</strong>
                            {!isCompletedTrip && (
                              <button
                                onClick={() => handleDeleteExpense(exp.id)}
                                style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "12px", padding: 0 }}
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="trip-modal-actions" style={{ marginTop: "24px", display: "flex", gap: "10px" }}>
              {activeModalTab === "itinerary" && !isCompletedTrip && (
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

      {shareModalOpen && (
        <div className="delete-modal-overlay" onClick={() => setShareModalOpen(null)}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Share Your Trip 🌍</h3>
            <p>Anyone with this link can view your itinerary and map in read-only mode.</p>
            <input
              type="text"
              readOnly
              value={`${window.location.origin}/trip/share/${shareModalOpen}`}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
                background: "var(--bg-input)",
                color: "var(--text-primary)",
                fontSize: "13px",
                marginBottom: "16px",
                textAlign: "center"
              }}
              onClick={(e) => e.target.select()}
            />
            <div className="delete-modal-actions">
              <button
                className="confirm-delete-btn button-ripple"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/trip/share/${shareModalOpen}`);
                  alert("Link copied to clipboard!");
                }}
              >
                📋 Copy Link
              </button>
              <button className="cancel-delete-btn button-ripple" onClick={() => setShareModalOpen(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default MyTrips;
