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
  title: string
  description: string
  category: 'financial' | 'operational' | 'strategic' | 'compliance' | 'technology'
  probability: number // 1-5
  impact: number // 1-5
  mitigation: string
  owner: string
  status: 'open' | 'mitigated' | 'closed'
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

export interface BusinessCase {
  id: string
  projectId: string
  
  // Timeline
  phases: {
    planning: {
      startDate: Date
      duration: number // months
      milestones: Milestone[]
    }
    compliance: {
      startDate: Date
      duration: number
      requirements: ComplianceItem[]
    }
    implementation: {
      startDate: Date
      duration: number
      workstreams: Workstream[]
    }
    rampUp: {
      startDate: Date
      duration: number
      targetMetrics: Metric[]
    }
  }
  
  // Resources
  staffing: {
    kickoffTeam: number
    rampUpCurve: { month: number; fte: number }[]
    steadyState: number
    skills: SkillRequirement[]
  }
  
  // Risks
  risks: Risk[]
  
  // Dependencies
  dependencies: Dependency[]
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
  category: 'completeness' | 'consistency' | 'logic' | 'format'
  resolved: boolean
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

// Default data
export const defaultPriorities: Priority[] = [
  {
    id: '1',
    code: 'P1',
    name: 'Digital Transformation',
    description: 'Modernize digital infrastructure and capabilities',
    weight: 30,
    minThreshold: 15,
    budgetMin: 20,
    budgetMax: 50,
    timeHorizon: 'medium',
    kpis: ['Digital adoption rate', 'System uptime', 'User satisfaction'],
    sponsor: 'John Smith, CTO',
    color: '#3b82f6',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    code: 'P2',
    name: 'Market Expansion',
    description: 'Enter new geographical markets and segments',
    weight: 25,
    minThreshold: 10,
    budgetMin: 15,
    budgetMax: 40,
    timeHorizon: 'long',
    kpis: ['Revenue growth', 'Market share', 'Customer acquisition'],
    sponsor: 'Sarah Johnson, CMO',
    color: '#10b981',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    code: 'P3',
    name: 'Operational Excellence',
    description: 'Improve efficiency and reduce operational costs',
    weight: 20,
    minThreshold: 12,
    budgetMin: 10,
    budgetMax: 30,
    timeHorizon: 'short',
    kpis: ['Cost reduction', 'Process efficiency', 'Quality metrics'],
    sponsor: 'Mike Davis, COO',
    color: '#f59e0b',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '4',
    code: 'P4',
    name: 'Customer Experience',
    description: 'Enhance customer satisfaction and retention',
    weight: 15,
    minThreshold: 8,
    budgetMin: 5,
    budgetMax: 25,
    timeHorizon: 'medium',
    kpis: ['NPS score', 'Customer retention', 'Response time'],
    sponsor: 'Lisa Chen, CCO',
    color: '#ef4444',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '5',
    code: 'P5',
    name: 'Innovation & R&D',
    description: 'Invest in future technologies and innovation',
    weight: 10,
    minThreshold: 5,
    budgetMin: 8,
    budgetMax: 20,
    timeHorizon: 'long',
    kpis: ['Patent applications', 'Innovation revenue', 'R&D ROI'],
    sponsor: 'Alex Rodriguez, CIO',
    color: '#8b5cf6',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

export const defaultProjects: Project[] = [
  {
    id: '1',
    projectId: 'PROJ-001',
    name: 'Cloud Infrastructure Migration',
    category: 'technology',
    description: 'Migrate legacy systems to cloud infrastructure for improved scalability and cost efficiency',
    sponsor: 'John Smith, CTO',
    status: 'evaluation',
    initialCapex: 5000000,
    annualOpex: 800000,
    revenuePotential: 2000000,
    savingsPotential: 1500000,
    npv: 8500000,
    irr: 24.5,
    mirr: 18.2,
    paybackPeriod: 2.8,
    ebitdaImpact: 1200000,
    riskLevel: 'medium',
    priorityAlignment: ['1', '3'],
    businessUnit: 'Technology',
    geography: 'Global',
    cashFlows: [
      { year: 0, amount: -5000000 },
      { year: 1, amount: 1200000 },
      { year: 2, amount: 2500000 },
      { year: 3, amount: 3200000 },
      { year: 4, amount: 3800000 },
      { year: 5, amount: 4200000 }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    projectId: 'PROJ-002',
    name: 'Southeast Asia Market Entry',
    category: 'expansion',
    description: 'Expand operations to key Southeast Asian markets including Singapore, Thailand, and Vietnam',
    sponsor: 'Sarah Johnson, CMO',
    status: 'ready',
    initialCapex: 12000000,
    annualOpex: 2000000,
    revenuePotential: 8000000,
    savingsPotential: 0,
    npv: 15600000,
    irr: 28.3,
    mirr: 21.7,
    paybackPeriod: 3.2,
    ebitdaImpact: 4500000,
    riskLevel: 'high',
    priorityAlignment: ['2', '4'],
    businessUnit: 'Sales & Marketing',
    geography: 'APAC',
    cashFlows: [
      { year: 0, amount: -12000000 },
      { year: 1, amount: -1000000 },
      { year: 2, amount: 2000000 },
      { year: 3, amount: 5500000 },
      { year: 4, amount: 8200000 },
      { year: 5, amount: 12000000 }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    projectId: 'PROJ-003',
    name: 'AI-Powered Customer Service',
    category: 'technology',
    description: 'Implement AI chatbots and predictive analytics to enhance customer service operations',
    sponsor: 'Lisa Chen, CCO',
    status: 'ideation',
    initialCapex: 3500000,
    annualOpex: 600000,
    revenuePotential: 1200000,
    savingsPotential: 2500000,
    npv: 6800000,
    irr: 32.1,
    mirr: 22.4,
    paybackPeriod: 2.1,
    ebitdaImpact: 1800000,
    riskLevel: 'medium',
    priorityAlignment: ['1', '4'],
    businessUnit: 'Customer Service',
    geography: 'Global',
    cashFlows: [
      { year: 0, amount: -3500000 },
      { year: 1, amount: 800000 },
      { year: 2, amount: 1800000 },
      { year: 3, amount: 2400000 },
      { year: 4, amount: 2800000 },
      { year: 5, amount: 3200000 }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

export const defaultSettings = {
  discountRate: 10,
  currency: 'USD',
  fiscalYearStart: 1,
  availableBudget: 125000000
}