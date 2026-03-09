import React, { useState } from 'react';
import { 
  ChevronDown, 
  Sun, 
  Moon, 
  Calculator, 
  Bell,
  Menu,
  X
} from 'lucide-react';
import type { AppState } from '../App';

interface AppBarProps {
  state: AppState;
  updateState: (key: keyof AppState, value: any) => void;
}

export const AppBar: React.FC<AppBarProps> = ({ state, updateState }) => {
  const [showCalcMenu, setShowCalcMenu] = useState(false);

  // Desktop Navigation rendering function
  const renderNavItems = (isMobile = false) => (
    <nav style={{ 
      display: 'flex', 
      alignItems: isMobile ? 'flex-start' : 'center', 
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '1rem' : '2rem',
      width: '100%'
    }}>
      <div 
        style={{ position: 'relative', width: isMobile ? '100%' : 'auto' }}
        onMouseEnter={() => !isMobile && setShowCalcMenu(true)}
        onMouseLeave={() => !isMobile && setShowCalcMenu(false)}
      >
        <button 
          style={navItemStyle(true, isMobile)}
          onClick={() => isMobile && setShowCalcMenu(!showCalcMenu)}
        >
          <Calculator size={18} />
          Calculators
          <ChevronDown size={14} style={{ transform: showCalcMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', marginLeft: isMobile ? 'auto' : 0 }} />
        </button>
        
        {showCalcMenu && (
          <div className={isMobile ? "" : "glass-panel"} style={{
            position: isMobile ? 'relative' : 'absolute',
            top: isMobile ? 'auto' : '100%',
            left: 0,
            width: isMobile ? '100%' : '200px',
            padding: '0.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
            boxShadow: isMobile ? 'none' : '0 10px 15px -3px rgba(0,0,0,0.3)',
            marginTop: '0.5rem',
            borderLeft: isMobile ? '2px solid var(--border)' : 'none',
            marginLeft: isMobile ? '1rem' : 0
          }}>
            <button 
              style={subMenuItemStyle(true)}
              onClick={() => {
                setShowCalcMenu(false);
                if (isMobile) updateState('isMobileNavOpen', false);
              }}
            >
              Retirement Planner
            </button>
            <button 
              style={subMenuItemStyle(false)}
              onClick={() => {
                alert('Loans & Mortgage feature coming soon!');
                if (isMobile) updateState('isMobileNavOpen', false);
              }}
            >
              Loans & Mortgage
            </button>
            <button 
              style={subMenuItemStyle(false)}
              onClick={() => {
                alert('Tax Estimator feature coming soon!');
                if (isMobile) updateState('isMobileNavOpen', false);
              }}
            >
              Tax Estimator
            </button>
          </div>
        )}
      </div>

      <button 
        style={navItemStyle(false, isMobile)}
        onClick={() => {
          alert('Reminders feature coming soon!');
          if (isMobile) updateState('isMobileNavOpen', false);
        }}
      >
        <Bell size={18} />
        Reminders
      </button>
    </nav>
  );

  return (
    <>
      <header className="glass-panel" style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 1000, 
        width: '100%', 
        height: '64px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '0 var(--spacing-md)',
        borderRadius: 0,
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none'
      }}>
        {/* Mobile Hamburger */}
        <div className="show-on-mobile" style={{ display: 'flex', alignItems: 'center' }}>
          <button 
            onClick={() => updateState('isMobileNavOpen', true)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', padding: '0.5rem' }}
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Logo & App Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '30px', height: '30px', overflow: 'hidden', flexShrink: 0, mixBlendMode: state.theme === 'dark' ? 'multiply' : 'normal' }}>
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

        {/* Desktop Navigation */}
        <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center' }}>
          {renderNavItems(false)}
        </div>

        {/* Theme Switch (Always visible) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => updateState('theme', state.theme === 'light' ? 'dark' : 'light')}
            style={{
              padding: '0.4rem',
              borderRadius: 'var(--radius-full)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none'
            }}
            title={`Switch to ${state.theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {state.theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Nav Drawer */}
      {state.isMobileNavOpen && (
        <div className="mobile-drawer-overlay show-on-mobile" onClick={() => updateState('isMobileNavOpen', false)}>
          <div 
            className="mobile-drawer-content" 
            onClick={e => e.stopPropagation()}
            style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>Aura Plan</span>
              <button 
                onClick={() => updateState('isMobileNavOpen', false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)' }}
              >
                <X size={24} />
              </button>
            </div>
            
            {renderNavItems(true)}
          </div>
        </div>
      )}
    </>
  );
};

const navItemStyle = (isActive: boolean, isMobile: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  background: 'transparent',
  border: 'none',
  padding: isMobile ? '0.75rem 0' : '0.5rem 0.75rem',
  width: isMobile ? '100%' : 'auto',
  borderRadius: isMobile ? 0 : 'var(--radius-md)',
  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
  fontWeight: 600,
  fontSize: isMobile ? '1.1rem' : '0.925rem',
  cursor: 'pointer',
  transition: 'all 0.2s',
  justifyContent: 'flex-start'
});

const subMenuItemStyle = (isActive: boolean): React.CSSProperties => ({
  padding: '0.6rem 0.75rem',
  borderRadius: 'var(--radius-sm)',
  background: isActive ? 'var(--primary)' : 'transparent',
  color: isActive ? 'white' : 'var(--text-secondary)',
  border: 'none',
  textAlign: 'left',
  width: '100%',
  fontSize: '0.95rem',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 0.2s'
});
