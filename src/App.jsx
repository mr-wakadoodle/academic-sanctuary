import { useState, useEffect, useRef } from "react";

// ============================================================
// DATA LAYER — Single source of truth for the entire app
// Future: Replace with API fetch for multi-user support
// ============================================================
const USER_DATA = {
  name: "Mani",
  program: "MS in Finance (Quantitative Finance Track)",
  university: "Boston College",
  school: "Carroll School of Management",
  enrollmentSemester: "Fall 2026",
  i20Amount: 110275,
  funding: {
    hdfcLoan: { label: "HDFC Credila Education Loan", amountINR: 9100000, amountUSD: 96809 },
    scholarship: { label: "Boston College Merit Scholarship", amountUSD: 10000 },
    fatherSavings: { label: "Father's Savings", amountUSD: 12906 },
  },
  get totalSecured() {
    return this.funding.hdfcLoan.amountUSD + this.funding.scholarship.amountUSD + this.funding.fatherSavings.amountUSD;
  },
  get fundingPercent() {
    return Math.min(Math.round((this.totalSecured / this.i20Amount) * 100), 100);
  },
  get surplus() {
    return this.totalSecured - this.i20Amount;
  },
};

const EXPENSE_DEFAULTS = {
  tuition: 69500,
  healthInsurance: 4403,
  studentFees: 116,
  rent: 1400,
  food: 550,
  transport: 90,
  personal: 200,
  flights: 1200,
  sevisFee: 350,
  visaFee: 185,
  biometrics: 50,
  exchangeRate: 94,
};

const MILESTONES = [
  {
    id: "sanction",
    title: "Sanction Letter",
    date: "April '26",
    subtitle: "Loan Approval Phase",
    icon: "description",
    description: "Securing the official commitment from your financial institution.",
    status: "completed",
    completedDate: "April 12, 2026",
    tasks: [
      { text: "Get property valuation", done: true },
      { text: "Sign final application", done: true },
      { text: "Submit KYC documents", done: true },
    ],
  },
  {
    id: "i20",
    title: "I-20 Receipt",
    date: "May '26",
    subtitle: "University Admission Finalization",
    icon: "school",
    description: "The essential document for your F-1 student visa status.",
    status: "in-progress",
    tasks: [
      { text: "Submit proof of funding to University", done: true },
      { text: "Review SEVIS information", done: false },
      { text: "Pay SEVIS fee ($350)", done: false },
    ],
  },
  {
    id: "visa",
    title: "Visa Interview",
    date: "June '26",
    subtitle: "The Final Gateway",
    icon: "travel_explore",
    description: "Your conversation with the consulate to finalize your journey.",
    status: "upcoming",
    tasks: [
      { text: "Book Biometrics appointment", done: false },
      { text: "Mock interview preparation", done: false },
      { text: "Organize document folder", done: false },
    ],
  },
];

const LENDERS = [
  {
    id: "sbi",
    name: "SBI Global Ed-Vantage",
    category: "Government Trusted",
    pros: ["Lowest interest rates (Floating) starting at 8.55%", "Tax benefits under Section 80E"],
    cons: ["Requires tangible collateral (Property/Fixed Deposit)", "Processing time can take up to 4-6 weeks"],
    maxAmount: "Up to ₹1.5 Cr",
    coverage: "India",
    tags: ["collateral"],
  },
  {
    id: "prodigy",
    name: "Prodigy Finance",
    category: "Fintech Specialist",
    pros: ["No collateral or co-signer required for top universities", "Completely digital application & disbursement"],
    cons: ["Higher interest rates compared to public banks (11-14% APR)"],
    maxAmount: "Global Coverage",
    coverage: "Global",
    tags: ["no-collateral"],
  },
  {
    id: "hdfc",
    name: "HDFC Credila",
    category: "Private Market Leader",
    pros: ["No collateral required for select programs & universities", "Approval before admission confirmation available", "Customizable loan structures tailored to course duration"],
    cons: ["Relatively high processing fees (1-1.5%)", "Frequent interest rate revisions"],
    maxAmount: "Fast Approval",
    coverage: "India",
    tags: ["no-collateral"],
  },
  {
    id: "mpower",
    name: "MPower Financing",
    category: "Fixed Rate Specialist",
    pros: ["Fixed interest rates for the entire life of the loan", "Includes career support and networking tools"],
    cons: ["Capped at $100,000 for total education costs"],
    maxAmount: "USA & Canada Only",
    coverage: "USA & Canada",
    tags: ["no-collateral", "cosigner"],
  },
];

// ============================================================
// ICON COMPONENT — Material Symbols via text
// ============================================================
const Icon = ({ name, filled, className = "", size = "text-2xl" }) => (
  <span
    className={`material-symbols-outlined ${size} ${className}`}
    style={filled ? { fontVariationSettings: "'FILL' 1" } : {}}
  >
    {name}
  </span>
);

// ============================================================
// SHARED: Top Navigation
// ============================================================
const NAV_ITEMS = [
  { id: "welcome", label: "Welcome", icon: "home" },
  { id: "calculator", label: "Expense Calculator", icon: "calculate" },
  { id: "funding", label: "Funding Options", icon: "account_balance" },
  { id: "journey", label: "Journey Map", icon: "map" },
];

function TopNav({ activeTab, setActiveTab }) {
  return (
    <header className="fixed top-0 w-full z-50 bg-[#fcf9f3]/80 backdrop-blur-xl" style={{ boxShadow: "0 1px 12px rgba(28,28,24,0.04)" }}>
      <nav className="flex justify-between items-center w-full px-4 sm:px-8 py-3 sm:py-4 max-w-7xl mx-auto">
        <div className="font-serif text-xl sm:text-2xl font-bold text-[#1c1c18] tracking-tight">
          The Academic Sanctuary
        </div>
        <div className="hidden md:flex items-center space-x-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`text-sm font-medium px-4 py-2 rounded-full transition-all duration-300 ${
                activeTab === item.id
                  ? "text-[#316342] font-semibold bg-[#b9efc5]/20"
                  : "text-[#1c1c18]/60 hover:text-[#316342] hover:bg-[#f6f3ed]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
}

function BottomNav({ activeTab, setActiveTab }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#fcf9f3]/80 backdrop-blur-xl px-2 py-2 flex justify-around items-center z-50" style={{ boxShadow: "0 -1px 12px rgba(28,28,24,0.04)" }}>
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-2xl transition-all ${
            activeTab === item.id ? "text-[#316342] bg-[#b9efc5]/20" : "text-[#1c1c18]/50"
          }`}
        >
          <Icon name={item.icon} filled={activeTab === item.id} size="text-xl" />
          <span className="text-[9px] uppercase font-bold tracking-tight">{item.label.split(" ")[0]}</span>
        </button>
      ))}
    </nav>
  );
}

// ============================================================
// COMPONENT: Animated Circular Progress
// ============================================================
function FundingRing({ percent, size = 220 }) {
  const [animPercent, setAnimPercent] = useState(0);
  const radius = (size / 2) * 0.82;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animPercent / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimPercent(percent), 300);
    return () => clearTimeout(timer);
  }, [percent]);

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="transparent" stroke="#e5e2dc" strokeWidth="14"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="transparent"
          stroke="url(#ringGrad)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)" }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#316342" />
            <stop offset="100%" stopColor="#4a7c59" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-serif text-4xl sm:text-5xl font-bold text-[#1c1c18]">
          {animPercent >= 100 ? "100" : animPercent}%
        </span>
        <span className="text-[#414942] text-[10px] uppercase tracking-[0.2em] mt-1 font-semibold">
          {percent >= 100 ? "Fully Funded" : "Secured"}
        </span>
      </div>
    </div>
  );
}

// ============================================================
// PAGE: Welcome Dashboard
// ============================================================
function WelcomePage({ setActiveTab }) {
  const fundingSources = [
    { ...USER_DATA.funding.hdfcLoan, amount: USER_DATA.funding.hdfcLoan.amountUSD },
    { ...USER_DATA.funding.scholarship, amount: USER_DATA.funding.scholarship.amountUSD },
    { ...USER_DATA.funding.fatherSavings, amount: USER_DATA.funding.fatherSavings.amountUSD },
  ];

  return (
    <main className="pt-24 sm:pt-32 pb-24 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto">
      {/* Hero */}
      <header className="mb-10 sm:mb-16">
        <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl text-[#1c1c18] leading-tight tracking-tight mb-4 sm:mb-6">
          Let's plan your 2026{" "}
          <br className="hidden sm:block" />
          <span className="italic text-[#316342]">journey, {USER_DATA.name}.</span>
        </h1>
        <p className="text-[#414942] text-base sm:text-lg max-w-2xl">
          Welcome to your sanctuary. Your {USER_DATA.program} at {USER_DATA.university} is financially secured.
          Let's track the remaining milestones.
        </p>
      </header>

      {/* Row 1: Funding Overview — Full Width */}
      <div className="mb-4 sm:mb-6">
        <div className="bg-[#f6f3ed] rounded-3xl p-6 sm:p-10 flex flex-col sm:flex-row items-center gap-8 sm:gap-12">
          <FundingRing percent={USER_DATA.fundingPercent} />
          <div className="flex-1 w-full">
            <h2 className="font-serif text-xl sm:text-2xl mb-4 italic">Funding Overview</h2>
            <div className="space-y-4 sm:space-y-6">
              <div className="flex justify-between items-end pb-2" style={{ borderBottom: "1px dashed #c1c9bf40" }}>
                <div>
                  <p className="text-[10px] text-[#414942] uppercase tracking-[0.15em] font-semibold mb-1">I-20 Requirement</p>
                  <p className="font-serif text-lg sm:text-xl">${USER_DATA.i20Amount.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-[#414942] uppercase tracking-[0.15em] font-semibold mb-1">
                    {USER_DATA.surplus > 0 ? "Surplus" : "Gap Remaining"}
                  </p>
                  <p className={`font-serif text-lg sm:text-xl ${USER_DATA.surplus > 0 ? "text-[#316342]" : "text-[#7d562d]"}`}>
                    ${Math.abs(USER_DATA.surplus).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {fundingSources.map((src, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span className="text-[#414942]">{src.label}</span>
                    <span className="font-medium text-[#1c1c18]">${src.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setActiveTab("calculator")}
                className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-full text-sm font-medium hover:opacity-90 transition-all"
                style={{ background: "linear-gradient(135deg, #316342, #4a7c59)", color: "#ffffff", boxShadow: "0 4px 16px rgba(49,99,66,0.25)" }}
              >
                View Cost Breakdown
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Next Step + Mentor's Note — Side by Side */}
      <div className="flex flex-col md:flex-row gap-4 sm:gap-6 mb-4 sm:mb-6">
        {/* Next Step Card */}
        <div className="flex-1 bg-[#ebe8e2] rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(49,99,66,0.1)" }}>
                <Icon name="assignment_late" filled className="text-[#316342]" size="text-xl" />
              </div>
              <h3 className="font-serif text-xl sm:text-2xl">Next Step</h3>
            </div>
            <p className="text-[#414942] text-sm mb-5">
              Complete your <span className="font-bold text-[#1c1c18]">SEVIS fee payment ($350)</span> and
              review your I-20 information to maintain your enrollment timeline.
            </p>
          </div>
          <div className="space-y-3">
            <div className="bg-white/50 rounded-2xl p-3 sm:p-4 flex items-center gap-3">
              <Icon name="calendar_today" className="text-[#7d562d]" size="text-xl" />
              <div>
                <p className="text-[9px] uppercase tracking-[0.15em] text-[#414942] font-semibold">Deadline</p>
                <p className="text-sm font-semibold">May 15, 2026</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab("journey")}
              className="px-6 py-2.5 rounded-full text-sm font-medium transition-all"
              style={{ background: "#ffffff", color: "#316342", border: "1px solid rgba(49,99,66,0.15)" }}
              onMouseEnter={(e) => { e.target.style.background = "#316342"; e.target.style.color = "#fff"; }}
              onMouseLeave={(e) => { e.target.style.background = "#ffffff"; e.target.style.color = "#316342"; }}
            >
              Open Journey Map
            </button>
          </div>
        </div>

        {/* Mentor's Note */}
        <div className="flex-1 bg-[#f6f3ed] rounded-3xl overflow-hidden flex flex-row">
          <div className="w-20 sm:w-28 flex items-center justify-center flex-shrink-0" style={{ background: "#ebe8e2" }}>
            <Icon name="auto_stories" className="text-[#316342]/20" size="text-5xl" />
          </div>
          <div className="p-5 sm:p-6 flex-1 flex flex-col justify-center">
            <span className="text-[#7d562d] font-serif italic text-sm mb-1">Mentor's Note</span>
            <blockquote className="text-[#1c1c18] font-serif text-base sm:text-lg leading-snug mb-2">
              "The roots of education are bitter, but the fruit is sweet."
            </blockquote>
            <p className="text-xs text-[#414942]">— ARISTOTLE</p>
          </div>
        </div>
      </div>

      {/* Row 3: Quick Tools + Market Mood */}
      <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
        {/* Quick Tools */}
        <div className="flex-1 md:flex-[3] bg-white rounded-3xl p-6 sm:p-8" style={{ boxShadow: "0 2px 16px rgba(28,28,24,0.04)" }}>
          <h4 className="font-serif text-lg sm:text-xl mb-4 sm:mb-6 italic">Quick Tools</h4>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {[
              { icon: "calculate", label: "New Calculation", tab: "calculator" },
              { icon: "map", label: "Journey Map", tab: "journey" },
              { icon: "account_balance", label: "Funding Options", tab: "funding" },
              { icon: "home", label: "Dashboard", tab: "welcome" },
            ].map((tool) => (
              <button
                key={tool.label}
                onClick={() => tool.tab && setActiveTab(tool.tab)}
                className="flex flex-col items-start p-3 sm:p-4 rounded-2xl bg-[#f6f3ed] hover:bg-[#ebe8e2] transition-colors text-left group"
              >
                <Icon name={tool.icon} className="text-[#316342] mb-2 sm:mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold">{tool.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Market Mood */}
        <div className="md:w-64 lg:w-72 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center" style={{ background: "rgba(255,220,189,0.3)" }}>
          <p className="text-[9px] uppercase tracking-[0.2em] font-bold mb-3" style={{ color: "#7d562d" }}>Market Mood</p>
          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ background: "#ffca98" }}>
            <Icon name="trending_up" className="text-[#7a532a]" size="text-3xl" />
          </div>
          <p className="font-serif text-base leading-tight">Student loan rates are currently stable.</p>
          <p className="text-xs mt-2" style={{ color: "#414942" }}>Refreshed 2h ago</p>
        </div>
      </div>
    </main>
  );
}

// ============================================================
// PAGE: Expense Calculator
// ============================================================
function ExpenseCalculator() {
  const [expenses, setExpenses] = useState({ ...EXPENSE_DEFAULTS });
  const [copiedMsg, setCopiedMsg] = useState(false);

  const update = (key, val) => setExpenses((prev) => ({ ...prev, [key]: Number(val) }));

  const tuitionTotal = expenses.tuition + expenses.healthInsurance + expenses.studentFees;
  const livingMonthly = expenses.rent + expenses.food + expenses.transport + expenses.personal;
  const livingAnnual = livingMonthly * 12;
  const travelTotal = expenses.flights + expenses.sevisFee + expenses.visaFee + expenses.biometrics;
  const hiddenCosts = expenses.healthInsurance + expenses.studentFees + expenses.sevisFee + expenses.visaFee + expenses.biometrics;
  const grandTotal = tuitionTotal + livingAnnual + travelTotal;
  const inrTotal = grandTotal * expenses.exchangeRate;

  const readinessPercent = Math.min(Math.round((USER_DATA.totalSecured / grandTotal) * 100), 100);

  const shareText = () => {
    const text = `📚 ${USER_DATA.program} at ${USER_DATA.university}\n\n💰 Cost Breakdown (Annual):\n• Tuition & Fees: $${tuitionTotal.toLocaleString()}\n• Living Expenses: $${livingAnnual.toLocaleString()}/yr\n• Travel & Visa: $${travelTotal.toLocaleString()}\n\n📊 TOTAL: $${grandTotal.toLocaleString()} (₹${Math.round(inrTotal).toLocaleString()} @ ₹${expenses.exchangeRate}/USD)\n\n— Generated by The Academic Sanctuary`;
    if (navigator.share) {
      navigator.share({ title: "Cost Breakdown", text });
    } else {
      navigator.clipboard.writeText(text);
      setCopiedMsg(true);
      setTimeout(() => setCopiedMsg(false), 2000);
    }
  };

  const SliderField = ({ label, value, min, max, step = 1, field, prefix = "$", suffix = "" }) => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="font-medium text-[#414942] text-sm">{label}</label>
        <span className="font-bold text-[#316342] text-lg">{prefix}{Number(value).toLocaleString()}{suffix}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => update(field, e.target.value)}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #316342 ${((value - min) / (max - min)) * 100}%, #e5e2dc ${((value - min) / (max - min)) * 100}%)`,
        }}
      />
    </div>
  );

  const HiddenCostBadge = ({ icon, title, description }) => (
    <div className="bg-[#ffdcbd] rounded-2xl p-4 flex items-start gap-3">
      <Icon name={icon} filled className="text-[#7d562d] mt-0.5" size="text-xl" />
      <div>
        <div className="flex gap-2 items-center mb-1">
          <span className="text-[9px] font-bold uppercase tracking-widest text-[#623f18] bg-[#ffca98] px-2 py-0.5 rounded-full">Hidden Cost</span>
          <span className="font-semibold text-sm text-[#2c1600]">{title}</span>
        </div>
        <p className="text-xs text-[#623f18] leading-relaxed">{description}</p>
      </div>
    </div>
  );

  return (
    <main className="pt-24 sm:pt-32 pb-24 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="mb-10 sm:mb-16">
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-[#1c1c18] tracking-tight mb-4">
          Planning your <span className="italic text-[#316342]">financial path</span> with clarity.
        </h1>
        <p className="text-[#414942] text-base sm:text-lg max-w-2xl leading-relaxed">
          Adjust the sliders to estimate your costs for {USER_DATA.program} at {USER_DATA.university}.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-12 items-start">
        {/* Sliders */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-6">
          {/* Tuition */}
          <section className="bg-[#f6f3ed] rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 bg-[#b9efc5] rounded-full"><Icon name="school" className="text-[#316342]" /></div>
              <h3 className="font-serif text-xl sm:text-2xl font-semibold">Tuition & Academic Fees</h3>
            </div>
            <SliderField label="Annual Tuition" value={expenses.tuition} min={30000} max={100000} step={500} field="tuition" />
            <HiddenCostBadge icon="info" title="Health Insurance" description={`Mandatory at Boston College — $${expenses.healthInsurance.toLocaleString()}/year for 2025-26.`} />
          </section>

          {/* Living */}
          <section className="bg-[#f6f3ed] rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 bg-[#b9efc5] rounded-full"><Icon name="home" className="text-[#316342]" /></div>
              <h3 className="font-serif text-xl sm:text-2xl font-semibold">Living Expenses</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              <SliderField label="Monthly Rent" value={expenses.rent} min={500} max={3000} step={50} field="rent" />
              <SliderField label="Food & Groceries" value={expenses.food} min={200} max={1000} step={25} field="food" />
              <SliderField label="Transportation" value={expenses.transport} min={0} max={300} step={10} field="transport" />
              <SliderField label="Personal & Misc" value={expenses.personal} min={50} max={500} step={25} field="personal" />
            </div>
          </section>

          {/* Travel */}
          <section className="bg-[#f6f3ed] rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 bg-[#b9efc5] rounded-full"><Icon name="flight_takeoff" className="text-[#316342]" /></div>
              <h3 className="font-serif text-xl sm:text-2xl font-semibold">Travel & Visas</h3>
            </div>
            <SliderField label="Round-trip Flights" value={expenses.flights} min={500} max={3000} step={50} field="flights" />
            <HiddenCostBadge icon="payments" title="SEVIS Fee & Visa Processing" description={`SEVIS I-901: $${expenses.sevisFee} + DS-160 Visa: $${expenses.visaFee} + Biometrics: ~$${expenses.biometrics}`} />
          </section>
        </div>

        {/* Sticky Receipt */}
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <div className="bg-white rounded-3xl p-6 sm:p-8 relative overflow-hidden" style={{ boxShadow: "0 12px 40px rgba(28,28,24,0.06)" }}>
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#316342] to-[#4a7c59]" />
            <div className="flex justify-between items-start mb-6 sm:mb-8">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold">Estimated Total</h2>
                <p className="text-[#414942] text-sm mt-1">Based on 1-year academic cycle</p>
              </div>
              <Icon name="receipt_long" className="text-[#4a7c59]/30" size="text-4xl" />
            </div>

            <div className="space-y-3 pb-6 sm:pb-8 mb-6 sm:mb-8" style={{ borderBottom: "2px dashed #c1c9bf40" }}>
              <div className="flex justify-between text-sm">
                <span className="text-[#414942]">Tuition & Fees</span>
                <span className="font-medium">${tuitionTotal.toLocaleString()}.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#414942]">Living Expenses (12 mo.)</span>
                <span className="font-medium">${livingAnnual.toLocaleString()}.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#414942]">Travel & Visa Logistics</span>
                <span className="font-medium">${travelTotal.toLocaleString()}.00</span>
              </div>
              <div className="flex justify-between text-sm text-[#7d562d] font-medium">
                <span>Mandatory Hidden Costs</span>
                <span>${hiddenCosts.toLocaleString()}.00</span>
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex justify-between items-end">
                <span className="font-bold text-[#414942] uppercase tracking-widest text-[10px]">Total in USD</span>
                <div className="text-right">
                  <span className="block text-3xl sm:text-4xl font-serif font-bold text-[#316342]">${grandTotal.toLocaleString()}</span>
                  <span className="text-xs text-[#414942]">Approx. annual requirement</span>
                </div>
              </div>

              <div className="bg-[#b9efc5]/20 p-4 rounded-2xl">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="font-bold text-[#316342] uppercase tracking-widest text-[10px]">Total in INR</span>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-[#414942]">@ ₹</span>
                      <input
                        type="number" value={expenses.exchangeRate} step={0.5} min={70} max={120}
                        onChange={(e) => update("exchangeRate", e.target.value)}
                        className="w-14 text-xs font-semibold bg-white/60 rounded-lg px-2 py-1 text-center border-none outline-none focus:ring-1 focus:ring-[#316342]/40"
                      />
                      <span className="text-xs text-[#414942]">/USD</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-xl sm:text-2xl font-serif font-bold text-[#1e5031]">
                      ₹{Math.round(inrTotal).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 sm:mt-8 space-y-3">
              <button
                onClick={shareText}
                className="w-full py-3 px-6 text-[#316342] font-semibold hover:bg-[#f6f3ed] rounded-full transition-colors flex items-center justify-center gap-2"
              >
                <Icon name="share" size="text-lg" />
                {copiedMsg ? "Copied to clipboard!" : "Share with family"}
              </button>
            </div>

            {/* Readiness Bar */}
            <div className="mt-6 sm:mt-8 pt-6 sm:pt-8" style={{ borderTop: "1px solid #ebe8e2" }}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-[#414942]">Financial Readiness Score</span>
                <span className="text-xs font-bold text-[#316342]">{readinessPercent >= 100 ? "Excellent" : readinessPercent >= 70 ? "High" : "Building"}</span>
              </div>
              <div className="h-3 w-full bg-[#e5e2dc] rounded-full relative overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-[#316342] rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(readinessPercent, 100)}%` }}
                />
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-[#414942] italic">
                "A clear plan is the first step toward a calm mind. You are {readinessPercent}% prepared for your journey's financial start."
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// ============================================================
// PAGE: Funding Options
// ============================================================
function FundingOptions() {
  const [filter, setFilter] = useState("all");

  const filtered = LENDERS.filter((l) => {
    if (filter === "all") return true;
    if (filter === "collateral") return l.tags.includes("collateral");
    if (filter === "no-collateral") return l.tags.includes("no-collateral");
    if (filter === "cosigner") return l.tags.includes("cosigner");
    return true;
  });

  const filters = [
    { id: "all", label: "All Options" },
    { id: "collateral", label: "With Collateral" },
    { id: "no-collateral", label: "Without Collateral" },
    { id: "cosigner", label: "US Co-signer" },
  ];

  return (
    <main className="pt-24 sm:pt-32 pb-24 px-4 sm:px-6 max-w-7xl mx-auto">
      <section className="mb-10 sm:mb-16">
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-[#1c1c18] tracking-tight mb-4">
          Secure your <span className="italic text-[#316342]">future</span> with clarity.
        </h1>
        <p className="text-[#414942] text-base sm:text-lg max-w-2xl">
          Compare tailored education loans from trusted global lenders. We've simplified the fine print so you can focus on your academic journey.
        </p>
      </section>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-8 sm:mb-12">
        <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#414942]">Filter by:</span>
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all"
            style={
              filter === f.id
                ? { background: "#316342", color: "#ffffff", boxShadow: "0 2px 8px rgba(49,99,66,0.25)" }
                : { background: "#f6f3ed", color: "#414942" }
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {filtered.map((lender) => (
          <div
            key={lender.id}
            className={`p-6 sm:p-8 rounded-3xl transition-all duration-300 ${
              lender.id === "hdfc" ? "bg-[#b9efc5]/15 ring-2 ring-[#316342]/20" : "bg-[#f6f3ed]"
            }`}
          >
            <div className="mb-4 sm:mb-6">
              <span className="text-[10px] font-bold text-[#316342] uppercase tracking-[0.2em] mb-2 block">
                {lender.category}
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold">{lender.name}</h3>
              {lender.id === "hdfc" && (
                <span className="inline-block mt-2 text-[9px] font-bold uppercase tracking-widest text-[#7d562d] bg-[#ffca98] px-3 py-1 rounded-full">
                  Your Current Lender
                </span>
              )}
            </div>

            <div className="space-y-3 mb-6 sm:mb-8">
              {lender.pros.map((p, i) => (
                <div key={i} className="flex items-start gap-2 sm:gap-3">
                  <Icon name="check_circle" filled className="text-[#316342] mt-0.5" size="text-lg" />
                  <p className="text-xs sm:text-sm text-[#414942]">{p}</p>
                </div>
              ))}
              {lender.cons.map((c, i) => (
                <div key={i} className="flex items-start gap-2 sm:gap-3">
                  <Icon name="warning" filled className="text-[#7d562d] mt-0.5" size="text-lg" />
                  <p className="text-xs sm:text-sm text-[#414942]">{c}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-[#414942] italic">{lender.maxAmount}</span>
              <button
                className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-medium hover:shadow-lg transition-all"
                style={{ background: "linear-gradient(135deg, #316342, #4a7c59)", color: "#ffffff" }}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-[#414942]">
          <Icon name="search_off" size="text-5xl" className="mb-4 opacity-30" />
          <p className="font-serif text-xl">No lenders match this filter.</p>
        </div>
      )}

      {/* Info Section */}
      <section className="mt-16 sm:mt-24 grid md:grid-cols-2 gap-8 sm:gap-16 items-center">
        <div className="relative rounded-3xl overflow-hidden h-64 sm:h-[400px] bg-[#ebe8e2] flex items-center justify-center">
          <div className="text-center">
            <Icon name="menu_book" className="text-[#316342]/20" size="text-8xl" />
          </div>
        </div>
        <div className="space-y-4 sm:space-y-6">
          <h2 className="font-serif text-3xl sm:text-4xl leading-tight">
            Navigating the <span className="italic">Financial</span> Landscape.
          </h2>
          <p className="text-[#414942] leading-relaxed text-sm sm:text-base">
            Selecting a lender is more than just finding the lowest rate — it's about matching your unique
            profile with the right financial support. Whether you have family collateral or are seeking
            merit-based funding alone, our sanctuary provides the tools to map your ascent.
          </p>
        </div>
      </section>
    </main>
  );
}

// ============================================================
// PAGE: Journey Map
// ============================================================
function JourneyMap() {
  const [tasks, setTasks] = useState(() =>
    MILESTONES.reduce((acc, m) => {
      m.tasks.forEach((t, i) => { acc[`${m.id}-${i}`] = t.done; });
      return acc;
    }, {})
  );

  const toggleTask = (milestoneId, taskIdx) => {
    setTasks((prev) => ({ ...prev, [`${milestoneId}-${taskIdx}`]: !prev[`${milestoneId}-${taskIdx}`] }));
  };

  const getStatus = (milestone) => {
    const allDone = milestone.tasks.every((_, i) => tasks[`${milestone.id}-${i}`]);
    const someDone = milestone.tasks.some((_, i) => tasks[`${milestone.id}-${i}`]);
    if (allDone) return "completed";
    if (someDone) return "in-progress";
    return "upcoming";
  };

  return (
    <main className="pt-24 sm:pt-32 pb-24 px-4 sm:px-6 max-w-5xl mx-auto">
      {/* Hero */}
      <div className="mb-12 sm:mb-20 text-center">
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-[#1c1c18] mb-4">Your Path to Scholar's Hall</h1>
        <p className="font-serif italic text-lg sm:text-xl text-[#316342] max-w-2xl mx-auto">
          A calm, structured timeline connecting your financial readiness to academic horizons.
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Center line — hidden on mobile */}
        <div className="hidden md:block absolute left-1/2 -translate-x-1/2 h-full w-1.5 rounded-full opacity-20 bg-gradient-to-b from-[#316342] via-[#316342] to-[#e5e2dc]" />

        {MILESTONES.map((milestone, idx) => {
          const status = getStatus(milestone);
          const isEven = idx % 2 === 0;

          return (
            <div key={milestone.id} className={`relative flex flex-col md:flex-row ${!isEven ? "md:flex-row-reverse" : ""} items-start md:items-center justify-between mb-12 sm:mb-24 w-full`}>
              {/* Date (desktop) */}
              <div className={`hidden md:block w-[45%] ${isEven ? "text-right pr-12" : "text-left pl-12"}`}>
                <span className={`font-serif italic text-2xl ${status === "upcoming" ? "text-[#717971]" : "text-[#7d562d]"}`}>
                  {milestone.date}
                </span>
                <p className="text-[#414942] text-sm mt-1">{milestone.subtitle}</p>
              </div>

              {/* Node */}
              <div className={`hidden md:flex absolute left-1/2 -translate-x-1/2 w-8 h-8 rounded-full items-center justify-center z-10 ${
                status === "completed" ? "bg-[#316342]" : status === "in-progress" ? "bg-[#316342]" : "bg-[#e5e2dc]"
              }`} style={{ boxShadow: "0 0 0 8px #fcf9f3" }}>
                <Icon
                  name={status === "completed" ? "check" : status === "in-progress" ? "sync" : "event"}
                  filled={status === "completed"}
                  className={status === "upcoming" ? "text-[#717971]" : "text-white"}
                  size="text-lg"
                />
              </div>

              {/* Content Card */}
              <div className={`w-full md:w-[45%] ${isEven ? "md:pl-12" : "md:pr-12"}`}>
                {/* Mobile date */}
                <div className="md:hidden flex items-center gap-3 mb-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    status === "completed" ? "bg-[#316342]" : status === "in-progress" ? "bg-[#316342]" : "bg-[#e5e2dc]"
                  }`}>
                    <Icon
                      name={status === "completed" ? "check" : status === "in-progress" ? "sync" : "event"}
                      className={status === "upcoming" ? "text-[#717971]" : "text-white"}
                      size="text-sm"
                    />
                  </div>
                  <span className="font-serif italic text-lg text-[#7d562d]">{milestone.date}</span>
                  <span className="text-xs text-[#414942]">· {milestone.subtitle}</span>
                </div>

                <div className={`bg-[#f6f3ed] p-6 sm:p-8 rounded-3xl transition-opacity ${
                  status === "upcoming" ? "opacity-50" : ""
                } ${status === "in-progress" ? "border-l-4 border-[#316342]" : ""}`}>
                  <div className="flex items-center gap-3 mb-3 sm:mb-4">
                    <Icon name={milestone.icon} className="text-[#316342]" />
                    <h3 className="font-serif text-xl sm:text-2xl font-bold">{milestone.title}</h3>
                  </div>
                  <p className="text-[#414942] text-xs sm:text-sm mb-4 sm:mb-6">{milestone.description}</p>

                  <div className="space-y-2 sm:space-y-3">
                    {milestone.tasks.map((task, i) => {
                      const isDone = tasks[`${milestone.id}-${i}`];
                      return (
                        <button
                          key={i}
                          onClick={() => toggleTask(milestone.id, i)}
                          className={`flex items-center gap-3 text-xs sm:text-sm w-full text-left transition-colors ${
                            isDone ? "text-[#316342]/50 line-through" : "text-[#1c1c18]"
                          }`}
                        >
                          <Icon
                            name={isDone ? "check_circle" : "radio_button_unchecked"}
                            filled={isDone}
                            className={isDone ? "text-[#316342]/50" : "text-[#717971]"}
                            size="text-lg"
                          />
                          {task.text}
                        </button>
                      );
                    })}
                  </div>

                  {status === "completed" && milestone.completedDate && (
                    <div className="mt-4 sm:mt-6 pt-4 flex justify-between items-center" style={{ borderTop: "1px solid #c1c9bf20" }}>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#316342]">Completed</span>
                      <span className="text-xs text-[#414942]">{milestone.completedDate}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </main>
  );
}

// ============================================================
// APP ROOT
// ============================================================
export default function App() {
  const [activeTab, setActiveTab] = useState("welcome");

  const renderPage = () => {
    switch (activeTab) {
      case "welcome": return <WelcomePage setActiveTab={setActiveTab} />;
      case "calculator": return <ExpenseCalculator />;
      case "funding": return <FundingOptions />;
      case "journey": return <JourneyMap />;
      default: return <WelcomePage setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf9f3] text-[#1c1c18] pb-16 md:pb-0">
      <TopNav activeTab={activeTab} setActiveTab={setActiveTab} />
      {renderPage()}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
