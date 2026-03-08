import React from 'react';
import { 
  ComposedChart, 
  Area, 
  Bar,
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import type { YearData, AppState } from '../App';

interface ChartsProps {
  data: YearData[];
  state: AppState;
  updateState: (key: keyof AppState, value: any) => void;
}

export const Charts: React.FC<ChartsProps> = ({ data, state, updateState }) => {
  const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  const chartData = data;
  
  const isSpouseOnly = !state.isCombinedView && state.hasSpouse && state.separateChartView === 'spouse';
  const xAxisKey = isSpouseOnly ? "spouse.age" : "userAge";

  return (
    <div className="glass-panel" style={{ height: '450px', padding: 'var(--spacing-xl)', marginBottom: 'var(--spacing-2xl)', flexShrink: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
          Wealth Projection ({state.isCombinedView ? 'Household Total' : 'Separate Accounts'})
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--bg-surface)', padding: '0.25rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
          {(['area', 'bar'] as const).map((style) => (
            <button 
              key={style}
              onClick={() => updateState('chartStyle', style)}
              style={{ 
                background: state.chartStyle === style ? 'rgba(59, 130, 246, 0.15)' : 'transparent', 
                color: state.chartStyle === style ? 'var(--primary)' : 'var(--text-secondary)',
                border: 'none', padding: '0.35rem 0.75rem', borderRadius: '4px', fontWeight: 600, fontSize: '0.75rem',
                cursor: 'pointer', transition: 'all 0.2s',
                textTransform: 'capitalize'
              }}
            >
              {style}
            </button>
          ))}
        </div>
      </div>
      <div style={{ width: '100%', height: 'calc(100% - 40px)', minHeight: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} opacity={0.5} />
            <XAxis 
              dataKey={xAxisKey}
              stroke="var(--text-muted)" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-secondary)', fontSize: 9 }} 
              tickMargin={15}
              interval={0}
              minTickGap={0}
            />
            <YAxis 
              stroke="var(--text-muted)" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} 
              tickFormatter={formatCurrency}
              width={65}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--bg-base)', 
                borderColor: 'var(--primary)', 
                borderRadius: '10px', 
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                padding: '12px 16px',
                opacity: 1
              }}
              itemStyle={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}
              labelStyle={{ color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 700, fontSize: '13px' }}
              labelFormatter={(label) => `Age ${label}`}
              formatter={(value: number | undefined, name: string | undefined) => [value != null ? formatCurrency(value) : '-', name ?? ''] as [string, string]}
              cursor={{ stroke: 'var(--primary)', strokeWidth: 1, fill: 'var(--bg-surface)', strokeDasharray: state.chartStyle === 'area' ? '4 4' : 'none' }}
            />
            <Legend verticalAlign="top" align="right" height={40} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 500 }} />
            
            {state.isCombinedView ? (
              <>
                {state.chartStyle === 'area' ? (
                  <Area type="monotone" name="Total Balance (Nominal)" dataKey="combined.endingBalanceNominal" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorMain)" animationDuration={1500} />
                ) : (
                  <Bar name="Total Balance (Nominal)" dataKey="combined.endingBalanceNominal" fill="var(--primary)" />
                )}
                {state.chartStyle === 'area' ? (
                  <Area type="monotone" name="Purchasing Power (Real)" dataKey="combined.endingBalanceReal" stroke="var(--accent-2)" strokeWidth={1} fill="rgba(139, 92, 246, 0.1)" dot={false} />
                ) : (
                  <Bar name="Purchasing Power (Real)" dataKey="combined.endingBalanceReal" fill="var(--accent-2)" />
                )}
              </>
            ) : (
              <>
                {(state.separateChartView === 'user' || state.separateChartView === 'both') && (
                  <>
                    {state.chartStyle === 'area' ? (
                      <Area type="monotone" name="User Nominal" dataKey="user.endingBalanceNominal" stroke="var(--primary)" strokeWidth={2} fill="url(#colorMain)" fillOpacity={0.4} />
                    ) : (
                      <Bar name="User Nominal" dataKey="user.endingBalanceNominal" fill="var(--primary)" stackId={state.separateChartView === 'both' ? "a" : undefined} />
                    )}
                    {state.chartStyle === 'area' ? (
                      <Line type="monotone" name="User Real" dataKey="user.endingBalanceReal" stroke="var(--primary)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    ) : (
                       state.separateChartView !== 'both' && <Bar name="User Real" dataKey="user.endingBalanceReal" fill="var(--accent-2)" />
                    )}
                  </>
                )}
                {state.hasSpouse && (state.separateChartView === 'spouse' || state.separateChartView === 'both') && (
                  <>
                    {state.chartStyle === 'area' ? (
                      <Area type="monotone" name="Spouse Nominal" dataKey="spouse.endingBalanceNominal" stroke="var(--accent-1)" strokeWidth={2} fill="transparent" />
                    ) : (
                      <Bar name="Spouse Nominal" dataKey="spouse.endingBalanceNominal" fill="var(--accent-1)" stackId={state.separateChartView === 'both' ? "a" : undefined} />
                    )}
                    {state.chartStyle === 'area' ? (
                      <Line type="monotone" name="Spouse Real" dataKey="spouse.endingBalanceReal" stroke="var(--accent-1)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    ) : (
                      state.separateChartView !== 'both' && <Bar name="Spouse Real" dataKey="spouse.endingBalanceReal" fill="var(--accent-2)" />
                    )}
                  </>
                )}
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
