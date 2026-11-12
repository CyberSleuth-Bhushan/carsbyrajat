import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, PhoneCall, Sparkles } from 'lucide-react';
import { api } from '../api/client';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  showSalesPrompt?: boolean;
}

export const ChatbotWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      sender: 'bot',
      text: 'Namaste! Welcome to <strong>Cars By Rajat</strong> Nagpur. I am your AI Auto-Advisor connected to our live verified showroom inventory. Ask me about available cars, budget options, financing/EMIs, or showroom test drives!',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (open) scrollToBottom();
  }, [messages, open]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await api.sendChatMessage(query);
      const botMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'bot',
        text: res.reply,
        showSalesPrompt: res.showSalesPrompt,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: 'bot',
          text: 'Sorry, I could not connect to our showroom fleet server. Please call us at <strong>+91 98230 11223</strong>.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 950,
          width: '58px',
          height: '58px',
          borderRadius: '50%',
          background: 'var(--primary)',
          color: '#FFFFFF',
          border: '2px solid #FFFFFF',
          boxShadow: 'var(--shadow-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease',
        }}
        aria-label="Open AI Auto Advisor"
      >
        {open ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* Chat Window */}
      {open && (
        <div style={{
          position: 'fixed',
          bottom: '94px',
          right: '24px',
          zIndex: 950,
          width: '380px',
          maxWidth: 'calc(100vw - 32px)',
          height: '540px',
          maxHeight: 'calc(100vh - 120px)',
          background: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'modalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          {/* Header */}
          <div style={{
            background: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="icon-box-sm">
                <Bot size={20} color="var(--primary)" />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-heading)' }}>
                  AI Auto-Advisor
                </div>
                <div style={{ fontSize: '11px', color: 'var(--success)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }}></span>
                  Live Showroom Assistant
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: '4px' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Body */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: 'var(--bg)',
          }}>
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                }}
              >
                <div style={{
                  padding: '12px 16px',
                  borderRadius: m.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: m.sender === 'user' ? 'var(--primary)' : 'var(--surface)',
                  color: m.sender === 'user' ? '#FFFFFF' : 'var(--text-heading)',
                  fontSize: '13px',
                  lineHeight: '1.55',
                  boxShadow: 'var(--shadow-sm)',
                  border: m.sender === 'user' ? 'none' : '1px solid var(--border)',
                }}
                dangerouslySetInnerHTML={{ __html: m.text }}
                />

                {m.showSalesPrompt && (
                  <div style={{ marginTop: '8px' }}>
                    <a
                      href="https://wa.me/919823011223?text=Hi%20Rajat,%20I%20was%20chatting%20with%20your%20AI%20Auto-Advisor%20and%20would%20like%20to%20speak%20with%20you%20directly."
                      target="_blank"
                      rel="noopener"
                      className="btn btn-sm btn-wa"
                      style={{ fontSize: '11.5px', padding: '6px 12px' }}
                    >
                      <PhoneCall size={12} /> Chat directly with Rajat Sharma
                    </a>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
                <div style={{
                  padding: '10px 16px',
                  borderRadius: '16px 16px 16px 4px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--muted)',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  <Sparkles size={14} color="var(--primary)" /> Searching live showroom inventory...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div style={{
            padding: '8px 12px',
            background: 'var(--surface)',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
          }}>
            <button
              type="button"
              onClick={() => handleSend('Show me automatic cars under 15 Lakh')}
              style={{
                fontSize: '11px',
                padding: '4px 10px',
                borderRadius: '9999px',
                border: '1px solid #D6E4FF',
                background: 'var(--primary-soft)',
                color: 'var(--primary)',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Automatic under 15L
            </button>
            <button
              type="button"
              onClick={() => handleSend('Which diesel SUVs are available?')}
              style={{
                fontSize: '11px',
                padding: '4px 10px',
                borderRadius: '9999px',
                border: '1px solid #D6E4FF',
                background: 'var(--primary-soft)',
                color: 'var(--primary)',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Diesel SUVs
            </button>
            <button
              type="button"
              onClick={() => handleSend('How does showroom inspection work?')}
              style={{
                fontSize: '11px',
                padding: '4px 10px',
                borderRadius: '9999px',
                border: '1px solid #D6E4FF',
                background: 'var(--primary-soft)',
                color: 'var(--primary)',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Inspection Process
            </button>
          </div>

          {/* Input Box */}
          <div style={{
            padding: '12px 14px',
            background: 'var(--surface)',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            gap: '8px',
          }}>
            <input
              type="text"
              placeholder="Ask about cars, prices, EMIs..."
              className="inp"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              style={{ borderRadius: '9999px', padding: '9px 16px', fontSize: '13px' }}
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="btn btn-primary"
              style={{
                width: '40px',
                height: '40px',
                padding: 0,
                borderRadius: '50%',
                flexShrink: 0,
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
