import React from "react";
import "./MyTrips.css";

const trips = [
  { name: "Boracay", date: "March 20-25, 2026", status: "Upcoming" },
  { name: "Baguio", date: "Jan 5-8, 2026", status: "Completed" },
  { name: "Cebu", date: "Feb 10-15, 2026", status: "Completed" },
];

const MyTrips = () => {
  return (
    <main className="trips-page">
      <div className="trips-content">
        <div className="page-header">
          <h2>My Trips</h2>
          <p>View your upcoming and completed travel plans.</p>
        </div>

        <div className="trips-grid">
          {trips.map((trip) => (
            <div className="trip-card" key={`${trip.name}-${trip.status}`}>
              <div>
                <h3>{trip.name}</h3>
                <p>{trip.date}</p>
              </div>

              <span className={`status ${trip.status.toLowerCase()}`}>
                {trip.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default MyTrips;
