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
  const ageColumnWidth = '88px';

  const Currency: React.FC<{ value: number; color?: string; prefix?: string }> = ({ value, color = 'inherit', prefix = '' }) => (
    <span style={{ fontVariantNumeric: 'tabular-nums' }}>
      <span style={{ color: 'var(--text-muted)', opacity: 0.7 }}>{prefix}$</span>
      <span style={{ color }}>{formatNum(value)}</span>
    </span>
  );

  const tableStyle: React.CSSProperties = {
    width: 'max-content',
    minWidth: '100%',
    borderCollapse: 'collapse',
    textAlign: 'right',
    whiteSpace: 'nowrap',
    fontSize: '0.9rem'
  };

  const renderTableHead = () => (
    <thead>
      <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        <th
          style={{
            padding: '0.75rem',
            textAlign: 'left',
            position: 'sticky',
            left: 0,
            width: ageColumnWidth,
            minWidth: ageColumnWidth,
            maxWidth: ageColumnWidth,
            background: 'var(--bg-base)',
            zIndex: 14,
            borderRight: '1px solid var(--border)',
            boxShadow: '10px 0 14px -10px rgba(0, 0, 0, 0.85)'
          }}
        >
          Age
        </th>
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
        <td
          style={{
            padding: '0.75rem',
            textAlign: 'left',
            fontWeight: 600,
            position: 'sticky',
            left: 0,
            width: ageColumnWidth,
            minWidth: ageColumnWidth,
            maxWidth: ageColumnWidth,
            background: 'var(--bg-base)',
            zIndex: 13,
            borderRight: '1px solid var(--border)',
            boxShadow: '10px 0 14px -10px rgba(0, 0, 0, 0.85)'
          }}
        >
          {displayAge}
        </td>
        <td style={{ padding: '0.75rem' }}><Currency value={d.startingBalanceNominal} /></td>
        <td style={{ padding: '0.75rem' }}><Currency value={d.contributions} color="var(--accent-1)" prefix="+ " /></td>
        <td style={{ padding: '0.75rem' }}><Currency value={d.employerMatch} color="var(--accent-1)" prefix="+ " /></td>
        <td style={{ padding: '0.75rem' }}><Currency value={d.interestNominal} color="var(--accent-1)" prefix="+ " /></td>
        <td style={{ padding: '0.75rem' }}>
          {d.endingBalanceNominal > 0 && d.withdrawals > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
              <span style={{ borderBottom: '1px dotted var(--danger)', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                <span style={{ color: 'var(--text-muted)', opacity: 0.7 }}>- $</span>
                <span style={{ color: 'var(--danger)' }}>{formatNum(d.withdrawals)}</span>
              </span>
              <InfoTooltip text={d.withdrawalDerivation} align="left">
                <Info size={16} color="var(--danger)" style={{ flexShrink: 0, opacity: 0.7 }} />
              </InfoTooltip>
            </div>
          ) : '-'}
        </td>
        <td style={{ padding: '0.75rem', fontWeight: 600 }}><Currency value={d.endingBalanceNominal} color="var(--primary)" /></td>
        <td style={{ padding: '0.75rem', fontWeight: 600 }}><Currency value={d.endingBalanceReal} color="var(--accent-2)" /></td>
      </tr>
    );
  };

  if (!state.hasSpouse || state.isCombinedView) {
    return (
      <div className="glass-panel" style={{ marginTop: 'var(--spacing-xl)', padding: 'var(--spacing-xl)', width: '100%', minHeight: '600px', flexShrink: 0 }}>
        <h3 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1.25rem' }}>
          Yearly Breakdown {state.hasSpouse ? '(Household Total)' : '(Primary Only)'}
        </h3>
        <div className="amortization-table-scroll" style={{ overflowX: 'auto', width: '100%' }}>
          <table style={tableStyle}>
            {renderTableHead()}
            <tbody>
              {data.map((year, i) => <React.Fragment key={i}>{renderRow(year, 'combined', 'transparent')}</React.Fragment>)}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)', marginTop: 'var(--spacing-xl)', width: '100%', minHeight: '600px', flexShrink: 0 }}>
      <div className="glass-panel" style={{ padding: 'var(--spacing-xl)', width: '100%' }}>
        <h3 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--primary)', fontSize: '1.25rem' }}>Primary Breakdown</h3>
        <div className="amortization-table-scroll" style={{ overflowX: 'auto', width: '100%' }}>
          <table style={tableStyle}>
            {renderTableHead()}
            <tbody>
              {data.map((year, i) => <React.Fragment key={i}>{renderRow(year, 'user', 'rgba(59, 130, 246, 0.05)')}</React.Fragment>)}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="glass-panel" style={{ padding: 'var(--spacing-xl)', width: '100%' }}>
        <h3 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--accent-1)', fontSize: '1.25rem' }}>Spouse Breakdown</h3>
        <div className="amortization-table-scroll" style={{ overflowX: 'auto', width: '100%' }}>
          <table style={tableStyle}>
            {renderTableHead()}
            <tbody>
              {data.map((year, i) => <React.Fragment key={i}>{renderRow(year, 'spouse', 'rgba(16, 185, 129, 0.05)')}</React.Fragment>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
