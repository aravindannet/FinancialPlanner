import React from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { YearData, AppState } from '../App';

interface ChartsProps {
  data: YearData[];
  state: AppState;
}

export const Charts: React.FC<ChartsProps> = ({ data, state }) => {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toLocaleString(undefined, { maximumFractionDigits: 1 })} Mil`;
    if (value >= 1000) return `$${(value / 1000).toLocaleString()}k`;
    return `$${value}`;
  };

  if (state.isCombinedView) {
    return (
      <div className="glass-panel" style={{ height: '400px', padding: 'var(--spacing-md)' }}>
        <h3 style={{ margin: '0 0 var(--spacing-md) var(--spacing-sm)', fontSize: '1.1rem' }}>Household Growth (Combined)</h3>
        <ResponsiveContainer width="100%" height="90%">
          <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorNominal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="userAge" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} tickMargin={10} minTickGap={20} />
            <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} tickFormatter={formatCurrency} width={80} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border)', borderRadius: 'var(--radius-md)' }}
              formatter={(value: any, name: string | undefined) => {
                const label = name === 'combined.endingBalanceNominal' ? 'Nominal Total' : 'Real Value (Today\'s $)';
                return [`$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, label];
              }}
              labelFormatter={(label) => `Primary Age ${label}`}
            />
            <Legend verticalAlign="top" height={36} />
            <Area 
              type="monotone" 
              name="combined.endingBalanceNominal"
              dataKey="combined.endingBalanceNominal" 
              stroke="var(--primary)" 
              fillOpacity={1} 
              fill="url(#colorNominal)" 
            />
            <Line 
              type="monotone" 
              name="combined.endingBalanceReal"
              dataKey="combined.endingBalanceReal" 
              stroke="var(--accent-2)" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Separate Spousal View
  return (
    <div className="glass-panel" style={{ height: '450px', padding: 'var(--spacing-md)' }}>
      <h3 style={{ margin: '0 0 var(--spacing-md) var(--spacing-sm)', fontSize: '1.1rem' }}>Individual Growth (Nominal & Real)</h3>
      <ResponsiveContainer width="100%" height="90%">
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="colorUser" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.6}/>
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorSpouse" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent-1)" stopOpacity={0.6}/>
              <stop offset="95%" stopColor="var(--accent-1)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="userAge" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} tickMargin={10} minTickGap={20} />
          <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} tickFormatter={formatCurrency} width={80} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border)', borderRadius: 'var(--radius-md)' }}
            formatter={(value: any, name: string | undefined) => {
              return [`$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, name || ''];
            }}
            labelFormatter={(label) => `Primary Age ${label}`}
          />
          <Legend verticalAlign="top" height={36} />
          
          <Area type="monotone" name="Primary Nominal" dataKey="user.endingBalanceNominal" stroke="var(--primary)" strokeWidth={2} fill="url(#colorUser)" fillOpacity={1} />
          <Line type="monotone" name="Primary Real" dataKey="user.endingBalanceReal" stroke="var(--primary)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
          
          <Area type="monotone" name="Spouse Nominal" dataKey="spouse.endingBalanceNominal" stroke="var(--accent-1)" strokeWidth={2} fill="url(#colorSpouse)" fillOpacity={1} />
          <Line type="monotone" name="Spouse Real" dataKey="spouse.endingBalanceReal" stroke="var(--accent-1)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
          
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
