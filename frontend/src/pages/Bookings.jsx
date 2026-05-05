import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE from "../apiConfig";
import "./Bookings.css";

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/trips/${encodeURIComponent(userId)}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Unable to load bookings");
        }

        const bookingData = data.map((trip) => ({
          id: trip.id,
          trip: trip.destinationName,
          date: `${trip.startDate} - ${trip.endDate}`,
          startDate: trip.startDate,
          endDate: trip.endDate,
          status: trip.status || "Upcoming",
          type: trip.status === "Completed" ? "Completed" : "Upcoming",
          notes: trip.notes || "No additional notes available.",
        }));

        setBookings(bookingData);
      } catch (err) {
        console.error("Error loading bookings:", err);
        setError(err.message || "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [navigate]);

  const closeModal = () => {
    setSelectedBooking(null);
  };

  const markAsComplete = () => {
    if (!selectedBooking) return;

    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === selectedBooking.id
          ? {
              ...booking,
              status: "Completed",
              type: "Completed",
            }
          : booking
      )
    );

    setSelectedBooking((prev) => ({
      ...prev,
      status: "Completed",
      type: "Completed",
    }));
  };

  return (
    <main className="bookings-page">
      <div className="bookings-content">
        <div className="page-header">
          <h2>My Bookings</h2>
          <p>Keep track of your confirmed travel arrangements.</p>
        </div>

        {loading ? (
          <div className="loading">Loading bookings...</div>
        ) : error ? (
          <div className="status-banner error-banner">{error}</div>
        ) : bookings.length === 0 ? (
          <div className="empty-state">No bookings found yet. Save a trip to get started.</div>
        ) : (
          <div className="bookings-grid">
            {bookings.map((booking) => (
              <div className="booking-card" key={booking.id}>
                <div>
                  <h3>{booking.trip}</h3>
                  <p>{booking.date}</p>
                </div>

                <span className={`type ${booking.type.toLowerCase()}`}>
                  {booking.type}
                </span>

                <button
                  className="details-btn button-ripple"
                  onClick={() => setSelectedBooking(booking)}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedBooking && (
        <div className="booking-modal-overlay" onClick={closeModal}>
          <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
            <div className="booking-modal-header">
              <div>
                <h3>{selectedBooking.trip}</h3>
                <p>Booking Details</p>
              </div>

              <button className="modal-close-btn" onClick={closeModal}>
                ×
              </button>
            </div>

            <div className="booking-detail-list">
              <div className="booking-detail-item">
                <span>Destination</span>
                <strong>{selectedBooking.trip}</strong>
              </div>

              <div className="booking-detail-item">
                <span>Start Date</span>
                <strong>{selectedBooking.startDate}</strong>
              </div>

              <div className="booking-detail-item">
                <span>End Date</span>
                <strong>{selectedBooking.endDate}</strong>
              </div>

              <div className="booking-detail-item">
                <span>Status</span>
                <strong>{selectedBooking.status}</strong>
              </div>

              <div className="booking-detail-item full">
                <span>Notes</span>
                <strong>{selectedBooking.notes}</strong>
              </div>
            </div>

            <div className="booking-modal-actions">
              {selectedBooking.status !== "Completed" && (
                <button className="complete-btn button-ripple" onClick={markAsComplete}>
                  Mark as Complete
                </button>
              )}

              <button className="modal-secondary-btn button-ripple" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Bookings;
