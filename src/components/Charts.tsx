import React from 'react';
import { 
  ComposedChart, 
  Area, 
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
}

export const Charts: React.FC<ChartsProps> = ({ data, state }) => {
  const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  const chartData = data;

  return (
    <div className="glass-panel" style={{ height: '450px', padding: 'var(--spacing-xl)', marginBottom: 'var(--spacing-2xl)', flexShrink: 0 }}>
      <h3 style={{ margin: '0 0 var(--spacing-md)', fontSize: '1.1rem' }}>
        Wealth Projection ({state.isCombinedView ? 'Household Total' : 'Separate Accounts'})
      </h3>
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
              dataKey="userAge" 
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
              cursor={{ stroke: 'var(--primary)', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Legend verticalAlign="top" align="right" height={40} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 500 }} />
            
            {state.isCombinedView ? (
              <>
                <Area 
                  type="monotone" 
                  name="Total Balance (Nominal)"
                  dataKey="combined.endingBalanceNominal" 
                  stroke="var(--primary)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorMain)" 
                  animationDuration={1500}
                />
                <Area
                  type="monotone"
                  name="Purchasing Power (Real)"
                  dataKey="combined.endingBalanceReal"
                  stroke="var(--accent-2)"
                  strokeWidth={1}
                  fill="rgba(139, 92, 246, 0.1)"
                  dot={false}
                />
              </>
            ) : (
              <>
                <Area type="monotone" name="User Nominal" dataKey="user.endingBalanceNominal" stroke="var(--primary)" strokeWidth={2} fill="url(#colorMain)" fillOpacity={0.4} />
                <Line type="monotone" name="User Real" dataKey="user.endingBalanceReal" stroke="var(--primary)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                {state.hasSpouse && (
                  <>
                    <Area type="monotone" name="Spouse Nominal" dataKey="spouse.endingBalanceNominal" stroke="var(--accent-1)" strokeWidth={2} fill="transparent" />
                    <Line type="monotone" name="Spouse Real" dataKey="spouse.endingBalanceReal" stroke="var(--accent-1)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
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
