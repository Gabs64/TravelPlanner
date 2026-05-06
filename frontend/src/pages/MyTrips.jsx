import React, { useState } from "react";
import "./MyTrips.css";

const initialTrips = [
  {
    id: 1,
    name: "Boracay",
    date: "March 20-25, 2026",
    status: "Upcoming",
    itinerary: [
      { id: 1, time: "Day 1", title: "Arrival and hotel check-in" },
      { id: 2, time: "Day 2", title: "Island hopping tour" },
      { id: 3, time: "Day 3", title: "White Beach and sunset viewing" },
      { id: 4, time: "Day 4", title: "Water activities and souvenir shopping" },
    ],
  },
  {
    id: 2,
    name: "Baguio",
    date: "Jan 5-8, 2026",
    status: "Completed",
    itinerary: [
      { id: 1, time: "Day 1", title: "Burnham Park and Session Road" },
      { id: 2, time: "Day 2", title: "Mines View Park and The Mansion" },
      { id: 3, time: "Day 3", title: "Botanical Garden and cafe hopping" },
    ],
  },
  {
    id: 3,
    name: "Cebu",
    date: "Feb 10-15, 2026",
    status: "Completed",
    itinerary: [
      { id: 1, time: "Day 1", title: "City tour and Magellan's Cross" },
      { id: 2, time: "Day 2", title: "Temple of Leah and Tops Lookout" },
      { id: 3, time: "Day 3", title: "Island hopping and beach day" },
    ],
  },
];

const MyTrips = () => {
  const [trips, setTrips] = useState(initialTrips);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [saveSuccessOpen, setSaveSuccessOpen] = useState(false);

  const isCompletedTrip = selectedTrip?.status?.toLowerCase() === "completed";

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
                <div className="itinerary-item" key={item.id}>
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
