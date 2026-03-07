import React, { useState } from 'react';
import { 
  ChevronDown, 
  Sun, 
  Moon, 
  Calculator, 
  Bell
} from 'lucide-react';
import type { AppState } from '../App';

interface AppBarProps {
  state: AppState;
  updateState: (key: keyof AppState, value: any) => void;
}

export const AppBar: React.FC<AppBarProps> = ({ state, updateState }) => {
  const [showCalcMenu, setShowCalcMenu] = useState(false);

  return (
    <header className="glass-panel" style={{ 
      position: 'sticky', 
      top: 0, 
      zIndex: 1000, 
      width: '100%', 
      height: '64px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      padding: '0 var(--spacing-xl)',
      borderRadius: 0,
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none'
    }}>
      {/* Left: Logo & App Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: '32px', height: '32px', overflow: 'hidden', flexShrink: 0, mixBlendMode: state.theme === 'dark' ? 'multiply' : 'normal' }}>
          <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <span style={{ 
          fontSize: '1.25rem', 
          fontWeight: 800, 
          letterSpacing: '-0.02em',
          background: 'linear-gradient(to right, var(--text-primary), var(--text-secondary))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Aura Plan
        </span>
      </div>

      {/* Center: Navigation */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        {/* Calculators Dropdown */}
        <div 
          style={{ position: 'relative' }}
          onMouseEnter={() => setShowCalcMenu(true)}
          onMouseLeave={() => setShowCalcMenu(false)}
        >
          <button style={navItemStyle(true)}>
            <Calculator size={18} />
            Calculators
            <ChevronDown size={14} style={{ transform: showCalcMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
          
          {showCalcMenu && (
            <div className="glass-panel" style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              width: '200px',
              padding: '0.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
              marginTop: '0.5rem'
            }}>
              <button 
                style={subMenuItemStyle(true)}
                onClick={() => setShowCalcMenu(false)}
              >
                Retirement Planner
              </button>
              <button 
                style={subMenuItemStyle(false)}
                onClick={() => alert('Loans & Mortgage feature coming soon!')}
              >
                Loans & Mortgage
              </button>
              <button 
                style={subMenuItemStyle(false)}
                onClick={() => alert('Tax Estimator feature coming soon!')}
              >
                Tax Estimator
              </button>
            </div>
          )}
        </div>

        {/* Reminders */}
        <button 
          style={navItemStyle(false)}
          onClick={() => alert('Reminders feature coming soon!')}
        >
          <Bell size={18} />
          Reminders
        </button>
      </nav>

      {/* Right: Theme Switch */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={() => updateState('theme', state.theme === 'light' ? 'dark' : 'light')}
          className="glass-panel"
          style={{
            padding: '0.5rem',
            borderRadius: 'var(--radius-full)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            background: 'var(--bg-surface)'
          }}
          title={`Switch to ${state.theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {state.theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>
    </header>
  );
};

const navItemStyle = (isActive: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  background: 'transparent',
  border: 'none',
  padding: '0.5rem 0.75rem',
  borderRadius: 'var(--radius-md)',
  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
  fontWeight: 600,
  fontSize: '0.925rem',
  cursor: 'pointer',
  transition: 'all 0.2s'
});

const subMenuItemStyle = (isActive: boolean): React.CSSProperties => ({
  padding: '0.6rem 0.75rem',
  borderRadius: 'var(--radius-sm)',
  background: isActive ? 'var(--primary)' : 'transparent',
  color: isActive ? 'white' : 'var(--text-secondary)',
  border: 'none',
  textAlign: 'left',
  width: '100%',
  fontSize: '0.85rem',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 0.2s'
});
