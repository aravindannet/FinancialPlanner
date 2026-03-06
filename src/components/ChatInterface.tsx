import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot } from 'lucide-react';
import type { AppState, YearData } from '../App';

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

interface ChatInterfaceProps {
  state: AppState;
  updateState: (key: keyof AppState, value: number | boolean) => void;
  data: YearData[];
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ state, updateState, data }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello! I'm your Aura Assistant. I can analyze your retirement plan, answer questions about your outcomes, or adjust your assumptions. Try asking 'Will I run out of money?' or 'How much am I withdrawing at age 70?'.", sender: 'bot' }
  ]);
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const processQuery = (query: string) => {
    const q = query.toLowerCase();
    
    // 1. Withdrawal Queries
    const withdrawMatch = q.match(/(?:withdraw|taking out|spending).*?(\d+)/i);
    if (withdrawMatch) {
      const targetAge = parseInt(withdrawMatch[1]);
      const yearData = data.find(d => d.userAge === targetAge || d.spouse.age === targetAge);
      if (yearData) {
        const isSpouse = q.includes('spouse') || q.includes('wife') || q.includes('husband');
        const isCombined = q.includes('combined') || q.includes('total') || q.includes('household');
        
        let amount = 0;
        let note = "";
        if (isCombined) {
          amount = yearData.combined.withdrawals;
          note = "This is your total household spending (grossed up for taxes).";
        } else if (isSpouse) {
          amount = yearData.spouse.withdrawals;
          note = "This is your spouse's individual portion.";
        } else {
          amount = yearData.user.withdrawals;
          note = "This is your individual portion.";
        }

        if (amount === 0) {
          return `You aren't withdrawing anything at age ${targetAge} because you are still in the saving phase! Contributions stop and withdrawals begin at age ${isSpouse ? state.spouseRetireAge : state.retireAge}.`;
        }

        return `At age ${targetAge}, your projected withdrawal is **$${Math.round(amount).toLocaleString()}**.
${note}
*Note: This amount reflects the inflation-adjusted value needed to maintain your purchasing power.*`;
      }
      return `I don't have data for age ${targetAge} in this plan.`;
    }

    // 2. Balance Queries
    const balanceMatch = q.match(/(?:balance|have|net worth|savings|portfolio).*?(\d+)/i);
    if (balanceMatch) {
      const targetAge = parseInt(balanceMatch[1]);
      const yearData = data.find(d => d.userAge === targetAge || d.spouse.age === targetAge);
      if (yearData) {
        const isSpouse = q.includes('spouse') || q.includes('wife') || q.includes('husband');
        const isCombined = q.includes('combined') || q.includes('total') || q.includes('household');
        
        const d = isCombined ? yearData.combined : (isSpouse ? yearData.spouse : yearData.user);
        const type = isCombined ? "Combined Portfolio" : (isSpouse ? "Spouse's Portfolio" : "Primary Portfolio");

        return `At age ${targetAge}, your **${type}** is projected to be:
• **Nominal**: $${Math.round(d.endingBalanceNominal).toLocaleString()}
• **Real Value**: $${Math.round(d.endingBalanceReal).toLocaleString()}`;
      }
      return `Age ${targetAge} is outside the range of this ${state.lifeExpectancy}-year plan.`;
    }

    // 3. Success / Runway Queries
    if (q.includes('run out') || q.includes('deplete') || q.includes('success') || q.includes('money last') || q.includes('die broke')) {
      const depletionYear = data.find(d => d.combined.endingBalanceNominal <= 0 && d.userAge >= state.retireAge);
      if (depletionYear) {
        return `⚠️ Based on your current assumptions, your portfolio is projected to deplete at age **${depletionYear.userAge}**. 
To fix this, consider:
• Increasing your **Expected Return**
• Reducing your **Net Withdrawal Rate**
• Pushing back your **Retirement Age**`;
      } else {
        return `🎉 Good news! Your plan is **Fully Funded**. Your savings are projected to last until at least age **${state.lifeExpectancy}** with a final balance of **$${Math.round(data[data.length-1].combined.endingBalanceNominal).toLocaleString()}**.`;
      }
    }

    // 4. Comparison Queries
    if (q.includes('spouse') || q.includes('more than') || q.includes('compare')) {
      if (q.includes('match')) {
        return `You are getting a **${state.userMatchPct}%** match, while your spouse is getting **${state.spouseMatchPct}%**. Is your employer more generous, or is it time for a renegotiation? 😉`;
      }
      if (q.includes('contribution') || q.includes('save')) {
        const diff = Math.abs(state.userContribution - state.spouseContribution);
        return `You are contributing **$${state.userContribution.toLocaleString()}** and your spouse is contributing **$${state.spouseContribution.toLocaleString()}**. That's a difference of **$${diff.toLocaleString()}** per year.`;
      }
    }

    // 5. Timeline Queries
    if (q.includes('when') && (q.includes('retire') || q.includes('stop working'))) {
      return `According to your settings, you plan to retire at age **${state.retireAge}**, and your spouse plans to retire at age **${state.spouseRetireAge}**.`;
    }

    // 6. Assumption Updates
    if (q.includes('set') || q.includes('change') || q.includes('update')) {
      const valMatch = q.match(/(\d+(?:\.\d+)?)/);
      if (valMatch) {
        const val = parseFloat(valMatch[0]);
        if (q.includes('inflation')) {
          updateState('inflation', val);
          return `✅ Done. I've updated the **Annual Inflation** to **${val}%**.`;
        }
        if (q.includes('return') || q.includes('growth') || q.includes('interest')) {
          updateState('expectedReturn', val);
          return `✅ Done. I've updated the **Expected Return** to **${val}%**.`;
        }
        if (q.includes('contribution') || q.includes('save')) {
          updateState('userContribution', val);
          return `✅ Done. Your **Annual Contribution** is now **$${val.toLocaleString()}**.`;
        }
      }
    }

    // 7. General Financial Advice / Philosophy
    if (q.includes('real') && q.includes('nominal')) {
      return "**Nominal** is the actual number of dollars in your account. **Real** is the purchasing power of those dollars in today's money. If you have $1M in 30 years but inflation was high, that $1M might only buy what $400k buys today—that's the 'Real' value.";
    }

    if (q.includes('tax') || q.includes('social security')) {
      return `Your plan currently assumes an **${state.taxRate}%** effective tax rate and **$${state.socialSecurity.toLocaleString()}/mo** in Social Security benefits. These are subtracted from your total withdrawal need to arrive at the net 401k pull.`;
    }

    // 8. Help Fallback
    return `I'm not quite sure how to answer that. You can ask me things like:
• 'What is my balance at age 65?'
• 'How much am I withdrawing at age 75?'
• 'Will I run out of money?'
• 'Set my inflation to 3.5%' 
• 'Compare our contributions'`;
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, { text: userMsg, sender: 'user' }]);
    setInput('');
    
    setTimeout(() => {
      const botResponse = processQuery(userMsg);
      setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend();
  };

  if (!isOpen) {
    return (
      <button 
        className="primary animate-fade-in"
        style={{ 
          position: 'fixed', bottom: '2rem', right: '2rem', 
          borderRadius: 'var(--radius-full)', padding: '1rem', 
          boxShadow: '0 8px 32px var(--primary-glow)',
          zIndex: 1000
        }}
        onClick={() => setIsOpen(true)}
      >
        <Bot size={24} />
      </button>
    );
  }

  return (
    <div className="glass-panel" style={{ 
      position: 'fixed', bottom: '2rem', right: '2rem', 
      width: '400px', height: '550px', 
      display: 'flex', flexDirection: 'column',
      zIndex: 1000,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      animation: 'fadeIn 0.3s ease-out'
    }}>
      {/* Header */}
      <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600 }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={18} color="white" />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Aura AI Assistant</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent-1)', fontWeight: 400 }}>Plan Analysis Agent</div>
          </div>
        </div>
        <button 
          style={{ padding: '0.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer' }}
          onClick={() => setIsOpen(false)}
        >
          ×
        </button>
      </div>
      
      {/* Messages Area */}
      <div style={{ flex: 1, padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'rgba(0,0,0,0.1)' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '100%'
          }}>
            <div style={{ 
              background: msg.sender === 'user' ? 'var(--primary)' : 'var(--bg-surface-active)', 
              color: msg.sender === 'user' ? 'white' : 'var(--text-primary)',
              padding: '0.875rem 1rem', 
              borderRadius: msg.sender === 'user' ? '16px 16px 2px 16px' : '2px 16px 16px 16px',
              fontSize: '0.875rem',
              lineHeight: '1.5',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              border: msg.sender === 'user' ? 'none' : '1px solid var(--border)',
              whiteSpace: 'pre-wrap'
            }}>
              {msg.text.split('\n').map((line, i) => (
                <div key={i} style={{ marginBottom: line.startsWith('•') ? '0.25rem' : '0' }}>
                  {line.split('**').map((part, j) => j % 2 === 1 ? <b key={j}>{part}</b> : part)}
                </div>
              ))}
            </div>
          </div>
        ))}
        <div ref={endOfMessagesRef} />
      </div>

      {/* Input Area */}
      <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.75rem', background: 'rgba(255,255,255,0.02)' }}>
        <input 
          type="text" 
          placeholder="Ask Aura anything about your plan..." 
          style={{ 
            flex: 1, 
            background: 'var(--bg-base)', 
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-full)',
            padding: '0.75rem 1.25rem',
            fontSize: '0.875rem',
            color: 'var(--text-primary)'
          }} 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button 
          className="primary" 
          style={{ width: '42px', height: '42px', borderRadius: '50%', padding: 0 }} 
          onClick={handleSend}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};
