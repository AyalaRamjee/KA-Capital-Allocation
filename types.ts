// types.ts - Shared TypeScript interfaces across multiple tabs

export interface BusinessDomain {
  id: string
  code: string
  name: string
  description: string
  icon: string // emoji or icon name
  budget: number // dollar amount
  budgetPercent: number // percentage of total budget
  remainingBudget: number // budget remaining after allocations
  riskTolerance: 'low' | 'medium' | 'high'
  minIRR: number // minimum IRR threshold (e.g., 15%)
  maxPayback: number // maximum payback period in years
  strategicScore: number // 1-10 importance ranking
  isActive: boolean
  projectCount: number
  color: string // for visualization
  projects: Project[] // projects in this domain
  createdAt: Date
  updatedAt: Date
}

export interface Project {
  id: string
  projectId?: string
  name: string
  category?: string
  description: string
  sponsor?: string
  status?: 'available' | 'selected' | 'excluded'
  
  // Financial
  capex: number // CAPEX requirement
  opex?: number // Annual OPEX
  revenuePotential?: number
  savingsPotential?: number
  
  // Analysis
  npv: number
  irr: number
  mirr: number
  paybackYears: number
  
  // Metadata
  risk: 'low' | 'medium' | 'high'
  riskLevel?: 'low' | 'medium' | 'high'
  riskScore: number // 1-10
  domain: string // Business Domain ID
  businessUnit?: string
  geography?: string
  duration: number // months
  
  // Portfolio Management
  isSelected?: boolean
  portfolioRank?: number
  rank?: number
  startQuarter?: number
  quarters?: number[]
  strategicFit?: number // 1-10 scale
  quarterlyAllocation?: {
    quarter: string // 'Q1-2025', 'Q2-2025', etc.
    amount: number
  }[]
  
  // Projections
  cashFlows?: {
    year: number
    amount: number
  }[]
  
  createdAt?: Date
  updatedAt?: Date
}

export interface ValidationIssue {
  id: string
  severity: 'critical' | 'warning' | 'info'
  title: string
  description: string
  affectedItems: string[]
  category: 'completeness' | 'consistency' | 'accuracy' | 'compliance' | 'logic' | 'format'
  resolved: boolean
  comments?: string
}

export interface ApprovalStatus {
  id: string
  domain: string
  role: 'domainOwner' | 'finance' | 'risk' | 'executive'
  status: 'pending' | 'approved' | 'rejected' | 'not_started'
  approver: string
  date?: Date
  comments?: string
}

export interface PortfolioMetrics {
  totalCapital: number
  totalCapex: number
  totalNPV: number
  avgIRR: number
  portfolioIRR: number
  avgPayback: number
  riskScore: number
  avgRisk: number
  selectedProjects: number
  projectCount: number
}

export interface QuarterlyLimit {
  quarter: string
  limit: number
  available: number
}

export interface RiskReturnProfile {
  riskLevel: 'low' | 'medium' | 'high'
  irrRange: [number, number]
  paybackRange: [number, number]
  npvMultiplier: number
  sectors: string[]
}

export interface IndustryMetrics {
  avgCapex: number
  avgIRR: number
  avgPayback: number
  regulatoryRisk: 'low' | 'medium' | 'high'
  capitalIntensity: 'low' | 'medium' | 'high'
}

export interface AllocationPattern {
  name: string
  description: string
  apply: (total: number, quarters: number) => number[]
}

export interface ValidationRule {
  name: string
  type: 'critical' | 'warning'
  check: (data: any) => boolean
  message: string
}

export interface AppState {
  businessDomains: BusinessDomain[]
  projects: Project[]
  validationIssues: ValidationIssue[]
  approvalStatuses: ApprovalStatus[]
  portfolioMetrics: PortfolioMetrics
  totalBudget: number
  quarterlyLimits: QuarterlyLimit[]
  riskReturnProfiles: RiskReturnProfile[]
  industryMetrics: { [key: string]: IndustryMetrics }
  allocationPatterns: AllocationPattern[]
  validationRules: ValidationRule[]
  settings: {
    discountRate: number
    currency: string
    fiscalYearStart: number
    totalBudget: number
  }
}