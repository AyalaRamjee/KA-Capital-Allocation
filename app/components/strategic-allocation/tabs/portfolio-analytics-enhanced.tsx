'use client'

import { useState, useMemo } from 'react'
import { TrendingUp, DollarSign, Target, BarChart3, PieChart, Activity, Download, Calendar, Award, AlertTriangle, Users, Building, MapPin, Zap } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Progress } from '../../../components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { useAllocationData } from '../../../hooks/use-allocation-data'
import { 
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter, Treemap, Sankey, FunnelChart, Funnel, LabelList
} from 'recharts'
import { cn } from '../../../lib/utils'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316']

function KPIDashboard({ state }: { state: any }) {
  const { projects, priorities, portfolioMetrics, availableBudget } = state
  
  const totalInvestment = projects.reduce((sum: number, p: any) => sum + p.initialCapex, 0)
  const totalNPV = projects.reduce((sum: number, p: any) => sum + p.npv, 0)
  const avgIRR = projects.length > 0 ? 
    projects.reduce((sum: number, p: any) => sum + (p.irr * p.initialCapex), 0) / totalInvestment : 0
  const avgPayback = projects.length > 0 ?
    projects.reduce((sum: number, p: any) => sum + p.paybackPeriod, 0) / projects.length : 0
  
  const riskScore = projects.reduce((sum: number, p: any) => {
    const riskValue = p.riskLevel === 'high' ? 3 : p.riskLevel === 'medium' ? 2 : 1
    return sum + (riskValue * p.initialCapex)
  }, 0) / totalInvestment

  const budgetUtilization = (totalInvestment / availableBudget) * 100

  const kpis = [
    {
      title: 'Total Portfolio Value',
      value: `$${(totalInvestment / 1000000).toFixed(1)}M`,
      subtitle: `${projects.length} projects`,
      icon: DollarSign,
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/20',
      trend: '+12.5%',
      trendColor: 'text-green-400'
    },
    {
      title: 'Portfolio NPV',
      value: `$${(totalNPV / 1000000).toFixed(1)}M`,
      subtitle: `ROI: ${totalInvestment > 0 ? ((totalNPV / totalInvestment) * 100).toFixed(1) : 0}%`,
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-green-900/20',
      trend: '+8.3%',
      trendColor: 'text-green-400'
    },
    {
      title: 'Weighted Average IRR',
      value: `${avgIRR.toFixed(1)}%`,
      subtitle: `Target: 15%+`,
      icon: Target,
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/20',
      trend: avgIRR >= 15 ? '+2.1%' : '-1.2%',
      trendColor: avgIRR >= 15 ? 'text-green-400' : 'text-red-400'
    },
    {
      title: 'Average Payback',
      value: `${avgPayback.toFixed(1)} yrs`,
      subtitle: `Target: <3 years`,
      icon: Activity,
      color: 'text-amber-400',
      bgColor: 'bg-amber-900/20',
      trend: avgPayback <= 3 ? '-0.3 yrs' : '+0.5 yrs',
      trendColor: avgPayback <= 3 ? 'text-green-400' : 'text-red-400'
    },
    {
      title: 'Risk Score',
      value: `${riskScore.toFixed(1)}/3.0`,
      subtitle: riskScore <= 2 ? 'Acceptable' : 'High Risk',
      icon: AlertTriangle,
      color: riskScore <= 2 ? 'text-green-400' : 'text-red-400',
      bgColor: riskScore <= 2 ? 'bg-green-900/20' : 'bg-red-900/20',
      trend: riskScore <= 2 ? 'Low' : 'High',
      trendColor: riskScore <= 2 ? 'text-green-400' : 'text-red-400'
    },
    {
      title: 'Budget Utilization',
      value: `${budgetUtilization.toFixed(1)}%`,
      subtitle: `$${(availableBudget / 1000000).toFixed(0)}M available`,
      icon: PieChart,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-900/20',
      trend: budgetUtilization <= 90 ? 'Optimal' : 'Over',
      trendColor: budgetUtilization <= 90 ? 'text-green-400' : 'text-red-400'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {kpis.map((kpi) => (
        <Card key={kpi.title} className={cn("relative overflow-hidden", kpi.bgColor)}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">{kpi.title}</p>
                <p className="text-3xl font-bold text-white mt-2">{kpi.value}</p>
                <p className="text-sm text-slate-400 mt-1">{kpi.subtitle}</p>
                <div className="flex items-center mt-2">
                  <span className={cn("text-sm font-medium", kpi.trendColor)}>
                    {kpi.trend}
                  </span>
                  <span className="text-xs text-slate-500 ml-1">vs last period</span>
                </div>
              </div>
              <div className={cn("w-16 h-16 rounded-lg flex items-center justify-center bg-slate-700", kpi.color)}>
                <kpi.icon className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function CashFlowProjection({ projects }: { projects: any[] }) {
  const years = Array.from({length: 6}, (_, i) => i)
  
  const cashFlowData = years.map(year => {
    const totalCashFlow = projects.reduce((sum, project) => {
      const yearFlow = project.cashFlows?.find((cf: any) => cf.year === year)
      return sum + (yearFlow?.amount || 0)
    }, 0)
    
    const cumulativeCashFlow = years.slice(0, year + 1).reduce((sum, y) => {
      const yearTotal = projects.reduce((yearSum, project) => {
        const yearFlow = project.cashFlows?.find((cf: any) => cf.year === y)
        return yearSum + (yearFlow?.amount || 0)
      }, 0)
      return sum + yearTotal
    }, 0)
    
    return {
      year: `Year ${year}`,
      cashFlow: totalCashFlow / 1000000,
      cumulative: cumulativeCashFlow / 1000000,
      investment: year === 0 ? Math.abs(totalCashFlow) / 1000000 : 0
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5" />
          <span>Portfolio Cash Flow Projection</span>
        </CardTitle>
        <CardDescription>5-year cash flow analysis with cumulative returns</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="year" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value: number, name: string) => [
                  `$${value.toFixed(1)}M`,
                  name === 'cashFlow' ? 'Annual Cash Flow' : 
                  name === 'cumulative' ? 'Cumulative' : 'Investment'
                ]}
              />
              <Bar dataKey="cashFlow" fill="#10b981" name="Annual Cash Flow" />
              <Line type="monotone" dataKey="cumulative" stroke="#3b82f6" strokeWidth={3} name="Cumulative" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

function PortfolioComposition({ projects, priorities }: { projects: any[], priorities: any[] }) {
  // By Priority
  const priorityData = priorities.map(priority => {
    const alignedProjects = projects.filter(p => p.priorityAlignment?.includes(priority.id))
    const totalInvestment = alignedProjects.reduce((sum, p) => sum + p.initialCapex, 0)
    
    return {
      name: priority.name,
      value: totalInvestment / 1000000,
      count: alignedProjects.length,
      color: priority.color
    }
  })

  // By Risk Level
  const riskData = [
    { name: 'Low Risk', value: 0, count: 0, color: '#10b981' },
    { name: 'Medium Risk', value: 0, count: 0, color: '#f59e0b' },
    { name: 'High Risk', value: 0, count: 0, color: '#ef4444' }
  ]
  
  projects.forEach(project => {
    const index = project.riskLevel === 'low' ? 0 : project.riskLevel === 'medium' ? 1 : 2
    riskData[index].value += project.initialCapex / 1000000
    riskData[index].count += 1
  })

  // By Time Horizon
  const timeData = [
    { name: 'Short Term (<2 yrs)', value: 0, count: 0 },
    { name: 'Medium Term (2-5 yrs)', value: 0, count: 0 },
    { name: 'Long Term (5+ yrs)', value: 0, count: 0 }
  ]
  
  projects.forEach(project => {
    const payback = project.paybackPeriod
    const index = payback < 2 ? 0 : payback <= 5 ? 1 : 2
    timeData[index].value += project.initialCapex / 1000000
    timeData[index].count += 1
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* By Priority */}
      <Card>
        <CardHeader>
          <CardTitle>By Strategic Priority</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#fff' }}
                  formatter={(value: number) => [`$${value.toFixed(1)}M`, 'Investment']}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* By Risk Level */}
      <Card>
        <CardHeader>
          <CardTitle>By Risk Level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#fff' }}
                  formatter={(value: number, name: string, props: any) => [
                    `$${value.toFixed(1)}M (${props.payload.count} projects)`,
                    'Investment'
                  ]}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* By Time Horizon */}
      <Card>
        <CardHeader>
          <CardTitle>By Payback Period</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timeData.map((item, index) => (
              <div key={item.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">{item.name}</span>
                  <span className="text-white">${item.value.toFixed(1)}M ({item.count})</span>
                </div>
                <Progress 
                  value={(item.value / timeData.reduce((sum, d) => sum + d.value, 0)) * 100} 
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function RiskHeatMap({ projects }: { projects: any[] }) {
  const heatmapData = projects.map(project => ({
    name: project.name,
    x: project.irr,
    y: project.riskLevel === 'low' ? 1 : project.riskLevel === 'medium' ? 2 : 3,
    z: project.initialCapex / 1000000,
    npv: project.npv / 1000000,
    payback: project.paybackPeriod
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5" />
          <span>Risk vs Return Analysis</span>
        </CardTitle>
        <CardDescription>Project positioning by IRR and risk level (bubble size = investment)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="x" 
                name="IRR" 
                unit="%" 
                stroke="#94a3b8"
                domain={['dataMin - 5', 'dataMax + 5']}
              />
              <YAxis 
                dataKey="y" 
                name="Risk Level" 
                domain={[0.5, 3.5]}
                tickCount={4}
                tickFormatter={(value) => 
                  value === 1 ? 'Low' : 
                  value === 2 ? 'Medium' : 
                  value === 3 ? 'High' : ''
                }
                stroke="#94a3b8"
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#fff' }}
                formatter={(value: number, name: string, props: any) => {
                  const data = props.payload
                  return [
                    <div key="tooltip">
                      <div className="font-medium">{data.name}</div>
                      <div>IRR: {data.x.toFixed(1)}%</div>
                      <div>Investment: ${data.z.toFixed(1)}M</div>
                      <div>NPV: ${data.npv.toFixed(1)}M</div>
                      <div>Payback: {data.payback.toFixed(1)} years</div>
                    </div>,
                    ''
                  ]
                }}
                labelFormatter={() => ''}
              />
              <Scatter
                name="Projects"
                data={heatmapData}
                fill="#3b82f6"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

function ExecutiveReports({ projects, priorities }: { projects: any[], priorities: any[] }) {
  const [reportType, setReportType] = useState('executive')
  
  const generateReport = () => {
    // Generate and download report
    console.log('Generating report:', reportType)
  }

  const reports = [
    {
      id: 'executive',
      name: 'Executive Summary',
      description: 'High-level portfolio overview for C-suite',
      icon: Award,
      color: 'text-purple-400'
    },
    {
      id: 'board',
      name: 'Board Pack',
      description: 'Comprehensive board presentation deck',
      icon: Users,
      color: 'text-blue-400'
    },
    {
      id: 'detailed',
      name: 'Detailed Analysis',
      description: 'In-depth project and portfolio analysis',
      icon: BarChart3,
      color: 'text-green-400'
    },
    {
      id: 'risk',
      name: 'Risk Assessment',
      description: 'Portfolio risk analysis and mitigation strategies',
      icon: AlertTriangle,
      color: 'text-red-400'
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Download className="w-5 h-5" />
          <span>Executive Reports</span>
        </CardTitle>
        <CardDescription>Generate comprehensive reports for stakeholders</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {reports.map(report => (
            <div 
              key={report.id}
              className={cn(
                "p-4 border rounded-lg cursor-pointer transition-all",
                reportType === report.id 
                  ? "border-blue-500 bg-blue-900/20" 
                  : "border-slate-600 hover:border-slate-500"
              )}
              onClick={() => setReportType(report.id)}
            >
              <div className="flex items-center space-x-3">
                <report.icon className={cn("w-6 h-6", report.color)} />
                <div>
                  <div className="font-medium text-white">{report.name}</div>
                  <div className="text-sm text-slate-400">{report.description}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <Button onClick={generateReport} className="w-full">
          <Download className="w-4 h-4 mr-2" />
          Generate {reports.find(r => r.id === reportType)?.name}
        </Button>
      </CardContent>
    </Card>
  )
}

export function PortfolioAnalyticsEnhanced() {
  const { state } = useAllocationData()
  const [timeRange, setTimeRange] = useState('12m')

  if (!state) {
    return <div className="p-6 text-center">Loading...</div>
  }

  const { projects, priorities } = state

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">6. Portfolio Analytics</h2>
          <p className="text-slate-400">Monitor performance and analyze portfolio composition</p>
        </div>
        <div className="flex space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 bg-slate-700 border-slate-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="3m">3 Months</SelectItem>
              <SelectItem value="6m">6 Months</SelectItem>
              <SelectItem value="12m">12 Months</SelectItem>
              <SelectItem value="24m">24 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Custom Range
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Dashboard
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-slate-800">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="composition">Composition</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPI Dashboard */}
          <KPIDashboard state={state} />
          
          {/* Cash Flow Projection */}
          <CashFlowProjection projects={projects} />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { month: 'Jan', npv: 150, irr: 18, projects: 8 },
                      { month: 'Feb', npv: 165, irr: 19, projects: 10 },
                      { month: 'Mar', npv: 180, irr: 21, projects: 12 },
                      { month: 'Apr', npv: 195, irr: 22, projects: 15 },
                      { month: 'May', npv: 210, irr: 24, projects: 18 },
                      { month: 'Jun', npv: 225, irr: 25, projects: 20 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="month" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#fff' }} />
                      <Area type="monotone" dataKey="npv" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                      <Area type="monotone" dataKey="irr" stackId="2" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Performance Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects.slice(0, 5).map((project, index) => (
                    <div key={project.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-white">{project.name}</div>
                          <div className="text-sm text-slate-400">NPV: ${(project.npv / 1000000).toFixed(1)}M</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-bold">{project.irr.toFixed(1)}%</div>
                        <div className="text-sm text-slate-400">IRR</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="composition" className="space-y-6">
          <PortfolioComposition projects={projects} priorities={priorities} />
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          <RiskHeatMap projects={projects} />
          
          {/* Risk Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['low', 'medium', 'high'].map(level => {
                    const count = projects.filter(p => p.riskLevel === level).length
                    const percentage = (count / projects.length) * 100
                    
                    return (
                      <div key={level} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-300 capitalize">{level} Risk</span>
                          <span className="text-white">{count} projects ({percentage.toFixed(0)}%)</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Value at Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-4xl font-bold text-red-400">$12.5M</div>
                  <div className="text-sm text-slate-400">95% Confidence (1 month)</div>
                  <Progress value={25} className="h-2" />
                  <div className="text-xs text-slate-500">5.2% of portfolio value</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Mitigation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Diversification Score</span>
                    <Badge className="bg-green-500">Excellent</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Risk-Adjusted Return</span>
                    <span className="text-white font-mono">2.3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Maximum Drawdown</span>
                    <span className="text-red-400 font-mono">-8.5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <ExecutiveReports projects={projects} priorities={priorities} />
        </TabsContent>
      </Tabs>
    </div>
  )
}