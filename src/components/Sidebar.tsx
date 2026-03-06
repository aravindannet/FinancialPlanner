import React from 'react';
import { X, Home, Target, Calculator, Settings } from 'lucide-react';
import type { AppState } from '../App';

interface SidebarProps {
  state: AppState;
  updateState: (key: keyof AppState, value: number | boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ updateState }) => {
  return (
    <>
      <div 
        style={{ 
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
          background: 'rgba(0,0,0,0.5)', zIndex: 40, backdropFilter: 'blur(4px)'
        }}
        onClick={() => updateState('isSidebarOpen', false)}
      />
      <div 
        className="glass-panel" 
        style={{ 
          position: 'fixed', top: 0, left: 0, width: '280px', height: '100vh', 
          zIndex: 50, padding: 'var(--spacing-xl)', display: 'flex', flexDirection: 'column',
          borderRight: '1px solid var(--border)', borderRadius: 0, transform: 'translateX(0)', transition: 'transform 0.3s ease'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-2xl)' }}>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>Aura Plan</h2>
          <button 
            onClick={() => updateState('isSidebarOpen', false)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            <X size={24} />
          </button>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--primary)', color: 'white', textDecoration: 'none', fontWeight: 500 }}>
            <Home size={20} /> Dashboard
          </a>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', textDecoration: 'none', pointerEvents: 'none', opacity: 0.5 }}>
            <Target size={20} /> Goal Planner
          </a>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', textDecoration: 'none', pointerEvents: 'none', opacity: 0.5 }}>
            <Calculator size={20} /> Loans & Mortgage
          </a>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', textDecoration: 'none', pointerEvents: 'none', opacity: 0.5 }}>
            <Settings size={20} /> Assumptions
          </a>
        </nav>
      </div>
    </>
  );
};
