import { useNavigate } from "react-router-dom";
import "./Intro.css";

function Intro() {
  const navigate = useNavigate();

  return (
    <div className="intro-page-container">
      <div className="intro-glass-panel">
        <img className="intro-logo" src="/TPLogo.png" alt="TravelPlanner logo" />

        <div className="intro-content">
          <h1>Plan Smarter. Travel Better.</h1>

          <p>
            TravelPlanner helps you organize destinations, bookings, and trip details
            in one smooth space, so every journey feels easier from the first idea to
            the final itinerary.
          </p>

          <button className="join-now-btn" onClick={() => navigate("/login")}>
            Join Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default Intro;
