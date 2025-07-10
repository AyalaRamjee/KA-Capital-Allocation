export interface Priority {
  id: string
  code: string
  name: string
  description: string
  weight: number // 0-100, all must sum to 100
  minThreshold: number // 0-100
  budgetMin: number
  budgetMax: number
  timeHorizon: 'short' | 'medium' | 'long'
  kpis: string[]
  sponsor: string
  color: string // for visualization
  createdAt: Date
  updatedAt: Date
}

export interface Project {
  id: string
  projectId: string
  name: string
  category: string
  description: string
  sponsor: string
  status: 'ideation' | 'evaluation' | 'ready' | 'approved' | 'rejected'
  
  // Financial
  initialCapex: number
  annualOpex: number
  revenuePotential: number
  savingsPotential: number
  
  // Analysis
  npv: number
  irr: number
  mirr: number
  paybackPeriod: number
  ebitdaImpact: number
  
  // Metadata
  riskLevel: 'low' | 'medium' | 'high'
  priorityAlignment: string[] // Priority IDs
  businessUnit: string
  geography: string
  
  // Projections
  cashFlows: {
    year: number
    amount: number
  }[]
  
  createdAt: Date
  updatedAt: Date
}

export interface Milestone {
  id: string
  name: string
  description: string
  dueDate: Date
  completed: boolean
  dependencies: string[]
}

export interface ComplianceItem {
  id: string
  requirement: string
  responsible: string
  dueDate: Date
  status: 'pending' | 'in_progress' | 'completed' | 'overdue'
  evidence: string[]
}

export interface Workstream {
  id: string
  name: string
  description: string
  lead: string
  startDate: Date
  endDate: Date
  progress: number
  milestones: Milestone[]
}

export interface Metric {
  id: string
  name: string
  target: number
  actual: number
  unit: string
  trend: 'up' | 'down' | 'stable'
}

export interface SkillRequirement {
  id: string
  name: string
  level: 'junior' | 'mid' | 'senior' | 'expert'
  count: number
  availability: 'high' | 'medium' | 'low'
  cost: number
}

export interface Risk {
  id: string
  description: string
  category: 'financial' | 'operational' | 'strategic' | 'compliance' | 'technology' | 'technical' | 'regulatory'
  probability: number // 1-5
  impact: number // 1-5
  mitigation: string
  owner: string
}

export interface Dependency {
  id: string
  name: string
  description: string
  type: 'internal' | 'external' | 'vendor' | 'regulatory'
  criticality: 'high' | 'medium' | 'low'
  owner: string
  dueDate: Date
  status: 'pending' | 'in_progress' | 'completed' | 'blocked'
}

export interface Phase {
  id: string
  name: string
  type: 'planning' | 'compliance' | 'implementation' | 'ramp-up'
  startWeek: number
  durationWeeks: number
  description: string
  deliverables: string[]
  dependencies: string[]
  milestones: Milestone[]
}

export interface Milestone {
  id: string
  name: string
  description: string
  dueDate: Date
  status: 'pending' | 'in_progress' | 'completed' | 'overdue'
  owner: string
}

export interface Resource {
  id: string
  skillType: string
  totalFTE: number
  rampUp: { week: number; fte: number }[]
  cost: number
}

export interface BusinessCase {
  id: string
  projectId: string
  status: 'draft' | 'review' | 'approved' | 'rejected'
  phases: Phase[]
  resources: Resource[]
  risks: Risk[]
  dependencies: string[]
  createdAt: Date
  updatedAt: Date
}

export interface ProjectScore {
  projectId: string
  scores: {
    priorityId: string
    alignmentScore: number // 0-100
    weightedScore: number // alignmentScore * priority.weight
  }[]
  totalScore: number
  passesThreshold: boolean
  rank: number
  allocated: boolean
}

export interface ValidationIssue {
  id: string
  severity: 'error' | 'warning'
  title: string
  description: string
  affectedItems: string[]
  category: 'completeness' | 'consistency' | 'accuracy' | 'compliance' | 'logic' | 'format'
  resolved: boolean
  comments?: string
}

export interface ApprovalStatus {
  id: string
  title: string
  approver: string
  status: 'pending' | 'approved' | 'rejected' | 'waiting'
  date?: Date
  comments?: string
  dependencies?: string[]
  requiredFor?: string[]
}

export interface PortfolioMetrics {
  totalCapital: number
  totalNPV: number
  avgIRR: number
  avgPayback: number
  riskScore: number
  roi: number
}

export interface Scenario {
  id: string
  name: string
  description: string
  parameters: {
    priorityAdjustments: {
      priorityId: string
      weightChange: number // -100 to +100
      thresholdChange: number
    }[]
    constraints: {
      budgetReduction: number // percentage
      complianceExtension: number // months
      fteLimit: number
      minIRR: number
    }
    riskFactors: {
      projectDelay: number // months
      costIncrease: number // percentage
      benefitReduction: number // percentage
    }
    marketConditions: {
      interestRateChange: number
      fxImpact: number
      inflationRate: number
    }
  }
  results: {
    portfolioNPV: number
    portfolioIRR: number
    projectsIncluded: string[]
    budgetUsed: number
    riskScore: number
  }
  createdAt: Date
}

export interface AppState {
  priorities: Priority[]
  projects: Project[]
  businessCases: BusinessCase[]
  projectScores: ProjectScore[]
  validationIssues: ValidationIssue[]
  approvalStatuses: ApprovalStatus[]
  portfolioMetrics: PortfolioMetrics
  scenarios: Scenario[]
  activeScenario: string
  currentTab: string
  availableBudget: number
  settings: {
    discountRate: number
    currency: string
    fiscalYearStart: number
  }
}

// Enterprise Strategic Priorities - Global Scale
export const defaultPriorities: Priority[] = [
  {
    id: '1',
    code: 'P1',
    name: 'Green Energy Transition',
    description: 'Accelerate renewable energy capacity to 50GW by 2030 with integrated green hydrogen production across India',
    weight: 45,
    minThreshold: 75,
    budgetMin: 3500000, // ₹35,000 Cr
    budgetMax: 4500000, // ₹45,000 Cr
    timeHorizon: 'long',
    kpis: [
      'Solar Park - 50GW capacity development',
      'Green Hydrogen Plant - 1M TPA production',
      'Offshore Wind Farms - 5GW across Gujarat coast',
      'Carbon neutrality achievement by 2050',
      'Renewable energy cost reduction by 40%'
    ],
    sponsor: 'Executive Director, Chief Executive Officer',
    color: '#10b981',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    code: 'P2',
    name: 'Infrastructure Expansion',
    description: 'Strategic expansion of ports, airports, roads and logistics infrastructure to capture emerging market opportunities',
    weight: 25,
    minThreshold: 70,
    budgetMin: 2000000, // ₹20,000 Cr
    budgetMax: 3000000, // ₹30,000 Cr
    timeHorizon: 'medium',
    kpis: [
      'Ports expansion - 5 new facilities by 2027',
      'Cargo capacity - 200 MT annual throughput',
      'Airport network - 3 new international hubs',
      'Digital logistics platform implementation',
      'Mumbai-Delhi Expressway completion'
    ],
    sponsor: 'VP Operations, Vice President',
    color: '#4B7BFF',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    code: 'P3',
    name: 'Digital Transformation',
    description: 'Enterprise-wide digital transformation with data centers, logistics technology, and super app development',
    weight: 20,
    minThreshold: 65,
    budgetMin: 1000000, // ₹10,000 Cr
    budgetMax: 1500000, // ₹15,000 Cr
    timeHorizon: 'short',
    kpis: [
      'Data center network - 15 facilities across India',
      'AI-powered logistics optimization',
      'Super app ecosystem development',
      'Digital automation - 80% process coverage',
      'Cybersecurity infrastructure enhancement'
    ],
    sponsor: 'Chief Strategy Officer, CSO',
    color: '#f59e0b',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '4',
    code: 'P4',
    name: 'Operational Excellence',
    description: 'Drive operational efficiency and cost optimization initiatives across all business verticals',
    weight: 10,
    minThreshold: 60,
    budgetMin: 500000,  // ₹5,000 Cr
    budgetMax: 1000000, // ₹10,000 Cr
    timeHorizon: 'medium',
    kpis: [
      'Cost reduction - 15% across operations',
      'Process automation implementation',
      'Safety protocols - zero incidents target',
      'Supply chain optimization',
      'Performance management systems'
    ],
    sponsor: 'Portfolio Manager, Senior Director',
    color: '#8b5cf6',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

// Enterprise Portfolio Projects
export const defaultProjects: Project[] = [
  {
    id: '1',
    projectId: 'SOLAR-001',
    name: 'Solar Park Phase III',
    category: 'renewable_energy',
    description: 'World\'s largest solar park expansion - 10GW additional capacity',
    sponsor: 'Executive Director, Chief Executive Officer',
    status: 'evaluation',
    initialCapex: 7500000, // ₹75,000 Cr
    annualOpex: 150000,
    revenuePotential: 1800000,
    savingsPotential: 0,
    npv: 9200000, // ₹92,000 Cr
    irr: 24.2,
    mirr: 18.8,
    paybackPeriod: 3.1,
    ebitdaImpact: 1400000,
    riskLevel: 'medium',
    priorityAlignment: ['1'],
    businessUnit: 'Green Energy Division',
    geography: 'Gujarat',
    cashFlows: [
      { year: 0, amount: -7500000 },
      { year: 1, amount: 800000 },
      { year: 2, amount: 1600000 },
      { year: 3, amount: 2400000 },
      { year: 4, amount: 2800000 },
      { year: 5, amount: 3200000 }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    projectId: 'PORT-002',
    name: 'Vizhinjam Deep Water Port',
    category: 'infrastructure',
    description: 'International container transshipment terminal in Kerala with 18m depth capability',
    sponsor: 'VP Operations, Vice President',
    status: 'ready',
    initialCapex: 2000000, // ₹20,000 Cr
    annualOpex: 200000,
    revenuePotential: 800000,
    savingsPotential: 0,
    npv: 3100000, // ₹31,000 Cr
    irr: 31.2,
    mirr: 23.4,
    paybackPeriod: 2.8,
    ebitdaImpact: 600000,
    riskLevel: 'high',
    priorityAlignment: ['2'],
    businessUnit: 'Infrastructure Division',
    geography: 'Kerala',
    cashFlows: [
      { year: 0, amount: -2000000 },
      { year: 1, amount: 200000 },
      { year: 2, amount: 600000 },
      { year: 3, amount: 900000 },
      { year: 4, amount: 1200000 },
      { year: 5, amount: 1400000 }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    projectId: 'HYDRO-003',
    name: 'Dibang Hydro Electric Project',
    category: 'renewable_energy',
    description: '2,880 MW run-of-river hydroelectric project in Arunachal Pradesh',
    sponsor: 'Hydro Project Team',
    status: 'approved',
    initialCapex: 4500000, // ₹45,000 Cr
    annualOpex: 180000,
    revenuePotential: 1200000,
    savingsPotential: 0,
    npv: 6700000, // ₹67,000 Cr
    irr: 21.5,
    mirr: 17.2,
    paybackPeriod: 4.2,
    ebitdaImpact: 900000,
    riskLevel: 'high',
    priorityAlignment: ['1'],
    businessUnit: 'Green Energy Division',
    geography: 'Arunachal Pradesh',
    cashFlows: [
      { year: 0, amount: -4500000 },
      { year: 1, amount: 0 },
      { year: 2, amount: 400000 },
      { year: 3, amount: 1000000 },
      { year: 4, amount: 1400000 },
      { year: 5, amount: 1600000 }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '4',
    projectId: 'ROAD-004',
    name: 'Mumbai-Delhi Expressway',
    category: 'infrastructure',
    description: '1,350km 8-lane access-controlled expressway connecting Mumbai and Delhi',
    sponsor: 'Adani Road Transport Team',
    status: 'ready',
    initialCapex: 3500000, // ₹35,000 Cr
    annualOpex: 350000,
    revenuePotential: 650000,
    savingsPotential: 200000,
    npv: 4100000, // ₹41,000 Cr
    irr: 18.7,
    mirr: 15.3,
    paybackPeriod: 5.2,
    ebitdaImpact: 500000,
    riskLevel: 'medium',
    priorityAlignment: ['2', '3'],
    businessUnit: 'Adani Road Transport',
    geography: 'Maharashtra, Delhi',
    cashFlows: [
      { year: 0, amount: -3500000 },
      { year: 1, amount: 100000 },
      { year: 2, amount: 400000 },
      { year: 3, amount: 700000 },
      { year: 4, amount: 900000 },
      { year: 5, amount: 1100000 }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '5',
    projectId: 'HYDROGEN-005',
    name: 'Green Hydrogen Manufacturing',
    category: 'renewable_energy',
    description: '1 million tons per annum green hydrogen and ammonia production facility',
    sponsor: 'Adani New Industries',
    status: 'evaluation',
    initialCapex: 3000000, // ₹30,000 Cr
    annualOpex: 400000,
    revenuePotential: 1000000,
    savingsPotential: 0,
    npv: 4200000, // ₹42,000 Cr
    irr: 26.8,
    mirr: 20.1,
    paybackPeriod: 3.8,
    ebitdaImpact: 700000,
    riskLevel: 'high',
    priorityAlignment: ['1', '4'],
    businessUnit: 'Adani New Industries',
    geography: 'Gujarat',
    cashFlows: [
      { year: 0, amount: -3000000 },
      { year: 1, amount: 200000 },
      { year: 2, amount: 600000 },
      { year: 3, amount: 1000000 },
      { year: 4, amount: 1200000 },
      { year: 5, amount: 1400000 }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '6',
    projectId: 'AIRPORT-006',
    name: 'Navi Mumbai International Airport',
    category: 'infrastructure',
    description: 'Greenfield airport with initial capacity of 10 million passengers per annum',
    sponsor: 'Adani Airport Holdings',
    status: 'ready',
    initialCapex: 1600000, // ₹16,000 Cr
    annualOpex: 160000,
    revenuePotential: 400000,
    savingsPotential: 0,
    npv: 2200000, // ₹22,000 Cr
    irr: 19.5,
    mirr: 16.2,
    paybackPeriod: 4.8,
    ebitdaImpact: 300000,
    riskLevel: 'medium',
    priorityAlignment: ['2'],
    businessUnit: 'Adani Airport Holdings',
    geography: 'Maharashtra',
    cashFlows: [
      { year: 0, amount: -1600000 },
      { year: 1, amount: 50000 },
      { year: 2, amount: 200000 },
      { year: 3, amount: 350000 },
      { year: 4, amount: 450000 },
      { year: 5, amount: 550000 }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '7',
    projectId: 'WIND-007',
    name: 'Offshore Wind Farm Gujarat',
    category: 'renewable_energy',
    description: '5GW offshore wind energy project in Gulf of Khambhat, Gujarat',
    sponsor: 'Adani Green Energy',
    status: 'ideation',
    initialCapex: 4000000, // ₹40,000 Cr
    annualOpex: 200000,
    revenuePotential: 1200000,
    savingsPotential: 0,
    npv: 5800000, // ₹58,000 Cr
    irr: 22.3,
    mirr: 18.9,
    paybackPeriod: 3.9,
    ebitdaImpact: 800000,
    riskLevel: 'high',
    priorityAlignment: ['1'],
    businessUnit: 'Green Energy Division',
    geography: 'Gujarat',
    cashFlows: [
      { year: 0, amount: -4000000 },
      { year: 1, amount: 300000 },
      { year: 2, amount: 800000 },
      { year: 3, amount: 1200000 },
      { year: 4, amount: 1400000 },
      { year: 5, amount: 1600000 }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '8',
    projectId: 'COAL-008',
    name: 'Talwandi Coal Power Plant',
    category: 'conventional_energy',
    description: '1,980 MW supercritical thermal power plant in Punjab',
    sponsor: 'Adani Power',
    status: 'rejected',
    initialCapex: 1500000, // ₹15,000 Cr
    annualOpex: 800000,
    revenuePotential: 600000,
    savingsPotential: 0,
    npv: -200000, // ₹-2,000 Cr (negative)
    irr: 8.2,
    mirr: 6.8,
    paybackPeriod: 8.5,
    ebitdaImpact: 100000,
    riskLevel: 'high',
    priorityAlignment: [],
    businessUnit: 'Adani Power',
    geography: 'Punjab',
    cashFlows: [
      { year: 0, amount: -1500000 },
      { year: 1, amount: 100000 },
      { year: 2, amount: 150000 },
      { year: 3, amount: 200000 },
      { year: 4, amount: 200000 },
      { year: 5, amount: 200000 }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

export const defaultSettings = {
  discountRate: 10,
  currency: 'INR',
  fiscalYearStart: 4, // Indian fiscal year starts in April
  availableBudget: 8500000 // ₹85,000 Cr total available budget
}

// Indian number formatting utility
export const formatIndianCurrency = (amount: number): string => {
  const crores = amount / 100000
  if (crores >= 1000) {
    return `₹${(crores / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })} L Cr`
  }
  return `₹${crores.toLocaleString('en-IN', { maximumFractionDigits: 0 })} Cr`
}