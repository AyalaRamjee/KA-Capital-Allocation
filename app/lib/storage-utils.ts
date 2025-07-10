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