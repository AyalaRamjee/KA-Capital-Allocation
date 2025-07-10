// Financial calculation utilities for Strategic Capital Allocation System

import { Project, Priority, ProjectScore, PortfolioMetrics, Scenario } from './data-models'

// NPV Calculation
export function calculateNPV(cashFlows: { year: number; amount: number }[], discountRate: number = 0.1): number {
  return cashFlows.reduce((npv, cf) => {
    return npv + (cf.amount / Math.pow(1 + discountRate, cf.year))
  }, 0)
}

// IRR Calculation using Newton-Raphson method
export function calculateIRR(cashFlows: { year: number; amount: number }[], initialGuess: number = 0.1): number {
  const maxIterations = 100
  const tolerance = 0.0001
  let rate = initialGuess
  
  for (let i = 0; i < maxIterations; i++) {
    const npv = cashFlows.reduce((sum, cf) => sum + cf.amount / Math.pow(1 + rate, cf.year), 0)
    const derivative = cashFlows.reduce((sum, cf) => sum - (cf.year * cf.amount) / Math.pow(1 + rate, cf.year + 1), 0)
    
    if (Math.abs(derivative) < tolerance) break
    
    const newRate = rate - npv / derivative
    
    if (Math.abs(newRate - rate) < tolerance) {
      return Math.min(Math.max(newRate * 100, -99), 999) // Cap between -99% and 999%
    }
    
    rate = newRate
  }
  
  return Math.min(Math.max(rate * 100, -99), 999)
}

// MIRR Calculation
export function calculateMIRR(
  cashFlows: { year: number; amount: number }[], 
  financeRate: number = 0.1, 
  reinvestRate: number = 0.1
): number {
  const negativeCFs = cashFlows.filter(cf => cf.amount < 0)
  const positiveCFs = cashFlows.filter(cf => cf.amount > 0)
  
  if (negativeCFs.length === 0 || positiveCFs.length === 0) return 0
  
  const lastYear = Math.max(...cashFlows.map(cf => cf.year))
  
  // Present value of negative cash flows
  const pvNegative = negativeCFs.reduce((pv, cf) => 
    pv + cf.amount / Math.pow(1 + financeRate, cf.year), 0)
  
  // Future value of positive cash flows
  const fvPositive = positiveCFs.reduce((fv, cf) => 
    fv + cf.amount * Math.pow(1 + reinvestRate, lastYear - cf.year), 0)
  
  if (pvNegative >= 0 || fvPositive <= 0) return 0
  
  const mirr = Math.pow(-fvPositive / pvNegative, 1 / lastYear) - 1
  return Math.min(Math.max(mirr * 100, -99), 999)
}

// Payback Period Calculation
export function calculatePaybackPeriod(cashFlows: { year: number; amount: number }[]): number {
  let cumulativeCF = 0
  
  for (let i = 0; i < cashFlows.length; i++) {
    cumulativeCF += cashFlows[i].amount
    
    if (cumulativeCF >= 0) {
      if (i === 0) return 0
      
      // Linear interpolation for fractional year
      const previousCumulative = cumulativeCF - cashFlows[i].amount
      const fraction = -previousCumulative / cashFlows[i].amount
      return cashFlows[i - 1].year + fraction
    }
  }
  
  return 99 // Never pays back
}

// Project Scoring
export function calculateProjectScore(
  project: Project, 
  priorities: Priority[]
): ProjectScore {
  const scores = priorities.map(priority => {
    // Simple alignment scoring based on priority alignment array
    const isAligned = project.priorityAlignment.includes(priority.id)
    const baseScore = isAligned ? 75 : 25 // Base alignment score
    
    // Adjust score based on financial metrics
    const irrBonus = Math.min(project.irr / 25 * 15, 15) // Up to 15 points for IRR
    const npvBonus = Math.min(project.npv / 10000000 * 10, 10) // Up to 10 points for NPV
    
    const alignmentScore = Math.min(baseScore + irrBonus + npvBonus, 100)
    const weightedScore = (alignmentScore * priority.weight) / 100
    
    return {
      priorityId: priority.id,
      alignmentScore,
      weightedScore
    }
  })
  
  const totalScore = scores.reduce((sum, score) => sum + score.weightedScore, 0)
  
  // Check if passes all thresholds
  const passesThreshold = priorities.every(priority => {
    const score = scores.find(s => s.priorityId === priority.id)
    return !score || score.alignmentScore >= priority.minThreshold
  })
  
  return {
    projectId: project.id,
    scores,
    totalScore,
    passesThreshold,
    rank: 0, // Will be calculated when ranking all projects
    allocated: false
  }
}

// Portfolio Optimization
export function optimizePortfolio(
  projects: Project[],
  priorities: Priority[],
  availableBudget: number,
  lockedProjects: string[] = [],
  excludedProjects: string[] = []
): {
  selectedProjects: string[]
  totalBudget: number
  portfolioNPV: number
  portfolioIRR: number
} {
  // Calculate scores for all projects
  const projectScores = projects
    .filter(p => !excludedProjects.includes(p.id))
    .map(p => calculateProjectScore(p, priorities))
    .sort((a, b) => b.totalScore - a.totalScore)
  
  // Add locked projects first
  const selectedProjects: string[] = [...lockedProjects]
  let remainingBudget = availableBudget
  
  // Subtract locked project costs
  lockedProjects.forEach(projectId => {
    const project = projects.find(p => p.id === projectId)
    if (project) {
      remainingBudget -= project.initialCapex
    }
  })
  
  // Add projects in score order while budget allows
  for (const score of projectScores) {
    if (lockedProjects.includes(score.projectId)) continue
    
    const project = projects.find(p => p.id === score.projectId)
    if (!project) continue
    
    if (project.initialCapex <= remainingBudget && score.passesThreshold) {
      selectedProjects.push(score.projectId)
      remainingBudget -= project.initialCapex
    }
  }
  
  // Calculate portfolio metrics
  const selectedProjectObjects = projects.filter(p => selectedProjects.includes(p.id))
  const totalBudget = selectedProjectObjects.reduce((sum, p) => sum + p.initialCapex, 0)
  const portfolioNPV = selectedProjectObjects.reduce((sum, p) => sum + p.npv, 0)
  
  // Weighted average IRR
  const totalCapex = selectedProjectObjects.reduce((sum, p) => sum + p.initialCapex, 0)
  const portfolioIRR = totalCapex > 0 
    ? selectedProjectObjects.reduce((sum, p) => sum + (p.irr * p.initialCapex / totalCapex), 0)
    : 0
  
  return {
    selectedProjects,
    totalBudget,
    portfolioNPV,
    portfolioIRR
  }
}

// Portfolio Metrics Calculation
export function calculatePortfolioMetrics(
  selectedProjects: Project[],
  availableBudget: number
): PortfolioMetrics {
  if (selectedProjects.length === 0) {
    return {
      totalCapital: 0,
      totalNPV: 0,
      avgIRR: 0,
      avgPayback: 0,
      riskScore: 0,
      roi: 0
    }
  }
  
  const totalCapital = selectedProjects.reduce((sum, p) => sum + p.initialCapex, 0)
  const totalNPV = selectedProjects.reduce((sum, p) => sum + p.npv, 0)
  
  // Weighted averages
  const avgIRR = selectedProjects.reduce((sum, p) => 
    sum + (p.irr * p.initialCapex / totalCapital), 0)
  
  const avgPayback = selectedProjects.reduce((sum, p) => 
    sum + (p.paybackPeriod * p.initialCapex / totalCapital), 0)
  
  // Risk score (1-100, weighted by investment)
  const riskWeights = { low: 20, medium: 50, high: 80 }
  const riskScore = selectedProjects.reduce((sum, p) => 
    sum + (riskWeights[p.riskLevel] * p.initialCapex / totalCapital), 0)
  
  // ROI over 5 years
  const totalReturns = selectedProjects.reduce((sum, p) => {
    const returns = p.cashFlows.filter(cf => cf.year > 0).reduce((cfSum, cf) => cfSum + cf.amount, 0)
    return sum + returns
  }, 0)
  
  const roi = totalCapital > 0 ? ((totalReturns - totalCapital) / totalCapital) * 100 : 0
  
  return {
    totalCapital: totalCapital / 1000000, // Convert to millions
    totalNPV: totalNPV / 1000000,
    avgIRR,
    avgPayback,
    riskScore,
    roi
  }
}

// Scenario Analysis
export function applyScenario(
  baseProjects: Project[],
  basePriorities: Priority[],
  scenario: Scenario
): {
  adjustedProjects: Project[]
  adjustedPriorities: Priority[]
} {
  // Adjust priorities
  const adjustedPriorities = basePriorities.map(priority => {
    const adjustment = scenario.parameters.priorityAdjustments.find(adj => adj.priorityId === priority.id)
    
    if (!adjustment) return priority
    
    return {
      ...priority,
      weight: Math.max(0, Math.min(100, priority.weight + adjustment.weightChange)),
      minThreshold: Math.max(0, Math.min(100, priority.minThreshold + adjustment.thresholdChange))
    }
  })
  
  // Normalize priority weights to sum to 100
  const totalWeight = adjustedPriorities.reduce((sum, p) => sum + p.weight, 0)
  if (totalWeight > 0) {
    adjustedPriorities.forEach(p => p.weight = (p.weight / totalWeight) * 100)
  }
  
  // Adjust projects based on risk factors
  const adjustedProjects = baseProjects.map(project => {
    const riskFactors = scenario.parameters.riskFactors
    const marketConditions = scenario.parameters.marketConditions
    
    // Apply cost increases
    const adjustedCapex = project.initialCapex * (1 + riskFactors.costIncrease / 100)
    const adjustedOpex = project.annualOpex * (1 + riskFactors.costIncrease / 100)
    
    // Apply benefit reductions
    const adjustedRevenue = project.revenuePotential * (1 - riskFactors.benefitReduction / 100)
    const adjustedSavings = project.savingsPotential * (1 - riskFactors.benefitReduction / 100)
    
    // Adjust cash flows
    const adjustedCashFlows = project.cashFlows.map(cf => ({
      ...cf,
      amount: cf.year === 0 
        ? cf.amount * (1 + riskFactors.costIncrease / 100) // CAPEX adjustment
        : cf.amount * (1 - riskFactors.benefitReduction / 100) // Benefit adjustment
    }))
    
    // Recalculate financial metrics
    const discountRate = 0.1 + (marketConditions.interestRateChange / 100)
    const newNPV = calculateNPV(adjustedCashFlows, discountRate)
    const newIRR = calculateIRR(adjustedCashFlows)
    const newPayback = calculatePaybackPeriod(adjustedCashFlows)
    
    return {
      ...project,
      initialCapex: adjustedCapex,
      annualOpex: adjustedOpex,
      revenuePotential: adjustedRevenue,
      savingsPotential: adjustedSavings,
      npv: newNPV,
      irr: newIRR,
      paybackPeriod: newPayback,
      cashFlows: adjustedCashFlows
    }
  })
  
  return {
    adjustedProjects,
    adjustedPriorities
  }
}

// Monte Carlo Simulation
export function runMonteCarloSimulation(
  projects: Project[],
  priorities: Priority[],
  availableBudget: number,
  iterations: number = 1000
): {
  npvDistribution: number[]
  meanNPV: number
  percentiles: { p10: number; p50: number; p90: number }
  roiProbability: number
  budgetProbability: number
  scheduleProbability: number
  riskProbability: number
} {
  const results: number[] = []
  
  for (let i = 0; i < iterations; i++) {
    // Apply random variations to projects
    const variedProjects = projects.map(project => {
      // Random variations: ±20% for costs, ±15% for benefits
      const costVariation = 1 + (Math.random() - 0.5) * 0.4 // ±20%
      const benefitVariation = 1 + (Math.random() - 0.5) * 0.3 // ±15%
      
      const variedCashFlows = project.cashFlows.map(cf => ({
        ...cf,
        amount: cf.year === 0 
          ? cf.amount * costVariation
          : cf.amount * benefitVariation
      }))
      
      const variedNPV = calculateNPV(variedCashFlows)
      
      return {
        ...project,
        npv: variedNPV,
        cashFlows: variedCashFlows
      }
    })
    
    // Run optimization for this iteration
    const optimization = optimizePortfolio(variedProjects, priorities, availableBudget)
    results.push(optimization.portfolioNPV)
  }
  
  // Sort results for percentile calculation
  results.sort((a, b) => a - b)
  
  const meanNPV = results.reduce((sum, val) => sum + val, 0) / results.length
  
  const percentiles = {
    p10: results[Math.floor(results.length * 0.1)],
    p50: results[Math.floor(results.length * 0.5)],
    p90: results[Math.floor(results.length * 0.9)]
  }
  
  // Calculate success probabilities (simplified)
  const roiProbability = results.filter(r => r > 0).length / results.length * 100
  const budgetProbability = 85 // Simplified - assume 85% chance of staying within budget
  const scheduleProbability = 75 // Simplified - assume 75% chance of on-time delivery
  const riskProbability = results.filter(r => r > meanNPV * 0.8).length / results.length * 100
  
  return {
    npvDistribution: results,
    meanNPV,
    percentiles,
    roiProbability,
    budgetProbability,
    scheduleProbability,
    riskProbability
  }
}

// Utility functions
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 1
  }).format(amount)
}

export function formatLargeNumber(num: number): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B'
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  } else {
    return num.toFixed(0)
  }
}

export function formatPercentage(num: number): string {
  return `${num.toFixed(1)}%`
}