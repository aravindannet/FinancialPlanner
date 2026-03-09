import React from 'react';
import {
  Maximize2,
  Minimize2,
  TrendingUp,
  Coins,
  HandCoins,
  CalendarDays,
  Download,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { Charts } from './Charts';
import { AmortizationTable } from './AmortizationTable';
import { generatePDFReport } from '../utils/pdfGenerator';
import type { AppState, YearData } from '../App';

interface DashboardProps {
  data: YearData[];
  state: AppState;
  updateState: (key: keyof AppState, value: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ data, state, updateState }) => {
  // Formatters
  const formatCurrency = (v: number) => {
    if (Math.abs(v) >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
    if (Math.abs(v) >= 1000) return `$${(v / 1000).toFixed(0)}K`;
    return `$${Math.round(v).toLocaleString()}`;
  };

  const handleDownloadPDF = () => {
    generatePDFReport(state);
  };

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
    if (state.isCombinedView) {
      return d.combined.endingBalanceNominal === 0 && d.userAge > state.retireAge;
    } else {
      if (state.separateChartView === 'user') {
        return d.user.endingBalanceNominal === 0 && d.user.age > state.retireAge;
      } else if (state.separateChartView === 'spouse' && state.hasSpouse) {
        return d.spouse.endingBalanceNominal === 0 && d.spouse.age > state.spouseRetireAge;
      } else {
        // Fallback to combined if 'both' is selected in separate view
        return d.combined.endingBalanceNominal === 0 && d.userAge > state.retireAge;
      }
    }
  });
  const hasMoneyAtEnd = !depletionYear;
  
  let depletionAge = state.lifeExpectancy;
  if (depletionYear) {
    if (state.isCombinedView || state.separateChartView === 'both' || state.separateChartView === 'user') {
      depletionAge = depletionYear.userAge;
    } else {
      depletionAge = depletionYear.spouse.age;
    }
  }

  // Decadal Highlights
  const decadalAges = [50, 60, 70, 80, 90, 100];
  const highlights = decadalAges.map(age => {
    const year = data.find(d => d.userAge === age);
    return year ? { age, data: year.combined } : null;
  }).filter(Boolean);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header" style={{ marginBottom: 'var(--spacing-xl)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="mobile-hide" style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(to right, var(--text-primary), var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
            Retirement Projection
          </h1>
          <p className="mobile-hide" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
            Advanced analysis of cumulative household wealth.
          </p>
        </div>

        <div className="dashboard-top-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {state.hasSpouse && (
            <div className="combined-toggle segmented-toggle" style={{ width: '100%', maxWidth: '320px' }}>
              <span
                className="segmented-toggle-thumb"
                style={{
                  width: 'calc((100% - 4px) / 2)',
                  transform: `translateX(${state.isCombinedView ? 100 : 0}%)`
                }}
              />
              <button
                onClick={() => updateState('isCombinedView', false)}
                className={`segmented-toggle-btn ${!state.isCombinedView ? 'active' : ''}`}
              >
                Separate
              </button>
              <button
                onClick={() => updateState('isCombinedView', true)}
                className={`segmented-toggle-btn ${state.isCombinedView ? 'active' : ''}`}
              >
                Combined
              </button>
            </div>
          )}

          <button
            onClick={handleDownloadPDF}
            className="pdf-button"
            aria-label="Export Report PDF"
            title="Export Report PDF"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <Download size={16} />
            <span className="mobile-hide">Export PDF</span>
          </button>

          <button
            onClick={() => updateState('isFullScreenDashboard', !state.isFullScreenDashboard)}
            className="hide-on-mobile"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              padding: '0.6rem',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              transition: 'all 0.2s'
            }}
            title={state.isFullScreenDashboard ? 'Show Inputs' : 'Full Screen Chart'}
          >
            {state.isFullScreenDashboard ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>

          {state.hasSpouse && !state.isCombinedView && (
            <div className="separate-options segmented-toggle" style={{ width: '100%' }}>
              <span
                className="segmented-toggle-thumb"
                style={{
                  width: 'calc((100% - 4px) / 3)',
                  transform: `translateX(${({ user: 0, spouse: 1, both: 2 }[state.separateChartView]) * 100}%)`
                }}
              />
              {(['user', 'spouse', 'both'] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => updateState('separateChartView', view)}
                  className={`segmented-toggle-btn ${state.separateChartView === view ? 'active' : ''}`}
                  style={{ textTransform: 'capitalize' }}
                >
                  {view}
                </button>
              ))}
            </div>
          )}
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
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>{formatCurrency(userRetireData?.startingBalanceNominal || 0)}</div>
              <p style={{ fontSize: '0.75rem', color: 'var(--accent-2)' }}>{formatCurrency(userRetireData?.startingBalanceReal || 0)} Real</p>
            </div>
            {state.hasSpouse && (
              <div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Spouse</p>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>{formatCurrency(spouseRetireData?.startingBalanceNominal || 0)}</div>
                <p style={{ fontSize: '0.75rem', color: 'var(--accent-2)' }}>{formatCurrency(spouseRetireData?.startingBalanceReal || 0)} Real</p>
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
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{formatCurrency(totals.userCont)}</div>
            </div>
            {state.hasSpouse && (
              <div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Spouse</p>
                <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{formatCurrency(totals.spouseCont)}</div>
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
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{formatCurrency(totals.userMatch)}</div>
            </div>
            {state.hasSpouse && (
              <div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Spouse</p>
                <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{formatCurrency(totals.spouseMatch)}</div>
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
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {highlights.map((h, idx) => (
            <div key={idx} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', flex: '1 1 0', minWidth: '150px' }}>
              <p style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Age {h?.age}</p>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.25rem' }}>{formatCurrency(h?.data.startingBalanceNominal || 0)}</div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatCurrency(h?.data.startingBalanceReal || 0)} Real Value</p>
            </div>
          ))}
        </div>
      </div>

        <div className="chart-wrapper"><Charts data={data} state={state} updateState={updateState} /></div>
      <AmortizationTable data={data} state={state} />
    </div>
  );
};
