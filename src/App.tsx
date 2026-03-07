import { useState, useMemo } from 'react';
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
  socialSecuritySpouse: number; // Monthly
  taxRate: number; // Percentage
  enableStressTest: boolean;

  isCombinedView: boolean;
  isSidebarOpen: boolean;
  isFullScreenDashboard: boolean;
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

    spouseAge: 30,
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
    socialSecuritySpouse: 0,
    taxRate: 15,
    enableStressTest: false,
    isCombinedView: true,
    isSidebarOpen: false,
    isFullScreenDashboard: false,
  });

  const updateState = (key: keyof AppState, value: number | boolean) => {
    setState(prev => ({ ...prev, [key]: value }));
  };

  const projectionData = useMemo(() => {
    const data: YearData[] = [];
    
    let balanceUserNominal = state.currentBalanceUser;
    let balanceSpouseNominal = state.currentBalanceSpouse;

    const nominalRate = state.expectedReturn / 100;
    const inflationRate = state.inflation / 100;

    const maxYearsToLive = state.lifeExpectancy - Math.min(state.userAge, state.spouseAge);

    for (let i = 0; i <= maxYearsToLive; i++) {
      const currentUserAge = state.userAge + i;
      const currentSpouseAge = state.spouseAge + i;
      
      const isUserRetired = currentUserAge >= state.retireAge;
      const isSpouseRetired = currentSpouseAge >= state.spouseRetireAge;

      // IRS Limits Logic (2024/2025 approx)
      const maxUserCont = currentUserAge >= 50 ? 31000 : 23500;
      const maxSpouseCont = currentSpouseAge >= 50 ? 31000 : 23500;

      const actualUserCont = isUserRetired ? 0 : Math.min(state.userContribution, maxUserCont);
      const actualSpouseCont = (isSpouseRetired || !state.hasSpouse) ? 0 : Math.min(state.spouseContribution, maxSpouseCont);

      // Tiered Match Helper
      const calcMatch = (income: number, contrib: number, t1P: number, t1M: number, t2P: number, t2M: number) => {
        if (income <= 0 || contrib <= 0) return 0;
        const contribPct = (contrib / income) * 100;
        const matchT1Pct = Math.min(contribPct, t1M);
        const matchT1Amt = (matchT1Pct / 100) * (t1P / 100) * income;
        let matchT2Amt = 0;
        if (contribPct > t1M) {
          const matchT2Pct = Math.min(contribPct - t1M, t2M);
          matchT2Amt = (matchT2Pct / 100) * (t2P / 100) * income;
        }
        return matchT1Amt + matchT2Amt;
      };

      const userMatch = isUserRetired ? 0 : calcMatch(state.userIncome, state.userContribution, state.userMatchTier1Pct, state.userMatchTier1Max, state.userMatchTier2Pct, state.userMatchTier2Max);
      const spouseMatch = (isSpouseRetired || !state.hasSpouse) ? 0 : calcMatch(state.spouseIncome, state.spouseContribution, state.spouseMatchTier1Pct, state.spouseMatchTier1Max, state.spouseMatchTier2Pct, state.spouseMatchTier2Max);

      // Discount factor for inflation (determines how much more nominal $ is needed to buy the same real goods)
      const inflationMultiplier = Math.pow(1 + inflationRate, i);

      // Effective tax rate logic (gross up the withdrawal to cover taxes)
      const taxMultiplier = 1 / (1 - state.taxRate / 100);
      
      // Social Security offsets
      const annualSSUser = state.socialSecurityUser * 12;
      const annualSSSpouse = state.socialSecuritySpouse * 12;

      // Withdrawals: Inflate the user's input so their *real* net purchasing power stays flat.
      let userWithdrawal = 0;
      let userDerivation = "";
      let spouseWithdrawal = 0;
      let spouseDerivation = "";
      
      const format = (v: number) => Math.round(v).toLocaleString();

      if (isUserRetired) {
        const netAfterSS = Math.max(0, state.userWithdrawalRate - annualSSUser);
        const inflated = netAfterSS * inflationMultiplier;
        const grossed = inflated * taxMultiplier;
        userWithdrawal = Math.min(balanceUserNominal, grossed);
        
        userDerivation = `PRIMARY:\n1. Target Lifestyle: $${format(state.userWithdrawalRate)}\n2. Minus Social Security: -$${format(annualSSUser)}\n3. Net Need (Today's $): $${format(netAfterSS)}\n4. Adjusted for Inflation (${inflationMultiplier.toFixed(2)}x): $${format(inflated)}\n5. Grossed up for ${state.taxRate}% Tax: $${format(grossed)}`;
        if (userWithdrawal < grossed) userDerivation += `\n⚠️ Capped by Balance`;
      }
      
      if (isSpouseRetired && state.hasSpouse) {
        const netAfterSS = Math.max(0, state.spouseWithdrawalRate - annualSSSpouse);
        const inflated = netAfterSS * inflationMultiplier;
        const grossed = inflated * taxMultiplier;
        spouseWithdrawal = Math.min(balanceSpouseNominal, grossed);

        spouseDerivation = `SPOUSE:\n1. Target Lifestyle: $${format(state.spouseWithdrawalRate)}\n2. Minus Social Security: -$${format(annualSSSpouse)}\n3. Net Need (Today's $): $${format(netAfterSS)}\n4. Adjusted for Inflation (${inflationMultiplier.toFixed(2)}x): $${format(inflated)}\n5. Grossed up for ${state.taxRate}% Tax: $${format(grossed)}`;
        if (spouseWithdrawal < grossed) spouseDerivation += `\n⚠️ Capped by Balance`;
      }

      // Check Stress Test (-30% in first 2 years of retirement)
      const userYearsRetired = currentUserAge - state.retireAge;
      const spouseYearsRetired = currentSpouseAge - state.spouseRetireAge;
      const userIsStressed = state.enableStressTest && userYearsRetired >= 0 && userYearsRetired < 2;
      const spouseIsStressed = state.enableStressTest && spouseYearsRetired >= 0 && spouseYearsRetired < 2;
      
      const userRate = userIsStressed ? -0.30 : nominalRate;
      const spouseRate = spouseIsStressed ? -0.30 : nominalRate;

      // User calculations
      const userStart = balanceUserNominal;
      const userBase = balanceUserNominal + actualUserCont + userMatch - userWithdrawal;
      const userInterest = userBase > 0 ? userBase * userRate : 0;
      balanceUserNominal = Math.max(0, userBase + userInterest);

      // Spouse calculations
      const spouseStart = state.hasSpouse ? balanceSpouseNominal : 0;
      let spouseInterest = 0;
      if (state.hasSpouse) {
        const spouseBase = balanceSpouseNominal + actualSpouseCont + spouseMatch - spouseWithdrawal;
        spouseInterest = spouseBase > 0 ? spouseBase * spouseRate : 0;
        balanceSpouseNominal = Math.max(0, spouseBase + spouseInterest);
      } else {
        balanceSpouseNominal = 0;
      }

      const combinedWithdrawal = userWithdrawal + (state.hasSpouse ? spouseWithdrawal : 0);
      const combinedDerivation = userDerivation + (state.hasSpouse ? ("\n\n" + spouseDerivation + `\n\nTOTAL HOUSEHOLD: $${format(userWithdrawal + spouseWithdrawal)}`) : "");

      // Discount factor for Real Values
      const discountFactor = inflationMultiplier;

      data.push({
        yearIndex: i,
        userAge: currentUserAge,
        user: {
          age: currentUserAge,
          startingBalanceNominal: userStart,
          startingBalanceReal: userStart / discountFactor,
          contributions: actualUserCont,
          employerMatch: userMatch,
          interestNominal: userInterest,
          withdrawals: userWithdrawal,
          withdrawalDerivation: userDerivation,
          endingBalanceNominal: balanceUserNominal,
          endingBalanceReal: balanceUserNominal / discountFactor
        },
        spouse: {
          age: currentSpouseAge,
          startingBalanceNominal: spouseStart,
          startingBalanceReal: spouseStart / discountFactor,
          contributions: actualSpouseCont,
          employerMatch: spouseMatch,
          interestNominal: spouseInterest,
          withdrawals: spouseWithdrawal,
          withdrawalDerivation: spouseDerivation,
          endingBalanceNominal: balanceSpouseNominal,
          endingBalanceReal: balanceSpouseNominal / discountFactor
        },
        combined: {
          startingBalanceNominal: userStart + spouseStart,
          startingBalanceReal: (userStart + spouseStart) / discountFactor,
          contributions: actualUserCont + actualSpouseCont,
          employerMatch: userMatch + spouseMatch,
          interestNominal: userInterest + spouseInterest,
          withdrawals: combinedWithdrawal,
          withdrawalDerivation: combinedDerivation,
          endingBalanceNominal: balanceUserNominal + balanceSpouseNominal,
          endingBalanceReal: (balanceUserNominal + balanceSpouseNominal) / discountFactor
        }
      });
    }
    
    return data;
  }, [state]);

  return (
    <div className="app-container" style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>
      
      {state.isSidebarOpen && <Sidebar state={state} updateState={updateState} />}
      
      {!state.isFullScreenDashboard && (
        <InputPanel state={state} updateState={updateState} />
      )}
      
      <Dashboard data={projectionData} state={state} updateState={updateState} />
      
      <ChatInterface state={state} updateState={updateState} data={projectionData} />
    </div>
  );
}

export default App;
