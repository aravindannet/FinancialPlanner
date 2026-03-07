import React from 'react';
import { X, Home, Target, Calculator, Settings } from 'lucide-react';
import type { AppState } from '../App';

interface SidebarProps {
  isOpen: boolean;
  state: AppState;
  updateState: (key: keyof AppState, value: any) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, updateState }) => {
  if (!isOpen) return null;

  return (
    <aside className="sidebar glass-panel" style={{ padding: 'var(--spacing-xl)', borderRadius: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-2xl)' }}>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>Aura Plan</h2>
        <button 
          onClick={() => updateState('isSidebarOpen', false)}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>
      </div>
      
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', flex: 1 }}>
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
    </aside>
  );
};
