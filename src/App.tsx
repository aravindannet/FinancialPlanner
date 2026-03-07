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
  userMatchPct: number;
  currentBalanceUser: number;

  spouseAge: number;
  spouseRetireAge: number;
  spouseIncome: number;
  spouseContribution: number;
  spouseMatchPct: number;
  currentBalanceSpouse: number;

  lifeExpectancy: number;
  expectedReturn: number;
  inflation: number;
  userWithdrawalRate: number; 
  spouseWithdrawalRate: number; 
  
  socialSecurity: number; // Monthly
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
    userMatchPct: 5,
    currentBalanceUser: 50000,

    spouseAge: 30,
    spouseRetireAge: 65,
    spouseIncome: 80000,
    spouseContribution: 8000,
    spouseMatchPct: 5,
    currentBalanceSpouse: 30000,

    lifeExpectancy: 90,
    expectedReturn: 7,
    inflation: 2.5,
    userWithdrawalRate: 60000,
    spouseWithdrawalRate: 60000,
    socialSecurity: 0,
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
      const actualSpouseCont = isSpouseRetired ? 0 : Math.min(state.spouseContribution, maxSpouseCont);

      const userMatch = isUserRetired ? 0 : state.userIncome * (state.userMatchPct / 100);
      const spouseMatch = isSpouseRetired ? 0 : state.spouseIncome * (state.spouseMatchPct / 100);

      // Discount factor for inflation (determines how much more nominal $ is needed to buy the same real goods)
      const inflationMultiplier = Math.pow(1 + inflationRate, i);

      // Effective tax rate logic (gross up the withdrawal to cover taxes)
      const taxMultiplier = 1 / (1 - state.taxRate / 100);
      
      // Social Security offsets
      const annualSS = state.socialSecurity * 12;

      // Withdrawals: Inflate the user's input so their *real* net purchasing power stays flat.
      let userWithdrawal = 0;
      let userDerivation = "";
      let spouseWithdrawal = 0;
      let spouseDerivation = "";
      
      const format = (v: number) => Math.round(v).toLocaleString();

      if (isUserRetired) {
        const netAfterSS = Math.max(0, state.userWithdrawalRate - annualSS);
        const inflated = netAfterSS * inflationMultiplier;
        const grossed = inflated * taxMultiplier;
        userWithdrawal = Math.min(balanceUserNominal, grossed);
        
        userDerivation = `PRIMARY:\n• Current Year Expected Withdrawal: $${format(state.userWithdrawalRate)}\n• SS = $${format(annualSS)}\n• Today's "$${format(netAfterSS)}" after inflation adjusted is ($${format(netAfterSS)} * ${inflationMultiplier.toFixed(2)}) = $${format(inflated)}\n• If you want to take "$${format(inflated)}" from above then with ${state.taxRate}% tax from input you need to take out = $${format(grossed)}`;
        if (userWithdrawal < grossed) userDerivation += `\n⚠️ Capped by Balance`;
      }
      
      if (isSpouseRetired) {
        const netAfterSS = Math.max(0, state.spouseWithdrawalRate - annualSS);
        const inflated = netAfterSS * inflationMultiplier;
        const grossed = inflated * taxMultiplier;
        spouseWithdrawal = Math.min(balanceSpouseNominal, grossed);

        spouseDerivation = `SPOUSE:\n• Current Year Expected Withdrawal: $${format(state.spouseWithdrawalRate)}\n• SS = $${format(annualSS)}\n• Today's "$${format(netAfterSS)}" after inflation adjusted is ($${format(netAfterSS)} * ${inflationMultiplier.toFixed(2)}) = $${format(inflated)}\n• If you want to take "$${format(inflated)}" from above then with ${state.taxRate}% tax from input you need to take out = $${format(grossed)}`;
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
      const spouseStart = balanceSpouseNominal;
      const spouseBase = balanceSpouseNominal + actualSpouseCont + spouseMatch - spouseWithdrawal;
      const spouseInterest = spouseBase > 0 ? spouseBase * spouseRate : 0;
      balanceSpouseNominal = Math.max(0, spouseBase + spouseInterest);

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
          withdrawals: userWithdrawal + spouseWithdrawal,
          withdrawalDerivation: (userDerivation || spouseDerivation) 
            ? `${userDerivation}${userDerivation && spouseDerivation ? '\n\n' : ''}${spouseDerivation}${userDerivation && spouseDerivation ? `\n\nTOTAL HOUSEHOLD: $${format(userWithdrawal + spouseWithdrawal)}` : ''}`
            : undefined,
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
