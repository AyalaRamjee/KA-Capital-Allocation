'use client'

import { useState, useEffect } from 'react'
import { Calculator, Zap, Target, CheckCircle, DollarSign, Wallet, TrendingUp, Briefcase } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Input } from '../../../components/ui/input'
import { Progress } from '../../../components/ui/progress'
import { useAllocationData } from '../../../hooks/use-allocation-data'
import { calculateProjectScore, optimizePortfolio } from '../../../lib/calculations'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface MetricCardProps {
  title: string
  value: string | number
  icon: React.ElementType
  color?: string
}

function MetricCard({ title, value, icon: Icon, color = 'blue' }: MetricCardProps) {
  const colorClasses = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    amber: 'text-amber-400',
    purple: 'text-purple-400',
    red: 'text-red-400'
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-white font-mono">{value}</p>
          </div>
          <div className={`w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center ${colorClasses[color as keyof typeof colorClasses]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ScoreCell({ 
  score, 
  weightedScore, 
  threshold, 
  projectId, 
  priorityId,
  onEdit 
}: { 
  score: number
  weightedScore: number
  threshold: number
  projectId: string
  priorityId: string
  onEdit: (projectId: string, priorityId: string, newScore: number) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(score)

  const handleSave = () => {
    onEdit(projectId, priorityId, editValue)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      setEditValue(score)
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return (
      <div className="flex items-center justify-center">
        <Input
          type="number"
          min="0"
          max="100"
          value={editValue}
          onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="w-16 h-8 text-xs bg-slate-700 border-slate-600 text-center"
          autoFocus
        />
      </div>
    )
  }

  return (
    <div
      className={`cursor-pointer hover:bg-slate-600 p-2 rounded text-center transition-colors ${
        score >= threshold ? 'text-green-400' : 'text-red-400'
      }`}
      onClick={() => setIsEditing(true)}
    >
      <div className="text-sm font-bold">{score}</div>
      <div className="text-xs opacity-60">{weightedScore.toFixed(1)}</div>
    </div>
  )
}

export function ScoringAllocation() {
  const { state, recalculateScores, optimizePortfolioAllocation, updateState } = useAllocationData()
  const [lockedProjects, setLockedProjects] = useState<string[]>([])
  const [excludedProjects, setExcludedProjects] = useState<string[]>([])
  const [availableBudget, setAvailableBudget] = useState(125000000)
  
  useEffect(() => {
    if (state?.projectScores?.length === 0 && state?.projects?.length > 0) {
      recalculateScores()
    }
  }, [state?.projects, state?.priorities, recalculateScores, state?.projectScores?.length])
  
  if (!state) {
    return <div className="p-6 text-center">Loading...</div>
  }

  const { projects, priorities, projectScores } = state

  const handleRecalculate = () => {
    recalculateScores()
  }

  const handleOptimize = () => {
    const result = optimizePortfolioAllocation(lockedProjects, excludedProjects)
    if (result) {
      console.log('Optimization result:', result)
    }
  }

  const handleScoreEdit = (projectId: string, priorityId: string, newScore: number) => {
    updateState(prevState => {
      const updatedScores = prevState.projectScores.map(ps => {
        if (ps.projectId === projectId) {
          const updatedProjectScores = ps.scores.map(s => {
            if (s.priorityId === priorityId) {
              const priority = priorities.find(p => p.id === priorityId)
              const weightedScore = priority ? (newScore * priority.weight) / 100 : 0
              return { ...s, alignmentScore: newScore, weightedScore }
            }
            return s
          })
          
          const totalScore = updatedProjectScores.reduce((sum, s) => sum + s.weightedScore, 0)
          const passesThreshold = priorities.every(priority => {
            const score = updatedProjectScores.find(s => s.priorityId === priority.id)
            return !score || score.alignmentScore >= priority.minThreshold
          })
          
          return {
            ...ps,
            scores: updatedProjectScores,
            totalScore,
            passesThreshold
          }
        }
        return ps
      })
      
      // Recalculate ranks
      updatedScores.sort((a, b) => b.totalScore - a.totalScore)
      updatedScores.forEach((score, index) => {
        score.rank = index + 1
      })
      
      return {
        ...prevState,
        projectScores: updatedScores
      }
    })
  }

  const cutLineIndex = calculateCutLine()
  const aboveThresholdProjects = projectScores.filter(p => p.passesThreshold).length
  const totalBudgetRequired = projects.reduce((sum, p) => sum + p.initialCapex, 0)
  const portfolioNPV = projectScores
    .filter(ps => ps.allocated)
    .reduce((sum, ps) => {
      const project = projects.find(p => p.id === ps.projectId)
      return sum + (project?.npv || 0)
    }, 0)

  function calculateCutLine(): number {
    let cumulativeBudget = 0
    const sortedScores = [...projectScores]
      .filter(ps => ps.passesThreshold && !excludedProjects.includes(ps.projectId))
      .sort((a, b) => b.totalScore - a.totalScore)
    
    for (let i = 0; i < sortedScores.length; i++) {
      const project = projects.find(p => p.id === sortedScores[i].projectId)
      if (project) {
        cumulativeBudget += project.initialCapex
        if (cumulativeBudget > availableBudget) {
          return i
        }
      }
    }
    return sortedScores.length
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16']

  const portfolioByPriority = priorities.map((priority, index) => {
    const alignedProjects = projectScores.filter(ps => 
      ps.allocated && projects.find(p => p.id === ps.projectId)?.priorityAlignment.includes(priority.id)
    )
    return {
      name: priority.name,
      value: alignedProjects.length,
      color: COLORS[index % COLORS.length]
    }
  })

  const portfolioByRisk = [
    { level: 'Low', count: projectScores.filter(ps => ps.allocated && projects.find(p => p.id === ps.projectId)?.riskLevel === 'low').length },
    { level: 'Medium', count: projectScores.filter(ps => ps.allocated && projects.find(p => p.id === ps.projectId)?.riskLevel === 'medium').length },
    { level: 'High', count: projectScores.filter(ps => ps.allocated && projects.find(p => p.id === ps.projectId)?.riskLevel === 'high').length }
  ]

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">4. Scoring & Allocation</h2>
          <p className="text-slate-400">Apply priorities to score projects and optimize portfolio</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleRecalculate}>
            <Calculator className="w-4 h-4 mr-2" />
            Recalculate
          </Button>
          <Button onClick={handleOptimize}>
            <Zap className="w-4 h-4 mr-2" />
            Optimize Portfolio
          </Button>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-5 gap-4">
        <MetricCard
          title="Total Projects"
          value={projects.length}
          icon={Briefcase}
        />
        <MetricCard
          title="Above Threshold"
          value={aboveThresholdProjects}
          icon={CheckCircle}
          color="green"
        />
        <MetricCard
          title="Budget Required"
          value={`$${(totalBudgetRequired / 1000000).toFixed(0)}M`}
          icon={DollarSign}
          color="amber"
        />
        <MetricCard
          title="Budget Available"
          value={`$${(availableBudget / 1000000).toFixed(0)}M`}
          icon={Wallet}
        />
        <MetricCard
          title="Portfolio NPV"
          value={`$${(portfolioNPV / 1000000).toFixed(0)}M`}
          icon={TrendingUp}
          color="green"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left: Scoring Matrix */}
        <div className="col-span-8">
          <Card>
            <CardHeader>
              <CardTitle>Project Scoring Matrix</CardTitle>
              <CardDescription>Click on scores to edit alignment ratings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left p-3 text-slate-400 min-w-[200px]">Project</th>
                      {priorities.map(priority => (
                        <th key={priority.id} className="text-center p-3 text-slate-400 min-w-[80px]">
                          <div className="font-medium">{priority.code}</div>
                          <div className="text-xs font-normal">{priority.weight}%</div>
                        </th>
                      ))}
                      <th className="text-center p-3 text-slate-400 min-w-[80px]">Total</th>
                      <th className="text-center p-3 text-slate-400 min-w-[60px]">Rank</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectScores.map(projectScore => {
                      const project = projects.find(p => p.id === projectScore.projectId)
                      return (
                        <tr 
                          key={projectScore.projectId} 
                          className={`border-b border-slate-700 ${
                            projectScore.allocated ? 'bg-green-900/20' : ''
                          }`}
                        >
                          <td className="p-3">
                            <div className="text-white font-medium">{project?.name}</div>
                            <div className="text-xs text-slate-400">{project?.projectId}</div>
                          </td>
                          {priorities.map(priority => {
                            const score = projectScore.scores.find(s => s.priorityId === priority.id)
                            return (
                              <td key={priority.id} className="text-center p-1">
                                <ScoreCell
                                  score={score?.alignmentScore || 0}
                                  weightedScore={score?.weightedScore || 0}
                                  threshold={priority.minThreshold}
                                  projectId={projectScore.projectId}
                                  priorityId={priority.id}
                                  onEdit={handleScoreEdit}
                                />
                              </td>
                            )
                          })}
                          <td className="text-center p-3">
                            <div className={`text-lg font-bold ${
                              projectScore.passesThreshold ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {projectScore.totalScore.toFixed(1)}
                            </div>
                          </td>
                          <td className="text-center p-3">
                            <Badge variant={projectScore.rank <= 10 ? 'default' : 'secondary'}>
                              #{projectScore.rank}
                            </Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Allocation Controls */}
        <div className="col-span-4 space-y-4">
          {/* Budget Control */}
          <Card>
            <CardHeader>
              <CardTitle>Budget Control</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-slate-400">Available Budget ($M)</label>
                  <Input
                    type="number"
                    value={availableBudget / 1000000}
                    onChange={(e) => setAvailableBudget(parseFloat(e.target.value) * 1000000 || 0)}
                    className="bg-slate-700 border-slate-600 mt-1"
                  />
                </div>
                <div className="text-sm text-slate-400">
                  Utilization: {((totalBudgetRequired / availableBudget) * 100).toFixed(1)}%
                </div>
                <Progress 
                  value={Math.min((totalBudgetRequired / availableBudget) * 100, 100)} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Portfolio Cut Line */}
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Cut Line</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {projectScores
                  .filter(ps => ps.passesThreshold)
                  .sort((a, b) => b.totalScore - a.totalScore)
                  .slice(0, 15)
                  .map((projectScore, index) => {
                    const project = projects.find(p => p.id === projectScore.projectId)
                    const isCutLine = cutLineIndex === index
                    return (
                      <div key={projectScore.projectId}>
                        <div className={`flex items-center justify-between p-2 rounded ${
                          projectScore.allocated ? 'bg-green-900/20' : 'bg-slate-700'
                        }`}>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-slate-400">#{index + 1}</span>
                            <span className="text-sm text-white truncate">{project?.name}</span>
                          </div>
                          <span className="text-xs font-mono text-white">
                            ${((project?.initialCapex || 0) / 1000000).toFixed(1)}M
                          </span>
                        </div>
                        {isCutLine && (
                          <div className="flex items-center my-2">
                            <div className="flex-1 h-px bg-red-500"></div>
                            <span className="mx-2 text-xs text-red-500">Budget Limit</span>
                            <div className="flex-1 h-px bg-red-500"></div>
                          </div>
                        )}
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Portfolio Composition */}
      <Card>
        <CardHeader>
          <CardTitle>Optimized Portfolio Composition</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm font-medium text-slate-400 mb-3">By Priority</h4>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={portfolioByPriority}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                  >
                    {portfolioByPriority.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-slate-400 mb-3">By Risk Level</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={portfolioByRisk}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="level" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-slate-400 mb-3">Allocation Summary</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Projects Selected:</span>
                  <span className="text-white font-mono">{projectScores.filter(ps => ps.allocated).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Budget Used:</span>
                  <span className="text-white font-mono">
                    ${(projectScores.filter(ps => ps.allocated).reduce((sum, ps) => {
                      const project = projects.find(p => p.id === ps.projectId)
                      return sum + (project?.initialCapex || 0)
                    }, 0) / 1000000).toFixed(1)}M
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Portfolio NPV:</span>
                  <span className="text-green-400 font-mono">${(portfolioNPV / 1000000).toFixed(1)}M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Avg Score:</span>
                  <span className="text-blue-400 font-mono">
                    {projectScores.filter(ps => ps.allocated).length > 0 
                      ? (projectScores.filter(ps => ps.allocated).reduce((sum, ps) => sum + ps.totalScore, 0) / 
                         projectScores.filter(ps => ps.allocated).length).toFixed(1)
                      : '0.0'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}