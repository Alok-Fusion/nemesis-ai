import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const [category, setCategory] = useState('Random'); // Default category
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);
  const inputRef = useRef(null);

  // ✅ Use env var for backend URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/debate`, {
        belief: input,
        category: category,
        history: updatedMessages, // ✅ Send full chat history
      });

      const bulletPoints = res.data.reply || ['⚠️ Nemesis gave no response.'];

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

  // Autofocus input when app loads
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Allow pressing Enter to send
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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
          ref={inputRef}
          rows="2"
          placeholder="Type a belief..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        {/* Category Dropdown */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="category-select"
        >
          <option value="Random">Random</option>
          <option value="Politics">Politics</option>
          <option value="Health">Health</option>
          <option value="Technology">Technology</option>
          <option value="Environment">Environment</option>
          <option value="Society">Society</option>
        </select>

        <button onClick={handleSend} disabled={loading}>
          {loading ? 'Thinking...' : 'Send'}
        </button>
      </div>
    </div>
  );
}

export default App;
