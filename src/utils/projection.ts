import type { AppState, YearData } from '../App';

export const calculateProjection = (state: AppState): YearData[] => {
  const data: YearData[] = [];
  
  let balanceUserNominal = state.currentBalanceUser;
  let balanceSpouseNominal = state.currentBalanceSpouse;

  const nominalRate = state.expectedReturn / 100;
  const inflationRate = state.inflation / 100;

  for (let yearIdx = 0; yearIdx <= (state.lifeExpectancy - state.userAge); yearIdx++) {
    const currentAgeUser = state.userAge + yearIdx;
    const currentAgeSpouse = state.spouseAge + yearIdx;
    const cumulativeInflation = Math.pow(1 + inflationRate, yearIdx);
    const yearlyReturn = nominalRate;

    // Income
    const currentIncomeUser = currentAgeUser < state.retireAge 
      ? state.userIncome * Math.pow(1 + (state.salaryGrowthUser / 100), yearIdx)
      : 0;
    
    const currentIncomeSpouse = state.hasSpouse && currentAgeSpouse < state.spouseRetireAge
      ? state.spouseIncome * Math.pow(1 + (state.salaryGrowthSpouse / 100), yearIdx)
      : 0;

    // Contributions & Match
    let userCont = 0;
    let userMatch = 0;
    if (currentAgeUser < state.retireAge) {
      const baseCont = state.userContributionType === 'dollar' 
        ? state.userContribution 
        : (currentIncomeUser * (state.userContribution / 100));
      
      let catchUp = 0;
      if (currentAgeUser >= 60) {
        catchUp = state.catchUp60User;
      } else if (currentAgeUser >= 50) {
        catchUp = state.catchUp50User;
      }

      userCont = baseCont + catchUp;

      const tier1Amount = currentIncomeUser * (state.userMatchTier1Max / 100);
      const tier1Match = tier1Amount * (state.userMatchTier1Pct / 100);
      const tier2Amount = currentIncomeUser * (state.userMatchTier2Max / 100);
      const tier2Match = tier2Amount * (state.userMatchTier2Pct / 100);
      userMatch = Math.min(userCont, tier1Match + tier2Match);
    }

    let spouseCont = 0;
    let spouseMatch = 0;
    if (state.hasSpouse && currentAgeSpouse < state.spouseRetireAge) {
      const baseCont = state.spouseContributionType === 'dollar' 
        ? state.spouseContribution 
        : (currentIncomeSpouse * (state.spouseContribution / 100));
      
      let catchUp = 0;
      if (currentAgeSpouse >= 60) {
        catchUp = state.catchUp60Spouse;
      } else if (currentAgeSpouse >= 50) {
        catchUp = state.catchUp50Spouse;
      }

      spouseCont = baseCont + catchUp;

      const tier1Amount = currentIncomeSpouse * (state.spouseMatchTier1Max / 100);
      const tier1Match = tier1Amount * (state.spouseMatchTier1Pct / 100);
      const tier2Amount = currentIncomeSpouse * (state.spouseMatchTier2Max / 100);
      const tier2Match = tier2Amount * (state.spouseMatchTier2Pct / 100);
      spouseMatch = Math.min(spouseCont, tier1Match + tier2Match);
    }

    // Stress Test Logic
    let appliedReturnUser = yearlyReturn;
    let appliedReturnSpouse = yearlyReturn;

    if (state.enableStressTest) {
      if (currentAgeUser === state.stressTestAge) {
        appliedReturnUser = -0.37;
      }
      if (state.hasSpouse && currentAgeSpouse === state.stressTestAge) {
        appliedReturnSpouse = -0.37;
      }
    }

    // Interest
    let userInterest: number;
    let spouseInterest: number;
    const m = state.contributionModel;
    if (m === 'end-of-year') {
      userInterest = balanceUserNominal * appliedReturnUser;
      spouseInterest = state.hasSpouse ? balanceSpouseNominal * appliedReturnSpouse : 0;
    } else if (m === 'mid-year') {
      userInterest = (balanceUserNominal * appliedReturnUser) + ((userCont + userMatch) * (appliedReturnUser / 2));
      spouseInterest = state.hasSpouse ? (balanceSpouseNominal * appliedReturnSpouse) + ((spouseCont + spouseMatch) * (appliedReturnSpouse / 2)) : 0;
    } else {
      userInterest = (balanceUserNominal + userCont + userMatch) * appliedReturnUser;
      spouseInterest = state.hasSpouse ? (balanceSpouseNominal + spouseCont + spouseMatch) * appliedReturnSpouse : 0;
    }

    // Withdrawals
    let userWithdrawal = 0;
    let spouseWithdrawal = 0;
    let combinedWithdrawal = 0;
    let userDerivation = "";
    let spouseDerivation = "";
    let combinedDerivation = "";

    if (currentAgeUser >= state.retireAge && currentAgeUser >= state.withdrawalStartAge) {
      const ssActive = currentAgeUser >= state.ssStartAgeUser;
      const ssOffset = ssActive ? state.socialSecurityUser * 12 : 0;
      const netNeed = Math.max(0, state.userWithdrawalRate - ssOffset);
      const inflationAdjusted = netNeed * cumulativeInflation;
      
      const penaltyRate = (currentAgeUser < 60 && state.applyEarlyPenalty) ? 0.10 : 0;
      const totalTaxAndPenalty = (state.taxRate / 100) + penaltyRate;
      
      userWithdrawal = inflationAdjusted / (1 - totalTaxAndPenalty);
      const ssLabel = ssActive ? `-$${(ssOffset).toLocaleString()}` : `$0 (starts age ${state.ssStartAgeUser})`;
      const penaltyLabel = penaltyRate > 0 ? ` + 10% Penalty` : '';
      userDerivation = `PRIMARY:\n• Take Home Value: $${state.userWithdrawalRate.toLocaleString()}\n• Social Security Received: ${ssLabel}\n• Net Take Home: $${netNeed.toLocaleString()}\n• Net Take Home Adjusted to Inflation (x${cumulativeInflation.toFixed(2)}): $${Math.round(inflationAdjusted).toLocaleString()}\n• Gross Amount required to withdraw (Tax ${state.taxRate}%${penaltyLabel}): $${Math.round(userWithdrawal).toLocaleString()}`;
      combinedWithdrawal += userWithdrawal;
    }

    if (state.hasSpouse && currentAgeSpouse >= state.spouseRetireAge && currentAgeUser >= state.withdrawalStartAge) {
      const ssActive = currentAgeSpouse >= state.ssStartAgeSpouse;
      const ssOffset = ssActive ? state.socialSecuritySpouse * 12 : 0;
      const netNeed = Math.max(0, state.spouseWithdrawalRate - ssOffset);
      const inflationAdjusted = netNeed * cumulativeInflation;
      
      const penaltyRate = (currentAgeSpouse < 60 && state.applyEarlyPenalty) ? 0.10 : 0;
      const totalTaxAndPenalty = (state.taxRate / 100) + penaltyRate;
      
      spouseWithdrawal = inflationAdjusted / (1 - totalTaxAndPenalty);
      const ssLabel = ssActive ? `-$${(ssOffset).toLocaleString()}` : `$0 (starts age ${state.ssStartAgeSpouse})`;
      const penaltyLabel = penaltyRate > 0 ? ` + 10% Penalty` : '';
      spouseDerivation = `SPOUSE:\n• Take Home Value: $${state.spouseWithdrawalRate.toLocaleString()}\n• Social Security Received: ${ssLabel}\n• Net Take Home: $${netNeed.toLocaleString()}\n• Net Take Home Adjusted to Inflation (x${cumulativeInflation.toFixed(2)}): $${Math.round(inflationAdjusted).toLocaleString()}\n• Gross Amount required to withdraw (Tax ${state.taxRate}%${penaltyLabel}): $${Math.round(spouseWithdrawal).toLocaleString()}`;
      combinedWithdrawal += spouseWithdrawal;
    }

    if (combinedWithdrawal > 0) {
      const netHousehold = state.userWithdrawalRate + (state.hasSpouse ? state.spouseWithdrawalRate : 0);
      combinedDerivation = `${userDerivation}${userDerivation && spouseDerivation ? '\n\n' : ''}${spouseDerivation}\n\n` +
        `TOTAL HOUSEHOLD:\n` +
        `• Total Household Net (Today's $): $${netHousehold.toLocaleString()}\n` +
        `• Total Household Gross (Nominal): $${Math.round(combinedWithdrawal).toLocaleString()}\n` +
        `• Before Inflation (Net): $${netHousehold.toLocaleString()}\n` +
        `• After Inflation (Real Value): $${Math.round(combinedWithdrawal / cumulativeInflation).toLocaleString()}`;
    }

    const startingUser = balanceUserNominal;
    const startingSpouse = balanceSpouseNominal;

    // Cap withdrawals to available balance (pre-withdrawal balance)
    const preWithdrawalUser = Math.max(0, balanceUserNominal + userCont + userMatch + userInterest);
    const preWithdrawalSpouse = state.hasSpouse ? Math.max(0, balanceSpouseNominal + spouseCont + spouseMatch + spouseInterest) : 0;

    const actualUserWithdrawal = Math.min(userWithdrawal, preWithdrawalUser);
    const actualSpouseWithdrawal = Math.min(spouseWithdrawal, preWithdrawalSpouse);

    balanceUserNominal = Math.max(0, preWithdrawalUser - actualUserWithdrawal);
    balanceSpouseNominal = state.hasSpouse ? Math.max(0, preWithdrawalSpouse - actualSpouseWithdrawal) : 0;

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
        withdrawals: actualUserWithdrawal,
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
        withdrawals: actualSpouseWithdrawal,
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
        withdrawals: actualUserWithdrawal + actualSpouseWithdrawal,
        withdrawalDerivation: combinedDerivation,
        endingBalanceNominal: balanceUserNominal + balanceSpouseNominal,
        endingBalanceReal: (balanceUserNominal + balanceSpouseNominal) / cumulativeInflation,
      }
    });
  }

  return data;
};
