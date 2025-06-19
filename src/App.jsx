import React from "react";
import "./styles.css";
import ChatBox from "./components/ChatBox";

const App = () => {
  return (
    <div className="extension-container">
      <img src="robot.png" alt="AI Assistant" className="robot-image" />
      <h2>🤖 Universal Support Assistant</h2>
      <p className="motto">Your always-on, AI-powered customer companion.</p>
      <ChatBox />
    </div>
  );
};

export default App;
