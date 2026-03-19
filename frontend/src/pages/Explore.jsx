import React from "react";
import "./Explore.css";

const Explore = () => {
  const destinations = ["Palawan", "Siargao", "Vigan", "Bohol", "Tagaytay"];

  return (
    <div className="main-page">
      <h2>Explore Destinations</h2>
      <div className="explore-grid">
        {destinations.map((place, idx) => (
          <div className="explore-card" key={idx}>
            <img src={`https://source.unsplash.com/400x250/?${place}`} alt={place} />
            <h3>{place}</h3>
            <button>View Trips</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Explore;