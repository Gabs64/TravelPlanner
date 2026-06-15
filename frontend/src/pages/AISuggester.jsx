import React, { useState, useEffect, useRef } from "react";
import { FaRobot, FaPaperPlane, FaMapMarkerAlt } from "react-icons/fa";
import API_BASE from "../apiConfig";
import "./AISuggester.css";

const parseMessageText = (text, onPlaceClick) => {
  if (!text) return "";
  const lines = text.split("\n");
  
  return lines.map((line, lineIndex) => {
    let currentLine = line.trim();
    if (!currentLine) {
      return <div key={lineIndex} style={{ height: "0.8em" }} />;
    }
    
    // Check for bullet points
    const isBullet = currentLine.startsWith("* ") || currentLine.startsWith("- ");
    if (isBullet) {
      currentLine = currentLine.substring(2).trim();
    }
    
    // Check for headers (e.g., ### title or ## title)
    let isHeader = false;
    if (currentLine.startsWith("### ")) {
      isHeader = true;
      currentLine = currentLine.substring(4).trim();
    } else if (currentLine.startsWith("## ")) {
      isHeader = true;
      currentLine = currentLine.substring(3).trim();
    }
    
    // Parse bold text: **text**
    const parts = [];
    let lastIndex = 0;
    const boldRegex = /\*\*([^*]+)\*\*/g;
    let match;
    
    while ((match = boldRegex.exec(currentLine)) !== null) {
      if (match.index > lastIndex) {
        parts.push(currentLine.substring(lastIndex, match.index));
      }
      const placeName = match[1];
      if (onPlaceClick) {
        parts.push(
          <strong
            key={match.index}
            className="place-link"
            onClick={() => onPlaceClick(placeName)}
            title={`Click to view ${placeName} on map`}
          >
            {placeName}
          </strong>
        );
      } else {
        parts.push(<strong key={match.index}>{placeName}</strong>);
      }
      lastIndex = boldRegex.lastIndex;
    }
    
    if (lastIndex < currentLine.length) {
      parts.push(currentLine.substring(lastIndex));
    }
    
    if (isBullet) {
      return (
        <li key={lineIndex} style={{ marginLeft: "1.2rem", marginBottom: "4px", listStyleType: "disc" }}>
          {parts}
        </li>
      );
    }
    
    if (isHeader) {
      return (
        <h4 key={lineIndex} style={{ marginTop: "12px", marginBottom: "6px", fontWeight: "700" }}>
          {parts}
        </h4>
      );
    }
    
    return (
      <p key={lineIndex} style={{ margin: "4px 0", lineHeight: "1.5" }}>
        {parts}
      </p>
    );
  });
};

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN || "";

const AISuggester = () => {
  const [messages, setMessages] = useState([
    {
      role: "model",
      text: "Hello! I am your AI Travel Agent Suggester. Ask me to suggest hotels, attractions, or food spots. As I make recommendations, I will automatically update the interactive map on the right!\n\nWhere would you like to travel today?",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [mapQuery, setMapQuery] = useState("Philippines");
  const [activeTab, setActiveTab] = useState("chat");
  const [mapUpdated, setMapUpdated] = useState(false);
  const messagesEndRef = useRef(null);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // Clean up map on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Geocoding and Map flying logic
  useEffect(() => {
    if (!window.mapboxgl || !MAPBOX_TOKEN) return;
    
    // Initialize map if not initialized
    if (!mapRef.current) {
      window.mapboxgl.accessToken = MAPBOX_TOKEN;
      mapRef.current = new window.mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [121.7740, 12.8797], // Philippines center
        zoom: 5,
      });
      // Add standard navigation controls
      mapRef.current.addControl(new window.mapboxgl.NavigationControl(), "top-right");
    }

    const optimizeSuggesterQuery = (query) => {
      const replacements = [
        { regex: /cafe\s+hopping/i, replacement: "cafe" },
        { regex: /coffee\s+hopping/i, replacement: "coffee shop" },
        { regex: /beach\s+hopping/i, replacement: "beach" },
        { regex: /island\s+hopping/i, replacement: "island" },
        { regex: /pub\s+crawl/i, replacement: "pub" },
        { regex: /bar\s+hopping/i, replacement: "bar" },
        { regex: /food\s+crawl/i, replacement: "restaurant" },
        { regex: /local\s+sightseeing/i, replacement: "tourist attraction" },
        { regex: /nature\s+walk/i, replacement: "park" },
        { regex: /souvenir\s+shopping/i, replacement: "market" },
        { regex: /shopping/i, replacement: "mall" },
        { regex: /sightseeing/i, replacement: "landmark" }
      ];

      let cleaned = query;
      for (const { regex, replacement } of replacements) {
        if (regex.test(cleaned)) {
          cleaned = cleaned.replace(regex, replacement);
        }
      }
      return cleaned;
    };

    const geocodeLocation = async () => {
      try {
        let optimizedQuery = optimizeSuggesterQuery(mapQuery);
        const cleanQuery = optimizedQuery.replace(/[:.,;]+$/, "").trim();
        if (!cleanQuery) return;
        
        let proximityParam = "";
        if (mapRef.current) {
          const center = mapRef.current.getCenter();
          proximityParam = `&proximity=${center.lng},${center.lat}`;
        }

        let countryParam = "";
        const queryLower = cleanQuery.toLowerCase();
        
        // Define explicit Philippine locations to restrict queries to PH when appropriate.
        // We do NOT use map center proximity to lock the country, as this prevents
        // international searches (e.g. Hawaii, Tokyo) once the map starts centered in the PH.
        const phKeywords = [
          "philippines",
          "boracay",
          "palawan",
          "siargao",
          "vigan",
          "bohol",
          "tagaytay",
          "manila",
          "cebu",
          "baguio",
          "el nido",
          "puerto princesa",
          "coron"
        ];
        
        const hasPhKeyword = phKeywords.some(keyword => queryLower.includes(keyword));
        if (hasPhKeyword) {
          countryParam = "&country=ph";
        }


        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(cleanQuery)}.json?access_token=${MAPBOX_TOKEN}${proximityParam}${countryParam}`
        );
        const data = await res.json();
        
        if (data.features && data.features.length > 0) {
          const [lng, lat] = data.features[0].center;
          
          // Move map camera smoothly
          mapRef.current.flyTo({
            center: [lng, lat],
            zoom: 12,
            essential: true
          });

          // Update marker position
          if (markerRef.current) {
            markerRef.current.setLngLat([lng, lat]);
          } else {
            markerRef.current = new window.mapboxgl.Marker({ color: "#ef4444" })
              .setLngLat([lng, lat])
              .addTo(mapRef.current);
          }
        }
      } catch (err) {
        console.error("Geocoding failed:", err);
      }
    };

    if (mapQuery) {
      geocodeLocation();
    }
  }, [mapQuery]);

  const handlePlaceClick = (placeName) => {
    setMapQuery(placeName);
    setMapUpdated(true);
    setActiveTab("map");
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    if (!textToSend) {
      setInputText("");
    }

    // Add user message
    const userMsg = { role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");


      // Build chat history in ChatMessage format
      const history = messages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch(`${API_BASE}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: text,
          history,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to get suggestions");

      let aiResponseText = data.message || "";

      // Parse and extract MAP command: [MAP: location]
      const mapRegex = /\[MAP:\s*([^\]]+)\]/i;
      const match = aiResponseText.match(mapRegex);
      if (match) {
        const location = match[1].trim();
        setMapQuery(location);
        setMapUpdated(true);
        // Strip the [MAP: ...] tag from the response text
        aiResponseText = aiResponseText.replace(mapRegex, "").trim();
      }

      setMessages((prev) => [...prev, { role: "model", text: aiResponseText }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "⚠️ Sorry, I encountered an issue fetching recommendations. Please check your backend connection or Gemini API key.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const selectSuggestion = (text) => {
    handleSend(text);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "map") {
      setMapUpdated(false);
    }
  };



  return (
    <main className="ai-suggester-page">
      <div className="ai-suggester-content">
        <div className="page-header">
          <div className="header-title-row">
            <h2>AI Travel Agent Suggester</h2>
             <div className="api-badge active">
              <FaRobot /> AI Active
            </div>
          </div>
          <p>Interact with our smart agent to plan details, find local spots, and map destinations.</p>
        </div>



        {/* Mobile View Tab Controls */}
        <div className="mobile-tabs-header">
          <button
            className={`mobile-tab-btn ${activeTab === "chat" ? "active" : ""}`}
            onClick={() => handleTabChange("chat")}
          >
            💬 Chat Assistant
          </button>
          <button
            className={`mobile-tab-btn ${activeTab === "map" ? "active" : ""}`}
            onClick={() => handleTabChange("map")}
          >
            🗺️ Navigation Map
            {mapUpdated && <span className="tab-badge"></span>}
          </button>
        </div>

        <div className="ai-layout">
          {/* Chat Panel */}
          <div className={`chat-panel ${activeTab === "chat" ? "mobile-show" : "mobile-hide"}`}>
            <div className="chat-messages">
              {messages.map((msg, index) => (
                <div key={index} className={`message-bubble-wrapper ${msg.role}`}>
                  <div className="avatar">
                    {msg.role === "model" ? <FaRobot /> : "U"}
                  </div>
                  <div className="message-bubble">
                    <div className="message-text-content">
                      {parseMessageText(msg.text, msg.role === "model" ? handlePlaceClick : null)}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="message-bubble-wrapper model">
                  <div className="avatar"><FaRobot /></div>
                  <div className="message-bubble typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length <= 2 && !loading && (
              <div className="suggestion-pills">
                <button onClick={() => selectSuggestion("Recommend a beach trip to Boracay")}>
                  🏝️ Suggest Boracay highlights
                </button>
                <button onClick={() => selectSuggestion("Things to do in cool Baguio City")}>
                  🌲 Things to do in Baguio
                </button>
                <button onClick={() => selectSuggestion("What are the best food spots in Cebu?")}>
                  🏙️ Cebu food recommendations
                </button>
              </div>
            )}

            {/* Input Bar */}
            <div className="chat-input-bar">
              <textarea
                placeholder="Ask for custom recommendations, itineraries, or details..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
              />
              <button
                className="send-btn button-ripple"
                onClick={() => handleSend()}
                disabled={loading || !inputText.trim()}
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>

          {/* Map Panel */}
          <div className={`map-panel ${activeTab === "map" ? "mobile-show" : "mobile-hide"}`}>
            <div className="map-card-header">
              <h4>
                <FaMapMarkerAlt /> Interactive Navigation
              </h4>
              <span className="location-focus">Focus: <strong>{mapQuery}</strong></span>
            </div>
            <div className="mapbox-map-container" ref={mapContainerRef}>
              {!MAPBOX_TOKEN && (
                <div className="mapbox-missing-token-overlay">
                  <p>🗺️ Mapbox Access Token is missing</p>
                  <span>Please configure <code>REACT_APP_MAPBOX_ACCESS_TOKEN</code> in your <code>.env</code> file in the <code>frontend/</code> directory.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AISuggester;
