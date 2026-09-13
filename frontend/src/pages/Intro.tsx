import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Intro.css";

function Intro() {
  const navigate = useNavigate();
  const [isFadingOut, setIsFadingOut] = useState(false);

  const handleJoinNow = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      navigate("/login");
    }, 300);
  };

  return (
    <div className={`intro-page-container ${isFadingOut ? "container-fade-out" : ""}`}>
      <div className="intro-blob blob-1"></div>
      <div className="intro-blob blob-2"></div>
      <div className="intro-blob blob-3"></div>

      <div className={`intro-glass-panel ${isFadingOut ? "panel-fade-out" : ""}`}>
        <div className="intro-logo-wrapper">
          <img className="intro-logo" src="/TPLogo.png" alt="TravelPlanner logo" />
        </div>

        <div className="intro-content">
          <h1>Plan Smarter. <br />Travel Better.</h1>

          <p>
            TravelPlanner helps you organize destinations, bookings, and trip details
            in one smooth space, so every journey feels easier from the first idea to
            the final itinerary.
          </p>

          <button
            className="join-now-btn button-ripple"
            onClick={handleJoinNow}
            disabled={isFadingOut}
          >
            Join Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default Intro;
