import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { AppState } from '../App';
import { calculateProjection } from './projection';

const formatCurrency = (value: number) => `$${Math.round(value).toLocaleString()}`;

export const generatePDFReport = (state: AppState) => {
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.height;
  
  // Custom brand colors (Fidelity-esque)
  const primaryColor = [22, 163, 74]; // Green
  const secondaryColor = [30, 58, 138]; // Blue
  
  doc.setFont('helvetica', 'normal');
  
  // --- Header ---
  doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('AURA PLAN', 14, 25);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Comprehensive Retirement Projection Report', 14, 33);
  
  // --- Summary Intro ---
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Projection Summary', 14, 55);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Prepared for: Primary (Age ${state.userAge})${state.hasSpouse ? ` & Spouse (Age ${state.spouseAge})` : ''}`, 14, 63);
  doc.text(`Life Expectancy: Age ${state.lifeExpectancy}`, 14, 69);
  doc.text(`Expected Nominal Return: ${state.expectedReturn}% | Expected Inflation: ${state.inflation}%`, 14, 75);
  doc.text(`Simulated Withdrawal Target (Today's $): ${formatCurrency(state.userWithdrawalRate + (state.hasSpouse ? state.spouseWithdrawalRate : 0))} / year`, 14, 81);

  // --- Run Projections For All Models ---
  const models = ['end-of-year', 'mid-year', 'beginning-of-year'] as const;
  const projections = models.map(model => {
    const modelState = { ...state, contributionModel: model };
    const data = calculateProjection(modelState);
    const dYear = data.find(d => d.combined.endingBalanceNominal === 0 && d.userAge > state.retireAge);
    const hasMoneyAtEnd = !dYear;
    const depletionAge = dYear ? dYear.userAge : state.lifeExpectancy;
    const retirementYear = data.find(d => d.userAge === state.retireAge);
    const legacy = data[data.length - 1]; // Age 90+

    return {
      model,
      data,
      hasMoneyAtEnd,
      depletionAge,
      retireBalance: retirementYear ? retirementYear.combined.startingBalanceNominal : 0,
      legacyNominal: legacy ? legacy.combined.endingBalanceNominal : 0,
      legacyReal: legacy ? legacy.combined.endingBalanceReal : 0
    };
  });

  // --- Model Comparison Table ---
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Contribution Timing Impact Matrix', 14, 100);

  const tableData = projections.map(p => [
    p.model.replace(/-/g, ' ').toUpperCase(),
    p.hasMoneyAtEnd ? 'Fully Funded' : `Depleted at Age ${p.depletionAge}`,
    formatCurrency(p.retireBalance),
    formatCurrency(p.legacyNominal),
    formatCurrency(p.legacyReal)
  ]);

  autoTable(doc, {
    startY: 105,
    head: [['Timing Model', 'Runway Status', 'Retirement Balance', 'Legacy (Nominal)', 'Legacy (Real)']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: primaryColor as any, textColor: 255, halign: 'center' },
    bodyStyles: { halign: 'center' },
    columnStyles: { 0: { halign: 'left', fontStyle: 'bold' } }
  });

  // --- Detailed Yearly Breakdown (using the user's currently selected model) ---
  const activeModelStr = state.contributionModel;
  const activeProjection = projections.find(p => p.model === activeModelStr) || projections[0];
  
  let finalY = (doc as any).lastAutoTable.finalY || 100;
  
  if (finalY + 30 > pageHeight) {
    doc.addPage();
    finalY = 20;
  } else {
    finalY += 20;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50, 50, 50);
  doc.text(`Detailed Trajectory: ${activeModelStr.replace(/-/g, ' ').toUpperCase()} (Current Selection)`, 14, finalY);

  // Filter data to decadal/key milestones to avoid overwhelming PDF length
  const keyAges = [40, 50, 60, state.retireAge, 70, 80, state.lifeExpectancy];
  if (state.hasSpouse && !keyAges.includes(state.spouseRetireAge)) {
    keyAges.push(state.spouseRetireAge);
  }
  
  const detailData = activeProjection.data
    .filter(d => keyAges.includes(d.userAge) || d.userAge === activeProjection.depletionAge || d.userAge === state.userAge)
    .sort((a, b) => a.userAge - b.userAge)
    .map(d => [
      d.userAge,
      formatCurrency(d.combined.startingBalanceNominal),
      formatCurrency(d.combined.contributions + d.combined.employerMatch),
      formatCurrency(d.combined.interestNominal),
      formatCurrency(d.combined.withdrawals),
      formatCurrency(d.combined.endingBalanceNominal)
    ]);

  autoTable(doc, {
    startY: finalY + 5,
    head: [['Age', 'Start Balance', 'Total Cont.', 'Interest Gained', 'Withdrawals', 'End Balance']],
    body: detailData,
    theme: 'grid',
    headStyles: { fillColor: secondaryColor as any, textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] as any }
  });

  // --- Footer ---
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Generated by Aura Plan on ${new Date().toLocaleDateString()}`, 14, pageHeight - 10);
    doc.text(`Page ${i} of ${pageCount}`, 190, pageHeight - 10, { align: 'right' });
  }

  doc.save('AuraPlan_Retirement_Projection.pdf');
};
