import React from "react";
import "./Explore.css";

const destinations = [
  {
    name: "Palawan",
    desc: "Lagoons, limestone cliffs, and island hopping",
    img: "https://images.unsplash.com/photo-1584824486539-53bb4646bdbc?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Siargao",
    desc: "Surf breaks, lagoons, and laid-back island days",
    img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Vigan",
    desc: "Historic streets and preserved Spanish-era architecture",
    img: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Bohol",
    desc: "Chocolate Hills, beaches, and countryside tours",
    img: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Tagaytay",
    desc: "Cool weather, lake views, and weekend escapes",
    img: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80",
  },
];

const Explore = () => {
  return (
    <main className="explore-page">
      <div className="explore-content">
        <div className="page-header">
          <h2>Explore Destinations</h2>
          <p>Browse places you can add to your next travel plan.</p>
        </div>

        <div className="explore-grid">
          {destinations.map((place) => (
            <div className="explore-card" key={place.name}>
              <img src={place.img} alt={place.name} />
              <div className="explore-card-body">
                <h3>{place.name}</h3>
                <p>{place.desc}</p>
                <button className="button-ripple">View Trips</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Explore;
