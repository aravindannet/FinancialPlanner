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
      
      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--primary)' }}>Primary User</h3>
        </div>
        
        <div className="input-group">
          <label className="input-label">Age <span className="value">{state.userAge}</span></label>
          <input type="range" min="18" max="80" value={state.userAge} onChange={(e) => updateState('userAge', Number(e.target.value))} />
        </div>
        <div className="input-group">
          <label className="input-label">Retirement Age <span className="value">{state.retireAge}</span></label>
          <input type="range" min={state.userAge} max="90" value={state.retireAge} onChange={(e) => updateState('retireAge', Number(e.target.value))} />
        </div>
        <div className="input-group">
          <label className="input-label">Current Income <span className="value">${state.userIncome.toLocaleString()}</span></label>
          <input type="range" min="0" max="500000" step="5000" value={state.userIncome} onChange={(e) => updateState('userIncome', Number(e.target.value))} />
        </div>
        <div className="input-group">
          <label className="input-label">Annual Contribution <span className="value">${state.userContribution.toLocaleString()}</span></label>
          <input type="range" min="0" max="69000" step="500" value={state.userContribution} onChange={(e) => updateState('userContribution', Number(e.target.value))} />
          {renderLimitWarning(state.userContribution, state.userAge)}
        </div>
        <div className="input-group">
          <label className="input-label">Employer Match <span className="value">{state.userMatchPct}%</span></label>
          <input type="range" min="0" max="15" step="1" value={state.userMatchPct} onChange={(e) => updateState('userMatchPct', Number(e.target.value))} />
        </div>
        <div className="input-group">
          <label className="input-label">Current 401k Balance <span className="value">${state.currentBalanceUser.toLocaleString()}</span></label>
          <input type="range" min="0" max="2000000" step="5000" value={state.currentBalanceUser} onChange={(e) => updateState('currentBalanceUser', Number(e.target.value))} />
        </div>
      </div>

      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--accent-2)', marginBottom: 'var(--spacing-md)' }}>Spouse</h3>
        <div className="input-group">
          <label className="input-label">Age <span className="value">{state.spouseAge}</span></label>
          <input type="range" min="18" max="80" value={state.spouseAge} onChange={(e) => updateState('spouseAge', Number(e.target.value))} />
        </div>
        <div className="input-group">
          <label className="input-label">Retirement Age <span className="value">{state.spouseRetireAge}</span></label>
          <input type="range" min={state.spouseAge} max="90" value={state.spouseRetireAge} onChange={(e) => updateState('spouseRetireAge', Number(e.target.value))} />
        </div>
        <div className="input-group">
          <label className="input-label">Current Income <span className="value">${state.spouseIncome.toLocaleString()}</span></label>
          <input type="range" min="0" max="500000" step="5000" value={state.spouseIncome} onChange={(e) => updateState('spouseIncome', Number(e.target.value))} />
        </div>
        <div className="input-group">
          <label className="input-label">Annual Contribution <span className="value">${state.spouseContribution.toLocaleString()}</span></label>
          <input type="range" min="0" max="69000" step="500" value={state.spouseContribution} onChange={(e) => updateState('spouseContribution', Number(e.target.value))} />
          {renderLimitWarning(state.spouseContribution, state.spouseAge)}
        </div>
        <div className="input-group">
          <label className="input-label">Employer Match <span className="value">{state.spouseMatchPct}%</span></label>
          <input type="range" min="0" max="15" step="1" value={state.spouseMatchPct} onChange={(e) => updateState('spouseMatchPct', Number(e.target.value))} />
        </div>
        <div className="input-group">
          <label className="input-label">Current 401k Balance <span className="value">${state.currentBalanceSpouse.toLocaleString()}</span></label>
          <input type="range" min="0" max="2000000" step="5000" value={state.currentBalanceSpouse} onChange={(e) => updateState('currentBalanceSpouse', Number(e.target.value))} />
        </div>
      </div>

      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 'var(--spacing-md)' }}>Retirement Phase (Today's $)</h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>Withdrawals automatically adjust for inflation.</p>
        <div className="input-group">
          <label className="input-label">
            Primary Net Withdrawal <span className="value" style={{ color: 'var(--danger)' }}>${state.userWithdrawalRate.toLocaleString()}/yr</span>
            <InfoTooltip text="The exact amount of spending cash you want to take home every year in retirement. This value is mathematically 'grossed-up' by your tax rate to cover taxes, and then incremented by inflation every year to protect your purchasing power." />
          </label>
          <input type="range" min="0" max="500000" step="1000" value={state.userWithdrawalRate} onChange={(e) => updateState('userWithdrawalRate', Number(e.target.value))} />
        </div>
        <div className="input-group">
          <label className="input-label">
            Spouse Net Withdrawal <span className="value" style={{ color: 'var(--danger)' }}>${state.spouseWithdrawalRate.toLocaleString()}/yr</span>
            <InfoTooltip text="The exact amount of spending cash your spouse wants to take home every year in retirement." />
          </label>
          <input type="range" min="0" max="500000" step="1000" value={state.spouseWithdrawalRate} onChange={(e) => updateState('spouseWithdrawalRate', Number(e.target.value))} />
        </div>
        <div className="input-group">
          <label className="input-label">
            Est. Social Security <span className="value" style={{ color: 'var(--accent-1)' }}>${state.socialSecurity.toLocaleString()}/mo</span>
            <InfoTooltip text="The combined monthly amount you expect to receive from Social Security. The engine subtracts this income from your 'Net Withdrawal' so your 401k doesn't have to fund your entire lifestyle." />
          </label>
          <input type="range" min="0" max="5000" step="100" value={state.socialSecurity} onChange={(e) => updateState('socialSecurity', Number(e.target.value))} />
        </div>
        <div className="input-group">
          <label className="input-label">
            Effective Tax Rate <span className="value">{state.taxRate}%</span>
            <InfoTooltip text="Your estimated effective tax rate in retirement. The engine artificially increases your 401k withdrawals to ensure you have enough to pay these taxes while still hitting your 'Net Withdrawal' target." />
          </label>
          <input type="range" min="0" max="40" step="1" value={state.taxRate} onChange={(e) => updateState('taxRate', Number(e.target.value))} />
        </div>
      </div>

      <div style={{ marginTop: 'var(--spacing-2xl)' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-md)' }}>Advanced Assumptions</h3>
        <div className="input-group">
          <label className="input-label">Expected Return <span className="value">{state.expectedReturn}%</span></label>
          <input type="range" min="1" max="15" step="0.5" value={state.expectedReturn} onChange={(e) => updateState('expectedReturn', Number(e.target.value))} />
        </div>
        <div className="input-group">
          <label className="input-label">Inflation <span className="value">{state.inflation}%</span></label>
          <input type="range" min="0" max="10" step="0.1" value={state.inflation} onChange={(e) => updateState('inflation', Number(e.target.value))} />
        </div>
        <div className="input-group">
          <label className="input-label">Life Expectancy <span className="value">{state.lifeExpectancy}</span></label>
          <input type="range" min="70" max="120" step="1" value={state.lifeExpectancy} onChange={(e) => updateState('lifeExpectancy', Number(e.target.value))} />
        </div>
        <div style={{ marginTop: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input 
            type="checkbox" 
            id="stressTest" 
            checked={state.enableStressTest} 
            onChange={(e) => updateState('enableStressTest', e.target.checked)} 
            style={{ cursor: 'pointer', width: '16px', height: '16px' }}
          />
          <label htmlFor="stressTest" style={{ cursor: 'pointer', fontSize: '0.875rem', color: 'var(--danger)' }}>
            Simulate 2008 Crash at Retirement (-30% return)
          </label>
        </div>
      </div>

    </div>
  );
};
