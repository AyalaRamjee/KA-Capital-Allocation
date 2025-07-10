'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { AppState, Priority, Project, ProjectScore, ValidationIssue } from '../lib/data-models'
import { loadAppState, saveAppState, scheduleAutoSave } from '../lib/storage-utils'
import { calculateProjectScore, optimizePortfolio, calculatePortfolioMetrics } from '../lib/calculations'

export function useAllocationData() {
  const [state, setState] = useState<AppState | null>(null)
  const [loading, setLoading] = useState(true)

  // Load initial state
  useEffect(() => {
    try {
      const initialState = loadAppState()
      setState(initialState)
    } catch (error) {
      console.error('Error loading initial state:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Auto-save when state changes
  useEffect(() => {
    if (state && !loading) {
      scheduleAutoSave(state)
    }
  }, [state, loading])

  // Update state helper
  const updateState = useCallback((updater: (prevState: AppState) => AppState) => {
    setState(prevState => {
      if (!prevState) return prevState
      const newState = updater(prevState)
      return { ...newState, updatedAt: new Date() }
    })
  }, [])

  // Priority management
  const addPriority = useCallback((priority: Omit<Priority, 'id' | 'createdAt' | 'updatedAt'>) => {
    updateState(state => ({
      ...state,
      priorities: [
        ...state.priorities,
        {
          ...priority,
          id: `priority-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    }))
  }, [updateState])

  const updatePriority = useCallback((id: string, updates: Partial<Priority>) => {
    updateState(state => ({
      ...state,
      priorities: state.priorities.map(p => 
        p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
      )
    }))
  }, [updateState])

  const deletePriority = useCallback((id: string) => {
    updateState(state => ({
      ...state,
      priorities: state.priorities.filter(p => p.id !== id),
      // Remove priority alignments from projects
      projects: state.projects.map(project => ({
        ...project,
        priorityAlignment: project.priorityAlignment.filter(pId => pId !== id)
      }))
    }))
  }, [updateState])

  // Project management
  const addProject = useCallback((project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    updateState(state => ({
      ...state,
      projects: [
        ...state.projects,
        {
          ...project,
          id: `project-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    }))
  }, [updateState])

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    updateState(state => ({
      ...state,
      projects: state.projects.map(p => 
        p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
      )
    }))
  }, [updateState])

  const deleteProject = useCallback((id: string) => {
    updateState(state => ({
      ...state,
      projects: state.projects.filter(p => p.id !== id),
      businessCases: state.businessCases.filter(bc => bc.projectId !== id),
      projectScores: state.projectScores.filter(ps => ps.projectId !== id)
    }))
  }, [updateState])

  // Scoring and allocation
  const recalculateScores = useCallback(() => {
    if (!state) return

    const projectScores = state.projects.map(project => 
      calculateProjectScore(project, state.priorities)
    )

    // Rank projects by total score
    projectScores.sort((a, b) => b.totalScore - a.totalScore)
    projectScores.forEach((score, index) => {
      score.rank = index + 1
    })

    updateState(prevState => ({
      ...prevState,
      projectScores
    }))
  }, [state, updateState])

  const optimizePortfolioAllocation = useCallback((
    lockedProjects: string[] = [],
    excludedProjects: string[] = []
  ) => {
    if (!state) return

    const optimization = optimizePortfolio(
      state.projects,
      state.priorities,
      state.availableBudget,
      lockedProjects,
      excludedProjects
    )

    // Update project scores with allocation status
    const updatedProjectScores = state.projectScores.map(score => ({
      ...score,
      allocated: optimization.selectedProjects.includes(score.projectId)
    }))

    // Calculate portfolio metrics
    const selectedProjects = state.projects.filter(p => 
      optimization.selectedProjects.includes(p.id)
    )
    
    const portfolioMetrics = calculatePortfolioMetrics(selectedProjects, state.availableBudget)

    updateState(prevState => ({
      ...prevState,
      projectScores: updatedProjectScores,
      portfolioMetrics
    }))

    return optimization
  }, [state, updateState])

  // Tab navigation
  const setCurrentTab = useCallback((tab: string) => {
    updateState(state => ({
      ...state,
      currentTab: tab
    }))
  }, [updateState])

  // Manual save
  const saveData = useCallback(() => {
    if (state) {
      saveAppState(state)
    }
  }, [state])

  // Validation
  const validateData = useCallback(() => {
    if (!state) return []

    const issues: ValidationIssue[] = []

    // Check priority weights sum to 100
    const totalWeight = state.priorities.reduce((sum, p) => sum + p.weight, 0)
    if (Math.abs(totalWeight - 100) > 0.1) {
      issues.push({
        id: 'priority-weights',
        severity: 'error' as const,
        title: 'Priority weights must sum to 100%',
        description: `Current total: ${totalWeight.toFixed(1)}%`,
        affectedItems: ['priorities'],
        category: 'consistency' as const,
        resolved: false
      })
    }

    // Check for projects without financial data
    const projectsWithoutFinancials = state.projects.filter(p => 
      !p.npv || !p.irr || p.cashFlows.length === 0
    )
    if (projectsWithoutFinancials.length > 0) {
      issues.push({
        id: 'missing-financials',
        severity: 'warning' as const,
        title: 'Projects missing financial projections',
        description: `${projectsWithoutFinancials.length} projects need complete financial data`,
        affectedItems: projectsWithoutFinancials.map(p => p.projectId),
        category: 'completeness' as const,
        resolved: false
      })
    }

    // Check for unrealistic IRR values
    const highIRRProjects = state.projects.filter(p => p.irr > 100)
    if (highIRRProjects.length > 0) {
      issues.push({
        id: 'high-irr',
        severity: 'warning' as const,
        title: 'Unrealistic IRR values detected',
        description: 'IRR values above 100% should be reviewed',
        affectedItems: highIRRProjects.map(p => p.projectId),
        category: 'logic' as const,
        resolved: false
      })
    }

    updateState(prevState => ({
      ...prevState,
      validationIssues: issues
    }))

    return issues
  }, [state, updateState])

  // Memoized computed values for performance
  const computedMetrics = useMemo(() => {
    if (!state) return null
    
    return {
      totalProjects: state.projects.length,
      totalPriorities: state.priorities.length,
      allocatedProjects: state.projectScores.filter(s => s.allocated).length,
      totalCapitalRequired: state.projects.reduce((sum, p) => sum + p.initialCapex, 0),
      budgetUtilization: state.portfolioMetrics.totalCapital / (state.availableBudget / 1000000) * 100,
      dataQualityScore: Math.max(0, 100 - state.validationIssues.filter(i => i.severity === 'error').length * 20)
    }
  }, [state?.projects, state?.priorities, state?.projectScores, state?.portfolioMetrics, state?.availableBudget, state?.validationIssues])

  // Memoized portfolio calculations
  const portfolioAnalytics = useMemo(() => {
    if (!state) return null
    
    const allocatedProjects = state.projects.filter(p => 
      state.projectScores.find(ps => ps.projectId === p.id)?.allocated
    )
    
    const totalInvestment = allocatedProjects.reduce((sum, p) => sum + p.initialCapex, 0)
    const totalNPV = allocatedProjects.reduce((sum, p) => sum + p.npv, 0)
    const averageIRR = allocatedProjects.length > 0 
      ? allocatedProjects.reduce((sum, p) => sum + (p.irr * p.initialCapex / totalInvestment), 0)
      : 0
    const averagePayback = allocatedProjects.length > 0
      ? allocatedProjects.reduce((sum, p) => sum + p.paybackPeriod, 0) / allocatedProjects.length
      : 0
    
    return {
      allocatedProjects,
      totalInvestment,
      totalNPV,
      averageIRR,
      averagePayback,
      portfolioRisk: allocatedProjects.reduce((sum, p) => {
        const riskWeight = p.riskLevel === 'high' ? 3 : p.riskLevel === 'medium' ? 2 : 1
        return sum + (riskWeight * p.initialCapex)
      }, 0) / totalInvestment
    }
  }, [state?.projects, state?.projectScores])

  // Memoized validation status
  const validationStatus = useMemo(() => {
    if (!state) return null
    
    const criticalIssues = state.validationIssues.filter(i => i.severity === 'error').length
    const warnings = state.validationIssues.filter(i => i.severity === 'warning').length
    const totalIssues = state.validationIssues.length
    
    return {
      criticalIssues,
      warnings,
      totalIssues,
      isValid: criticalIssues === 0,
      dataQualityScore: Math.max(0, 100 - criticalIssues * 20)
    }
  }, [state?.validationIssues])

  return {
    // State
    state,
    loading,
    
    // Memoized computed values for performance
    computedMetrics,
    portfolioAnalytics,
    validationStatus,

    // Priority management
    addPriority,
    updatePriority,
    deletePriority,

    // Project management
    addProject,
    updateProject,
    deleteProject,

    // Scoring and allocation
    recalculateScores,
    optimizePortfolioAllocation,

    // Navigation
    setCurrentTab,

    // Utilities
    saveData,
    validateData,
    updateState
  }
}