import React from "react";
import "./MyTrips.css";

const MyTrips = () => {
  const trips = [
    { name: "Boracay", date: "March 20-25, 2026", status: "Upcoming" },
    { name: "Baguio", date: "Jan 5-8, 2026", status: "Completed" },
    { name: "Cebu", date: "Feb 10-15, 2026", status: "Completed" },
  ];

  return (
    <div className="main-page">
      <h2>My Trips</h2>
      <div className="trips-grid">
        {trips.map((trip, idx) => (
          <div className="trip-card" key={idx}>
            <h3>{trip.name}</h3>
            <p>{trip.date}</p>
            <span className={`status ${trip.status.toLowerCase()}`}>
              {trip.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyTrips;