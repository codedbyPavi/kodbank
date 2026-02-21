import { useState, useRef, useEffect } from 'react';
import { FiMessageCircle, FiX, FiSend } from 'react-icons/fi';
import { api } from '../api/axios';
import './Chatbot.css';

const WELCOME_MSG = "Hi, I'm Kora — your Kodbank AI assistant.";

function AssistantSticker() {
  return (
    <div className="assistant-sticker" aria-hidden="true">
      <svg
        className="assistant-sticker__svg"
        viewBox="0 0 80 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Head */}
        <circle cx="40" cy="22" r="14" fill="#2D2A3A" />
        <circle cx="36" cy="19" r="2" fill="#EAEAF0" />
        <circle cx="44" cy="19" r="2" fill="#EAEAF0" />
        {/* Yellow shirt / body */}
        <path
          d="M28 38 L40 32 L52 38 L52 72 L28 72 Z"
          fill="url(#shirt)"
        />
        <defs>
          <linearGradient id="shirt" x1="28" y1="32" x2="52" y2="72" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFD700" />
            <stop offset="1" stopColor="#FFC107" />
          </linearGradient>
        </defs>
        {/* Arm waving */}
        <path
          className="assistant-sticker__hand"
          d="M52 42 Q62 30 68 38 Q72 44 66 48 L58 44 Z"
          fill="#FFD700"
          stroke="#FFC107"
          strokeWidth="1"
        />
        {/* Other arm at side */}
        <path d="M28 42 L22 58 L26 60 L32 46 Z" fill="#FFC107" />
        {/* Legs */}
        <path d="M32 72 L30 92 L38 92 L36 72 Z" fill="#1A1A2E" />
        <path d="M44 72 L42 92 L50 92 L48 72 Z" fill="#1A1A2E" />
      </svg>
    </div>
  );
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: WELCOME_MSG },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setLoading(true);

    try {
      const { data } = await api.post('/api/ai/chat', { message: text });
      const reply = data.reply || "I couldn't process that. Try again.";
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      const fallback =
        err.response?.data?.reply ||
        err.response?.data?.message ||
        'Kora AI is unavailable. Please try again later.';
      setMessages((prev) => [...prev, { role: 'assistant', content: fallback }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <div className={`chatbot-fab-wrap ${open ? 'chatbot-fab-wrap--hidden' : ''}`}>
        <AssistantSticker />
        <button
          type="button"
          className="chatbot-fab"
          onClick={() => setOpen(true)}
          aria-label="Open Kora AI"
        >
          <FiMessageCircle />
          <span>Ask Kora</span>
        </button>
      </div>

      <div className={`chatbot-panel ${open ? 'chatbot-panel--open' : ''}`}>
        <div className="chatbot-panel__header">
          <div className="chatbot-panel__title">
            <span className="chatbot-panel__icon">K</span>
            <div>
              <h3>Kora AI</h3>
              <span className="chatbot-panel__subtitle">Smart Banking Companion</span>
            </div>
          </div>
          <button
            type="button"
            className="chatbot-panel__close"
            onClick={() => setOpen(false)}
            aria-label="Close chat"
          >
            <FiX />
          </button>
        </div>

        <div className="chatbot-panel__messages">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`chatbot-msg chatbot-msg--${msg.role}`}
            >
              <div className="chatbot-msg__bubble">{msg.content}</div>
            </div>
          ))}
          {loading && (
            <div className="chatbot-msg chatbot-msg--assistant">
              <div className="chatbot-msg__bubble chatbot-msg__typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chatbot-panel__input-wrap">
          <input
            ref={inputRef}
            type="text"
            className="chatbot-panel__input"
            placeholder="Ask about banking, savings, budgeting..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            type="button"
            className="chatbot-panel__send"
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            aria-label="Send"
          >
            <FiSend />
          </button>
        </div>
      </div>
    </>
  );
}
