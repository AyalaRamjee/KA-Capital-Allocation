'use client'

import { useState, useEffect, useMemo } from 'react'
import { TrendingUp, Target, Zap, Lock, Unlock, BarChart3, Sliders, Download, Save, RefreshCw, CheckCircle, XCircle, ArrowUp, ArrowDown, DollarSign, Award } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Badge } from '../../../components/ui/badge'
import { Progress } from '../../../components/ui/progress'
import { Slider } from '../../../components/ui/slider'
import { Switch } from '../../../components/ui/switch'
import { useAllocationData } from '../../../hooks/use-allocation-data'
import { Project, Priority, ProjectScore } from '../../../lib/data-models'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ComposedChart, ReferenceLine, ScatterChart, Scatter } from 'recharts'
import { cn } from '../../../lib/utils'

interface ScoringMatrixCell {
  projectId: string
  priorityId: string
  score: number
  weight: number
  weightedScore: number
}

function ScoringMatrix({ projects, priorities, scores, onScoreChange, lockedProjects }: {
  projects: Project[]
  priorities: Priority[]
  scores: ScoringMatrixCell[]
  onScoreChange: (projectId: string, priorityId: string, score: number) => void
  lockedProjects: Set<string>
}) {
  const getScore = (projectId: string, priorityId: string) => {
    return scores.find(s => s.projectId === projectId && s.priorityId === priorityId)?.score || 0
  }

  const getWeightedScore = (projectId: string, priorityId: string) => {
    return scores.find(s => s.projectId === projectId && s.priorityId === priorityId)?.weightedScore || 0
  }

  const getTotalScore = (projectId: string) => {
    return scores
      .filter(s => s.projectId === projectId)
      .reduce((sum, s) => sum + s.weightedScore, 0)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400 bg-green-900/20'
    if (score >= 60) return 'text-blue-400 bg-blue-900/20'
    if (score >= 40) return 'text-amber-400 bg-amber-900/20'
    return 'text-red-400 bg-red-900/20'
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-slate-600">
            <th className="text-left p-4 text-slate-300 font-medium min-w-[200px] sticky left-0 bg-slate-800">
              Project
            </th>
            {priorities.map(priority => (
              <th key={priority.id} className="text-center p-4 text-slate-300 font-medium min-w-[120px]">
                <div>
                  <div className="font-bold">{priority.code}</div>
                  <div className="text-xs text-slate-400">Weight: {priority.weight}%</div>
                  <div className="text-xs text-slate-400">Threshold: {priority.minThreshold}%</div>
                </div>
              </th>
            ))}
            <th className="text-center p-4 text-slate-300 font-medium min-w-[120px]">
              Total Score
            </th>
            <th className="text-center p-4 text-slate-300 font-medium min-w-[100px]">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {projects.map(project => {
            const totalScore = getTotalScore(project.id)
            const isLocked = lockedProjects.has(project.id)
            const passesThreshold = priorities.every(p => 
              getScore(project.id, p.id) >= p.minThreshold
            )

            return (
              <tr key={project.id} className="border-b border-slate-700 hover:bg-slate-800/50 group">
                <td className="p-4 sticky left-0 bg-slate-800 group-hover:bg-slate-800/80">
                  <div className="flex items-center space-x-3">
                    {isLocked ? (
                      <Lock className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Unlock className="w-4 h-4 text-slate-400" />
                    )}
                    <div>
                      <div className="font-medium text-white">{project.name}</div>
                      <div className="text-xs text-slate-400">{project.projectId}</div>
                      <div className="text-xs text-slate-400">
                        ${(project.initialCapex / 1000000).toFixed(1)}M • NPV: ${(project.npv / 1000000).toFixed(1)}M
                      </div>
                    </div>
                  </div>
                </td>

                {priorities.map(priority => {
                  const score = getScore(project.id, priority.id)
                  const weightedScore = getWeightedScore(project.id, priority.id)
                  const passesThreshold = score >= priority.minThreshold

                  return (
                    <td key={priority.id} className="p-4 text-center">
                      <div className="space-y-2">
                        <div className="relative">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={score}
                            onChange={(e) => onScoreChange(project.id, priority.id, parseInt(e.target.value) || 0)}
                            className={cn(
                              "w-16 h-8 text-center text-sm bg-slate-700 border-slate-600",
                              getScoreColor(score),
                              !passesThreshold && "border-red-500 border-2"
                            )}
                          />
                          {!passesThreshold && (
                            <XCircle className="absolute -top-1 -right-1 w-3 h-3 text-red-500" />
                          )}
                        </div>
                        <div className="text-xs text-slate-400">
                          Weighted: {weightedScore.toFixed(1)}
                        </div>
                      </div>
                    </td>
                  )
                })}

                <td className="p-4 text-center">
                  <div className={cn(
                    "text-xl font-bold",
                    totalScore >= 70 ? "text-green-400" : 
                    totalScore >= 50 ? "text-amber-400" : "text-red-400"
                  )}>
                    {totalScore.toFixed(1)}
                  </div>
                  {passesThreshold ? (
                    <CheckCircle className="w-4 h-4 text-green-400 mx-auto mt-1" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400 mx-auto mt-1" />
                  )}
                </td>

                <td className="p-4 text-center">
                  <Badge className={cn(
                    passesThreshold && totalScore >= 50 ? 
                      "bg-green-500 text-white" : 
                      "bg-red-500 text-white"
                  )}>
                    {passesThreshold && totalScore >= 50 ? "Qualified" : "Below Threshold"}
                  </Badge>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function OptimizationPanel({ 
  projects, 
  priorities, 
  availableBudget, 
  onOptimize, 
  lockedProjects, 
  onToggleLock 
}: {
  projects: Project[]
  priorities: Priority[]
  availableBudget: number
  onOptimize: () => void
  lockedProjects: Set<string>
  onToggleLock: (projectId: string) => void
}) {
  const [optimizationGoal, setOptimizationGoal] = useState<'npv' | 'irr' | 'balanced'>('npv')
  const [riskTolerance, setRiskTolerance] = useState(50)
  const [budgetUtilization, setBudgetUtilization] = useState(90)

  const totalBudgetUsed = projects
    .filter(p => lockedProjects.has(p.id))
    .reduce((sum, p) => sum + p.initialCapex, 0)

  const budgetRemaining = availableBudget - totalBudgetUsed

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-blue-400" />
          <span>Portfolio Optimization</span>
        </CardTitle>
        <CardDescription>Configure optimization parameters and run portfolio allocation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Optimization Settings */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label>Optimization Goal</Label>
            <div className="mt-2 space-y-2">
              {[
                { value: 'npv', label: 'Maximize NPV', icon: DollarSign },
                { value: 'irr', label: 'Maximize IRR', icon: TrendingUp },
                { value: 'balanced', label: 'Balanced Approach', icon: Target }
              ].map(({ value, label, icon: Icon }) => (
                <label key={value} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="optimizationGoal"
                    value={value}
                    checked={optimizationGoal === value}
                    onChange={(e) => setOptimizationGoal(e.target.value as any)}
                    className="w-4 h-4"
                  />
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-300">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Risk Tolerance: {riskTolerance}%</Label>
              <Slider
                value={[riskTolerance]}
                onValueChange={(value) => setRiskTolerance(value[0])}
                max={100}
                step={5}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Budget Utilization Target: {budgetUtilization}%</Label>
              <Slider
                value={[budgetUtilization]}
                onValueChange={(value) => setBudgetUtilization(value[0])}
                max={100}
                step={5}
                className="mt-2"
              />
            </div>
          </div>
        </div>

        {/* Budget Overview */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-slate-800 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              ${(availableBudget / 1000000).toFixed(0)}M
            </div>
            <div className="text-sm text-slate-400">Total Budget</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              ${(budgetRemaining / 1000000).toFixed(0)}M
            </div>
            <div className="text-sm text-slate-400">Available</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400">
              {((totalBudgetUsed / availableBudget) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-slate-400">Utilized</div>
          </div>
        </div>

        {/* Locked Projects */}
        <div>
          <Label>Locked Projects ({lockedProjects.size})</Label>
          <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
            {projects.map(project => (
              <div key={project.id} className="flex items-center justify-between p-2 bg-slate-700 rounded">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-white">{project.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    ${(project.initialCapex / 1000000).toFixed(1)}M
                  </Badge>
                </div>
                <Switch
                  checked={lockedProjects.has(project.id)}
                  onCheckedChange={() => onToggleLock(project.id)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Optimize Button */}
        <Button onClick={onOptimize} className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
          <RefreshCw className="w-4 h-4 mr-2" />
          Run Optimization
        </Button>
      </CardContent>
    </Card>
  )
}

function AllocationResults({ 
  projects, 
  priorities, 
  scores, 
  budgetCutoff 
}: {
  projects: Project[]
  priorities: Priority[]
  scores: ScoringMatrixCell[]
  budgetCutoff: number
}) {
  const rankedProjects = projects
    .map(project => {
      const totalScore = scores
        .filter(s => s.projectId === project.id)
        .reduce((sum, s) => sum + s.weightedScore, 0)
      
      return { ...project, totalScore }
    })
    .sort((a, b) => b.totalScore - a.totalScore)

  let cumulativeBudget = 0
  const fundedProjects: (Project & { totalScore: number })[] = []
  const unfundedProjects: (Project & { totalScore: number })[] = []

  for (const project of rankedProjects) {
    if (cumulativeBudget + project.initialCapex <= budgetCutoff) {
      cumulativeBudget += project.initialCapex
      fundedProjects.push(project)
    } else {
      unfundedProjects.push(project)
    }
  }

  const waterfallData = rankedProjects.map((project, index) => ({
    name: project.projectId,
    projectName: project.name,
    investment: project.initialCapex / 1000000,
    cumulative: rankedProjects.slice(0, index + 1).reduce((sum, p) => sum + p.initialCapex, 0) / 1000000,
    funded: fundedProjects.includes(project),
    score: project.totalScore
  }))

  return (
    <div className="space-y-6">
      {/* Portfolio Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {fundedProjects.length}
            </div>
            <div className="text-sm text-slate-400">Projects Funded</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              ${(cumulativeBudget / 1000000).toFixed(0)}M
            </div>
            <div className="text-sm text-slate-400">Total Investment</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              ${(fundedProjects.reduce((sum, p) => sum + p.npv, 0) / 1000000).toFixed(0)}M
            </div>
            <div className="text-sm text-slate-400">Portfolio NPV</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-amber-400 mb-2">
              {fundedProjects.length > 0 ? 
                (fundedProjects.reduce((sum, p) => sum + (p.irr * p.initialCapex), 0) / 
                 fundedProjects.reduce((sum, p) => sum + p.initialCapex, 0)).toFixed(1) : 0}%
            </div>
            <div className="text-sm text-slate-400">Weighted IRR</div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Waterfall Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Allocation Waterfall</CardTitle>
          <CardDescription>Cumulative investment by project ranking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={waterfallData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value: number, name: string) => [
                    name === 'investment' ? `$${value.toFixed(1)}M` : `$${value.toFixed(0)}M`,
                    name === 'investment' ? 'Investment' : 'Cumulative'
                  ]}
                  labelFormatter={(label, payload) => {
                    const data = payload?.[0]?.payload
                    return data ? `${data.projectName} (Score: ${data.score.toFixed(1)})` : label
                  }}
                />
                <Bar 
                  dataKey="investment" 
                  fill="#10b981"
                  name="Investment"
                />
                <Line 
                  type="monotone" 
                  dataKey="cumulative" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  name="Cumulative"
                />
                <ReferenceLine 
                  y={budgetCutoff / 1000000} 
                  stroke="#f59e0b" 
                  strokeDasharray="5 5"
                  label="Budget Limit"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Funded vs Unfunded Projects */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-400">Funded Projects ({fundedProjects.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {fundedProjects.map((project, index) => (
                <div key={project.id} className="flex items-center justify-between p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-white">{project.name}</div>
                      <div className="text-sm text-slate-400">Score: {project.totalScore.toFixed(1)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-bold">${(project.initialCapex / 1000000).toFixed(1)}M</div>
                    <div className="text-sm text-slate-400">NPV: ${(project.npv / 1000000).toFixed(1)}M</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-400">Unfunded Projects ({unfundedProjects.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unfundedProjects.map((project, index) => (
                <div key={project.id} className="flex items-center justify-between p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {fundedProjects.length + index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-white">{project.name}</div>
                      <div className="text-sm text-slate-400">Score: {project.totalScore.toFixed(1)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-red-400 font-bold">${(project.initialCapex / 1000000).toFixed(1)}M</div>
                    <div className="text-sm text-slate-400">NPV: ${(project.npv / 1000000).toFixed(1)}M</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function ScoringAllocationEnhanced() {
  const { state, optimizePortfolioAllocation, recalculateScores } = useAllocationData()
  const [scores, setScores] = useState<ScoringMatrixCell[]>([])
  const [lockedProjects, setLockedProjects] = useState<Set<string>>(new Set())
  const [budgetCutoff, setBudgetCutoff] = useState(125000000) // $125M default
  const [autoScore, setAutoScore] = useState(false)
  const [optimizationResults, setOptimizationResults] = useState<any>(null)

  // Initialize scoring matrix
  useEffect(() => {
    if (!state?.projects || !state?.priorities) return
    
    const initialScores: ScoringMatrixCell[] = []
    state.projects.forEach(project => {
      state.priorities.forEach(priority => {
        const baseScore = autoScore ? 
          Math.min(100, Math.max(0, 
            (project.npv / 10000000) * 20 + // NPV factor
            (project.irr) * 1.5 + // IRR factor
            (project.riskLevel === 'low' ? 20 : project.riskLevel === 'medium' ? 10 : 0) + // Risk factor
            Math.random() * 20 // Random factor for demo
          )) : 50

        initialScores.push({
          projectId: project.id,
          priorityId: priority.id,
          score: baseScore,
          weight: priority.weight / 100,
          weightedScore: baseScore * (priority.weight / 100)
        })
      })
    })
    setScores(initialScores)
  }, [state?.projects, state?.priorities, autoScore])

  if (!state) {
    return <div className="p-6 text-center">Loading...</div>
  }

  const { projects, priorities, availableBudget } = state

  const handleScoreChange = (projectId: string, priorityId: string, newScore: number) => {
    setScores(prev => prev.map(score => {
      if (score.projectId === projectId && score.priorityId === priorityId) {
        return {
          ...score,
          score: newScore,
          weightedScore: newScore * score.weight
        }
      }
      return score
    }))
  }

  const handleToggleLock = (projectId: string) => {
    setLockedProjects(prev => {
      const newSet = new Set(prev)
      if (newSet.has(projectId)) {
        newSet.delete(projectId)
      } else {
        newSet.add(projectId)
      }
      return newSet
    })
  }

  const handleOptimize = () => {
    // Run optimization algorithm (simplified)
    const optimization = optimizePortfolioAllocation?.(
      Array.from(lockedProjects),
      []
    )
    setOptimizationResults(optimization)
  }

  const totalBudgetAllocated = projects
    .filter(p => lockedProjects.has(p.id))
    .reduce((sum, p) => sum + p.initialCapex, 0)

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">4. Scoring & Allocation</h2>
          <p className="text-slate-400">Score projects against priorities and optimize portfolio allocation</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setAutoScore(!autoScore)}>
            <Target className="w-4 h-4 mr-2" />
            {autoScore ? 'Manual Scoring' : 'Auto-Score'}
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Results
          </Button>
          <Button>
            <Save className="w-4 h-4 mr-2" />
            Save Portfolio
          </Button>
        </div>
      </div>

      {/* Scoring Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Scoring Controls</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{projects.length}</div>
              <div className="text-sm text-slate-400">Total Projects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{priorities.length}</div>
              <div className="text-sm text-slate-400">Priority Areas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {projects.filter(p => {
                  const totalScore = scores
                    .filter(s => s.projectId === p.id)
                    .reduce((sum, s) => sum + s.weightedScore, 0)
                  return totalScore >= 50 && priorities.every(pr => {
                    const score = scores.find(s => s.projectId === p.id && s.priorityId === pr.id)
                    return score ? score.score >= pr.minThreshold : false
                  })
                }).length}
              </div>
              <div className="text-sm text-slate-400">Qualified Projects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">
                ${(budgetCutoff / 1000000).toFixed(0)}M
              </div>
              <div className="text-sm text-slate-400">
                <Input
                  type="range"
                  min={50000000}
                  max={availableBudget}
                  value={budgetCutoff}
                  onChange={(e) => setBudgetCutoff(parseInt(e.target.value))}
                  className="w-full mt-1"
                />
                Budget Cutoff
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Scoring Matrix - 8 cols */}
        <div className="col-span-8">
          <Card>
            <CardHeader>
              <CardTitle>Project Scoring Matrix</CardTitle>
              <CardDescription>
                Score each project against investment priorities. Red borders indicate scores below threshold.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScoringMatrix
                projects={projects}
                priorities={priorities}
                scores={scores}
                onScoreChange={handleScoreChange}
                lockedProjects={lockedProjects}
              />
            </CardContent>
          </Card>
        </div>

        {/* Optimization Panel - 4 cols */}
        <div className="col-span-4">
          <OptimizationPanel
            projects={projects}
            priorities={priorities}
            availableBudget={budgetCutoff}
            onOptimize={handleOptimize}
            lockedProjects={lockedProjects}
            onToggleLock={handleToggleLock}
          />
        </div>
      </div>

      {/* Allocation Results */}
      <AllocationResults
        projects={projects}
        priorities={priorities}
        scores={scores}
        budgetCutoff={budgetCutoff}
      />
    </div>
  )
}