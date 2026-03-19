import React from "react";
import "./Home.css";

const destinations = [
  {
    name: "Boracay",
    desc: "White sand beaches and nightlife",
    img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Baguio",
    desc: "Cool climate and scenic views",
    img: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Cebu",
    desc: "Urban + island adventure",
    img: "https://images.unsplash.com/photo-1581091012184-529d2f27a511?auto=format&fit=crop&w=400&q=80"
  }
];

const Home = () => {
  return (
    <div className="home-container">
      {/* Navbar */}
      <div className="navbar">
        <input type="text" placeholder="🔍 Search destinations..." />
        <div className="user">
          <img src="https://i.pravatar.cc/40" alt="user" />
          <span>Marc</span>
        </div>
      </div>

      {/* Stats */}
      <div className="stats">
        <div className="card">
          <h3>Trips Planned</h3>
          <p>12</p>
        </div>
        <div className="card">
          <h3>Upcoming Trips</h3>
          <p>3</p>
        </div>
        <div className="card">
          <h3>Visited Places</h3>
          <p>8</p>
        </div>
      </div>

      {/* Destinations */}
      <div className="section">
        <h2>Popular Destinations</h2>
        <div className="destinations">
          {destinations.map((dest, index) => (
            <div className="destination-card" key={index}>
              <img src={dest.img} alt={dest.name} />
              <h3>{dest.name}</h3>
              <p>{dest.desc}</p>
              <button>Plan Trip</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;