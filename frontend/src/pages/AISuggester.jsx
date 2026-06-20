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

const detectDestination = (text) => {
  const destinations = [
    "boracay", "baguio", "cebu", "palawan", "siargao", "vigan", "bohol", "tagaytay",
    "tokyo", "kyoto", "rome", "bali", "paris", "manila", "el nido", "puerto princesa", "coron"
  ];
  const lower = text.toLowerCase();
  for (const dest of destinations) {
    if (lower.includes(dest)) {
      return dest.charAt(0).toUpperCase() + dest.slice(1);
    }
  }
  return "";
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
  const [placesToMap, setPlacesToMap] = useState(["Philippines"]);
  const [destinationContext, setDestinationContext] = useState("");
  const [activeTab, setActiveTab] = useState("chat");
  const [mapUpdated, setMapUpdated] = useState(false);
  const messagesEndRef = useRef(null);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const geocodedPlacesRef = useRef([]);

  // Clean up map and markers on unmount
  useEffect(() => {
    return () => {
      if (markersRef.current) {
        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current = [];
      }
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

    const geocodeLocations = async () => {
      try {
        if (!placesToMap || placesToMap.length === 0) return;

        // Clear existing markers
        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current = [];

        const coordinates = [];
        const geocodedList = [];

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
        const isPhTarget = phKeywords.some((keyword) => 
          destinationContext.toLowerCase().includes(keyword) ||
          placesToMap.some((q) => q.toLowerCase().includes(keyword))
        );

        const promises = placesToMap.map(async (query) => {
          // Clean the query from parentheses and extra symbols (e.g. Kawasan Falls (Badian) -> Kawasan Falls Badian)
          let cleanedQuery = query.replace(/\(([^)]+)\)/g, " $1 ");
          cleanedQuery = cleanedQuery.replace(/[()]/g, " ");
          cleanedQuery = cleanedQuery.replace(/\s+/g, " ").trim();

          // Append destination context to help geocoding find the accurate region (e.g. Kawasan Falls Badian Cebu)
          let queryWithContext = cleanedQuery;
          if (destinationContext && !cleanedQuery.toLowerCase().includes(destinationContext.toLowerCase())) {
            queryWithContext = `${cleanedQuery} ${destinationContext}`;
          }

          let optimizedQuery = optimizeSuggesterQuery(queryWithContext);
          const cleanQuery = optimizedQuery.replace(/[:.,;]+$/, "").trim();
          if (!cleanQuery) return null;

          let proximityParam = "";
          if (mapRef.current) {
            const center = mapRef.current.getCenter();
            proximityParam = `&proximity=${center.lng},${center.lat}`;
          }

          let countryParam = "";
          if (isPhTarget) {
            countryParam = "&country=ph";
          }

          const res = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(cleanQuery)}.json?access_token=${MAPBOX_TOKEN}${proximityParam}${countryParam}`
          );
          const data = await res.json();
          
          if (data.features && data.features.length > 0) {
            const [lng, lat] = data.features[0].center;
            const displayName = data.features[0].text || cleanQuery;
            return {
              query,
              name: displayName,
              lng,
              lat
            };
          }
          return null;
        });

        const results = await Promise.all(promises);
        const validResults = results.filter((r) => r !== null);

        if (validResults.length > 0) {
          validResults.forEach((res) => {
            // Create a custom element for the marker to show a beautiful label & pin
            const el = document.createElement("div");
            el.className = "custom-marker-wrapper";

            const labelEl = document.createElement("div");
            labelEl.className = "custom-marker-label";
            labelEl.textContent = res.name;
            el.appendChild(labelEl);

            const pinEl = document.createElement("div");
            pinEl.className = "custom-marker-pin";
            el.appendChild(pinEl);

            // Add marker to map
            const marker = new window.mapboxgl.Marker({ element: el })
              .setLngLat([res.lng, res.lat])
              .addTo(mapRef.current);

            markersRef.current.push(marker);
            coordinates.push([res.lng, res.lat]);
            geocodedList.push(res);
          });

          geocodedPlacesRef.current = geocodedList;

          // Adjust viewport
          if (coordinates.length === 1) {
            mapRef.current.flyTo({
              center: coordinates[0],
              zoom: 12,
              essential: true
            });
          } else {
            const bounds = new window.mapboxgl.LngLatBounds();
            coordinates.forEach((coord) => bounds.extend(coord));
            mapRef.current.fitBounds(bounds, {
              padding: 60,
              maxZoom: 14,
              duration: 1200
            });
          }
        }
      } catch (err) {
        console.error("Geocoding failed:", err);
      }
    };

    geocodeLocations();
  }, [placesToMap]);

  const handlePlaceClick = (placeName) => {
    // Try to find if this place is already geocoded on the map
    const found = geocodedPlacesRef.current.find(
      (p) =>
        p.name.toLowerCase().includes(placeName.toLowerCase()) ||
        placeName.toLowerCase().includes(p.name.toLowerCase()) ||
        p.query.toLowerCase().includes(placeName.toLowerCase())
    );

    if (found) {
      mapRef.current.flyTo({
        center: [found.lng, found.lat],
        zoom: 14,
        essential: true
      });
      // Highlight the label element
      const markers = document.getElementsByClassName("custom-marker-wrapper");
      for (let i = 0; i < markers.length; i++) {
        const markerEl = markers[i];
        const labelEl = markerEl.querySelector(".custom-marker-label");
        if (labelEl && labelEl.textContent.toLowerCase() === found.name.toLowerCase()) {
          labelEl.classList.add("highlighted");
          setTimeout(() => {
            labelEl.classList.remove("highlighted");
          }, 3000);
        }
      }
    } else {
      setPlacesToMap([placeName]);
    }
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

      // Parse and extract all MAP tags: [MAP: location]
      const mapRegex = /\[MAP:\s*([^\]]+)\]/gi;
      const matches = [...aiResponseText.matchAll(mapRegex)];
      const locations = matches.map((m) => m[1].trim());

      // Strip the MAP tags from the response text
      aiResponseText = aiResponseText.replace(mapRegex, "").trim();
      // Clean up formatting leftover like trailing/double commas
      aiResponseText = aiResponseText.replace(/,\s*,\s*/g, ", ").trim();
      aiResponseText = aiResponseText.replace(/,\s*$/g, "").trim();

      // Detect destination context from the latest user message or AI response
      const combinedText = text + " " + aiResponseText;
      const detected = detectDestination(combinedText);
      if (detected) {
        setDestinationContext(detected);
      }

      // Extract all bolded place recommendations directly from the text to map them!
      const boldRegex = /\*\*([^*]+)\*\*/g;
      const boldMatches = [...aiResponseText.matchAll(boldRegex)];
      const excludeKeywords = [
        "recommend", "suggest", "spot", "food", "activit", "note", "attention", "warning", "tip", "important", "caution"
      ];
      
      const boldLocations = [];
      boldMatches.forEach((m) => {
        const term = m[1].trim();
        const isExcluded = excludeKeywords.some((keyword) => term.toLowerCase().includes(keyword));
        if (!isExcluded && term.length > 0 && term.length < 60) {
          const cleanTerm = term.replace(/:$/, "").trim();
          if (cleanTerm) {
            // Split combined locations containing " & " or " and "
            if (cleanTerm.includes(" & ")) {
              cleanTerm.split(" & ").forEach((p) => {
                const trimmed = p.trim();
                if (trimmed) boldLocations.push(trimmed);
              });
            } else if (cleanTerm.toLowerCase().includes(" and ")) {
              cleanTerm.split(/\s+and\s+/i).forEach((p) => {
                const trimmed = p.trim();
                if (trimmed) boldLocations.push(trimmed);
              });
            } else {
              boldLocations.push(cleanTerm);
            }
          }
        }
      });

      // Prefer bolded locations from the text, fallback to MAP tags if none bolded
      const finalLocations = boldLocations.length > 0 ? boldLocations : locations;

      if (finalLocations.length > 0) {
        setPlacesToMap(finalLocations);
        setMapUpdated(true);
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
              <span className="location-focus">
                {placesToMap.length > 1 ? "Locations Pinned: " : "Focus: "}
                <strong>{placesToMap.join(", ")}</strong>
              </span>
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
