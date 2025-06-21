import React, { useState, useRef, useEffect } from "react";
import Message from "./Message";
import './Chatbox.css';

const BACKEND_URL = "http://localhost:8000"; // change if needed

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [userQuery, setUserQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [feedbacks, setFeedbacks] = useState({}); // { [msgIndex]: "feedback" | "regenerating" }

  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // SpeechRecognition setup (for text input, not used for hold-to-record)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = "en-US";
      recognitionRef.current.interimResults = false;
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setUserQuery(transcript);
        setListening(false);
      };

      recognitionRef.current.onend = () => {
        setListening(false);
      };

      recognitionRef.current.onerror = () => {
        setListening(false);
      };
    }
  }, []);

  // --- Voice Recording Handlers ---
  const handleMicMouseDown = async () => {
    setShowTooltip(false);
    setRecording(true);
    setAudioURL(null);
    setAudioBlob(null);

    if (navigator.mediaDevices && window.MediaRecorder) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new window.MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          setAudioBlob(blob);
          setAudioURL(URL.createObjectURL(blob));
          setRecording(false);
        };

        mediaRecorderRef.current.start();
      } catch (err) {
        alert("Microphone access denied or not supported.");
        setRecording(false);
      }
    } else {
      alert("Audio recording not supported in this browser.");
      setRecording(false);
    }
  };

  const handleMicMouseUp = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
    }
  };

  // Send text message
  const sendMessage = async () => {
    if (!userQuery.trim()) return;

    const userMsg = { role: "user", text: userQuery };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    // Demo: Fake AI response after short delay
    setTimeout(() => {
      const aiMsg = {
        role: "ai",
        text: `This is a demo response to: "${userQuery}"`,
        sources: [],
      };
      setMessages((prev) => [...prev, aiMsg]);
      setUserQuery("");
      setLoading(false);
    }, 700);
  };

  // Send audio message
  const sendAudioMessage = async () => {
    if (!audioBlob) return;

    const userMsg = { role: "user", audio: audioURL };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    // Demo: Fake AI response after short delay
    setTimeout(() => {
      const aiMsg = {
        role: "ai",
        text: "This is a demo response to your voice message.",
        sources: [],
      };
      setMessages((prev) => [...prev, aiMsg]);
      setAudioURL(null);
      setAudioBlob(null);
      setLoading(false);
    }, 1000);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  // Feedback handlers
  const handleFeedback = (index, type) => {
    setFeedbacks((prev) => ({ ...prev, [index]: "feedback" }));
  };

  const handleRegenerate = (index, msg) => {
    setFeedbacks((prev) => ({ ...prev, [index]: "regenerating" }));
    setLoading(true);

    // Simulate regeneration
    setTimeout(() => {
      const regeneratedMsg = {
        role: "ai",
        text: `This is a regenerated response for: "${msg.text || "your voice message"}"`,
        sources: [],
      };
      setMessages((prev) => {
        // Insert regenerated message after the current one
        const newMsgs = [...prev];
        newMsgs.splice(index + 1, 0, regeneratedMsg);
        return newMsgs;
      });
      setFeedbacks((prev) => ({ ...prev, [index]: undefined }));
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="chat-container">
      <div className="chat-box">
        {messages.map((msg, i) =>
          msg.audio ? (
            <div key={i} className="msg user">
              <audio controls src={msg.audio} style={{ verticalAlign: "middle" }} />
            </div>
          ) : (
            <div key={i}>
              <Message msg={msg} />
              {/* Thumbs and Regenerate for AI responses */}
              {msg.role === "ai" && (
                <div>
                  <div className="response-actions">
                    <button
                      className="resp-btn"
                      onClick={() => handleFeedback(i, "up")}
                      disabled={!!feedbacks[i]}
                      title="Thumbs up"
                    >
                      👍
                    </button>
                    <button
                      className="resp-btn"
                      onClick={() => handleFeedback(i, "down")}
                      disabled={!!feedbacks[i]}
                      title="Thumbs down"
                    >
                      👎
                    </button>
                    <button
                      className="resp-btn regen-btn"
                      onClick={() => handleRegenerate(i, msg)}
                      disabled={!!feedbacks[i]}
                      title="Regenerate response"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="23 4 23 10 17 10"></polyline>
                        <path d="M1 20v-6a8 8 0 0 1 14-5.29L23 10"></path>
                      </svg>
                    </button>
                  </div>
                  {feedbacks[i] === "feedback" && (
                    <div className="feedback-msg">
                      <em>Thanks for your feedback</em>
                    </div>
                  )}
                  {feedbacks[i] === "regenerating" && (
                    <div className="feedback-msg">
                      <em>Regenerating response...</em>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        )}
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
          disabled={recording}
        />
        {/* Mic button */}
        <button
          className="mic-btn"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            marginRight: "8px",
            padding: "0 8px",
            display: "flex",
            alignItems: "center",
            fontSize: "1.3em",
            color: recording ? "#1976d2" : "#555",
            position: "relative"
          }}
          title=""
          tabIndex={0}
          onMouseDown={handleMicMouseDown}
          onMouseUp={handleMicMouseUp}
          onMouseLeave={() => { handleMicMouseUp(); setShowTooltip(false); }}
          onTouchStart={handleMicMouseDown}
          onTouchEnd={handleMicMouseUp}
          onMouseEnter={() => setShowTooltip(true)}
        >
          {/* Animated ripples when recording */}
          {recording && (
            <span className="mic-ripple">
              <span className="ripple ripple1"></span>
              <span className="ripple ripple2"></span>
              <span className="ripple ripple3"></span>
            </span>
          )}
          {/* SVG mic icon */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={recording ? "#1976d2" : "#555"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{zIndex:2}}>
            <rect x="9" y="2" width="6" height="12" rx="3" />
            <path d="M5 10v2a7 7 0 0 0 14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="22" />
            <line x1="8" y1="22" x2="16" y2="22" />
          </svg>
          {/* Tooltip */}
          {showTooltip && !recording && (
            <span
              style={{
                position: "absolute",
                top: "-30px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "#222",
                color: "#fff",
                padding: "4px 10px",
                borderRadius: "6px",
                fontSize: "0.9em",
                whiteSpace: "nowrap",
                zIndex: 10,
                pointerEvents: "none"
              }}
            >
              Press and hold to speak
            </span>
          )}
        </button>
        <button onClick={sendMessage} disabled={recording}>➤</button>
      </div>
      {/* Audio preview and send/cancel */}
      {audioURL && (
        <div className="audio-preview" style={{ display: "flex", alignItems: "center", marginTop: 8 }}>
          <audio controls src={audioURL} style={{ marginRight: 8 }} />
          <button onClick={sendAudioMessage} style={{ marginRight: 4 }}>Send</button>
          <button onClick={() => { setAudioURL(null); setAudioBlob(null); }}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
