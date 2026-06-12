const API_BASE =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8080"
    : (process.env.REACT_APP_API_BASE || "https://travelplanner-backend-rp6r.onrender.com");

export default API_BASE;
