import React from 'react';
import { InfoTooltip } from './InfoTooltip';
import type { YearData, AppState } from '../App';

interface TableProps {
  data: YearData[];
  state: AppState;
}

export const AmortizationTable: React.FC<TableProps> = ({ data, state }) => {
  const formatNum = (val: number) => Math.round(val).toLocaleString();

  const renderTableHead = () => (
    <thead>
      <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Age</th>
        <th style={{ padding: '0.75rem' }}>
          Starting (Nominal)
          <InfoTooltip text="The actual dollar value of the account at the beginning of the year, prior to any contributions or returns." />
        </th>
        <th style={{ padding: '0.75rem' }}>
          Contributions
          <InfoTooltip text="Total amount personally deposited into the account this year. Capped automatically at IRS limits." />
        </th>
        <th style={{ padding: '0.75rem' }}>
          Employer Match
          <InfoTooltip text="Free money deposited by your employer based on your match percentage and current salary." />
        </th>
        <th style={{ padding: '0.75rem' }}>
          Interest Earned ({state.expectedReturn}%)
          <InfoTooltip text="The investment returns generated this year. Calculated as (Starting Balance + Contributions + Match - Withdrawals) * Expected Return." />
        </th>
        <th style={{ padding: '0.75rem', color: 'var(--danger)' }}>
          Withdrawals
          <InfoTooltip text="Money taken out of the portfolio during retirement. This is grossed-up for taxes and adjusted for inflation annually." />
        </th>
        <th style={{ padding: '0.75rem', color: 'var(--primary)' }}>
          Ending (Nominal)
          <InfoTooltip text="The actual 'Sticker Price' value on the account statement at year-end." />
        </th>
        <th style={{ padding: '0.75rem', color: 'var(--accent-2)' }}>
          Ending (Real $)
          <InfoTooltip text="The inflation-adjusted value. This tells you what the ending balance is actually worth in today’s purchasing power." />
        </th>
      </tr>
    </thead>
  );

  const renderRow = (year: YearData, type: 'combined' | 'user' | 'spouse', bg: string) => {
    const d = year[type];
    const displayAge = type === 'spouse' ? year.spouse.age : year.userAge;
    
    return (
      <tr style={{ borderBottom: '1px solid var(--border)', background: bg }}>
        <td style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 500 }}>{displayAge}</td>
        <td style={{ padding: '0.75rem' }}>${formatNum(d.startingBalanceNominal)}</td>
        <td style={{ padding: '0.75rem', color: 'var(--accent-1)' }}>+ ${formatNum(d.contributions)}</td>
        <td style={{ padding: '0.75rem', color: 'var(--accent-1)' }}>+ ${formatNum(d.employerMatch)}</td>
        <td style={{ padding: '0.75rem', color: 'var(--accent-1)' }}>+ ${formatNum(d.interestNominal)}</td>
        <td style={{ padding: '0.75rem', color: 'var(--danger)' }}>
          {d.withdrawals > 0 ? (
            <InfoTooltip text={d.withdrawalDerivation || ""} align="center">
              <span style={{ borderBottom: '1px dotted var(--danger)', cursor: 'help' }}>
                - ${formatNum(d.withdrawals)}
              </span>
            </InfoTooltip>
          ) : '-'}
        </td>
        <td style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>${formatNum(d.endingBalanceNominal)}</td>
        <td style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--accent-2)' }}>${formatNum(d.endingBalanceReal)}</td>
      </tr>
    );
  };

  if (state.isCombinedView) {
    return (
      <div className="glass-panel" style={{ marginTop: 'var(--spacing-xl)', padding: 'var(--spacing-xl)', overflowX: 'auto', width: '100%' }}>
        <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Yearly Breakdown (Household Total)</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', whiteSpace: 'nowrap' }}>
          {renderTableHead()}
          <tbody>
            {data.map((year, i) => <React.Fragment key={i}>{renderRow(year, 'combined', 'transparent')}</React.Fragment>)}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 'var(--spacing-lg)', marginTop: 'var(--spacing-xl)', width: '100%' }}>
      <div className="glass-panel" style={{ padding: 'var(--spacing-xl)', overflowX: 'auto', width: '100%' }}>
        <h3 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--primary)' }}>Primary Breakdown</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', whiteSpace: 'nowrap' }}>
          {renderTableHead()}
          <tbody>
            {data.map((year, i) => <React.Fragment key={i}>{renderRow(year, 'user', 'rgba(59, 130, 246, 0.05)')}</React.Fragment>)}
          </tbody>
        </table>
      </div>
      
      <div className="glass-panel" style={{ padding: 'var(--spacing-xl)', overflowX: 'auto', width: '100%' }}>
        <h3 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--accent-1)' }}>Spouse Breakdown</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', whiteSpace: 'nowrap' }}>
          {renderTableHead()}
          <tbody>
            {data.map((year, i) => <React.Fragment key={i}>{renderRow(year, 'spouse', 'rgba(16, 185, 129, 0.05)')}</React.Fragment>)}
          </tbody>
        </table>
      </div>
    </div>
  );
};
