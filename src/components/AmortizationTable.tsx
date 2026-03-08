import React from 'react';
import { InfoTooltip } from './InfoTooltip';
import { Info } from 'lucide-react';
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
          <InfoTooltip text="Account value at the start of the year." />
        </th>
        <th style={{ padding: '0.75rem' }}>
          Contributions
          <InfoTooltip text="Total personally deposited. Capped at IRS limits." />
        </th>
        <th style={{ padding: '0.75rem' }}>
          Employer Match
          <InfoTooltip text="Free money from employer based on tiered match rules." />
        </th>
        <th style={{ padding: '0.75rem' }}>
          Interest Nom.
          <InfoTooltip text="Returns generated this year." />
        </th>
        <th style={{ padding: '0.75rem', color: 'var(--danger)' }}>
          Withdrawals
          <InfoTooltip text="Money taken out (Grossed for tax + Inflation adjusted)." />
        </th>
        <th style={{ padding: '0.75rem', color: 'var(--primary)' }}>Ending (Nom)</th>
        <th style={{ padding: '0.75rem', color: 'var(--accent-2)' }}>Ending (Real)</th>
      </tr>
    </thead>
  );

  const renderRow = (year: YearData, type: 'combined' | 'user' | 'spouse', bg: string) => {
    const d = year[type];
    const displayAge = type === 'spouse' ? year.spouse.age : year.userAge;
    
    return (
      <tr style={{ borderBottom: '1px solid var(--border)', background: bg }} className="table-row-hover">
        <td style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 500 }}>{displayAge}</td>
        <td style={{ padding: '0.75rem' }}>${formatNum(d.startingBalanceNominal)}</td>
        <td style={{ padding: '0.75rem', color: 'var(--accent-1)' }}>+ ${formatNum(d.contributions)}</td>
        <td style={{ padding: '0.75rem', color: 'var(--accent-1)' }}>+ ${formatNum(d.employerMatch)}</td>
        <td style={{ padding: '0.75rem', color: 'var(--accent-1)' }}>+ ${formatNum(d.interestNominal)}</td>
        <td style={{ padding: '0.75rem', color: 'var(--danger)' }}>
          {d.endingBalanceNominal > 0 && d.withdrawals > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'help' }} title={d.withdrawalDerivation}>
              <span style={{ borderBottom: '1px dotted var(--danger)' }}>- ${formatNum(d.withdrawals)}</span>
              <Info size={12} color="var(--text-muted)" />
            </div>
          ) : '-'}
        </td>
        <td style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>${formatNum(d.endingBalanceNominal)}</td>
        <td style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--accent-2)' }}>${formatNum(d.endingBalanceReal)}</td>
      </tr>
    );
  };

  if (!state.hasSpouse || state.isCombinedView) {
    return (
      <div className="glass-panel" style={{ marginTop: 'var(--spacing-xl)', padding: 'var(--spacing-xl)', overflowX: 'auto', width: '100%', minHeight: '600px', flexShrink: 0 }}>
        <h3 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1.25rem' }}>
          Yearly Breakdown {state.hasSpouse ? '(Household Total)' : '(Primary Only)'}
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', whiteSpace: 'nowrap', fontSize: '0.9rem' }}>
          {renderTableHead()}
          <tbody>
            {data.map((year, i) => <React.Fragment key={i}>{renderRow(year, 'combined', 'transparent')}</React.Fragment>)}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)', marginTop: 'var(--spacing-xl)', width: '100%', minHeight: '600px', flexShrink: 0 }}>
      <div className="glass-panel" style={{ padding: 'var(--spacing-xl)', overflowX: 'auto', width: '100%' }}>
        <h3 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--primary)', fontSize: '1.25rem' }}>Primary Breakdown</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', whiteSpace: 'nowrap', fontSize: '0.9rem' }}>
          {renderTableHead()}
          <tbody>
            {data.map((year, i) => <React.Fragment key={i}>{renderRow(year, 'user', 'rgba(59, 130, 246, 0.05)')}</React.Fragment>)}
          </tbody>
        </table>
      </div>
      
      <div className="glass-panel" style={{ padding: 'var(--spacing-xl)', overflowX: 'auto', width: '100%' }}>
        <h3 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--accent-1)', fontSize: '1.25rem' }}>Spouse Breakdown</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', whiteSpace: 'nowrap', fontSize: '0.9rem' }}>
          {renderTableHead()}
          <tbody>
            {data.map((year, i) => <React.Fragment key={i}>{renderRow(year, 'spouse', 'rgba(16, 185, 129, 0.05)')}</React.Fragment>)}
          </tbody>
        </table>
      </div>
    </div>
  );
};
