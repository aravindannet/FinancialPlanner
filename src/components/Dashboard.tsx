import React from 'react';
import { Maximize2, Minimize2, Menu } from 'lucide-react';
import { Charts } from './Charts';
import { AmortizationTable } from './AmortizationTable';
import type { AppState, YearData } from '../App';

interface DashboardProps {
  data: YearData[];
  state: AppState;
  updateState: (key: keyof AppState, value: number | boolean) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ data, state, updateState }) => {
  // Find key metrics
  const retirementYearUser = data.find(d => d.userAge === state.retireAge);
  let projectedBalanceNominalAtRetirement = 0;
  let projectedBalanceRealAtRetirement = 0;

  if (retirementYearUser) {
    projectedBalanceNominalAtRetirement = state.isCombinedView 
      ? retirementYearUser.combined.startingBalanceNominal 
      : retirementYearUser.user.startingBalanceNominal;
      
    projectedBalanceRealAtRetirement = state.isCombinedView 
      ? retirementYearUser.combined.startingBalanceReal 
      : retirementYearUser.user.startingBalanceReal;
  }
  
  const totalContributions = data.reduce((sum, year) => 
    sum + (state.isCombinedView ? year.combined.contributions : year.user.contributions), 0);
    
  const totalEmployerMatch = data.reduce((sum, year) => 
    sum + (state.isCombinedView ? year.combined.employerMatch : year.user.employerMatch), 0);

  // Calculate Depletion Age
  const depletionYear = data.find(d => {
    if (state.isCombinedView) return d.combined.endingBalanceNominal === 0 && d.userAge > state.retireAge;
    return d.user.endingBalanceNominal === 0 && d.user.age > state.retireAge;
  });
  
  const hasMoneyAtEnd = !depletionYear;
  const depletionAge = depletionYear ? (state.isCombinedView ? depletionYear.userAge : depletionYear.user.age) : state.lifeExpectancy;

  return (
    <div style={{ flex: 1, padding: 'var(--spacing-2xl)', overflowY: 'auto', position: 'relative' }}>
      <header style={{ marginBottom: 'var(--spacing-2xl)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={() => updateState('isSidebarOpen', !state.isSidebarOpen)} 
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '0.5rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--text-primary)' }}
          >
            <Menu size={20} />
          </button>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Retirement Projection</h1>
            <p style={{ color: 'var(--text-secondary)' }}>See how your 401k compounding works over time.</p>
          </div>
        </div>
        
        {/* Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--bg-surface)', padding: '0.5rem', borderRadius: 'var(--radius-full)' }}>
            <button 
              onClick={() => updateState('isCombinedView', false)}
              style={{ 
                background: !state.isCombinedView ? 'var(--primary)' : 'transparent', 
                color: !state.isCombinedView ? 'white' : 'var(--text-secondary)',
                border: 'none', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Separate
            </button>
            <button 
              onClick={() => updateState('isCombinedView', true)}
              style={{ 
                background: state.isCombinedView ? 'var(--primary)' : 'transparent', 
                color: state.isCombinedView ? 'white' : 'var(--text-secondary)',
                border: 'none', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Combined Household
            </button>
          </div>

          <button 
            onClick={() => updateState('isFullScreenDashboard', !state.isFullScreenDashboard)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '0.75rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--text-primary)' }}
            title="Toggle Full Screen"
          >
            {state.isFullScreenDashboard ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>
      </header>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-2xl)' }}>
        
        <div className="glass-panel animate-fade-in" style={{ padding: 'var(--spacing-xl)', borderLeft: hasMoneyAtEnd ? '4px solid var(--accent-1)' : '4px solid var(--danger)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Plan Runway</p>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: hasMoneyAtEnd ? 'var(--accent-1)' : 'var(--danger)' }}>
            {hasMoneyAtEnd ? `Fully Funded (Age ${state.lifeExpectancy}+)` : `Depletes at Age ${depletionAge}`}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
            {hasMoneyAtEnd ? 'Your money outlasts your life expectancy.' : 'Your money will run out during retirement.'}
          </p>
        </div>

        <div className="glass-panel animate-fade-in" style={{ padding: 'var(--spacing-xl)', animationDelay: '0.1s' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
            Balance at Primary Retirement
          </p>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--primary)' }}>
            ${projectedBalanceNominalAtRetirement.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
            ${projectedBalanceRealAtRetirement.toLocaleString(undefined, { maximumFractionDigits: 0 })} in today's money
          </p>
        </div>
        
        <div className="glass-panel animate-fade-in" style={{ padding: 'var(--spacing-xl)', animationDelay: '0.2s' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Total Contributions {state.isCombinedView ? '(Both)' : '(Primary)'}</p>
          <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>
            ${totalContributions.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
        
        <div className="glass-panel animate-fade-in" style={{ padding: 'var(--spacing-xl)', animationDelay: '0.3s' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Total Employer Match {state.isCombinedView ? '(Both)' : '(Primary)'}</p>
          <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>
            ${totalEmployerMatch.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>

      <Charts data={data} state={state} />
      <AmortizationTable data={data} state={state} />
    </div>
  );
};
