'use client'

import { useState } from 'react'
import { Download, DollarSign, TrendingUp, Target, Percent, Clock, Shield } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { useAllocationData } from '../../../hooks/use-allocation-data'
import { calculatePortfolioMetrics } from '../../../lib/calculations'
import { 
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Treemap 
} from 'recharts'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
  color?: string
  trend?: { value: number; direction: 'up' | 'down' }
}

function MetricCard({ title, value, subtitle, icon: Icon, color = 'blue', trend }: MetricCardProps) {
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
            {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
            {trend && (
              <div className={`flex items-center mt-2 text-xs ${
                trend.direction === 'up' ? 'text-green-400' : 'text-red-400'
              }`}>
                <span>{trend.direction === 'up' ? '↗' : '↘'} {trend.value}%</span>
              </div>
            )}
          </div>
          <div className={`w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center ${colorClasses[color as keyof typeof colorClasses]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function PriorityDonutChart({ priorities, projects, projectScores }: any) {
  const data = priorities.map((priority: any, index: number) => {
    const allocatedProjects = projectScores.filter((ps: any) => 
      ps.allocated && projects.find((p: any) => p.id === ps.projectId)?.priorityAlignment.includes(priority.id)
    )
    return {
      name: priority.name,
      value: allocatedProjects.length,
      coverage: Math.min((allocatedProjects.length / projects.length) * 100, 100),
      color: priority.color
    }
  })

  return (
    <div className="space-y-4">
      {data.map((item: any, index: number) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-white">{item.name}</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-white">{item.coverage.toFixed(0)}%</div>
              <div className="text-xs text-slate-400">{item.value} projects</div>
            </div>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${item.coverage}%`,
                backgroundColor: item.color 
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export function PortfolioAnalytics() {
  const { state } = useAllocationData()
  const [viewMode, setViewMode] = useState<'executive' | 'financial' | 'strategic' | 'operational'>('executive')
  
  if (!state) {
    return <div className="p-6 text-center">Loading...</div>
  }

  const { projects, priorities, projectScores, portfolioMetrics } = state
  
  const allocatedProjects = projects.filter(p => 
    projectScores.find(ps => ps.projectId === p.id)?.allocated
  )

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting portfolio analytics report...')
  }

  // Calculate additional metrics
  const totalInvestment = allocatedProjects.reduce((sum, p) => sum + p.initialCapex, 0)
  const averageIRR = allocatedProjects.length > 0 
    ? allocatedProjects.reduce((sum, p) => sum + (p.irr * p.initialCapex / totalInvestment), 0)
    : 0

  // Cash flow projection data
  const cashFlowProjection = Array.from({ length: 6 }, (_, year) => {
    const investment = year === 0 ? totalInvestment : 0
    const returns = allocatedProjects.reduce((sum, p) => {
      const cf = p.cashFlows.find(cf => cf.year === year)
      return sum + (cf?.amount || 0)
    }, 0)
    
    return {
      year,
      investment: investment / 1000000,
      returns: Math.max(0, returns / 1000000),
      cumulative: year === 0 ? -investment / 1000000 : 0 // Simplified cumulative
    }
  })

  // Update cumulative values
  for (let i = 1; i < cashFlowProjection.length; i++) {
    cashFlowProjection[i].cumulative = 
      cashFlowProjection[i - 1].cumulative + 
      cashFlowProjection[i].returns - 
      cashFlowProjection[i].investment
  }

  // Portfolio treemap data
  const portfolioTreemap = priorities.map(priority => {
    const alignedProjects = allocatedProjects.filter(p => 
      p.priorityAlignment.includes(priority.id)
    )
    const totalValue = alignedProjects.reduce((sum, p) => sum + p.initialCapex, 0)
    
    return {
      name: priority.name,
      value: totalValue / 1000000,
      children: alignedProjects.map(p => ({
        name: p.name,
        value: p.initialCapex / 1000000
      }))
    }
  }).filter(item => item.value > 0)

  // Resource requirements over time
  const fteRequirements = [
    { quarter: 'Q1', fte: 45 },
    { quarter: 'Q2', fte: 78 },
    { quarter: 'Q3', fte: 92 },
    { quarter: 'Q4', fte: 85 },
    { quarter: 'Q1+1', fte: 65 },
    { quarter: 'Q2+1', fte: 42 }
  ]

  // Top skills required
  const topSkills = [
    { name: 'Data Science', coverage: 75, fte: 12 },
    { name: 'Cloud Architecture', coverage: 60, fte: 8 },
    { name: 'Project Management', coverage: 90, fte: 15 },
    { name: 'DevOps', coverage: 45, fte: 6 },
    { name: 'Cybersecurity', coverage: 30, fte: 4 }
  ]

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">6. Portfolio Analytics</h2>
          <p className="text-slate-400">Holistic view of the investment portfolio and its impacts</p>
        </div>
        <div className="flex space-x-2">
          <Select value={viewMode} onValueChange={(value: string) => setViewMode(value as 'executive' | 'financial' | 'strategic' | 'operational')}>
            <SelectTrigger className="w-48 bg-slate-700 border-slate-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="executive">Executive Dashboard</SelectItem>
              <SelectItem value="financial">Financial Deep Dive</SelectItem>
              <SelectItem value="strategic">Strategic Alignment</SelectItem>
              <SelectItem value="operational">Operational View</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Executive Dashboard View */}
      {viewMode === 'executive' && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-6 gap-4">
            <MetricCard
              title="Portfolio Value"
              value={`$${(totalInvestment / 1000000).toFixed(0)}M`}
              subtitle="Total capital allocated"
              icon={DollarSign}
              trend={{ value: 12.5, direction: 'up' }}
            />
            <MetricCard
              title="Portfolio NPV"
              value={`$${portfolioMetrics.totalNPV.toFixed(0)}M`}
              subtitle="Net present value"
              icon={TrendingUp}
              color="green"
              trend={{ value: 8.3, direction: 'up' }}
            />
            <MetricCard
              title="Avg IRR"
              value={`${averageIRR.toFixed(1)}%`}
              subtitle="Weighted average"
              icon={Percent}
              color="blue"
            />
            <MetricCard
              title="Avg Payback"
              value={`${portfolioMetrics.avgPayback.toFixed(1)} yrs`}
              subtitle="Average period"
              icon={Clock}
              color="amber"
            />
            <MetricCard
              title="Risk Score"
              value={portfolioMetrics.riskScore.toFixed(0)}
              subtitle="Portfolio risk"
              icon={Shield}
              color={portfolioMetrics.riskScore < 30 ? 'green' : portfolioMetrics.riskScore < 60 ? 'amber' : 'red'}
            />
            <MetricCard
              title="ROI"
              value={`${portfolioMetrics.roi.toFixed(1)}%`}
              subtitle="5-year return"
              icon={Target}
              color="purple"
            />
          </div>

          {/* Main Visualizations */}
          <div className="grid grid-cols-2 gap-6">
            {/* Cash Flow Projection */}
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Cash Flow Projection</CardTitle>
                <CardDescription>5-year cumulative cash flow forecast</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={cashFlowProjection}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="year" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #475569',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="investment" 
                      stackId="1" 
                      fill="#ef4444" 
                      name="Investment ($M)"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="returns" 
                      stackId="1" 
                      fill="#10b981" 
                      name="Returns ($M)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cumulative" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Cumulative ($M)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Portfolio Composition Treemap */}
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Composition</CardTitle>
                <CardDescription>Investment allocation by priority</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <Treemap
                    data={portfolioTreemap}
                    dataKey="value"
                    aspectRatio={4 / 3}
                    stroke="#fff"
                    fill="#8884d8"
                  >
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload[0]) {
                          return (
                            <div className="bg-slate-800 border border-slate-600 rounded p-3">
                              <p className="text-white">{payload[0].payload.name}</p>
                              <p className="text-slate-400">${payload[0].value}M</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                  </Treemap>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Strategic Alignment */}
          <Card>
            <CardHeader>
              <CardTitle>Strategic Priority Coverage</CardTitle>
              <CardDescription>How well the portfolio addresses each priority</CardDescription>
            </CardHeader>
            <CardContent>
              <PriorityDonutChart 
                priorities={priorities}
                projects={allocatedProjects}
                projectScores={projectScores}
              />
            </CardContent>
          </Card>

          {/* Resource Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Resource Requirements</CardTitle>
              <CardDescription>FTE and skill requirements over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-3">FTE Requirements</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={fteRequirements}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="quarter" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid #475569',
                          borderRadius: '8px'
                        }}
                      />
                      <Area type="monotone" dataKey="fte" fill="#3b82f6" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-3">Top Skills Required</h4>
                  <div className="space-y-3">
                    {topSkills.map(skill => (
                      <div key={skill.name} className="flex items-center justify-between">
                        <span className="text-sm text-white">{skill.name}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-slate-700 rounded-full h-2">
                            <div 
                              className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                              style={{ width: `${skill.coverage}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-400 w-12 text-right">{skill.fte} FTE</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Financial Deep Dive View */}
      {viewMode === 'financial' && (
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>NPV Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={allocatedProjects.map(p => ({ 
                  name: p.projectId, 
                  npv: p.npv / 1000000,
                  irr: p.irr 
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Bar dataKey="npv" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>IRR vs Investment</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={allocatedProjects.map(p => ({ 
                  name: p.projectId, 
                  investment: p.initialCapex / 1000000,
                  irr: p.irr 
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Area type="monotone" dataKey="irr" fill="#3b82f6" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Strategic View */}
      {viewMode === 'strategic' && (
        <Card>
          <CardHeader>
            <CardTitle>Strategic Alignment Heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-slate-500">
              <p>Strategic alignment heatmap visualization</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Operational View */}
      {viewMode === 'operational' && (
        <Card>
          <CardHeader>
            <CardTitle>Operational Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-slate-500">
              <p>Operational dashboard with execution metrics</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}