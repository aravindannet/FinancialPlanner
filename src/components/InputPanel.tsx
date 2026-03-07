import React from 'react';
import { InfoTooltip } from './InfoTooltip';
import type { AppState } from '../App';

interface InputPanelProps {
  state: AppState;
  updateState: (key: keyof AppState, value: number | boolean | string) => void;
}

export const InputPanel: React.FC<InputPanelProps> = ({ state, updateState }) => {


  return (
    <div className="glass-panel" style={{ width: '380px', flexShrink: 0, padding: 'var(--spacing-xl)', overflowY: 'auto', borderLeft: 'none', borderTop: 'none', borderBottom: 'none' }}>
      <h2 style={{ marginBottom: 'var(--spacing-xl)', fontSize: '1.25rem' }}>Household Assumptions</h2>
      
      {/* Primary User Card */}
      <div className="glass-panel" style={{ padding: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--primary)' }}>Primary User</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input 
              type="checkbox" 
              id="hasSpouse" 
              checked={state.hasSpouse} 
              onChange={(e) => updateState('hasSpouse', e.target.checked)} 
              style={{ cursor: 'pointer' }}
            />
            <label htmlFor="hasSpouse" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>Include Spouse</label>
          </div>
        </div>
        
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
            <InfoTooltip align="right" text="Your annual 401k contribution." />
          </label>
          <input type="range" min="0" max="69000" step="500" value={state.userContribution} onChange={(e) => updateState('userContribution', Number(e.target.value))} />
        </div>
        <div className="input-group" style={{ marginBottom: 'var(--spacing-md)' }}>
          <label className="input-label" style={{ marginBottom: '0.5rem' }}>
            Employer Match Tiers
            <InfoTooltip align="right" text="Match Rate on first tier of salary %, and Rate on second tier." />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
            <div>
              <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>TIER 1 MATCH %</p>
              <input type="number" value={state.userMatchTier1Pct} onChange={(e) => updateState('userMatchTier1Pct', Number(e.target.value))} style={{ width: '100%', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '0.25rem', fontSize: '0.8rem' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>UP TO SALARY %</p>
              <input type="number" value={state.userMatchTier1Max} onChange={(e) => updateState('userMatchTier1Max', Number(e.target.value))} style={{ width: '100%', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '0.25rem', fontSize: '0.8rem' }} />
            </div>
            <div style={{ marginTop: '0.25rem' }}>
              <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>TIER 2 MATCH %</p>
              <input type="number" value={state.userMatchTier2Pct} onChange={(e) => updateState('userMatchTier2Pct', Number(e.target.value))} style={{ width: '100%', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '0.25rem', fontSize: '0.8rem' }} />
            </div>
            <div style={{ marginTop: '0.25rem' }}>
              <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>ON NEXT SALARY %</p>
              <input type="number" value={state.userMatchTier2Max} onChange={(e) => updateState('userMatchTier2Max', Number(e.target.value))} style={{ width: '100%', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '0.25rem', fontSize: '0.8rem' }} />
            </div>
          </div>
        </div>
        <div className="input-group">
          <label className="input-label">
            401k Balance <span className="value">${state.currentBalanceUser.toLocaleString()}</span>
            <InfoTooltip align="right" text="Current total value of your retirement account." />
          </label>
          <input type="range" min="0" max="2000000" step="5000" value={state.currentBalanceUser} onChange={(e) => updateState('currentBalanceUser', Number(e.target.value))} />
        </div>
      </div>
      
      {state.hasSpouse && (
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
        </div>
        <div className="input-group" style={{ marginBottom: 'var(--spacing-md)' }}>
          <label className="input-label" style={{ marginBottom: '0.5rem' }}>
            Employer Match Tiers
            <InfoTooltip align="right" text="Match Rate on first tier of salary %, and Rate on second tier." />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
            <div>
              <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>TIER 1 MATCH %</p>
              <input type="number" value={state.spouseMatchTier1Pct} onChange={(e) => updateState('spouseMatchTier1Pct', Number(e.target.value))} style={{ width: '100%', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '0.25rem', fontSize: '0.8rem' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>UP TO SALARY %</p>
              <input type="number" value={state.spouseMatchTier1Max} onChange={(e) => updateState('spouseMatchTier1Max', Number(e.target.value))} style={{ width: '100%', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '0.25rem', fontSize: '0.8rem' }} />
            </div>
            <div style={{ marginTop: '0.25rem' }}>
              <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>TIER 2 MATCH %</p>
              <input type="number" value={state.spouseMatchTier2Pct} onChange={(e) => updateState('spouseMatchTier2Pct', Number(e.target.value))} style={{ width: '100%', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '0.25rem', fontSize: '0.8rem' }} />
            </div>
            <div style={{ marginTop: '0.25rem' }}>
              <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>ON NEXT SALARY %</p>
              <input type="number" value={state.spouseMatchTier2Max} onChange={(e) => updateState('spouseMatchTier2Max', Number(e.target.value))} style={{ width: '100%', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '0.25rem', fontSize: '0.8rem' }} />
            </div>
          </div>
        </div>
        <div className="input-group">
          <label className="input-label">
            401k Balance <span className="value">${state.currentBalanceSpouse.toLocaleString()}</span>
            <InfoTooltip align="right" text="Spouse's current account balance." />
          </label>
          <input type="range" min="0" max="2000000" step="5000" value={state.currentBalanceSpouse} onChange={(e) => updateState('currentBalanceSpouse', Number(e.target.value))} />
        </div>
      </div>
      )}

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
        {state.hasSpouse && (
          <div className="input-group">
            <label className="input-label">
              Spouse Net Withdrawal <span className="value" style={{ color: 'var(--danger)' }}>${state.spouseWithdrawalRate.toLocaleString()}/yr</span>
              <InfoTooltip align="right" text="Desired take-home cash for spouse per year." />
            </label>
            <input type="range" min="0" max="500000" step="1000" value={state.spouseWithdrawalRate} onChange={(e) => updateState('spouseWithdrawalRate', Number(e.target.value))} />
          </div>
        )}
        <div className="input-group">
          <label className="input-label">
            Primary Social Security <span className="value" style={{ color: 'var(--accent-1)' }}>${state.socialSecurityUser.toLocaleString()}/mo</span>
            <InfoTooltip align="right" text="Expected monthly Social Security benefit for the primary user." />
          </label>
          <input type="range" min="0" max="6000" step="100" value={state.socialSecurityUser} onChange={(e) => updateState('socialSecurityUser', Number(e.target.value))} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', flexShrink: 0 }}>Starts at:</span>
            {([62, 67, 70] as const).map(age => (
              <button
                key={age}
                onClick={() => updateState('ssStartAgeUser', age)}
                style={{
                  padding: '0.2rem 0.6rem',
                  borderRadius: '999px',
                  border: state.ssStartAgeUser === age ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                  background: state.ssStartAgeUser === age ? 'var(--primary)' : 'transparent',
                  color: state.ssStartAgeUser === age ? 'white' : 'var(--text-secondary)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {age}
              </button>
            ))}
          </div>
        </div>
        {state.hasSpouse && (
          <div className="input-group">
            <label className="input-label">
              Spouse Social Security <span className="value" style={{ color: 'var(--accent-1)' }}>${state.socialSecuritySpouse.toLocaleString()}/mo</span>
              <InfoTooltip align="right" text="Expected monthly Social Security benefit for the spouse." />
            </label>
            <input type="range" min="0" max="6000" step="100" value={state.socialSecuritySpouse} onChange={(e) => updateState('socialSecuritySpouse', Number(e.target.value))} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', flexShrink: 0 }}>Starts at:</span>
              {([62, 67, 70] as const).map(age => (
                <button
                  key={age}
                  onClick={() => updateState('ssStartAgeSpouse', age)}
                  style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: '999px',
                    border: state.ssStartAgeSpouse === age ? '1.5px solid var(--accent-1)' : '1px solid var(--border)',
                    background: state.ssStartAgeSpouse === age ? 'var(--accent-1)' : 'transparent',
                    color: state.ssStartAgeSpouse === age ? 'white' : 'var(--text-secondary)',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {age}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="input-group">
          <label className="input-label">
            Effective Tax Rate <span className="value">{state.taxRate}%</span>
            <InfoTooltip align="right" text="Estimated tax rate on retirement withdrawals." />
          </label>
          <input type="range" min="0" max="50" step="1" value={state.taxRate} onChange={(e) => updateState('taxRate', Number(e.target.value))} />
        </div>

        {state.retireAge < 60 && (
          <div style={{ marginTop: 'var(--spacing-md)', padding: 'var(--spacing-sm)', background: 'rgba(239, 68, 68, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--danger)', marginBottom: 'var(--spacing-sm)', fontWeight: 700 }}>Early Wealth Controls</h4>
            
            <div className="input-group">
              <label className="input-label">
                Begin Withdrawals at Age <span className="value">Age {state.withdrawalStartAge}</span>
                <InfoTooltip align="right" text="Defer withdrawals until age 60+ to avoid the 10% penalty, even if retiring early." />
              </label>
              <input type="range" min={state.retireAge} max="70" value={state.withdrawalStartAge} onChange={(e) => updateState('withdrawalStartAge', Number(e.target.value))} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input 
                type="checkbox" 
                id="applyPenalty" 
                checked={state.applyEarlyPenalty} 
                onChange={(e) => updateState('applyEarlyPenalty', e.target.checked)} 
                style={{ cursor: 'pointer' }}
              />
              <label htmlFor="applyPenalty" style={{ cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                Apply 10% Early Withdrawal Penalty
                <InfoTooltip align="right" text="IRS Penalty for non-qualified withdrawals before age 59½." />
              </label>
            </div>
          </div>
        )}

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
              <InfoTooltip align="right" text="Applies a -37% return in Month 1 of Year 1 to stress test plan resilience." />
            </label>
          </div>
        </div>
      </div>

      {/* Contribution Model Selector */}
      <div className="glass-panel" style={{ padding: 'var(--spacing-md)', background: 'rgba(255,255,255,0.02)' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--accent-2)', marginBottom: 'var(--spacing-sm)' }}>
          Contribution Timing Model
          <InfoTooltip align="right" text="Controls when contributions are assumed to be invested each year. This affects your total projected growth." />
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {([
            {
              key: 'end-of-year',
              label: 'End of Year',
              sub: 'Conservative',
              tip: 'Interest on start balance first, then contributions added at year-end. Most textbooks use this. Formula: Interest = Start × Rate. End = Start + Interest + Contributions.',
            },
            {
              key: 'mid-year',
              label: 'Mid-Year / Payroll',
              sub: 'Most Realistic',
              tip: '401k deductions happen each paycheck, so contributions earn ~half a year of interest on average. Formula: Interest = (Start × Rate) + (Contributions × Rate÷2). End = Start + Contributions + Interest.',
            },
            {
              key: 'beginning-of-year',
              label: 'Beginning of Year',
              sub: 'Aggressive',
              tip: 'Contributions added on January 1 and earn a full year of interest. Formula: Interest = (Start + Contributions) × Rate. End = Start + Contributions + Interest.',
            },
          ] as const).map(({ key, label, sub, tip }) => (
            <button
              key={key}
              onClick={() => updateState('contributionModel', key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.6rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: state.contributionModel === key ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                background: state.contributionModel === key ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
              }}
            >
              <div style={{
                width: '14px', height: '14px', borderRadius: '50%', flexShrink: 0,
                border: state.contributionModel === key ? '4px solid var(--primary)' : '2px solid var(--border)',
                background: state.contributionModel === key ? 'white' : 'transparent',
                transition: 'all 0.15s',
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: state.contributionModel === key ? 'var(--primary)' : 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                  {label}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{sub}</div>
              </div>
              <InfoTooltip align="right" text={tip} />
            </button>
          ))}
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
