import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./DestinationDetails.css";

const destinationData = {
  boracay: {
    name: "Boracay",
    desc: "White sand beaches, island activities, sunset views, and nightlife.",
    location: "Boracay, Malay, Aklan, Philippines",
  },
  baguio: {
    name: "Baguio",
    desc: "Cool climate, mountain views, parks, cafes, and scenic attractions.",
    location: "Baguio City, Benguet, Philippines",
  },
  cebu: {
    name: "Cebu",
    desc: "A mix of city travel, beaches, heritage spots, and island adventures.",
    location: "Cebu City, Cebu, Philippines",
  },
};

const DestinationDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const destination = destinationData[slug];

  if (!destination) {
    return (
      <main className="destination-page">
        <div className="destination-content">
          <button className="back-btn button-ripple" onClick={() => navigate("/home")}>
            Back
          </button>
          <h2>Destination not found</h2>
        </div>
      </main>
    );
  }

  const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    destination.location
  )}&output=embed`;

  return (
    <main className="destination-page">
      <div className="destination-content">
        <div className="destination-topbar">
          <button className="back-btn button-ripple" onClick={() => navigate("/home")}>
            Back
          </button>
        </div>

        <div className="page-header">
          <h2>{destination.name}</h2>
          <p>{destination.desc}</p>
        </div>

        <section className="destination-layout">
          <div
            className="destination-panel"
            style={{ viewTransitionName: `dest-card-${slug}` }}
          >
            <h3>Trip Planning</h3>
            <p>
              <strong>Location:</strong> {destination.location}
            </p>
            <p>Use the map to check the area and start planning your route.</p>

            <div className="destination-actions">
              <button className="button-ripple">Save Trip</button>
              <button
                className="button-ripple secondary-action"
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      destination.location
                    )}`,
                    "_blank"
                  )
                }
              >
                Open in Google Maps
              </button>
            </div>
          </div>

          <div
            className="map-card"
            style={{ viewTransitionName: `dest-image-${slug}` }}
          >
            <iframe
              title={`${destination.name} Map`}
              src={mapUrl}
              loading="lazy"
              allowFullScreen
            />
          </div>
        </section>
      </div>
    </main>
  );
};

export default DestinationDetails;
