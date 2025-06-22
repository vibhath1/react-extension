import React, { useEffect, useState } from "react";
import "./styles.css";
import ChatBox from "./components/Chatbox";

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500); // 2.5 seconds
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="extension-root">
      <div className="extension-container">
        <div className="background-gradient" />
        {showSplash ? (
          <div className={`splash-screen${showSplash ? " fade-in" : " fade-out"}`}>
            <img src="robot.png" alt="AI Assistant" className="splash-robot-full" />
            <div className="splash-overlay">
              <h2 className="splash-title">🤖 Universal Support Assistant</h2>
              <p className="splash-motto">Your always-on, AI-powered customer companion.</p>
            </div>
          </div>
        ) : (
          <div className="chatbox-glass">
            <ChatBox />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
