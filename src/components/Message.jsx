import React from "react";
import "./Message.css"; // Import the CSS file

const Message = ({ msg }) => {
  return (
    <div className={`msg ${msg.role}`}>
      <div className="bubble">
        <p className="bubble-text">{msg.text}</p>
        {msg.sources && msg.sources.length > 0 && (
          <ul className="sources">
            {msg.sources.map((src, i) => (
              <li key={i}>
                <a href={src} target="_blank" rel="noreferrer">
                  🔗 Source {i + 1}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Message;
