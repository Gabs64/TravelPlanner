import React from "react";
import "./Bookings.css";

const Bookings = () => {
  const bookings = [
    { trip: "Boracay", date: "March 20, 2026", type: "Hotel" },
    { trip: "Baguio", date: "Jan 5, 2026", type: "Flight" },
    { trip: "Cebu", date: "Feb 10, 2026", type: "Hotel" },
  ];

  return (
    <div className="main-page">
      <h2>My Bookings</h2>
      <div className="bookings-grid">
        {bookings.map((b, idx) => (
          <div className="booking-card" key={idx}>
            <h3>{b.trip}</h3>
            <p>{b.date}</p>
            <span className="type">{b.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Bookings;