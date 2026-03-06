import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot } from 'lucide-react';

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

export const ChatInterface: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello! I can help you analyze your household financial plan or adjust your assumptions. Just ask!", sender: 'bot' }
  ]);
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { text: input, sender: 'user' }]);
    setInput('');
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        text: "I'm a simulated AI assistant for this demo. I've noted your request, but I don't have the backend logic to modify the chart just yet! Feel free to adjust the sliders in the meantime.", 
        sender: 'bot' 
      }]);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button 
        className="primary"
        style={{ position: 'fixed', bottom: '2rem', right: '2rem', borderRadius: 'var(--radius-full)', padding: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
        onClick={() => setIsOpen(true)}
      >
        <Bot size={24} />
      </button>
    );
  }

  return (
    <div className="glass-panel" style={{ 
      position: 'fixed', bottom: '2rem', right: '2rem', 
      width: '350px', height: '450px', 
      display: 'flex', flexDirection: 'column',
      zIndex: 100,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
    }}>
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          <Bot size={20} color="var(--primary)" /> AI Assistant
        </div>
        <button style={{ padding: '0.25rem', background: 'transparent', border: 'none' }} onClick={() => setIsOpen(false)}>×</button>
      </div>
      
      <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
            <div style={{ 
              background: msg.sender === 'user' ? 'var(--primary)' : 'var(--bg-surface-active)', 
              color: msg.sender === 'user' ? 'white' : 'var(--text-primary)',
              padding: '0.75rem', 
              borderRadius: 'var(--radius-md)' 
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={endOfMessagesRef} />
      </div>

      <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem' }}>
        <input 
          type="text" 
          placeholder="Ask AI to change assumptions..." 
          style={{ flex: 1 }} 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="primary" style={{ padding: '0.5rem' }} onClick={handleSend}>
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};
