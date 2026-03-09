import { useState, useMemo, useEffect } from 'react';
import { AppBar } from './components/AppBar';
import { InputPanel } from './components/InputPanel';
import { Dashboard } from './components/Dashboard';
import { ChatInterface } from './components/ChatInterface';
import { calculateProjection } from './utils/projection';
import './index.css';

export interface AppState {
  userAge: number;
  retireAge: number;
  userIncome: number;
  userContribution: number;
  userContributionType: 'dollar' | 'percent';
  userMatchTier1Pct: number;
  userMatchTier1Max: number;
  userMatchTier2Pct: number;
  userMatchTier2Max: number;
  salaryGrowthUser: number;
  catchUp50User: number;
  catchUp60User: number;
  currentBalanceUser: number;

  spouseAge: number;
  spouseRetireAge: number;
  spouseIncome: number;
  spouseContribution: number;
  spouseContributionType: 'dollar' | 'percent';
  spouseMatchTier1Pct: number;
  spouseMatchTier1Max: number;
  spouseMatchTier2Pct: number;
  spouseMatchTier2Max: number;
  salaryGrowthSpouse: number;
  catchUp50Spouse: number;
  catchUp60Spouse: number;
  currentBalanceSpouse: number;
  hasSpouse: boolean;

  lifeExpectancy: number;
  expectedReturn: number;
  inflation: number;
  userWithdrawalRate: number; 
  spouseWithdrawalRate: number; 
  
  socialSecurityUser: number; // Monthly
  ssStartAgeUser: 62 | 67 | 70;
  socialSecuritySpouse: number; // Monthly
  ssStartAgeSpouse: 62 | 67 | 70;
  taxRate: number; // Percentage
  enableStressTest: boolean;
  stressTestAge: number;
  applyEarlyPenalty: boolean;
  withdrawalStartAge: number;

  isCombinedView: boolean;
  isSidebarOpen: boolean;
  isFullScreenDashboard: boolean;
  chartType: 'growth' | 'annual';
  chartStyle: 'area' | 'bar';
  contributionModel: 'end-of-year' | 'beginning-of-year' | 'mid-year';
  theme: 'light' | 'dark';
  separateChartView: 'user' | 'spouse' | 'both';
  isMobileNavOpen: boolean;
  isMobileInputOpen: boolean;
}

export interface PersonYearData {
  age: number;
  startingBalanceNominal: number;
  startingBalanceReal: number;
  contributions: number;
  employerMatch: number;
  interestNominal: number;
  withdrawals: number;
  withdrawalDerivation: string;
  endingBalanceNominal: number;
  endingBalanceReal: number;
}

export interface YearData {
  yearIndex: number;
  userAge: number; // Reference age
  user: PersonYearData;
  spouse: PersonYearData;
  combined: Omit<PersonYearData, 'age'>;
}

const DEFAULT_STATE: AppState = {
  userAge: 35,
  retireAge: 65,
  userIncome: 100000,
  userContribution: 10000,
  userContributionType: 'dollar',
  userMatchTier1Pct: 100,
  userMatchTier1Max: 3,
  userMatchTier2Pct: 50,
  userMatchTier2Max: 2,
  salaryGrowthUser: 0,
  catchUp50User: 0,
  catchUp60User: 0,
  currentBalanceUser: 50000,

  spouseAge: 33,
  spouseRetireAge: 65,
  spouseIncome: 80000,
  spouseContribution: 8000,
  spouseContributionType: 'dollar',
  spouseMatchTier1Pct: 100,
  spouseMatchTier1Max: 4,
  spouseMatchTier2Pct: 0,
  spouseMatchTier2Max: 0,
  salaryGrowthSpouse: 0,
  catchUp50Spouse: 0,
  catchUp60Spouse: 0,
  currentBalanceSpouse: 30000,
  hasSpouse: true,

  lifeExpectancy: 90,
  expectedReturn: 7,
  inflation: 2.5,
  userWithdrawalRate: 60000,
  spouseWithdrawalRate: 60000,
  socialSecurityUser: 0,
  ssStartAgeUser: 67,
  socialSecuritySpouse: 0,
  ssStartAgeSpouse: 67,
  taxRate: 15,
  enableStressTest: false,
  isCombinedView: true,
  isSidebarOpen: true,
  isFullScreenDashboard: false,
  chartType: 'growth',
  chartStyle: 'area',
  contributionModel: 'mid-year',
  theme: 'dark',
  applyEarlyPenalty: false,
  withdrawalStartAge: 60,
  stressTestAge: 65,
  separateChartView: 'both',
  isMobileNavOpen: false,
  isMobileInputOpen: false,
};

const STORAGE_KEY = 'aura_plan_state';

const loadSavedState = (): AppState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_STATE, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn('Failed to load state from local storage', e);
  }
  return DEFAULT_STATE;
};

export default function App() {
  const [state, setState] = useState<AppState>(loadSavedState());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  const updateState = (key: keyof AppState | Partial<AppState>, value?: any) => {
    if (typeof key === 'object') {
      setState(prev => ({ ...prev, ...key }));
    } else {
      setState(prev => ({ ...prev, [key]: value }));
    }
  };

  const projectionData = useMemo(() => {
    return calculateProjection(state);
  }, [state]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-base)', overflow: 'hidden' }}>
      <AppBar state={state} updateState={updateState} />
      
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Desktop Sidebar OR Mobile Drawer */}
        <div 
          className={`sidebar-container ${state.isMobileInputOpen ? "mobile-drawer-overlay" : ""}`}
          onClick={() => state.isMobileInputOpen && updateState('isMobileInputOpen', false)}
          style={{
            width: state.isFullScreenDashboard && !state.isMobileInputOpen ? '0' : (state.isMobileInputOpen ? '100%' : '380px'),
            minWidth: state.isFullScreenDashboard && !state.isMobileInputOpen ? '0' : (state.isMobileInputOpen ? '100%' : '380px'),
            overflow: 'hidden',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            opacity: state.isFullScreenDashboard && !state.isMobileInputOpen ? 0 : 1,
            zIndex: state.isMobileInputOpen ? 1050 : 1,
            position: state.isMobileInputOpen ? 'fixed' : 'relative',
            top: state.isMobileInputOpen ? 0 : 'auto',
            left: state.isMobileInputOpen ? 0 : 'auto',
            height: state.isMobileInputOpen ? '100%' : 'auto',
            display: (state.isMobileInputOpen || !state.isFullScreenDashboard) ? 'block' : 'none'
          }}
        >
          {/* Apply "hide-on-mobile" if the drawer IS NOT open, preventing it from taking space in the regular flex layout. */}
          <div 
            className={`mobile-drawer-content ${!state.isMobileInputOpen ? 'hide-on-mobile' : ''}`}
            onClick={(e) => e.stopPropagation()}
            style={{ 
              width: state.isMobileInputOpen ? '380px' : '100%', 
              height: '100%', 
              overflowY: 'auto',
              borderRight: state.isMobileInputOpen ? '1px solid var(--border)' : (state.isFullScreenDashboard ? 'none' : '1px solid var(--border)'),
              background: 'var(--bg-base)'
            }}
          >
            <InputPanel state={state} updateState={updateState} />
          </div>
        </div>
        
        <main style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
          <Dashboard data={projectionData} state={state} updateState={updateState} />
          
          {/* Mobile Floating Action Button to manually open Input Panel */}
          <button 
            className="mobile-fab show-on-mobile"
            onClick={() => updateState('isMobileInputOpen', true)}
            title="Edit Plan Assumptions"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
        </main>

        <ChatInterface data={projectionData} state={state} updateState={updateState} />
      </div>
    </div>
  );
}

