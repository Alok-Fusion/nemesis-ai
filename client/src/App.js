import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  const handleSend = async () => {
    if (!input.trim()) return;
  
    const userMessage = { text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
  
    try {
      const res = await axios.post('http://localhost:5000/debate', {
        belief: input,
      });
  
      const bulletPoints = res.data.reply; // Already an array
  
      const nemesisMessage = {
        text: bulletPoints,
        sender: 'nemesis',
      };
  
      setMessages((prev) => [...prev, nemesisMessage]);
    } catch (err) {
      console.error('Frontend error:', err.message);
      setMessages((prev) => [
        ...prev,
        { text: ['⚠️ Error: Could not reach Nemesis.'], sender: 'nemesis' },
      ]);
    }
  
    setLoading(false);
  };
  

  // Auto-scroll on new message
  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  return (
    <div className="chat-container">
      <div className="chat-header">NemesisAI 💀</div>

      <div className="chat-body" ref={chatRef}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`message ${msg.sender === 'user' ? 'user' : 'nemesis'}`}
          >
            {msg.sender === 'user' ? (
              msg.text
            ) : (
              <ul>
                {msg.text.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <textarea
          rows="2"
          placeholder="Type a belief..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={handleSend} disabled={loading}>
          {loading ? 'Thinking...' : 'Send'}
        </button>
      </div>
    </div>
  );
}

export default App;
