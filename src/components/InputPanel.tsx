import React from 'react';
import { InfoTooltip } from './InfoTooltip';
import type { AppState } from '../App';

interface InputPanelProps {
  state: AppState;
  updateState: (key: keyof AppState, value: number | boolean) => void;
}

export const InputPanel: React.FC<InputPanelProps> = ({ state, updateState }) => {
  const getIrsLimit = (age: number) => age >= 50 ? 31000 : 23500;

  const renderLimitWarning = (contrib: number, age: number) => {
    const limit = getIrsLimit(age);
    if (contrib > limit) {
      return <div style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>IRS Limit Exceeded! Max is ${limit.toLocaleString()}</div>;
    }
    return null;
  };

  return (
    <div className="glass-panel" style={{ width: '380px', flexShrink: 0, padding: 'var(--spacing-xl)', overflowY: 'auto', borderLeft: 'none', borderTop: 'none', borderBottom: 'none' }}>
      <h2 style={{ marginBottom: 'var(--spacing-xl)', fontSize: '1.25rem' }}>Household Assumptions</h2>
      
      {/* Primary User Card */}
      <div className="glass-panel" style={{ padding: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)', background: 'rgba(255,255,255,0.02)' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: 'var(--spacing-md)' }}>Primary User</h3>
        
        <div className="input-group">
          <label className="input-label">
            Age <span className="value">{state.userAge}</span>
            <InfoTooltip align="right" text="Your current age. Impacts years to retirement and catch-up contribution eligibility." />
          </label>
          <input type="range" min="18" max="80" value={state.userAge} onChange={(e) => updateState('userAge', Number(e.target.value))} />
        </div>
        <div className="input-group">
          <label className="input-label">
            Retirement Age <span className="value">{state.retireAge}</span>
            <InfoTooltip align="right" text="Age you plan to stop working and begin withdrawals." />
          </label>
          <input type="range" min={state.userAge} max="90" value={state.retireAge} onChange={(e) => updateState('retireAge', Number(e.target.value))} />
        </div>
        <div className="input-group">
          <label className="input-label">
            Current Income <span className="value">${state.userIncome.toLocaleString()}</span>
            <InfoTooltip align="right" text="Gross annual salary. Used for calculating employer match amounts." />
          </label>
          <input type="range" min="0" max="500000" step="5000" value={state.userIncome} onChange={(e) => updateState('userIncome', Number(e.target.value))} />
        </div>
        <div className="input-group">
          <label className="input-label">
            Annual Contribution <span className="value">${state.userContribution.toLocaleString()}</span>
            <InfoTooltip align="right" text="Your annual deposit. Automatically capped at IRS limits in simulations." />
          </label>
          <input type="range" min="0" max="69000" step="500" value={state.userContribution} onChange={(e) => updateState('userContribution', Number(e.target.value))} />
          {renderLimitWarning(state.userContribution, state.userAge)}
        </div>
        <div className="input-group">
          <label className="input-label">
            Employer Match <span className="value">{state.userMatchPct}%</span>
            <InfoTooltip align="right" text="Percentage of income your employer contributes to your 401k." />
          </label>
          <input type="range" min="0" max="15" step="1" value={state.userMatchPct} onChange={(e) => updateState('userMatchPct', Number(e.target.value))} />
        </div>
        <div className="input-group">
          <label className="input-label">
            401k Balance <span className="value">${state.currentBalanceUser.toLocaleString()}</span>
            <InfoTooltip align="right" text="Current total value of your retirement account." />
          </label>
          <input type="range" min="0" max="2000000" step="5000" value={state.currentBalanceUser} onChange={(e) => updateState('currentBalanceUser', Number(e.target.value))} />
        </div>
      </div>

      {/* Spouse Card */}
      <div className="glass-panel" style={{ padding: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)', background: 'rgba(255,255,255,0.02)' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--accent-2)', marginBottom: 'var(--spacing-md)' }}>Spouse / Partner</h3>
        <div className="input-group">
          <label className="input-label">
            Age <span className="value">{state.spouseAge}</span>
            <InfoTooltip align="right" text="Your spouse's current age." />
          </label>
          <input type="range" min="18" max="80" value={state.spouseAge} onChange={(e) => updateState('spouseAge', Number(e.target.value))} />
        </div>
        <div className="input-group">
          <label className="input-label">
            Retirement Age <span className="value">{state.spouseRetireAge}</span>
            <InfoTooltip align="right" text="Age your spouse plans to retire." />
          </label>
          <input type="range" min={state.spouseAge} max="90" value={state.spouseRetireAge} onChange={(e) => updateState('spouseRetireAge', Number(e.target.value))} />
        </div>
        <div className="input-group">
          <label className="input-label">
            Current Income <span className="value">${state.spouseIncome.toLocaleString()}</span>
            <InfoTooltip align="right" text="Spouse's gross annual salary." />
          </label>
          <input type="range" min="0" max="500000" step="5000" value={state.spouseIncome} onChange={(e) => updateState('spouseIncome', Number(e.target.value))} />
        </div>
        <div className="input-group">
          <label className="input-label">
            Annual Contribution <span className="value">${state.spouseContribution.toLocaleString()}</span>
            <InfoTooltip align="right" text="Spouse's annual deposit." />
          </label>
          <input type="range" min="0" max="69000" step="500" value={state.spouseContribution} onChange={(e) => updateState('spouseContribution', Number(e.target.value))} />
          {renderLimitWarning(state.spouseContribution, state.spouseAge)}
        </div>
        <div className="input-group">
          <label className="input-label">
            Employer Match <span className="value">{state.spouseMatchPct}%</span>
            <InfoTooltip align="right" text="Spouse's employer match percentage." />
          </label>
          <input type="range" min="0" max="15" step="1" value={state.spouseMatchPct} onChange={(e) => updateState('spouseMatchPct', Number(e.target.value))} />
        </div>
        <div className="input-group">
          <label className="input-label">
            401k Balance <span className="value">${state.currentBalanceSpouse.toLocaleString()}</span>
            <InfoTooltip align="right" text="Spouse's current account balance." />
          </label>
          <input type="range" min="0" max="2000000" step="5000" value={state.currentBalanceSpouse} onChange={(e) => updateState('currentBalanceSpouse', Number(e.target.value))} />
        </div>
      </div>

      {/* Retirement Phase Card */}
      <div className="glass-panel" style={{ padding: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)', background: 'rgba(255,255,255,0.02)' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 'var(--spacing-md)' }}>Retirement Goal</h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>Withdrawals adjust for inflation annually.</p>
        
        <div className="input-group">
          <label className="input-label">
            Primary Net Withdrawal <span className="value" style={{ color: 'var(--danger)' }}>${state.userWithdrawalRate.toLocaleString()}/yr</span>
            <InfoTooltip align="right" text="Desired take-home cash per year. Grossed-up for taxes in simulation." />
          </label>
          <input type="range" min="0" max="500000" step="1000" value={state.userWithdrawalRate} onChange={(e) => updateState('userWithdrawalRate', Number(e.target.value))} />
        </div>
        <div className="input-group">
          <label className="input-label">
            Spouse Net Withdrawal <span className="value" style={{ color: 'var(--danger)' }}>${state.spouseWithdrawalRate.toLocaleString()}/yr</span>
            <InfoTooltip align="right" text="Desired take-home cash for spouse per year." />
          </label>
          <input type="range" min="0" max="500000" step="1000" value={state.spouseWithdrawalRate} onChange={(e) => updateState('spouseWithdrawalRate', Number(e.target.value))} />
        </div>
        <div className="input-group">
          <label className="input-label">
            Est. Social Security <span className="value" style={{ color: 'var(--accent-1)' }}>${state.socialSecurity.toLocaleString()}/mo</span>
            <InfoTooltip align="right" text="Combined monthly Social Security income." />
          </label>
          <input type="range" min="0" max="10000" step="100" value={state.socialSecurity} onChange={(e) => updateState('socialSecurity', Number(e.target.value))} />
        </div>
        <div className="input-group">
          <label className="input-label">
            Effective Tax Rate <span className="value">{state.taxRate}%</span>
            <InfoTooltip align="right" text="Estimated tax rate on retirement withdrawals." />
          </label>
          <input type="range" min="0" max="50" step="1" value={state.taxRate} onChange={(e) => updateState('taxRate', Number(e.target.value))} />
        </div>

        <div style={{ marginTop: 'var(--spacing-md)', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input 
              type="checkbox" 
              id="stressTest" 
              checked={state.enableStressTest} 
              onChange={(e) => updateState('enableStressTest', e.target.checked)} 
              style={{ cursor: 'pointer', width: '16px', height: '16px' }}
            />
            <label htmlFor="stressTest" style={{ cursor: 'pointer', fontSize: '0.875rem', color: 'var(--danger)', fontWeight: 600 }}>
              Simulate 2008 Crash
              <InfoTooltip align="right" text="Forces -30% return during first 2 retirement years." />
            </label>
          </div>
        </div>
      </div>

      {/* Assumptions Card */}
      <div className="glass-panel" style={{ padding: 'var(--spacing-md)', background: 'rgba(255,255,255,0.02)' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--accent-2)', marginBottom: 'var(--spacing-md)' }}>Market Assumptions</h3>
        <div className="input-group">
          <label className="input-label">
            Expected Return <span className="value">{state.expectedReturn}%</span>
            <InfoTooltip align="right" text="Average annual portfolio growth rate." />
          </label>
          <input type="range" min="1" max="15" step="0.5" value={state.expectedReturn} onChange={(e) => updateState('expectedReturn', Number(e.target.value))} />
        </div>
        <div className="input-group">
          <label className="input-label">
            Annual Inflation <span className="value">{state.inflation}%</span>
            <InfoTooltip align="right" text="Average rate by which costs increase and dollar value erodes." />
          </label>
          <input type="range" min="0" max="10" step="0.1" value={state.inflation} onChange={(e) => updateState('inflation', Number(e.target.value))} />
        </div>
        <div className="input-group">
          <label className="input-label">
            Life Expectancy <span className="value">Age {state.lifeExpectancy}</span>
            <InfoTooltip align="right" text="Age the plan is projected to last until." />
          </label>
          <input type="range" min="70" max="120" step="1" value={state.lifeExpectancy} onChange={(e) => updateState('lifeExpectancy', Number(e.target.value))} />
        </div>
      </div>

    </div>
  );
};
