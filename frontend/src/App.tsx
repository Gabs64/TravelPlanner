import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Bookings from "./pages/Bookings";
import MyTrips from "./pages/MyTrips";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Intro from "./pages/Intro";
import DestinationDetails from "./pages/DestinationDetails";
import "./App.css";

// Initialize dark mode on startup - check localStorage as fallback, but exclude auth pages
const initDarkMode = () => {
  const currentPath = window.location.pathname;
  const isAuthPage = currentPath === "/" || currentPath === "/login" || currentPath === "/intro";

  if (!isAuthPage) {
    const isDarkMode = localStorage.getItem("darkMode") === "true";
    if (isDarkMode) {
      document.documentElement.classList.add("dark-mode");
      document.body.classList.add("dark-mode-body");
    }
  }
};

initDarkMode();

function AnimatedRoutes() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/" || location.pathname === "/login";

  return (
    <div className={isLoginPage ? "main-content auth-layout" : "main-content"}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Intro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/destination/:slug" element={<DestinationDetails />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/mytrips" element={<MyTrips />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        
      </Routes>
    </div>
  );
}

function Layout() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/" || location.pathname === "/login";

  return (
    <>
      {!isLoginPage && <Sidebar />}
      <AnimatedRoutes />
    </>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
