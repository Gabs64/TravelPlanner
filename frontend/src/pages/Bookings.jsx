import React from "react";
import "./Bookings.css";

const bookings = [
  { trip: "Boracay", date: "March 20, 2026", type: "Hotel" },
  { trip: "Baguio", date: "Jan 5, 2026", type: "Flight" },
  { trip: "Cebu", date: "Feb 10, 2026", type: "Hotel" },
];

const Bookings = () => {
  return (
    <main className="bookings-page">
      <div className="bookings-content">
        <div className="page-header">
          <h2>My Bookings</h2>
          <p>Keep track of your confirmed travel arrangements.</p>
        </div>

        <div className="bookings-grid">
          {bookings.map((booking) => (
            <div className="booking-card" key={`${booking.trip}-${booking.type}`}>
              <div>
                <h3>{booking.trip}</h3>
                <p>{booking.date}</p>
              </div>
              <span className={`type ${booking.type.toLowerCase()}`}>
                {booking.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Bookings;
