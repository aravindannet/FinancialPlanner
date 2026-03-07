import React from 'react';
import { 
  Maximize2, 
  Minimize2, 
  Menu, 
  TrendingUp, 
  Coins, 
  HandCoins, 
  CalendarDays,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { Charts } from './Charts';
import { AmortizationTable } from './AmortizationTable';
import type { AppState, YearData } from '../App';

interface DashboardProps {
  data: YearData[];
  state: AppState;
  updateState: (key: keyof AppState, value: number | boolean) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ data, state, updateState }) => {
  // Formatters
  const formatMil = (v: number) => `$${(v / 1000000).toFixed(2)}M`;
  const formatNum = (v: number) => `$${Math.round(v).toLocaleString()}`;

  // Find metrics at retirement
  const getRetireData = (age: number, type: 'user' | 'spouse') => {
    const d = data.find(year => (type === 'user' ? year.userAge : year.spouse.age) === age);
    return d ? d[type] : null;
  };

  const userRetireData = getRetireData(state.retireAge, 'user');
  const spouseRetireData = getRetireData(state.spouseRetireAge, 'spouse');

  // Totals
  const totals = data.reduce((acc, year) => ({
    userCont: acc.userCont + year.user.contributions,
    spouseCont: acc.spouseCont + year.spouse.contributions,
    userMatch: acc.userMatch + year.user.employerMatch,
    spouseMatch: acc.spouseMatch + year.spouse.employerMatch,
  }), { userCont: 0, spouseCont: 0, userMatch: 0, spouseMatch: 0 });

  // Depletion Age
  const depletionYear = data.find(d => {
    if (state.isCombinedView) return d.combined.endingBalanceNominal === 0 && d.userAge > state.retireAge;
    return d.user.endingBalanceNominal === 0 && d.user.age > state.retireAge;
  });
  const hasMoneyAtEnd = !depletionYear;
  const depletionAge = depletionYear ? (state.isCombinedView ? depletionYear.userAge : depletionYear.user.age) : state.lifeExpectancy;

  // Decadal Highlights (Age 50, 60, 70, 80)
  const decadalAges = [50, 60, 70, 80];
  const highlights = decadalAges.map(age => {
    const year = data.find(d => d.userAge === age);
    return year ? { age, data: year.combined } : null;
  }).filter(Boolean);

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
            <p style={{ color: 'var(--text-secondary)' }}>Advanced analysis of your cumulative household wealth.</p>
          </div>
        </div>
        
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {state.hasSpouse && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--bg-surface)', padding: '0.5rem', borderRadius: 'var(--radius-full)' }}>
              <button 
                onClick={() => updateState('isCombinedView', false)}
                style={{ 
                  background: !state.isCombinedView ? 'var(--primary)' : 'transparent', 
                  color: !state.isCombinedView ? 'white' : 'var(--text-secondary)',
                  border: 'none', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.2s'
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
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                Combined
              </button>
            </div>
          )}

          <button 
            onClick={() => updateState('isFullScreenDashboard', !state.isFullScreenDashboard)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '0.75rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--text-primary)' }}
            title="Toggle Full Screen"
          >
            {state.isFullScreenDashboard ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>
      </header>
      
      {/* Primary Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-2xl)' }}>
        
        {/* Plan Runway */}
        <div className="glass-panel animate-fade-in" style={{ padding: 'var(--spacing-xl)', borderLeft: hasMoneyAtEnd ? '4px solid var(--accent-1)' : '4px solid var(--danger)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Plan Runway</p>
            {hasMoneyAtEnd ? <ShieldCheck size={20} color="var(--accent-1)" /> : <ShieldAlert size={20} color="var(--danger)" />}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: hasMoneyAtEnd ? 'var(--accent-1)' : 'var(--danger)' }}>
            {hasMoneyAtEnd ? `Fully Funded` : `Ends at Age ${depletionAge}`}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
            {hasMoneyAtEnd ? `Your portfolio outlasts your Age ${state.lifeExpectancy} expectancy.` : `Warning: Portfolio depletion occurs before Age ${state.lifeExpectancy}.`}
          </p>
        </div>

        {/* Projected Balance */}
        <div className="glass-panel animate-fade-in" style={{ padding: 'var(--spacing-xl)', animationDelay: '0.1s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Balance at Retirement</p>
            <TrendingUp size={20} color="var(--primary)" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: state.hasSpouse ? '1fr 1fr' : '1fr', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Primary</p>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>{formatMil(userRetireData?.startingBalanceNominal || 0)}</div>
              <p style={{ fontSize: '0.75rem', color: 'var(--accent-2)' }}>{formatMil(userRetireData?.startingBalanceReal || 0)} Real</p>
            </div>
            {state.hasSpouse && (
              <div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Spouse</p>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>{formatMil(spouseRetireData?.startingBalanceNominal || 0)}</div>
                <p style={{ fontSize: '0.75rem', color: 'var(--accent-2)' }}>{formatMil(spouseRetireData?.startingBalanceReal || 0)} Real</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Total Contributions */}
        <div className="glass-panel animate-fade-in" style={{ padding: 'var(--spacing-xl)', animationDelay: '0.2s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Lifetime Contributions</p>
            <Coins size={20} color="var(--accent-1)" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: state.hasSpouse ? '1fr 1fr' : '1fr', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Primary</p>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{formatNum(totals.userCont)}</div>
            </div>
            {state.hasSpouse && (
              <div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Spouse</p>
                <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{formatNum(totals.spouseCont)}</div>
              </div>
            )}
          </div>
        </div>
        
        {/* Employer Match */}
        <div className="glass-panel animate-fade-in" style={{ padding: 'var(--spacing-xl)', animationDelay: '0.3s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Employer Match</p>
            <HandCoins size={20} color="var(--accent-2)" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: state.hasSpouse ? '1fr 1fr' : '1fr', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Primary</p>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{formatNum(totals.userMatch)}</div>
            </div>
            {state.hasSpouse && (
              <div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Spouse</p>
                <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{formatNum(totals.spouseMatch)}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Decadal Snapshots */}
      <div className="glass-panel animate-fade-in" style={{ padding: 'var(--spacing-xl)', marginBottom: 'var(--spacing-2xl)', animationDelay: '0.4s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <CalendarDays size={20} color="var(--primary)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Decadal Wealth Milestones {state.hasSpouse ? '(Combined)' : ''}</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
          {highlights.map((h, idx) => (
            <div key={idx} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <p style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Age {h?.age}</p>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.25rem' }}>{formatMil(h?.data.startingBalanceNominal || 0)}</div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatMil(h?.data.startingBalanceReal || 0)} Real Value</p>
            </div>
          ))}
        </div>
      </div>

      <Charts data={data} state={state} />
      <AmortizationTable data={data} state={state} />
    </div>
  );
};
