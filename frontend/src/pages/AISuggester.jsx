import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FaRobot, FaPaperPlane, FaMapMarkerAlt, FaInfoCircle } from "react-icons/fa";
import API_BASE from "../apiConfig";
import "./AISuggester.css";

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
  const [hasApiKey, setHasApiKey] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const key = localStorage.getItem("geminiApiKey");
    setHasApiKey(!!key);
  }, []);

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
      const savedKey = localStorage.getItem("geminiApiKey") || "";

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
          apiKey: savedKey,
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

  const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`;

  return (
    <main className="ai-suggester-page">
      <div className="ai-suggester-content">
        <div className="page-header">
          <div className="header-title-row">
            <h2>AI Travel Agent Suggester</h2>
            <div className={`api-badge ${hasApiKey ? "active" : "demo"}`}>
              <FaRobot /> {hasApiKey ? "Gemini Live" : "Demo Mode"}
            </div>
          </div>
          <p>Interact with our smart agent to plan details, find local spots, and map destinations.</p>
        </div>

        {!hasApiKey && (
          <div className="demo-notice-banner">
            <FaInfoCircle />
            <span>
              Running in <strong>Demo Mode</strong> with local simulated responses. Provide your own Gemini API Key in the{" "}
              <Link to="/settings" className="settings-link">Settings page</Link> to enable fully live travel suggestions!
            </span>
          </div>
        )}

        <div className="ai-layout">
          {/* Chat Panel */}
          <div className="chat-panel">
            <div className="chat-messages">
              {messages.map((msg, index) => (
                <div key={index} className={`message-bubble-wrapper ${msg.role}`}>
                  <div className="avatar">
                    {msg.role === "model" ? <FaRobot /> : "U"}
                  </div>
                  <div className="message-bubble">
                    <p style={{ whiteSpace: "pre-line" }}>{msg.text}</p>
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
          <div className="map-panel">
            <div className="map-card-header">
              <h4>
                <FaMapMarkerAlt /> Interactive Navigation
              </h4>
              <span className="location-focus">Focus: <strong>{mapQuery}</strong></span>
            </div>
            <div className="map-iframe-container">
              <iframe
                title="AI Suggester Google Map"
                src={mapUrl}
                loading="lazy"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AISuggester;
