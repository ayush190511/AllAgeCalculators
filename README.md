# ⏳ AllAgeCalculators — Precision Multi-Page Age Engine

[![Live Website](https://img.shields.io/badge/Website-allagecalculators.com-0070f3?style=for-the-badge&logo=vercel&logoColor=white)](https://allagecalculators.com)
[![Built with Astro](https://img.shields.io/badge/Astro-5.0-FF5D01?style=for-the-badge&logo=astro&logoColor=white)](https://astro.build)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4.0-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

**[AllAgeCalculators (allagecalculators.com)](https://allagecalculators.com)** is a privacy-first, zero-latency, and multi-page web application engineered to deliver mathematically exact chronological age calculations, competitive examination eligibility verdicts, retirement progress tracking, and pet/pediatric age conversions.

---

## 🌟 Overview & Mission

Calculating age accurately sounds simple, but leap years, variable month lengths, official government cutoff dates (like UPSC's 1st August rule), and veterinary breed formulas make naive calculations inaccurate. 

**AllAgeCalculators** solves this by providing specialized, content-forward calculation engines built on a clean Vercel/Linear-inspired dark/light theme.

### 🔒 100% Client-Side Privacy Standard
Privacy is built into the architecture. All date of birth entries, time calculations, and user inputs **execute 100% client-side inside your browser via local JavaScript**. Your private date of birth is **never uploaded, logged, or transmitted** to any external server.

---

## 🚀 Specialized Calculation Engines

### 1. ⚡ Chronological Age & Live Ticker (`/`)
- **Exact Age Breakdown**: Calculates exact age in **Years, Months, and Days** with leap year normalization.
- **Live Second Ticker**: Provides a real-time down-to-the-second ticker when birth time is optionally added.
- **Lifetime Totals**: Displays total days lived, total hours, total weeks, and a countdown to the user's next birthday.

### 2. 🎯 UPSC CSE Rule 6 Cutoff Engine (`/upsc-age-calculator`)
- **Official 1st August Cutoff**: Evaluates exam eligibility strictly as of the official 1st August cutoff date for UPSC Civil Services Examination cycles (2024 through 2030).
- **Category & Relaxations**: Factors in General, EWS, OBC (+3 yrs, 9 attempts), SC/ST (+5 yrs, unlimited attempts), PwBD (+10 yrs), Ex-Servicemen (+5 yrs), and J&K Domicile relaxations.
- **Underage Eligibility Countdown**: For aspirants younger than 21, automatically calculates the **exact time remaining (Years, Months, Days) until their 21st birthday** and identifies their earliest eligible exam cycle year.

### 3. 🏖️ Retirement & Pension Age Countdown (`/retirement-age-calculator`)
- **Custom Career Joining Age**: Allows users to input their custom work joining age (default 22) to compute personalized **Career Milestone Progress (%)**.
- **Target Age Presets & Manual Input**: Quick presets for India Govt (60), State Pensions (58, 62, 65, 70), RMD Age (73), plus a **Manual Stepper** for custom target ages (e.g. 52, 55, 63).
- **Theme Stepper Controls**: Seamless `+` and `-` custom steppers with hidden browser spinners and focus rings.

### 4. 🐶 AVMA Dog Age Converter (`/dog-age-calculator`)
- **Veterinary Breed Size Adjustment**: Replaces the flawed "1 human year = 7 dog years" myth with American Veterinary Medical Association (AVMA) formulas tailored for Small, Medium, Large, and Giant dog breeds.
- **Life Stage Sleep Guidance**: Provides size-adjusted sleep requirements (12–18 hours/day) and life stage advice.

### 5. 👶 Pediatric Baby & Child Age Calculator (`/baby-age-calculator`)
- **Weeks & Months Precision**: Calculates baby age in exact weeks, months, and total days.
- **Premature Corrected Age**: Includes optional gestational age correction (for babies born before 37 weeks) to accurately track pediatric development milestones and school admission readiness.

### 6. ⏱️ Date Difference & Age Gap Tool (`/date-difference-calculator`)
- **Interval Duration**: Computes exact duration between any two historical or future dates with total days, hours, and minutes breakdowns.

---

## 🛠️ Technology Stack & Architecture

- **Framework**: [Astro 5](https://astro.build) (Static Site Generation for ultra-fast load times & zero JS overhead on static pages)
- **UI Components**: [React 19](https://react.dev) (Interactive calculation tools with hydration)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) + CSS Custom Variables for instant Theme Toggling (Light & Dark mode)
- **Icons**: [Lucide React](https://lucide.dev)
- **SEO & Structured Data**: Native Schema.org `FAQPage` JSON-LD integration with embedded `<p>` tags for search engines.

---

## 📁 Project Directory Structure

```text
age_calculator/
├── public/
│   ├── favicon.svg
│   └── og-image.png
├── src/
│   ├── components/
│   │   ├── Header.astro            # Responsive Navbar with touchscreen scroll bar & mobile drawer
│   │   ├── Footer.astro            # Site footer & floating "Back to Top" touch button
│   │   ├── SEOContent.astro        # On-Page SEO guide & 20+ Ahrefs JSON-LD FAQ schema
│   │   ├── RelaxationTable.tsx     # UPSC Category relaxation reference matrix
│   │   └── modes/
│   │       ├── NormalAgeMode.tsx   # Chronological age & live ticker tool
│   │       ├── UPSCMode.tsx        # Official UPSC 1st Aug cutoff & underage countdown
│   │       ├── RetirementMode.tsx  # Retirement countdown with custom joining age & stepper
│   │       ├── DogAgeMode.tsx      # AVMA dog years to human years converter
│   │       ├── BabyAgeMode.tsx     # Pediatric baby age & corrected age tool
│   │       └── DateDiffMode.tsx    # Date interval & age gap calculator
│   ├── lib/
│   │   ├── date-utils.ts           # Leap-year aware date mathematics library
│   │   ├── upsc-calculator.ts      # Rule 6 UPSC Civil Services eligibility engine
│   │   └── types.ts                # TypeScript interfaces & types
│   ├── pages/
│   │   ├── index.astro                     # Home / Main Age Calculator (/)
│   │   ├── upsc-age-calculator.astro       # UPSC Cutoff Engine (/upsc-age-calculator)
│   │   ├── retirement-age-calculator.astro # Retirement Countdown (/retirement-age-calculator)
│   │   ├── dog-age-calculator.astro        # Dog Age Tool (/dog-age-calculator)
│   │   ├── baby-age-calculator.astro       # Baby Age Tool (/baby-age-calculator)
│   │   ├── date-difference-calculator.astro# Date Difference Tool (/date-difference-calculator)
│   │   ├── about.astro                     # Mission & Privacy (/about)
│   │   ├── privacy-policy.astro            # 100% Client-Side Privacy Policy (/privacy-policy)
│   │   └── terms-and-conditions.astro      # Legal Terms (/terms-and-conditions)
│   └── styles/
│       └── global.css              # Custom Tailwind v4 tokens & animation utilities
├── astro.config.mjs
└── package.json
```

---

## 💻 Local Development & Build

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ayush190511/AllAgeCalculators.git
   cd AllAgeCalculators
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:4321` to view the app.

4. **Build production bundle**:
   ```bash
   npm run build
   ```
   This generates static HTML/CSS/JS output in the `dist/` directory ready for deployment on Vercel, Netlify, or Cloudflare Pages.

---

## 📄 License & Independence Disclaimer

- **License**: Released under the [MIT License](LICENSE).
- **Disclaimer**: AllAgeCalculators (`allagecalculators.com`) is an independent educational technology project. It is **NOT** affiliated with, endorsed by, or connected to the Union Public Service Commission (UPSC), any government ministry, or any official entity. Candidates must verify official exam notifications at [upsc.gov.in](https://upsc.gov.in).
