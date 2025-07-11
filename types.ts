// types.ts - Adani Growth System TypeScript interfaces

// Core Adani Growth System interfaces
export interface InvestmentPriority {
  id: string
  name: string
  description: string
  weight: number // percentage
  capitalAllocation: number
  timeHorizon: number
  minROI: number
  maxPayback: number
  riskAppetite: 'conservative' | 'moderate' | 'aggressive'
  strategicImportance: number // 1-10
  icon: string
  color: string
}

export interface Opportunity {
  id: string
  name: string
  source: string
  sponsor: string
  investmentRange: { min: number; max: number }
  estimatedStart: string
  duration: number
  strategicFitScore: number
  preliminaryRiskScore: number
  status: 'new' | 'under_review' | 'approved' | 'rejected'
  description: string
  recommendations: string
  approvedBy: string | null
  updatedBy: string
  updatedDate: Date
}

export interface FinancialProjection {
  year: number
  revenue: number
  costs: number
  ebitda: number
  capex: number
  fcf: number
}

export interface RiskMitigation {
  id: string
  risk: string
  impact: 'low' | 'medium' | 'high'
  probability: 'low' | 'medium' | 'high'
  mitigation: string
  owner: string
}

export interface Synergy {
  id: string
  type: 'revenue' | 'cost' | 'capital'
  description: string
  value: number
  timeframe: string
  confidence: 'low' | 'medium' | 'high'
}

export interface AdaniProject {
  id: string
  opportunityId: string
  name: string
  description: string
  sponsor: string
  status: 'planning' | 'approved' | 'in_progress' | 'completed' | 'cancelled'
  
  // Financial
  capex: number
  opex: number
  revenuePotential: number
  
  // Analysis
  npv: number
  irr: number
  mirr: number
  paybackYears: number
  
  // Business Plan
  businessPlan: {
    executiveSummary: string
    marketAnalysis: string
    financialProjections: FinancialProjection[]
    riskMitigation: RiskMitigation[]
    synergies: Synergy[]
  }
  
  // Scoring
  compositeScore: number
  investmentGrade: 'A' | 'B' | 'C' | 'Non-Investment'
  
  // Metadata
  riskScore: number
  duration: number
  geography: string
  businessUnit: string
  createdAt: Date
  updatedAt: Date
}

// Enhanced interfaces for Tab 3
export interface ValidatedProject extends Omit<AdaniProject, 'businessPlan'> {
  validationId: string
  validationStatus: 'pending' | 'in_review' | 'validated' | 'rejected'
  validationDate: Date
  validatedBy: string
  
  // Enhanced business plan
  businessPlan: {
    executiveSummary: string
    marketAnalysis: string
    marketSize: number
    competitiveLandscape: string
    investmentThesis: string
    keySuccessFactors: string[]
    expectedOutcomes: string[]
    
    // 5-year financial projections (quarterly)
    financials: {
      year: number
      quarter: number
      revenue: number
      costs: number
      ebitda: number
      ebitdaMargin: number
      cashFlow: number
      capexDeployment: number
      cumulativeCapex: number
      roic: number
    }[]
    
    // For compatibility with base interface
    financialProjections: FinancialProjection[]
    riskMitigation: RiskMitigation[]
    
    // Risk assessment
    risks: {
      id: string
      category: 'execution' | 'market' | 'regulatory' | 'financial' | 'operational'
      description: string
      probability: number // 1-100
      impact: number // 1-100
      riskScore: number // probability * impact
      mitigation: string
      mitigationCost: number
      owner: string
      status: 'identified' | 'mitigated' | 'accepted'
    }[]
    
    // Synergy analysis
    synergies: {
      id: string
      businessUnit: string
      type: 'revenue' | 'cost' | 'strategic'
      description: string
      valueEstimate: number
      timeToRealize: number // months
      confidence: 'low' | 'medium' | 'high'
      dependencies: string[]
    }[]
  }
  
  // Scoring breakdown
  scoringBreakdown: {
    strategicAlignment: number // 0-100
    financialScore: number // 0-100
    riskAdjustment: number // 0-100
    synergyScore: number // 0-100
    compositeScore: number // weighted average
  }
}

// Tab 4 - Sector Allocation
export interface SectorAllocation {
  sectorId: string
  sector: AdaniSector
  currentAllocation: number // percentage
  targetAllocation: number // percentage
  minAllocation: number // percentage
  maxAllocation: number // percentage
  allocatedCapital: number // dollars
  projectCount: number
  projects: ValidatedProject[]
  performance: {
    avgIRR: number
    avgNPV: number
    avgRisk: number
    totalCapital: number
  }
}

export interface AllocationConstraint {
  sectorId: string
  constraintType: 'min' | 'max' | 'target'
  value: number
  isHard: boolean // hard stop vs warning
  reason: string
}

// Tab 5 - Data Quality
export interface ValidationRule {
  id: string
  name: string
  category: 'financial' | 'completeness' | 'consistency' | 'accuracy' | 'compliance'
  severity: 'critical' | 'warning' | 'info'
  description: string
  checkFunction: string // serialized function
  autoFixable: boolean
  enabled: boolean
}

export interface DataQualityIssue {
  id: string
  ruleId: string
  severity: 'critical' | 'warning' | 'info'
  title: string
  description: string
  affectedItems: string[]
  category: 'financial' | 'completeness' | 'consistency' | 'accuracy' | 'compliance'
  status: 'open' | 'resolved' | 'ignored'
  detectedDate: Date
  resolvedDate?: Date
  resolvedBy?: string
  autoFixSuggestion?: string
}

export interface DataQualityMetrics {
  overallScore: number // 0-100
  totalIssues: number
  criticalIssues: number
  warningIssues: number
  infoIssues: number
  resolvedIssues: number
  categoryBreakdown: {
    [key: string]: number
  }
  trendData: {
    date: Date
    score: number
    issueCount: number
  }[]
}

// Audit Trail
export interface AuditEntry {
  id: string
  timestamp: Date
  userId: string
  userName: string
  action: 'create' | 'update' | 'delete' | 'approve' | 'reject'
  entityType: 'priority' | 'opportunity' | 'project' | 'allocation'
  entityId: string
  changes: {
    field: string
    oldValue: any
    newValue: any
  }[]
  reason?: string
}

export interface AdaniSector {
  id: string
  name: string
  icon: string
  targetAllocation: number
  color: string
}

export interface AdaniMetrics {
  totalCapital: number
  deploymentTarget: number
  currentDeploymentRate: number
  targetDeploymentRate: number
  totalOpportunities: number
  activePriorities: number
  portfolioSectors: number
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
  itemId: string
  itemType: 'priority' | 'opportunity' | 'project'
  role: 'sponsor' | 'finance' | 'risk' | 'executive'
  status: 'pending' | 'approved' | 'rejected' | 'not_started'
  approver: string
  date?: Date
  comments?: string
}

// Main application state
export interface AppState {
  // Adani Growth System state
  investmentPriorities: InvestmentPriority[]
  opportunities: Opportunity[]
  adaniProjects: AdaniProject[]
  validatedProjects: ValidatedProject[]
  adaniSectors: AdaniSector[]
  adaniMetrics: AdaniMetrics
  
  // Tab 4 - Sector Allocation
  sectorAllocations: SectorAllocation[]
  allocationConstraints: AllocationConstraint[]
  
  // Tab 5 - Data Quality
  validationRules: ValidationRule[]
  dataQualityIssues: DataQualityIssue[]
  dataQualityMetrics: DataQualityMetrics
  
  // Validation and approval
  validationIssues: ValidationIssue[]
  approvalStatuses: ApprovalStatus[]
  auditTrail: AuditEntry[]
  
  // System settings
  settings: {
    discountRate: number
    currency: string
    fiscalYearStart: number
    totalBudget: number
  }
}