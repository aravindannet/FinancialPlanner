# Aura Plan - Advanced Financial Planner

Aura Plan is a premium, high-fidelity 401k retirement planning application built with **React**, **TypeScript**, and **Vite**. It features a custom **glassmorphism** design system and an advanced financial projection engine.

## 🚀 Key Features

- **Advanced Retirement Intel**:
  - **Social Security Integration**: Offset your withdrawal needs with expected monthly Social Security income (configurable start ages: 62, 67, 70).
  - **Tax-Adjusted Withdrawals**: Automatically "grosses up" retirement withdrawals to cover estimated effective taxes.
  - **Early Wealth Controls**: Specialized logic for early retirees (age < 60) with options to defer withdrawals or apply a 10% IRS penalty.
  - **Inflation Protection**: Set goals in *today's dollars*; the engine adjusts for inflation every year to protect purchasing power.
- **Robust Financial Engine**:
  - **Plan Runway Metric**: Instantly see at what age your funds will deplete, with visual alerts if you run out early.
  - **Bad Market Stress Test**: Fixed and verified 2008 Crash simulation (-37% in Year 1) to test portfolio durability.
  - **IRS 401k Limit Validation**: Intelligently caps contributions at the annual maximums.
- **Premium UI/UX**:
  - **Dynamic Area Charts**: Visualize Nominal vs Real growth with gradients and million-dollar scale formatting.
  - **Dual View Modes**: Switch between **Combined Household** health and **Separate** individual breakdowns.
  - **Full-Screen Data Grid**: Expand the dashboard to fill the entire screen for deep data analysis.
  - **Glassmorphism Design**: A sleek dark-mode interface with blurred surfaces and fluid micro-animations.

## 🧮 How the Math Works

### The SS & Tax Logic
1. **Net Need**: Your `Desired Withdrawal` minus `Annual Social Security`.
2. **Gross-Up**: `Net Need / (1 - Tax Rate)` ensures you have enough for both bills and the IRS.
3. **Compound Growth**: Yearly returns are calculated based on your `Expected Return` assumptions.

### Nominal vs. Real Value
- **Nominal**: The "Sticker Price" - what your bank account statement will actually say.
- **Real**: Adjusted for inflation - what those dollars are actually *worth* in today's purchasing power.

## 🛠️ Tech Stack

- **Core**: React 18, TypeScript, Vite
- **Styling**: Vanilla CSS (CSS Variables, Flexbox/Grid)
- **Charts**: Recharts (ComposedChart for Area/Line overlays)
- **Icons**: Lucide-React

## 📦 Getting Started

1. **Clone and Install**:
   ```bash
   git clone https://github.com/aravindannet/FinancialPlanner.git
   cd FinancialPlanner
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```

## 📝 Branching Strategy
- **`master`**: Stable production code.
- **`Develop`**: Integration branch for new features.
- **`Feature`**: Individual feature development work.

