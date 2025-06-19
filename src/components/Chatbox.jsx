import React, { useState, useRef, useEffect } from "react";
import Message from "./Message";

const BACKEND_URL = "http://localhost:8000"; // change if needed

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [userQuery, setUserQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!userQuery.trim()) return;

    const userMsg = { role: "user", text: userQuery };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const res = await fetch(`${BACKEND_URL}/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: userQuery }),
    });

    const data = await res.json();
    const aiMsg = {
      role: "ai",
      text: data.answer,
      sources: data.sources || [],
    };

    setMessages((prev) => [...prev, aiMsg]);
    setUserQuery("");
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="chat-container">
      <div className="chat-box">
        {messages.map((msg, i) => (
          <Message key={i} msg={msg} />
        ))}
        {loading && <div className="msg ai">⌛ Generating response...</div>}
        <div ref={messagesEndRef}></div>
      </div>
      <div className="input-row">
        <input
          type="text"
          placeholder="Type your question..."
          value={userQuery}
          onChange={(e) => setUserQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={sendMessage}>➤</button>
      </div>
    </div>
  );
};

export default ChatBox;
