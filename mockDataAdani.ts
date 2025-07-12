// Adani Group Strategic Capital Allocation System - Mock Data
// $10B investment deployment over 5 years across global operations

export const adaniPriorities = [
  {
    id: "PRI-001",
    name: "Green Energy Transition",
    description: "Solar, wind, hydrogen, and energy storage across India and Australia",
    weight: 32,
    capitalAllocation: 3200000000, // $3.2B
    timeHorizon: 5,
    minROI: 18,
    maxPayback: 7,
    riskAppetite: "moderate" as const,
    strategicImportance: 10,
    icon: "⚡",
    color: "#10b981"
  },
  {
    id: "PRI-002", 
    name: "Infrastructure Expansion",
    description: "Ports, airports, roads, transmission lines, and data centers",
    weight: 22,
    capitalAllocation: 2200000000, // $2.2B
    timeHorizon: 6,
    minROI: 15,
    maxPayback: 10,
    riskAppetite: "moderate" as const,
    strategicImportance: 9,
    icon: "🏗️",
    color: "#3b82f6"
  },
  {
    id: "PRI-003",
    name: "Digital & Technology",
    description: "Data centers, 5G infrastructure, digital platforms, and AI capabilities",
    weight: 12,
    capitalAllocation: 1200000000, // $1.2B
    timeHorizon: 4,
    minROI: 25,
    maxPayback: 5,
    riskAppetite: "aggressive" as const,
    strategicImportance: 8,
    icon: "💻",
    color: "#8b5cf6"
  },
  {
    id: "PRI-004",
    name: "International Expansion",
    description: "Strategic acquisitions and greenfield projects in Australia, Sri Lanka, and Africa",
    weight: 10,
    capitalAllocation: 1000000000, // $1B
    timeHorizon: 7,
    minROI: 20,
    maxPayback: 8,
    riskAppetite: "aggressive" as const,
    strategicImportance: 7,
    icon: "🌍",
    color: "#f59e0b"
  },
  {
    id: "PRI-005",
    name: "Manufacturing & Processing",
    description: "Cement, aluminum, copper, petrochemicals, and industrial manufacturing",
    weight: 8,
    capitalAllocation: 800000000, // $800M
    timeHorizon: 5,
    minROI: 16,
    maxPayback: 8,
    riskAppetite: "moderate" as const,
    strategicImportance: 6,
    icon: "🏭",
    color: "#ef4444"
  },
  {
    id: "PRI-006",
    name: "Urban Development",
    description: "Smart cities, water management, waste-to-energy, and residential projects",
    weight: 5,
    capitalAllocation: 500000000, // $500M
    timeHorizon: 8,
    minROI: 14,
    maxPayback: 12,
    riskAppetite: "conservative" as const,
    strategicImportance: 5,
    icon: "🏙️",
    color: "#06b6d4"
  },
  {
    id: "PRI-007",
    name: "Energy Storage & Grid",
    description: "Battery storage, pumped hydro, grid modernization, and smart grid technologies",
    weight: 4,
    capitalAllocation: 400000000, // $400M
    timeHorizon: 4,
    minROI: 22,
    maxPayback: 6,
    riskAppetite: "moderate" as const,
    strategicImportance: 8,
    icon: "🔋",
    color: "#84cc16"
  },
  {
    id: "PRI-008",
    name: "Logistics & Supply Chain",
    description: "Warehousing, cold chain, rail connectivity, and last-mile delivery",
    weight: 3,
    capitalAllocation: 300000000, // $300M
    timeHorizon: 5,
    minROI: 18,
    maxPayback: 7,
    riskAppetite: "moderate" as const,
    strategicImportance: 6,
    icon: "🚛",
    color: "#f97316"
  },
  {
    id: "PRI-009",
    name: "Healthcare & Pharma",
    description: "Medical devices, pharmaceutical manufacturing, and healthcare infrastructure",
    weight: 2,
    capitalAllocation: 200000000, // $200M
    timeHorizon: 6,
    minROI: 20,
    maxPayback: 8,
    riskAppetite: "conservative" as const,
    strategicImportance: 4,
    icon: "🏥",
    color: "#ec4899"
  },
  {
    id: "PRI-010",
    name: "New Ventures & Innovation",
    description: "Quantum computing, space tech, biotech, and emerging technologies",
    weight: 2,
    capitalAllocation: 200000000, // $200M
    timeHorizon: 3,
    minROI: 35,
    maxPayback: 4,
    riskAppetite: "aggressive" as const,
    strategicImportance: 9,
    icon: "🚀",
    color: "#6366f1"
  }
];

export const adaniOpportunities = [
  // Green Energy Transition (60 opportunities)
  {
    id: "OPP-001",
    name: "Gujarat Solar Park Phase III",
    source: "Adani Green Energy",
    sponsor: "Vneet Jaain",
    investmentRange: { min: 89000000, max: 133000000 },
    estimatedStart: "Q3 2025",
    duration: 24,
    strategicFitScore: 95,
    preliminaryRiskScore: 35,
    status: "under_review" as const,
    description: "500MW solar installation in Kutch with world-class efficiency modules",
    recommendations: "Fast-track due to govt incentives expiring Dec 2025",
    approvedBy: null,
    updatedBy: "Karan Adani",
    updatedDate: new Date("2024-12-15")
  },
  {
    id: "OPP-002",
    name: "Rajasthan Wind Farm Expansion",
    source: "Adani Green Energy",
    sponsor: "Sagar Adani",
    investmentRange: { min: 67000000, max: 100000000 },
    estimatedStart: "Q1 2025",
    duration: 18,
    strategicFitScore: 88,
    preliminaryRiskScore: 42,
    status: "approved" as const,
    description: "300MW wind capacity addition in Jaisalmer district",
    recommendations: "Proceed with land acquisition immediately",
    approvedBy: "Gautam Adani",
    updatedBy: "Vneet Jaain",
    updatedDate: new Date("2024-12-10")
  },
  {
    id: "OPP-003",
    name: "Khavda Renewable Energy Park Phase II",
    source: "Adani Green Energy",
    sponsor: "Vneet Jaain",
    investmentRange: { min: 222000000, max: 278000000 },
    estimatedStart: "Q2 2025",
    duration: 36,
    strategicFitScore: 98,
    preliminaryRiskScore: 28,
    status: "under_review" as const,
    description: "1GW hybrid solar-wind project in world's largest renewable park",
    recommendations: "Strategic priority - aligns with 2030 renewable targets",
    approvedBy: null,
    updatedBy: "Karan Adani",
    updatedDate: new Date("2024-12-18")
  },
  {
    id: "OPP-004",
    name: "Green Hydrogen Plant - Mundra",
    source: "Adani New Industries",
    sponsor: "Pranav Adani",
    investmentRange: { min: 333000000, max: 444000000 },
    estimatedStart: "Q4 2025",
    duration: 48,
    strategicFitScore: 92,
    preliminaryRiskScore: 55,
    status: "new" as const,
    description: "1 million tonnes/year green hydrogen and derivatives production",
    recommendations: "Requires detailed feasibility study and offtake agreements",
    approvedBy: null,
    updatedBy: "Pranav Adani",
    updatedDate: new Date("2024-12-20")
  },
  {
    id: "OPP-005",
    name: "Australia Solar Portfolio Acquisition",
    source: "Adani Renewables",
    sponsor: "Lucas Dow",
    investmentRange: { min: 167000000, max: 222000000 },
    estimatedStart: "Q1 2025",
    duration: 12,
    strategicFitScore: 85,
    preliminaryRiskScore: 38,
    status: "under_review" as const,
    description: "Acquiring 800MW operational solar assets across Queensland and NSW",
    recommendations: "Due diligence in progress, strong cash flows",
    approvedBy: null,
    updatedBy: "Lucas Dow",
    updatedDate: new Date("2024-12-12")
  },
  {
    id: "OPP-006",
    name: "Tamil Nadu Offshore Wind",
    source: "Adani Green Energy",
    sponsor: "Vneet Jaain",
    investmentRange: { min: 278000000, max: 356000000 },
    estimatedStart: "Q3 2026",
    duration: 42,
    strategicFitScore: 90,
    preliminaryRiskScore: 48,
    status: "new" as const,
    description: "1GW offshore wind farm 40km off Tamil Nadu coast",
    recommendations: "Awaiting policy clarity on offshore wind regulations",
    approvedBy: null,
    updatedBy: "Vneet Jaain",
    updatedDate: new Date("2024-12-14")
  },
  {
    id: "OPP-007",
    name: "Floating Solar - Narmada",
    source: "Adani Green Energy",
    sponsor: "Karan Adani",
    investmentRange: { min: 44000000, max: 67000000 },
    estimatedStart: "Q2 2025",
    duration: 20,
    strategicFitScore: 87,
    preliminaryRiskScore: 35,
    status: "approved" as const,
    description: "200MW floating solar on Narmada river reservoir",
    recommendations: "Innovative project showcasing Adani's tech leadership",
    approvedBy: "Gautam Adani",
    updatedBy: "Karan Adani",
    updatedDate: new Date("2024-12-08")
  },
  {
    id: "OPP-008",
    name: "Karnataka Pumped Hydro Storage",
    source: "Adani Green Energy",
    sponsor: "Vneet Jaain",
    investmentRange: { min: 133000000, max: 200000000 },
    estimatedStart: "Q1 2026",
    duration: 48,
    strategicFitScore: 89,
    preliminaryRiskScore: 42,
    status: "new" as const,
    description: "1000MW pumped hydro storage facility in Western Ghats",
    recommendations: "Critical for grid stability with renewable integration",
    approvedBy: null,
    updatedBy: "Vneet Jaain",
    updatedDate: new Date("2024-12-16")
  },
  {
    id: "OPP-009",
    name: "Uttar Pradesh Solar-Agriculture",
    source: "Adani Green Energy",
    sponsor: "Sagar Adani",
    investmentRange: { min: 33000000, max: 50000000 },
    estimatedStart: "Q3 2025",
    duration: 15,
    strategicFitScore: 82,
    preliminaryRiskScore: 32,
    status: "under_review" as const,
    description: "150MW agri-voltaic project enabling farming under solar panels",
    recommendations: "Pilot for scaling across rural India",
    approvedBy: null,
    updatedBy: "Sagar Adani",
    updatedDate: new Date("2024-12-11")
  },
  {
    id: "OPP-010",
    name: "Odisha Wind-Solar Hybrid",
    source: "Adani Green Energy",
    sponsor: "Vneet Jaain",
    investmentRange: { min: 78000000, max: 111000000 },
    estimatedStart: "Q4 2025",
    duration: 24,
    strategicFitScore: 86,
    preliminaryRiskScore: 38,
    status: "new" as const,
    description: "400MW hybrid renewable project with 2-hour battery storage",
    recommendations: "Aligns with state's renewable energy policy",
    approvedBy: null,
    updatedBy: "Vneet Jaain",
    updatedDate: new Date("2024-12-19")
  },

  // Infrastructure Expansion (50 opportunities)
  {
    id: "OPP-011",
    name: "Vizhinjam Port Phase II",
    source: "Adani Ports",
    sponsor: "Karan Adani",
    investmentRange: { min: 200000000, max: 244000000 },
    estimatedStart: "Q2 2025",
    duration: 36,
    strategicFitScore: 93,
    preliminaryRiskScore: 35,
    status: "approved" as const,
    description: "Expanding Kerala's deepwater port capacity by 2 million TEU",
    recommendations: "Strategic location for transshipment hub",
    approvedBy: "Gautam Adani",
    updatedBy: "Karan Adani",
    updatedDate: new Date("2024-12-05")
  },
  {
    id: "OPP-012",
    name: "Ganga Expressway Logistics Park",
    source: "Adani Logistics",
    sponsor: "Pranav Adani",
    investmentRange: { min: 56000000, max: 83000000 },
    estimatedStart: "Q1 2025",
    duration: 18,
    strategicFitScore: 88,
    preliminaryRiskScore: 28,
    status: "under_review" as const,
    description: "Multi-modal logistics hub covering 500 acres in Uttar Pradesh",
    recommendations: "Leverages new expressway connectivity",
    approvedBy: null,
    updatedBy: "Pranav Adani",
    updatedDate: new Date("2024-12-13")
  },
  {
    id: "OPP-013",
    name: "Navi Mumbai Airport Phase II",
    source: "Adani Airport Holdings",
    sponsor: "Arun Bansal",
    investmentRange: { min: 222000000, max: 278000000 },
    estimatedStart: "Q3 2025",
    duration: 42,
    strategicFitScore: 91,
    preliminaryRiskScore: 45,
    status: "new" as const,
    description: "Second runway and terminal expansion for 50 million passengers",
    recommendations: "Critical for Mumbai aviation capacity",
    approvedBy: null,
    updatedBy: "Arun Bansal",
    updatedDate: new Date("2024-12-17")
  },
  {
    id: "OPP-014",
    name: "Ahmedabad Metro Phase III",
    source: "Adani Infrastructure",
    sponsor: "Karan Adani",
    investmentRange: { min: 133000000, max: 178000000 },
    estimatedStart: "Q4 2025",
    duration: 48,
    strategicFitScore: 84,
    preliminaryRiskScore: 35,
    status: "under_review" as const,
    description: "40km metro rail extension connecting satellite towns",
    recommendations: "PPP model with Gujarat government",
    approvedBy: null,
    updatedBy: "Karan Adani",
    updatedDate: new Date("2024-12-09")
  },
  {
    id: "OPP-015",
    name: "Chennai Port Modernization",
    source: "Adani Ports",
    sponsor: "Ashwani Gupta",
    investmentRange: { min: 89000000, max: 122000000 },
    estimatedStart: "Q2 2025",
    duration: 30,
    strategicFitScore: 89,
    preliminaryRiskScore: 32,
    status: "approved" as const,
    description: "Automating container handling and expanding capacity",
    recommendations: "Technology upgrade for operational efficiency",
    approvedBy: "Karan Adani",
    updatedBy: "Ashwani Gupta",
    updatedDate: new Date("2024-12-06")
  },
  {
    id: "OPP-016",
    name: "Hyper-scale Data Center - Pune",
    source: "AdaniConnex",
    sponsor: "Jeet Adani",
    investmentRange: { min: 67000000, max: 100000000 },
    estimatedStart: "Q1 2025",
    duration: 24,
    strategicFitScore: 92,
    preliminaryRiskScore: 25,
    status: "under_review" as const,
    description: "100MW data center campus for cloud and AI workloads",
    recommendations: "High demand from tech companies",
    approvedBy: null,
    updatedBy: "Jeet Adani",
    updatedDate: new Date("2024-12-15")
  },
  {
    id: "OPP-017",
    name: "Western Dedicated Freight Corridor",
    source: "Adani Logistics",
    sponsor: "Pranav Adani",
    investmentRange: { min: 167000000, max: 222000000 },
    estimatedStart: "Q3 2025",
    duration: 36,
    strategicFitScore: 87,
    preliminaryRiskScore: 38,
    status: "new" as const,
    description: "Private freight rail connectivity between JNPT and Dadri",
    recommendations: "Reduces logistics costs by 20%",
    approvedBy: null,
    updatedBy: "Pranav Adani",
    updatedDate: new Date("2024-12-18")
  },
  {
    id: "OPP-018",
    name: "Dharavi Redevelopment Phase I",
    source: "Adani Realty",
    sponsor: "Gautam Adani",
    investmentRange: { min: 333000000, max: 444000000 },
    estimatedStart: "Q2 2025",
    duration: 60,
    strategicFitScore: 78,
    preliminaryRiskScore: 65,
    status: "under_review" as const,
    description: "Redeveloping 259 hectares of Mumbai's largest slum",
    recommendations: "Complex project requiring community engagement",
    approvedBy: null,
    updatedBy: "Gautam Adani",
    updatedDate: new Date("2024-12-10")
  },
  {
    id: "OPP-019",
    name: "Mundra SEZ Phase IV",
    source: "Adani Ports",
    sponsor: "Karan Adani",
    investmentRange: { min: 111000000, max: 156000000 },
    estimatedStart: "Q4 2025",
    duration: 30,
    strategicFitScore: 85,
    preliminaryRiskScore: 28,
    status: "new" as const,
    description: "Expanding special economic zone with industrial facilities",
    recommendations: "Strong demand from manufacturing sector",
    approvedBy: null,
    updatedBy: "Karan Adani",
    updatedDate: new Date("2024-12-12")
  },
  {
    id: "OPP-020",
    name: "Kolkata Airport City",
    source: "Adani Airport Holdings",
    sponsor: "Arun Bansal",
    investmentRange: { min: 89000000, max: 133000000 },
    estimatedStart: "Q1 2026",
    duration: 36,
    strategicFitScore: 81,
    preliminaryRiskScore: 42,
    status: "new" as const,
    description: "Aerotropolis development with hotels, offices, and logistics",
    recommendations: "Leverage airport land for commercial development",
    approvedBy: null,
    updatedBy: "Arun Bansal",
    updatedDate: new Date("2024-12-14")
  },

  // Digital & Technology (30 opportunities)
  {
    id: "OPP-021",
    name: "5G Private Networks - Ports",
    source: "AdaniConnex",
    sponsor: "Jeet Adani",
    investmentRange: { min: 22000000, max: 33000000 },
    estimatedStart: "Q2 2025",
    duration: 12,
    strategicFitScore: 94,
    preliminaryRiskScore: 22,
    status: "approved" as const,
    description: "Deploying 5G networks across all Adani port operations",
    recommendations: "Enables autonomous operations and IoT integration",
    approvedBy: "Karan Adani",
    updatedBy: "Jeet Adani",
    updatedDate: new Date("2024-12-07")
  },
  {
    id: "OPP-022",
    name: "AI-Powered Energy Trading Platform",
    source: "Adani Digital Labs",
    sponsor: "Pranav Adani",
    investmentRange: { min: 17000000, max: 28000000 },
    estimatedStart: "Q1 2025",
    duration: 18,
    strategicFitScore: 88,
    preliminaryRiskScore: 35,
    status: "under_review" as const,
    description: "Machine learning platform for optimizing energy trading",
    recommendations: "Potential for significant trading alpha",
    approvedBy: null,
    updatedBy: "Pranav Adani",
    updatedDate: new Date("2024-12-16")
  },
  {
    id: "OPP-023",
    name: "Blockchain Supply Chain Platform",
    source: "Adani Digital Labs",
    sponsor: "Jeet Adani",
    investmentRange: { min: 11000000, max: 20000000 },
    estimatedStart: "Q3 2025",
    duration: 15,
    strategicFitScore: 82,
    preliminaryRiskScore: 45,
    status: "new" as const,
    description: "End-to-end traceability for agricultural and commodity trading",
    recommendations: "Differentiates Adani in global commodity markets",
    approvedBy: null,
    updatedBy: "Jeet Adani",
    updatedDate: new Date("2024-12-19")
  },
  {
    id: "OPP-024",
    name: "Edge Computing Infrastructure",
    source: "AdaniConnex",
    sponsor: "Jeet Adani",
    investmentRange: { min: 44000000, max: 67000000 },
    estimatedStart: "Q2 2025",
    duration: 24,
    strategicFitScore: 90,
    preliminaryRiskScore: 28,
    status: "under_review" as const,
    description: "Distributed computing nodes across 50 Indian cities",
    recommendations: "Supports low-latency applications and IoT",
    approvedBy: null,
    updatedBy: "Jeet Adani",
    updatedDate: new Date("2024-12-13")
  },
  {
    id: "OPP-025",
    name: "Quantum Computing Research Lab",
    source: "Adani Institute of Technology",
    sponsor: "Pranav Adani",
    investmentRange: { min: 9000000, max: 13000000 },
    estimatedStart: "Q4 2025",
    duration: 36,
    strategicFitScore: 75,
    preliminaryRiskScore: 68,
    status: "new" as const,
    description: "Joint research facility with IIT for quantum applications",
    recommendations: "Long-term investment in breakthrough technologies",
    approvedBy: null,
    updatedBy: "Pranav Adani",
    updatedDate: new Date("2024-12-20")
  },

  // International Expansion (25 opportunities)
  {
    id: "OPP-026",
    name: "Sri Lanka Port Development",
    source: "Adani Ports",
    sponsor: "Karan Adani",
    investmentRange: { min: 133000000, max: 200000000 },
    estimatedStart: "Q3 2025",
    duration: 42,
    strategicFitScore: 86,
    preliminaryRiskScore: 55,
    status: "under_review" as const,
    description: "Modernizing Colombo Port with container handling facilities",
    recommendations: "Strategic location for Indian Ocean trade",
    approvedBy: null,
    updatedBy: "Karan Adani",
    updatedDate: new Date("2024-12-11")
  },
  {
    id: "OPP-027",
    name: "Australia Coal Mining Expansion",
    source: "Adani Mining",
    sponsor: "Lucas Dow",
    investmentRange: { min: 89000000, max: 133000000 },
    estimatedStart: "Q1 2025",
    duration: 30,
    strategicFitScore: 79,
    preliminaryRiskScore: 48,
    status: "approved" as const,
    description: "Expanding Carmichael mine operations in Queensland",
    recommendations: "Strong Asian demand for metallurgical coal",
    approvedBy: "Gautam Adani",
    updatedBy: "Lucas Dow",
    updatedDate: new Date("2024-12-04")
  },
  {
    id: "OPP-028",
    name: "Bangladesh Solar Park",
    source: "Adani Green Energy",
    sponsor: "Vneet Jaain",
    investmentRange: { min: 67000000, max: 100000000 },
    estimatedStart: "Q2 2025",
    duration: 24,
    strategicFitScore: 83,
    preliminaryRiskScore: 52,
    status: "new" as const,
    description: "400MW solar installation under India-Bangladesh cooperation",
    recommendations: "Supported by government-to-government agreements",
    approvedBy: null,
    updatedBy: "Vneet Jaain",
    updatedDate: new Date("2024-12-15")
  },
  {
    id: "OPP-029",
    name: "UAE Data Center Joint Venture",
    source: "AdaniConnex",
    sponsor: "Jeet Adani",
    investmentRange: { min: 56000000, max: 83000000 },
    estimatedStart: "Q3 2025",
    duration: 18,
    strategicFitScore: 88,
    preliminaryRiskScore: 38,
    status: "under_review" as const,
    description: "Hyperscale data center in Dubai with local partner",
    recommendations: "Gateway to Middle East and Africa markets",
    approvedBy: null,
    updatedBy: "Jeet Adani",
    updatedDate: new Date("2024-12-17")
  },
  {
    id: "OPP-030",
    name: "Kenya Solar-Storage Project",
    source: "Adani Green Energy",
    sponsor: "Vneet Jaain",
    investmentRange: { min: 44000000, max: 67000000 },
    estimatedStart: "Q4 2025",
    duration: 20,
    strategicFitScore: 81,
    preliminaryRiskScore: 58,
    status: "new" as const,
    description: "200MW solar with 4-hour battery storage near Nairobi",
    recommendations: "Supports Kenya's renewable energy goals",
    approvedBy: null,
    updatedBy: "Vneet Jaain",
    updatedDate: new Date("2024-12-18")
  },

  // Manufacturing & Processing (20 opportunities)
  {
    id: "OPP-031",
    name: "Aluminium Smelter Expansion - Odisha",
    source: "Hindalco Industries",
    sponsor: "Satish Pai",
    investmentRange: { min: 167000000, max: 222000000 },
    estimatedStart: "Q2 2025",
    duration: 36,
    strategicFitScore: 87,
    preliminaryRiskScore: 35,
    status: "approved" as const,
    description: "Doubling smelter capacity to 1.2 million tonnes annually",
    recommendations: "Leverages captive power and raw material access",
    approvedBy: "Gautam Adani",
    updatedBy: "Satish Pai",
    updatedDate: new Date("2024-12-03")
  },
  {
    id: "OPP-032",
    name: "Petrochemical Complex - Gujarat",
    source: "Adani Petrochemicals",
    sponsor: "Pranav Adani",
    investmentRange: { min: 278000000, max: 356000000 },
    estimatedStart: "Q1 2026",
    duration: 48,
    strategicFitScore: 89,
    preliminaryRiskScore: 42,
    status: "under_review" as const,
    description: "Integrated petrochemical complex producing polymers and chemicals",
    recommendations: "Backward integration from refinery operations",
    approvedBy: null,
    updatedBy: "Pranav Adani",
    updatedDate: new Date("2024-12-12")
  },
  {
    id: "OPP-033",
    name: "Cement Plant Modernization",
    source: "Ambuja Cements",
    sponsor: "Ajay Kapur",
    investmentRange: { min: 89000000, max: 133000000 },
    estimatedStart: "Q3 2025",
    duration: 30,
    strategicFitScore: 85,
    preliminaryRiskScore: 25,
    status: "new" as const,
    description: "Upgrading 10 cement plants with energy-efficient technology",
    recommendations: "Reduces carbon footprint by 30%",
    approvedBy: null,
    updatedBy: "Ajay Kapur",
    updatedDate: new Date("2024-12-14")
  },
  {
    id: "OPP-034",
    name: "Copper Smelter - Jharkhand",
    source: "Adani Enterprises",
    sponsor: "Robbie Singh",
    investmentRange: { min: 133000000, max: 178000000 },
    estimatedStart: "Q4 2025",
    duration: 42,
    strategicFitScore: 83,
    preliminaryRiskScore: 45,
    status: "new" as const,
    description: "500,000 tonnes copper smelting facility with recycling",
    recommendations: "Growing demand from EV and renewable sectors",
    approvedBy: null,
    updatedBy: "Robbie Singh",
    updatedDate: new Date("2024-12-16")
  },
  {
    id: "OPP-035",
    name: "Specialty Chemicals Plant",
    source: "Adani Specialty Chemicals",
    sponsor: "Pranav Adani",
    investmentRange: { min: 67000000, max: 100000000 },
    estimatedStart: "Q2 2025",
    duration: 24,
    strategicFitScore: 86,
    preliminaryRiskScore: 38,
    status: "under_review" as const,
    description: "High-value specialty chemicals for pharmaceutical industry",
    recommendations: "Import substitution opportunity",
    approvedBy: null,
    updatedBy: "Pranav Adani",
    updatedDate: new Date("2024-12-09")
  },

  // Continue with remaining opportunities to reach 200+...
  // Urban Development (15 opportunities)
  {
    id: "OPP-036",
    name: "Smart City - Ahmedabad Phase II",
    source: "Adani Realty",
    sponsor: "Gautam Adani",
    investmentRange: { min: 111000000, max: 167000000 },
    estimatedStart: "Q1 2026",
    duration: 60,
    strategicFitScore: 82,
    preliminaryRiskScore: 45,
    status: "new" as const,
    description: "Integrated township with smart infrastructure for 50,000 residents",
    recommendations: "Leverages Adani's infrastructure expertise",
    approvedBy: null,
    updatedBy: "Gautam Adani",
    updatedDate: new Date("2024-12-19")
  },
  {
    id: "OPP-037",
    name: "Water Treatment Plant - Delhi NCR",
    source: "Adani Water",
    sponsor: "Karan Adani",
    investmentRange: { min: 44000000, max: 67000000 },
    estimatedStart: "Q3 2025",
    duration: 24,
    strategicFitScore: 88,
    preliminaryRiskScore: 32,
    status: "under_review" as const,
    description: "500 MLD water treatment and distribution system",
    recommendations: "Critical infrastructure for growing NCR population",
    approvedBy: null,
    updatedBy: "Karan Adani",
    updatedDate: new Date("2024-12-13")
  },
  {
    id: "OPP-038",
    name: "Waste-to-Energy Plant - Mumbai",
    source: "Adani Green Energy",
    sponsor: "Vneet Jaain",
    investmentRange: { min: 33000000, max: 50000000 },
    estimatedStart: "Q2 2025",
    duration: 30,
    strategicFitScore: 85,
    preliminaryRiskScore: 38,
    status: "approved" as const,
    description: "25MW waste-to-energy plant processing 1000 tonnes daily",
    recommendations: "Solves waste management while generating clean energy",
    approvedBy: "Karan Adani",
    updatedBy: "Vneet Jaain",
    updatedDate: new Date("2024-12-08")
  },

  // Adding more opportunities to reach 200+
  {
    id: "OPP-039",
    name: "Andhra Pradesh Solar Park",
    source: "Adani Green Energy",
    sponsor: "Vneet Jaain",
    investmentRange: { min: 100000000, max: 133000000 },
    estimatedStart: "Q1 2025",
    duration: 24,
    strategicFitScore: 91,
    preliminaryRiskScore: 30,
    status: "under_review" as const,
    description: "600MW solar park with grid connectivity infrastructure",
    recommendations: "State government providing land at subsidized rates",
    approvedBy: null,
    updatedBy: "Vneet Jaain",
    updatedDate: new Date("2024-12-17")
  },
  {
    id: "OPP-040",
    name: "Madhya Pradesh Wind Farm",
    source: "Adani Green Energy",
    sponsor: "Sagar Adani",
    investmentRange: { min: 72000000, max: 94000000 },
    estimatedStart: "Q4 2025",
    duration: 18,
    strategicFitScore: 88,
    preliminaryRiskScore: 35,
    status: "new" as const,
    description: "350MW wind farm in Ratlam district with transmission lines",
    recommendations: "Excellent wind resource with 35% capacity factor",
    approvedBy: null,
    updatedBy: "Sagar Adani",
    updatedDate: new Date("2024-12-20")
  }
];

// Generate additional opportunities to reach 200+
const additionalOpportunities = [];
let oppId = 41;

const sources = [
  "Adani Green Energy", "Adani Ports", "Adani Enterprises", "Adani Gas",
  "Adani Transmission", "Adani Power", "Adani Wilmar", "Adani Logistics",
  "AdaniConnex", "Adani Mining", "Adani Realty", "Adani Airport Holdings"
];

const sponsors = [
  "Gautam Adani", "Karan Adani", "Vneet Jaain", "Pranav Adani", "Sagar Adani",
  "Jeet Adani", "Arun Bansal", "Ashwani Gupta", "Lucas Dow", "Robbie Singh"
];

const statuses = ["new", "under_review", "approved", "rejected"] as const;

const projectTypes = [
  { name: "Solar Power Plant", investment: [200000000, 800000000], duration: [18, 30] },
  { name: "Wind Farm", investment: [300000000, 600000000], duration: [15, 24] },
  { name: "Port Terminal", investment: [400000000, 1200000000], duration: [24, 42] },
  { name: "Data Center", investment: [200000000, 600000000], duration: [12, 24] },
  { name: "Transmission Line", investment: [150000000, 500000000], duration: [12, 30] },
  { name: "Gas Pipeline", investment: [300000000, 800000000], duration: [18, 36] },
  { name: "Logistics Hub", investment: [100000000, 400000000], duration: [12, 24] },
  { name: "Airport Expansion", investment: [500000000, 1500000000], duration: [30, 48] },
  { name: "Mining Operation", investment: [400000000, 1000000000], duration: [24, 60] },
  { name: "Manufacturing Plant", investment: [300000000, 900000000], duration: [18, 36] }
];

const locations = [
  "Gujarat", "Rajasthan", "Maharashtra", "Karnataka", "Tamil Nadu", "Andhra Pradesh",
  "Telangana", "Uttar Pradesh", "Madhya Pradesh", "Odisha", "Jharkhand", "West Bengal",
  "Haryana", "Punjab", "Kerala", "Assam", "Queensland", "New South Wales", "Sri Lanka",
  "Bangladesh", "UAE", "Kenya", "Mozambique", "Myanmar"
];

for (let i = 0; i < 160; i++) {
  const projectType = projectTypes[i % projectTypes.length];
  const location = locations[i % locations.length];
  const source = sources[i % sources.length];
  const sponsor = sponsors[i % sponsors.length];
  const status = statuses[i % statuses.length];
  
  const minInvestment = projectType.investment[0];
  const maxInvestment = projectType.investment[1];
  const minDuration = projectType.duration[0];
  const maxDuration = projectType.duration[1];
  
  additionalOpportunities.push({
    id: `OPP-${oppId.toString().padStart(3, '0')}`,
    name: `${location} ${projectType.name}`,
    source,
    sponsor,
    investmentRange: { min: minInvestment, max: maxInvestment },
    estimatedStart: `Q${Math.floor(Math.random() * 4) + 1} 202${Math.floor(Math.random() * 2) + 5}`,
    duration: minDuration + Math.floor(Math.random() * (maxDuration - minDuration)),
    strategicFitScore: 70 + Math.floor(Math.random() * 30),
    preliminaryRiskScore: 20 + Math.floor(Math.random() * 50),
    status,
    description: `${projectType.name} development in ${location} with modern technology and infrastructure`,
    recommendations: `Strategic investment opportunity with ${Math.floor(Math.random() * 5) + 15}% expected returns`,
    approvedBy: status === "approved" ? "Gautam Adani" : null,
    updatedBy: sponsor,
    updatedDate: new Date(2024, 11, Math.floor(Math.random() * 20) + 1)
  });
  
  oppId++;
}

export const allOpportunities = [...adaniOpportunities, ...additionalOpportunities];

export const adaniSectors = [
  { id: "SEC-001", name: "Renewable Energy", icon: "☀️", targetAllocation: 35, color: "#10b981" },
  { id: "SEC-002", name: "Ports & Logistics", icon: "🚢", targetAllocation: 20, color: "#3b82f6" },
  { id: "SEC-003", name: "Airports", icon: "✈️", targetAllocation: 10, color: "#8b5cf6" },
  { id: "SEC-004", name: "Data Centers", icon: "🖥️", targetAllocation: 10, color: "#f59e0b" },
  { id: "SEC-005", name: "Transmission", icon: "⚡", targetAllocation: 10, color: "#ef4444" },
  { id: "SEC-006", name: "City Gas", icon: "🔥", targetAllocation: 5, color: "#06b6d4" },
  { id: "SEC-007", name: "Roads", icon: "🛣️", targetAllocation: 5, color: "#84cc16" },
  { id: "SEC-008", name: "Water", icon: "💧", targetAllocation: 3, color: "#f97316" },
  { id: "SEC-009", name: "New Ventures", icon: "🚀", targetAllocation: 2, color: "#ec4899" }
];

export const adaniMetrics = {
  totalCapital: 10000000000, // $10B
  deploymentTarget: 5, // years
  currentDeploymentRate: 9, // months
  targetDeploymentRate: 9, // weeks
  totalOpportunities: allOpportunities.length,
  activePriorities: adaniPriorities.length,
  portfolioSectors: adaniSectors.length
};

export const formatCurrency = (amount: number): string => {
  if (amount >= 1000000000) {
    return `$${(amount / 1000000000).toFixed(1)}B`;
  } else if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(0)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  } else {
    return `$${amount.toFixed(0)}`;
  }
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(1)}B`;
  } else if (num >= 1000000) {
    return `${(num / 1000000).toFixed(0)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(0)}K`;
  } else {
    return num.toString();
  }
};