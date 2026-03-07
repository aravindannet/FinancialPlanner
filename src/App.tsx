import { useState, useMemo, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { InputPanel } from './components/InputPanel';
import { Dashboard } from './components/Dashboard';
import { ChatInterface } from './components/ChatInterface';
import './index.css';

export interface AppState {
  userAge: number;
  retireAge: number;
  userIncome: number;
  userContribution: number;
  currentBalanceUser: number;

  spouseAge: number;
  spouseRetireAge: number;
  spouseIncome: number;
  spouseContribution: number;
  spouseMatchTier1Pct: number;
  spouseMatchTier1Max: number;
  spouseMatchTier2Pct: number;
  spouseMatchTier2Max: number;
  currentBalanceSpouse: number;
  hasSpouse: boolean;

  userMatchTier1Pct: number;
  userMatchTier1Max: number;
  userMatchTier2Pct: number;
  userMatchTier2Max: number;

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

  isCombinedView: boolean;
  isSidebarOpen: boolean;
  isFullScreenDashboard: boolean;
  chartType: 'growth' | 'annual';
  contributionModel: 'end-of-year' | 'beginning-of-year' | 'mid-year';
  theme: 'light' | 'dark';
}

export interface PersonYearData {
  age: number;
  startingBalanceNominal: number;
  startingBalanceReal: number;
  contributions: number;
  employerMatch: number;
  interestNominal: number;
  withdrawals: number;
  withdrawalDerivation?: string;
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

function App() {
  const [state, setState] = useState<AppState>({
    userAge: 30,
    retireAge: 65,
    userIncome: 100000,
    userContribution: 10000,
    currentBalanceUser: 50000,
    userMatchTier1Pct: 100,
    userMatchTier1Max: 3,
    userMatchTier2Pct: 50,
    userMatchTier2Max: 2,

    spouseAge: 32,
    spouseRetireAge: 65,
    spouseIncome: 80000,
    spouseContribution: 8000,
    spouseMatchTier1Pct: 100,
    spouseMatchTier1Max: 3,
    spouseMatchTier2Pct: 50,
    spouseMatchTier2Max: 2,
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
    contributionModel: 'mid-year',
    theme: 'dark',
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  const updateState = (key: keyof AppState, value: any) => {
    setState(prev => ({ ...prev, [key]: value }));
  };

  const projectionData = useMemo(() => {
    const data: YearData[] = [];
    
    let balanceUserNominal = state.currentBalanceUser;
    let balanceSpouseNominal = state.currentBalanceSpouse;

    const nominalRate = state.expectedReturn / 100;
    const inflationRate = state.inflation / 100;

    for (let yearIdx = 0; yearIdx <= (state.lifeExpectancy - state.userAge); yearIdx++) {
      const currentAgeUser = state.userAge + yearIdx;
      const currentAgeSpouse = state.spouseAge + yearIdx;
      const cumulativeInflation = Math.pow(1 + inflationRate, yearIdx);

      // --- USER CALCULATIONS ---
      let userCont = 0;
      let userMatch = 0;
      if (currentAgeUser < state.retireAge) {
        userCont = Math.min(state.userContribution, 24500); 
        // Tiered Match User
        const tier1Match = Math.min(state.userIncome * (state.userMatchTier1Max / 100), userCont) * (state.userMatchTier1Pct / 100);
        const userContAboveTier1 = Math.max(0, userCont - (state.userIncome * (state.userMatchTier1Max / 100)));
        const tier2Match = Math.min(state.userIncome * (state.userMatchTier2Max / 100), userContAboveTier1) * (state.userMatchTier2Pct / 100);
        userMatch = tier1Match + tier2Match;
      }

      // --- SPOUSE CALCULATIONS ---
      let spouseCont = 0;
      let spouseMatch = 0;
      if (state.hasSpouse && currentAgeSpouse < state.spouseRetireAge) {
        spouseCont = Math.min(state.spouseContribution, 24500);
        // Tiered Match Spouse
        const tier1MatchS = Math.min(state.spouseIncome * (state.spouseMatchTier1Max / 100), spouseCont) * (state.spouseMatchTier1Pct / 100);
        const spouseContAboveTier1 = Math.max(0, spouseCont - (state.spouseIncome * (state.spouseMatchTier1Max / 100)));
        const tier2MatchS = Math.min(state.spouseIncome * (state.spouseMatchTier2Max / 100), spouseContAboveTier1) * (state.spouseMatchTier2Pct / 100);
        spouseMatch = tier1MatchS + tier2MatchS;
      }

      // Interest — varies by contribution model
      let userInterest: number;
      let spouseInterest: number;
      const m = state.contributionModel;
      if (m === 'end-of-year') {
        // Interest first, then contributions added at end
        userInterest = balanceUserNominal * nominalRate;
        spouseInterest = state.hasSpouse ? balanceSpouseNominal * nominalRate : 0;
      } else if (m === 'mid-year') {
        // Half-year credit on contributions (payroll / most realistic)
        userInterest = (balanceUserNominal * nominalRate) + ((userCont + userMatch) * (nominalRate / 2));
        spouseInterest = state.hasSpouse ? (balanceSpouseNominal * nominalRate) + ((spouseCont + spouseMatch) * (nominalRate / 2)) : 0;
      } else {
        // beginning-of-year: contributions earn a full year of interest
        userInterest = (balanceUserNominal + userCont + userMatch) * nominalRate;
        spouseInterest = state.hasSpouse ? (balanceSpouseNominal + spouseCont + spouseMatch) * nominalRate : 0;
      }

      // Withdrawals
      let userWithdrawal = 0;
      let spouseWithdrawal = 0;
      let combinedWithdrawal = 0;
      let userDerivation = "";
      let spouseDerivation = "";
      let combinedDerivation = "";

      if (currentAgeUser >= state.retireAge) {
        const ssActive = currentAgeUser >= state.ssStartAgeUser;
        const ssOffset = ssActive ? state.socialSecurityUser * 12 : 0;
        const netNeed = Math.max(0, state.userWithdrawalRate - ssOffset);
        const inflationAdjusted = netNeed * cumulativeInflation;
        userWithdrawal = inflationAdjusted / (1 - (state.taxRate / 100));
        const ssLabel = ssActive ? `-$${(ssOffset).toLocaleString()}` : `$0 (starts age ${state.ssStartAgeUser})`;
        userDerivation = `PRIMARY:\n• Target: $${state.userWithdrawalRate.toLocaleString()}\n• SS Offset: ${ssLabel}\n• Net Need: $${netNeed.toLocaleString()}\n• Inflation (x${cumulativeInflation.toFixed(2)}): $${Math.round(inflationAdjusted).toLocaleString()}\n• Gross-up (/${(1-state.taxRate/100).toFixed(2)}): $${Math.round(userWithdrawal).toLocaleString()}`;
        combinedWithdrawal += userWithdrawal;
      }

      if (state.hasSpouse && currentAgeSpouse >= state.spouseRetireAge) {
        const ssActive = currentAgeSpouse >= state.ssStartAgeSpouse;
        const ssOffset = ssActive ? state.socialSecuritySpouse * 12 : 0;
        const netNeed = Math.max(0, state.spouseWithdrawalRate - ssOffset);
        const inflationAdjusted = netNeed * cumulativeInflation;
        spouseWithdrawal = inflationAdjusted / (1 - (state.taxRate / 100));
        const ssLabel = ssActive ? `-$${(ssOffset).toLocaleString()}` : `$0 (starts age ${state.ssStartAgeSpouse})`;
        spouseDerivation = `SPOUSE:\n• Target: $${state.spouseWithdrawalRate.toLocaleString()}\n• SS Offset: ${ssLabel}\n• Net Need: $${netNeed.toLocaleString()}\n• Inflation (x${cumulativeInflation.toFixed(2)}): $${Math.round(inflationAdjusted).toLocaleString()}\n• Gross-up (/${(1-state.taxRate/100).toFixed(2)}): $${Math.round(spouseWithdrawal).toLocaleString()}`;
        combinedWithdrawal += spouseWithdrawal;
      }

      if (combinedWithdrawal > 0) {
        combinedDerivation = `${userDerivation}${userDerivation && spouseDerivation ? '\n\n' : ''}${spouseDerivation}\n\nTOTAL HOUSEHOLD: $${Math.round(combinedWithdrawal).toLocaleString()}`;
      }

      const startingUser = balanceUserNominal;
      const startingSpouse = balanceSpouseNominal;

      balanceUserNominal = Math.max(0, balanceUserNominal + userCont + userMatch + userInterest - userWithdrawal);
      balanceSpouseNominal = state.hasSpouse ? Math.max(0, balanceSpouseNominal + spouseCont + spouseMatch + spouseInterest - spouseWithdrawal) : 0;

      data.push({
        yearIndex: yearIdx,
        userAge: currentAgeUser,
        user: {
          age: currentAgeUser,
          startingBalanceNominal: startingUser,
          startingBalanceReal: startingUser / cumulativeInflation,
          contributions: userCont,
          employerMatch: userMatch,
          interestNominal: userInterest,
          withdrawals: userWithdrawal,
          withdrawalDerivation: userDerivation,
          endingBalanceNominal: balanceUserNominal,
          endingBalanceReal: balanceUserNominal / cumulativeInflation,
        },
        spouse: {
          age: currentAgeSpouse,
          startingBalanceNominal: startingSpouse,
          startingBalanceReal: startingSpouse / cumulativeInflation,
          contributions: spouseCont,
          employerMatch: spouseMatch,
          interestNominal: spouseInterest,
          withdrawals: spouseWithdrawal,
          withdrawalDerivation: spouseDerivation,
          endingBalanceNominal: balanceSpouseNominal,
          endingBalanceReal: balanceSpouseNominal / cumulativeInflation,
        },
        combined: {
          startingBalanceNominal: startingUser + startingSpouse,
          startingBalanceReal: (startingUser + startingSpouse) / cumulativeInflation,
          contributions: userCont + spouseCont,
          employerMatch: userMatch + spouseMatch,
          interestNominal: userInterest + spouseInterest,
          withdrawals: combinedWithdrawal,
          withdrawalDerivation: combinedDerivation,
          endingBalanceNominal: balanceUserNominal + balanceSpouseNominal,
          endingBalanceReal: (balanceUserNominal + balanceSpouseNominal) / cumulativeInflation,
        }
      });
    }
    return data;
  }, [state]);

  return (
    <div className="app-container">
      <Sidebar isOpen={state.isSidebarOpen} state={state} updateState={updateState} />
      <div className={`main-content ${!state.isSidebarOpen ? 'sidebar-closed' : ''}`}>
        {!state.isFullScreenDashboard && <InputPanel state={state} updateState={updateState} />}
        <Dashboard data={projectionData} state={state} updateState={updateState} />
      </div>
      <ChatInterface state={state} data={projectionData} updateState={updateState} />
    </div>
  );
}

export default App;
