// Storage utilities for Strategic Capital Allocation System

import { AppState, defaultPriorities, defaultProjects, defaultSettings } from './data-models'

const STORAGE_KEY = 'scas-app-state'

export function loadAppState(): AppState {
  if (typeof window === 'undefined') {
    return getDefaultAppState()
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return getDefaultAppState()
    }

    const parsed = JSON.parse(stored)
    
    // Convert date strings back to Date objects
    const hydrated = {
      ...parsed,
      priorities: parsed.priorities?.map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt)
      })) || defaultPriorities,
      projects: parsed.projects?.map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt)
      })) || defaultProjects,
      businessCases: parsed.businessCases || [],
      projectScores: parsed.projectScores || [],
      validationIssues: parsed.validationIssues || [],
      approvalStatuses: parsed.approvalStatuses || [],
      portfolioMetrics: parsed.portfolioMetrics || getDefaultPortfolioMetrics(),
      scenarios: parsed.scenarios || [],
      activeScenario: parsed.activeScenario || 'base',
      currentTab: parsed.currentTab || 'priorities',
      availableBudget: parsed.availableBudget || defaultSettings.availableBudget,
      settings: parsed.settings || defaultSettings
    }

    return hydrated
  } catch (error) {
    console.error('Error loading app state:', error)
    return getDefaultAppState()
  }
}

export function saveAppState(state: AppState): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.error('Error saving app state:', error)
  }
}

export function getDefaultAppState(): AppState {
  return {
    priorities: defaultPriorities,
    projects: defaultProjects,
    businessCases: [],
    projectScores: [],
    validationIssues: [],
    approvalStatuses: [],
    portfolioMetrics: getDefaultPortfolioMetrics(),
    scenarios: [],
    activeScenario: 'base',
    currentTab: 'priorities',
    availableBudget: defaultSettings.availableBudget,
    settings: defaultSettings
  }
}

function getDefaultPortfolioMetrics() {
  return {
    totalCapital: 0,
    totalNPV: 0,
    avgIRR: 0,
    avgPayback: 0,
    riskScore: 0,
    roi: 0
  }
}

export function exportToExcel(data: any, filename: string): void {
  // Simple CSV export for now - can be enhanced with proper Excel library
  const csvContent = convertToCSV(data)
  downloadFile(csvContent, `${filename}.csv`, 'text/csv')
}

export function exportToPDF(elementId: string, filename: string): void {
  // Placeholder for PDF export functionality
  console.log(`PDF export for ${elementId} - ${filename}`)
}

export function exportPortfolioReport(state: AppState): void {
  const report = generatePortfolioReport(state)
  downloadFile(report, 'portfolio-report.txt', 'text/plain')
}

export function exportProjectScores(state: AppState): void {
  const data = state.projectScores.map(ps => {
    const project = state.projects.find(p => p.id === ps.projectId)
    return {
      projectId: ps.projectId,
      projectName: project?.name || 'Unknown',
      totalScore: ps.totalScore,
      rank: ps.rank,
      allocated: ps.allocated,
      passesThreshold: ps.passesThreshold,
      ...ps.scores.reduce((acc, score) => {
        const priority = state.priorities.find(p => p.id === score.priorityId)
        acc[`${priority?.code || score.priorityId}_score`] = score.alignmentScore
        acc[`${priority?.code || score.priorityId}_weighted`] = score.weightedScore
        return acc
      }, {} as any)
    }
  })
  exportToExcel(data, 'project-scores')
}

export function exportPortfolioAnalytics(state: AppState): void {
  const allocatedProjects = state.projects.filter(p => 
    state.projectScores.find(ps => ps.projectId === p.id)?.allocated
  )
  
  const data = allocatedProjects.map(project => ({
    projectId: project.projectId,
    name: project.name,
    initialCapex: project.initialCapex,
    npv: project.npv,
    irr: project.irr,
    paybackPeriod: project.paybackPeriod,
    riskLevel: project.riskLevel,
    sponsor: project.sponsor,
    status: project.status,
    priorityAlignment: project.priorityAlignment.join(';')
  }))
  
  exportToExcel(data, 'portfolio-analytics')
}

export function exportBusinessCases(state: AppState): void {
  const data = state.businessCases.map(bc => ({
    id: bc.id,
    projectId: bc.projectId,
    status: bc.status,
    totalPhases: bc.phases.length,
    totalResources: bc.resources.length,
    totalRisks: bc.risks.length,
    totalCost: bc.resources.reduce((sum, r) => sum + r.cost, 0),
    totalDuration: Math.max(...bc.phases.map(p => p.startWeek + p.durationWeeks)),
    createdAt: bc.createdAt.toISOString()
  }))
  
  exportToExcel(data, 'business-cases')
}

export function exportValidationReport(state: AppState): void {
  const report = generateValidationReport(state)
  downloadFile(report, 'validation-report.txt', 'text/plain')
}

export function exportScenarioComparison(state: AppState): void {
  const data = state.scenarios.map(scenario => ({
    id: scenario.id,
    name: scenario.name,
    description: scenario.description,
    portfolioNPV: scenario.results.portfolioNPV,
    portfolioIRR: scenario.results.portfolioIRR,
    budgetUsed: scenario.results.budgetUsed,
    riskScore: scenario.results.riskScore,
    projectsIncluded: scenario.results.projectsIncluded.length,
    createdAt: scenario.createdAt.toISOString()
  }))
  
  exportToExcel(data, 'scenario-comparison')
}

export function exportFullPortfolio(state: AppState): void {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
  const fullExport = {
    exportedAt: timestamp,
    priorities: state.priorities,
    projects: state.projects,
    projectScores: state.projectScores,
    businessCases: state.businessCases,
    portfolioMetrics: state.portfolioMetrics,
    scenarios: state.scenarios,
    settings: state.settings
  }
  
  downloadFile(JSON.stringify(fullExport, null, 2), `portfolio-export-${timestamp}.json`, 'application/json')
}

function generatePortfolioReport(state: AppState): string {
  const allocatedProjects = state.projects.filter(p => 
    state.projectScores.find(ps => ps.projectId === p.id)?.allocated
  )
  
  const totalInvestment = allocatedProjects.reduce((sum, p) => sum + p.initialCapex, 0)
  const totalNPV = allocatedProjects.reduce((sum, p) => sum + p.npv, 0)
  const avgIRR = allocatedProjects.length > 0 
    ? allocatedProjects.reduce((sum, p) => sum + p.irr, 0) / allocatedProjects.length 
    : 0
  
  return `STRATEGIC CAPITAL ALLOCATION PORTFOLIO REPORT
Generated: ${new Date().toISOString()}

EXECUTIVE SUMMARY
================
Total Investment: $${(totalInvestment / 1000000).toFixed(1)}M
Portfolio NPV: $${(totalNPV / 1000000).toFixed(1)}M
Average IRR: ${avgIRR.toFixed(1)}%
Projects Selected: ${allocatedProjects.length}
Available Budget: $${(state.availableBudget / 1000000).toFixed(1)}M
Budget Utilization: ${((totalInvestment / state.availableBudget) * 100).toFixed(1)}%

PRIORITIES
==========
${state.priorities.map(p => `${p.code}: ${p.name} (Weight: ${p.weight}%, Threshold: ${p.minThreshold})`).join('\n')}

SELECTED PROJECTS
================
${allocatedProjects.map(p => {
  const score = state.projectScores.find(ps => ps.projectId === p.id)
  return `${p.projectId}: ${p.name}
  Investment: $${(p.initialCapex / 1000000).toFixed(1)}M
  NPV: $${(p.npv / 1000000).toFixed(1)}M
  IRR: ${p.irr.toFixed(1)}%
  Score: ${score?.totalScore.toFixed(1) || 'N/A'}
  Rank: #${score?.rank || 'N/A'}
  Risk Level: ${p.riskLevel}
  Sponsor: ${p.sponsor}
`}).join('\n')}

VALIDATION STATUS
================
Critical Issues: ${state.validationIssues.filter(i => i.severity === 'error').length}
Warnings: ${state.validationIssues.filter(i => i.severity === 'warning').length}
Data Quality Score: ${Math.max(0, 100 - state.validationIssues.filter(i => i.severity === 'error').length * 20)}%

SCENARIOS ANALYZED
=================
${state.scenarios.map(s => `${s.name}: NPV $${(s.results.portfolioNPV / 1000000).toFixed(1)}M, IRR ${s.results.portfolioIRR.toFixed(1)}%`).join('\n')}
`
}

function generateValidationReport(state: AppState): string {
  const totalWeight = state.priorities.reduce((sum, p) => sum + p.weight, 0)
  const projectsWithoutFinancials = state.projects.filter(p => !p.npv || !p.irr || p.cashFlows.length === 0)
  const highIRRProjects = state.projects.filter(p => p.irr > 100)
  
  return `DATA VALIDATION REPORT
Generated: ${new Date().toISOString()}

SUMMARY
=======
Total Issues: ${state.validationIssues.length}
Critical Errors: ${state.validationIssues.filter(i => i.severity === 'error').length}
Warnings: ${state.validationIssues.filter(i => i.severity === 'warning').length}
Data Quality Score: ${Math.max(0, 100 - state.validationIssues.filter(i => i.severity === 'error').length * 20)}%

COMPLETENESS CHECKS
==================
Priority weights sum to 100%: ${Math.abs(totalWeight - 100) < 0.1 ? 'PASS' : 'FAIL'}
Projects with financial data: ${state.projects.length - projectsWithoutFinancials.length}/${state.projects.length}
Projects with unrealistic IRR (>100%): ${highIRRProjects.length}

DETAILED ISSUES
==============
${state.validationIssues.map(issue => `${issue.severity.toUpperCase()}: ${issue.title}
Description: ${issue.description}
Affected: ${issue.affectedItems?.join(', ') || 'N/A'}
`).join('\n')}

RECOMMENDATIONS
==============
${state.validationIssues.filter(i => i.severity === 'error').length > 0 
  ? '- Resolve all critical errors before proceeding with allocation decisions'
  : '- All critical validations passed'
}
${projectsWithoutFinancials.length > 0 
  ? `- Complete financial projections for ${projectsWithoutFinancials.length} projects`
  : '- All projects have complete financial data'
}
${highIRRProjects.length > 0 
  ? `- Review IRR calculations for ${highIRRProjects.length} projects with unusually high returns`
  : '- All IRR values are within reasonable ranges'
}
`
}

function convertToCSV(data: any[]): string {
  if (!data.length) return ''
  
  const headers = Object.keys(data[0]).join(',')
  const rows = data.map(row => 
    Object.values(row).map(value => 
      typeof value === 'string' && value.includes(',') ? `"${value}"` : value
    ).join(',')
  ).join('\n')
  
  return `${headers}\n${rows}`
}

function downloadFile(content: string, filename: string, contentType: string): void {
  const blob = new Blob([content], { type: contentType })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

// Auto-save functionality
let autoSaveTimeout: NodeJS.Timeout | null = null

export function scheduleAutoSave(state: AppState): void {
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout)
  }
  
  autoSaveTimeout = setTimeout(() => {
    saveAppState(state)
  }, 30000) // Auto-save every 30 seconds
}

export function clearStorage(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY)
  }
}