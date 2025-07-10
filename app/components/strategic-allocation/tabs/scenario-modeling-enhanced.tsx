'use client'

import { useState, useEffect } from 'react'
import { Sliders, TrendingUp, Target, Zap, RefreshCw, Download, Save, Copy, Trash2, Play, BarChart3, AlertTriangle, DollarSign, Activity, Plus, Edit } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Slider } from '../../../components/ui/slider'
import { Badge } from '../../../components/ui/badge'
import { Progress } from '../../../components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { useAllocationData } from '../../../hooks/use-allocation-data'
import { Scenario } from '../../../lib/data-models'
import { 
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ReferenceLine,
  AreaChart, Area, ScatterChart, Scatter, Cell
} from 'recharts'
import { cn } from '../../../lib/utils'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316']

interface ScenarioParameters {
  name: string
  description: string
  budgetReduction: number
  projectDelays: number
  costInflation: number
  benefitReduction: number
  interestRateChange: number
  fxImpact: number
  riskMultiplier: number
  priorityAdjustments: { [key: string]: number }
}

interface MonteCarloResult {
  simulation: number
  npv: number
  irr: number
  payback: number
  riskScore: number
  projectsIncluded: number
}

function ScenarioBuilder({ 
  scenario, 
  onSave, 
  onCancel, 
  priorities 
}: {
  scenario?: ScenarioParameters
  onSave: (scenario: ScenarioParameters) => void
  onCancel: () => void
  priorities: any[]
}) {
  const [params, setParams] = useState<ScenarioParameters>(
    scenario || {
      name: '',
      description: '',
      budgetReduction: 0,
      projectDelays: 0,
      costInflation: 0,
      benefitReduction: 0,
      interestRateChange: 0,
      fxImpact: 0,
      riskMultiplier: 1,
      priorityAdjustments: {}
    }
  )

  const handleSave = () => {
    if (params.name.trim()) {
      onSave(params)
    }
  }

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Scenario Name</Label>
          <Input
            value={params.name}
            onChange={(e) => setParams({ ...params, name: e.target.value })}
            placeholder="e.g., Market Downturn, Budget Cut"
            className="bg-slate-700 border-slate-600"
          />
        </div>
        <div>
          <Label>Description</Label>
          <Input
            value={params.description}
            onChange={(e) => setParams({ ...params, description: e.target.value })}
            placeholder="Brief description of scenario"
            className="bg-slate-700 border-slate-600"
          />
        </div>
      </div>

      {/* Financial Constraints */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5" />
            <span>Financial Constraints</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label>Budget Reduction: {params.budgetReduction}%</Label>
              <Slider
                value={[params.budgetReduction]}
                onValueChange={(value) => setParams({ ...params, budgetReduction: value[0] })}
                max={50}
                step={5}
                className="mt-2"
              />
              <div className="text-xs text-slate-400 mt-1">Reduce available capital allocation</div>
            </div>
            
            <div>
              <Label>Cost Inflation: {params.costInflation}%</Label>
              <Slider
                value={[params.costInflation]}
                onValueChange={(value) => setParams({ ...params, costInflation: value[0] })}
                max={30}
                step={2}
                className="mt-2"
              />
              <div className="text-xs text-slate-400 mt-1">Increase project costs</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label>Interest Rate Change: {params.interestRateChange > 0 ? '+' : ''}{params.interestRateChange}%</Label>
              <Slider
                value={[params.interestRateChange]}
                onValueChange={(value) => setParams({ ...params, interestRateChange: value[0] })}
                min={-5}
                max={10}
                step={0.5}
                className="mt-2"
              />
              <div className="text-xs text-slate-400 mt-1">Affect discount rates and NPV</div>
            </div>
            
            <div>
              <Label>FX Impact: {params.fxImpact > 0 ? '+' : ''}{params.fxImpact}%</Label>
              <Slider
                value={[params.fxImpact]}
                onValueChange={(value) => setParams({ ...params, fxImpact: value[0] })}
                min={-20}
                max={20}
                step={1}
                className="mt-2"
              />
              <div className="text-xs text-slate-400 mt-1">Currency impact on international projects</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Risk Factors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span>Project Risk Factors</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label>Project Delays: {params.projectDelays} months</Label>
              <Slider
                value={[params.projectDelays]}
                onValueChange={(value) => setParams({ ...params, projectDelays: value[0] })}
                max={24}
                step={1}
                className="mt-2"
              />
              <div className="text-xs text-slate-400 mt-1">Extend all project timelines</div>
            </div>
            
            <div>
              <Label>Benefit Reduction: {params.benefitReduction}%</Label>
              <Slider
                value={[params.benefitReduction]}
                onValueChange={(value) => setParams({ ...params, benefitReduction: value[0] })}
                max={50}
                step={5}
                className="mt-2"
              />
              <div className="text-xs text-slate-400 mt-1">Reduce expected benefits/revenues</div>
            </div>
          </div>

          <div>
            <Label>Risk Multiplier: {params.riskMultiplier.toFixed(1)}x</Label>
            <Slider
              value={[params.riskMultiplier]}
              onValueChange={(value) => setParams({ ...params, riskMultiplier: value[0] })}
              min={0.5}
              max={3}
              step={0.1}
              className="mt-2"
            />
            <div className="text-xs text-slate-400 mt-1">Overall risk level adjustment</div>
          </div>
        </CardContent>
      </Card>

      {/* Priority Adjustments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Priority Weight Adjustments</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {priorities.map(priority => (
              <div key={priority.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: priority.color }}
                  />
                  <div>
                    <div className="font-medium text-white">{priority.name}</div>
                    <div className="text-sm text-slate-400">Current: {priority.weight}%</div>
                  </div>
                </div>
                <div className="w-32">
                  <Label className="text-xs">
                    Adjustment: {params.priorityAdjustments[priority.id] > 0 ? '+' : ''}{params.priorityAdjustments[priority.id] || 0}%
                  </Label>
                  <Slider
                    value={[params.priorityAdjustments[priority.id] || 0]}
                    onValueChange={(value) => setParams({
                      ...params,
                      priorityAdjustments: {
                        ...params.priorityAdjustments,
                        [priority.id]: value[0]
                      }
                    })}
                    min={-50}
                    max={50}
                    step={5}
                    className="mt-1"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!params.name.trim()}>
          <Save className="w-4 h-4 mr-2" />
          Save Scenario
        </Button>
      </div>
    </div>
  )
}

function MonteCarloSimulation({ 
  scenario, 
  projects, 
  onResults 
}: {
  scenario: ScenarioParameters
  projects: any[]
  onResults: (results: MonteCarloResult[]) => void
}) {
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [iterations] = useState(1000)

  const runSimulation = async () => {
    setIsRunning(true)
    setProgress(0)

    const results: MonteCarloResult[] = []

    for (let i = 0; i < iterations; i++) {
      // Simulate random variations
      const budgetMultiplier = 1 - (scenario.budgetReduction / 100) * (0.8 + Math.random() * 0.4)
      const costMultiplier = 1 + (scenario.costInflation / 100) * (0.8 + Math.random() * 0.4)
      const benefitMultiplier = 1 - (scenario.benefitReduction / 100) * (0.8 + Math.random() * 0.4)
      const delayMultiplier = 1 + (scenario.projectDelays / 12) * (0.8 + Math.random() * 0.4)

      // Apply scenario to projects
      const adjustedProjects = projects.map(project => {
        const adjustedCost = project.initialCapex * costMultiplier
        const adjustedBenefits = project.npv * benefitMultiplier
        const adjustedIRR = project.irr * benefitMultiplier * (1 / costMultiplier)
        const adjustedPayback = project.paybackPeriod * delayMultiplier

        return {
          ...project,
          adjustedCost,
          adjustedBenefits,
          adjustedIRR,
          adjustedPayback,
          riskScore: project.riskLevel === 'high' ? 3 : project.riskLevel === 'medium' ? 2 : 1
        }
      })

      // Calculate portfolio metrics for this iteration
      const totalInvestment = adjustedProjects.reduce((sum, p) => sum + p.adjustedCost, 0)
      const totalNPV = adjustedProjects.reduce((sum, p) => sum + p.adjustedBenefits, 0)
      const avgIRR = adjustedProjects.length > 0 ? 
        adjustedProjects.reduce((sum, p) => sum + p.adjustedIRR, 0) / adjustedProjects.length : 0
      const avgPayback = adjustedProjects.length > 0 ?
        adjustedProjects.reduce((sum, p) => sum + p.adjustedPayback, 0) / adjustedProjects.length : 0
      const avgRiskScore = adjustedProjects.length > 0 ?
        adjustedProjects.reduce((sum, p) => sum + p.riskScore, 0) / adjustedProjects.length : 0

      results.push({
        simulation: i + 1,
        npv: totalNPV / 1000000,
        irr: avgIRR,
        payback: avgPayback,
        riskScore: avgRiskScore * scenario.riskMultiplier,
        projectsIncluded: adjustedProjects.length
      })

      // Update progress
      if (i % 10 === 0) {
        setProgress((i / iterations) * 100)
        await new Promise(resolve => setTimeout(resolve, 1))
      }
    }

    setProgress(100)
    onResults(results)
    setIsRunning(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="w-5 h-5" />
          <span>Monte Carlo Simulation</span>
        </CardTitle>
        <CardDescription>Run {iterations.toLocaleString()} iterations to assess scenario probability</CardDescription>
      </CardHeader>
      <CardContent>
        {isRunning ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
              <div className="flex-1">
                <div className="text-white font-medium">Running simulation...</div>
                <div className="text-slate-400 text-sm">
                  {Math.round(progress / 100 * iterations).toLocaleString()} / {iterations.toLocaleString()} iterations
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-400">{progress.toFixed(0)}%</div>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="text-slate-400">
              Analyze scenario impact through probabilistic modeling
            </div>
            <Button onClick={runSimulation} className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
              <Play className="w-4 h-4 mr-2" />
              Run Monte Carlo Simulation
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ScenarioResults({ 
  results, 
  baselineMetrics 
}: {
  results: MonteCarloResult[]
  baselineMetrics: any
}) {
  if (results.length === 0) return null

  // Calculate statistics
  const npvValues = results.map(r => r.npv).sort((a, b) => a - b)
  const irrValues = results.map(r => r.irr).sort((a, b) => a - b)
  
  const percentile = (arr: number[], p: number) => arr[Math.floor(arr.length * p / 100)]
  
  const stats = {
    npv: {
      mean: npvValues.reduce((sum, v) => sum + v, 0) / npvValues.length,
      p5: percentile(npvValues, 5),
      p25: percentile(npvValues, 25),
      p50: percentile(npvValues, 50),
      p75: percentile(npvValues, 75),
      p95: percentile(npvValues, 95)
    },
    irr: {
      mean: irrValues.reduce((sum, v) => sum + v, 0) / irrValues.length,
      p5: percentile(irrValues, 5),
      p25: percentile(irrValues, 25),
      p50: percentile(irrValues, 50),
      p75: percentile(irrValues, 75),
      p95: percentile(irrValues, 95)
    }
  }

  // Distribution data for charts
  const npvDistribution = Array.from({ length: 20 }, (_, i) => {
    const min = Math.min(...npvValues)
    const max = Math.max(...npvValues)
    const bucketSize = (max - min) / 20
    const bucketStart = min + i * bucketSize
    const bucketEnd = bucketStart + bucketSize
    const count = npvValues.filter(v => v >= bucketStart && v < bucketEnd).length
    
    return {
      range: `${bucketStart.toFixed(0)}-${bucketEnd.toFixed(0)}`,
      count,
      probability: (count / results.length) * 100
    }
  })

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>NPV Distribution ($M)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Mean</span>
                <span className="text-white font-mono">${stats.npv.mean.toFixed(1)}M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Median (P50)</span>
                <span className="text-white font-mono">${stats.npv.p50.toFixed(1)}M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">5th Percentile</span>
                <span className="text-red-400 font-mono">${stats.npv.p5.toFixed(1)}M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">95th Percentile</span>
                <span className="text-green-400 font-mono">${stats.npv.p95.toFixed(1)}M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">vs Baseline</span>
                <span className={cn(
                  "font-mono",
                  stats.npv.mean > baselineMetrics.npv ? "text-green-400" : "text-red-400"
                )}>
                  {stats.npv.mean > baselineMetrics.npv ? '+' : ''}{((stats.npv.mean - baselineMetrics.npv) / baselineMetrics.npv * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>IRR Distribution (%)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Mean</span>
                <span className="text-white font-mono">{stats.irr.mean.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Median (P50)</span>
                <span className="text-white font-mono">{stats.irr.p50.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">5th Percentile</span>
                <span className="text-red-400 font-mono">{stats.irr.p5.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">95th Percentile</span>
                <span className="text-green-400 font-mono">{stats.irr.p95.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">vs Baseline</span>
                <span className={cn(
                  "font-mono",
                  stats.irr.mean > baselineMetrics.irr ? "text-green-400" : "text-red-400"
                )}>
                  {stats.irr.mean > baselineMetrics.irr ? '+' : ''}{(stats.irr.mean - baselineMetrics.irr).toFixed(1)}pp
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>NPV Probability Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={npvDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="range" 
                  stroke="#94a3b8" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#fff' }}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Probability']}
                />
                <Area 
                  type="monotone" 
                  dataKey="probability" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.3}
                />
                <ReferenceLine 
                  x={baselineMetrics.npv?.toString()} 
                  stroke="#f59e0b" 
                  strokeDasharray="5 5"
                  label="Baseline"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Risk Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-400">
                {(npvValues.filter(v => v < 0).length / npvValues.length * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-slate-400">Probability of Loss</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-400">
                ${Math.abs(stats.npv.p5).toFixed(1)}M
              </div>
              <div className="text-sm text-slate-400">Value at Risk (95%)</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">
                ${(stats.npv.p95 - stats.npv.p5).toFixed(1)}M
              </div>
              <div className="text-sm text-slate-400">Expected Range (90%)</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function ScenarioModelingEnhanced() {
  const { state } = useAllocationData()
  const [scenarios, setScenarios] = useState<ScenarioParameters[]>([])
  const [activeScenario, setActiveScenario] = useState<ScenarioParameters | null>(null)
  const [showBuilder, setShowBuilder] = useState(false)
  const [editingScenario, setEditingScenario] = useState<ScenarioParameters | undefined>()
  const [monteCarloResults, setMonteCarloResults] = useState<MonteCarloResult[]>([])

  if (!state) {
    return <div className="p-6 text-center">Loading...</div>
  }

  const { projects, priorities } = state

  // Baseline metrics for comparison
  const baselineMetrics = {
    npv: projects.reduce((sum, p) => sum + p.npv, 0) / 1000000,
    irr: projects.length > 0 ? projects.reduce((sum, p) => sum + p.irr, 0) / projects.length : 0,
    payback: projects.length > 0 ? projects.reduce((sum, p) => sum + p.paybackPeriod, 0) / projects.length : 0
  }

  const handleSaveScenario = (scenario: ScenarioParameters) => {
    if (editingScenario) {
      setScenarios(prev => prev.map(s => s.name === editingScenario.name ? scenario : s))
    } else {
      setScenarios(prev => [...prev, scenario])
    }
    setShowBuilder(false)
    setEditingScenario(undefined)
  }

  const handleDeleteScenario = (scenarioName: string) => {
    if (confirm('Are you sure you want to delete this scenario?')) {
      setScenarios(prev => prev.filter(s => s.name !== scenarioName))
      if (activeScenario?.name === scenarioName) {
        setActiveScenario(null)
        setMonteCarloResults([])
      }
    }
  }

  const handleCloneScenario = (scenario: ScenarioParameters) => {
    const cloned = {
      ...scenario,
      name: `${scenario.name} (Copy)`,
      description: `Copy of ${scenario.description}`
    }
    setScenarios(prev => [...prev, cloned])
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">7. Scenario Modeling</h2>
          <p className="text-slate-400">Model different scenarios and stress test portfolio performance</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Analysis
          </Button>
          <Button onClick={() => setShowBuilder(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Scenario
          </Button>
        </div>
      </div>

      {showBuilder ? (
        <Card>
          <CardHeader>
            <CardTitle>{editingScenario ? 'Edit' : 'Create'} Scenario</CardTitle>
          </CardHeader>
          <CardContent>
            <ScenarioBuilder
              scenario={editingScenario}
              onSave={handleSaveScenario}
              onCancel={() => {
                setShowBuilder(false)
                setEditingScenario(undefined)
              }}
              priorities={priorities}
            />
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="scenarios" className="space-y-6">
          <TabsList className="bg-slate-800">
            <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
            <TabsTrigger value="simulation">Monte Carlo</TabsTrigger>
            <TabsTrigger value="stress-test">Stress Test</TabsTrigger>
          </TabsList>

          <TabsContent value="scenarios" className="space-y-6">
            {/* Baseline Card */}
            <Card className="border-blue-500/30 bg-blue-900/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Baseline Scenario</h3>
                    <p className="text-slate-400">Current portfolio configuration</p>
                  </div>
                  <div className="grid grid-cols-3 gap-6 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-400">${baselineMetrics.npv.toFixed(1)}M</div>
                      <div className="text-sm text-slate-400">Portfolio NPV</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-400">{baselineMetrics.irr.toFixed(1)}%</div>
                      <div className="text-sm text-slate-400">Average IRR</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-amber-400">{baselineMetrics.payback.toFixed(1)} yrs</div>
                      <div className="text-sm text-slate-400">Average Payback</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scenario Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {scenarios.map((scenario) => (
                <Card key={scenario.name} className={cn(
                  "cursor-pointer transition-all hover:border-blue-500/50",
                  activeScenario?.name === scenario.name && "border-blue-500 bg-blue-900/10"
                )}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white">{scenario.name}</h3>
                        <p className="text-slate-400 text-sm">{scenario.description}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingScenario(scenario)
                            setShowBuilder(true)
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCloneScenario(scenario)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteScenario(scenario.name)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Budget Reduction</span>
                          <span className="text-red-400">{scenario.budgetReduction}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Project Delays</span>
                          <span className="text-amber-400">{scenario.projectDelays} mo</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Cost Inflation</span>
                          <span className="text-red-400">{scenario.costInflation}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Benefit Reduction</span>
                          <span className="text-red-400">{scenario.benefitReduction}%</span>
                        </div>
                      </div>

                      <Button
                        className="w-full"
                        variant={activeScenario?.name === scenario.name ? "default" : "outline"}
                        onClick={() => setActiveScenario(scenario)}
                      >
                        {activeScenario?.name === scenario.name ? 'Active Scenario' : 'Activate Scenario'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {scenarios.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Sliders className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Scenarios Created</h3>
                  <p className="text-slate-400 mb-6">Create your first scenario to start modeling different conditions</p>
                  <Button onClick={() => setShowBuilder(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Scenario
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="simulation" className="space-y-6">
            {activeScenario ? (
              <>
                <MonteCarloSimulation
                  scenario={activeScenario}
                  projects={projects}
                  onResults={setMonteCarloResults}
                />
                <ScenarioResults
                  results={monteCarloResults}
                  baselineMetrics={baselineMetrics}
                />
              </>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Activity className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Select a Scenario</h3>
                  <p className="text-slate-400">Choose a scenario to run Monte Carlo simulation</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            {scenarios.length >= 2 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Scenario Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={[
                        {
                          metric: 'NPV Impact',
                          baseline: 100,
                          ...scenarios.slice(0, 3).reduce((acc, scenario, index) => ({
                            ...acc,
                            [`scenario${index + 1}`]: 100 - scenario.budgetReduction - scenario.benefitReduction
                          }), {})
                        },
                        {
                          metric: 'Risk Level',
                          baseline: 50,
                          ...scenarios.slice(0, 3).reduce((acc, scenario, index) => ({
                            ...acc,
                            [`scenario${index + 1}`]: 50 * scenario.riskMultiplier
                          }), {})
                        },
                        {
                          metric: 'Timeline Impact',
                          baseline: 100,
                          ...scenarios.slice(0, 3).reduce((acc, scenario, index) => ({
                            ...acc,
                            [`scenario${index + 1}`]: 100 - (scenario.projectDelays * 2)
                          }), {})
                        },
                        {
                          metric: 'Cost Impact',
                          baseline: 100,
                          ...scenarios.slice(0, 3).reduce((acc, scenario, index) => ({
                            ...acc,
                            [`scenario${index + 1}`]: 100 - scenario.costInflation
                          }), {})
                        }
                      ]}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="metric" stroke="#94a3b8" />
                        <PolarRadiusAxis angle={90} domain={[0, 150]} stroke="#94a3b8" />
                        <Radar
                          name="Baseline"
                          dataKey="baseline"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.1}
                        />
                        {scenarios.slice(0, 3).map((scenario, index) => (
                          <Radar
                            key={scenario.name}
                            name={scenario.name}
                            dataKey={`scenario${index + 1}`}
                            stroke={COLORS[index + 1]}
                            fill={COLORS[index + 1]}
                            fillOpacity={0.1}
                          />
                        ))}
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <BarChart3 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Need More Scenarios</h3>
                  <p className="text-slate-400">Create at least 2 scenarios to enable comparison</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="stress-test" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Stress Testing</CardTitle>
                <CardDescription>Test portfolio resilience under extreme conditions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {[
                    { name: 'Market Crash', impact: -35, color: 'text-red-400' },
                    { name: 'Interest Rate Spike', impact: -20, color: 'text-amber-400' },
                    { name: 'Currency Crisis', impact: -25, color: 'text-orange-400' }
                  ].map(stress => (
                    <div key={stress.name} className="p-4 bg-slate-700 rounded-lg">
                      <h4 className="font-medium text-white mb-2">{stress.name}</h4>
                      <div className={cn("text-2xl font-bold", stress.color)}>
                        {stress.impact}%
                      </div>
                      <div className="text-sm text-slate-400">NPV Impact</div>
                      <Progress value={Math.abs(stress.impact)} className="mt-2 h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}