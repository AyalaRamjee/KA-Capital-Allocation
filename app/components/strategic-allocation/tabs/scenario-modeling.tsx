'use client'

import { useState } from 'react'
import { Save, Play, Copy, Trash2, Plus, X } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card'
import { Label } from '../../../components/ui/label'
import { Input } from '../../../components/ui/input'
import { Badge } from '../../../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Checkbox } from '../../../components/ui/checkbox'
import { useAllocationData } from '../../../hooks/use-allocation-data'
import { applyScenario, runMonteCarloSimulation } from '../../../lib/calculations'
import { Scenario } from '../../../lib/data-models'
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'

interface ComparisonBarProps {
  label: string
  baseValue: number
  scenarioValue: number
  format: 'currency' | 'percentage' | 'number'
  inverse?: boolean
}

function ComparisonBar({ label, baseValue, scenarioValue, format, inverse = false }: ComparisonBarProps) {
  const change = ((scenarioValue - baseValue) / baseValue) * 100
  const isPositive = inverse ? change < 0 : change > 0

  const formatValue = (value: number) => {
    switch (format) {
      case 'currency':
        return `$${(value / 1000000).toFixed(1)}M`
      case 'percentage':
        return `${value.toFixed(1)}%`
      default:
        return value.toFixed(0)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className={`font-mono ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {change > 0 ? '+' : ''}{change.toFixed(1)}%
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-slate-700 rounded h-6 relative overflow-hidden">
          <div 
            className="absolute left-0 top-0 h-full bg-slate-600"
            style={{ width: '50%' }}
          />
          <div 
            className={`absolute top-0 h-full ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}
            style={{ 
              left: change > 0 ? '50%' : `${50 + change/2}%`,
              width: `${Math.abs(change)/2}%`
            }}
          />
        </div>
        <div className="text-xs font-mono w-20 text-right text-white">
          {formatValue(scenarioValue)}
        </div>
      </div>
    </div>
  )
}

function TornadoChart({ sensitivities }: { sensitivities: { factor: string; impact: number }[] }) {
  return (
    <div className="space-y-2">
      {sensitivities.map(item => (
        <div key={item.factor} className="flex items-center">
          <span className="text-xs text-slate-400 w-24">{item.factor}</span>
          <div className="flex-1 flex items-center">
            <div className="flex-1 bg-slate-700 rounded h-4 relative">
              <div 
                className={`absolute top-0 h-full rounded ${
                  item.impact > 0 ? 'bg-green-500 left-1/2' : 'bg-red-500 right-1/2'
                }`}
                style={{ width: `${Math.abs(item.impact) * 2}%` }}
              />
            </div>
          </div>
          <span className="text-xs font-mono w-16 text-right text-white">
            {item.impact > 0 ? '+' : ''}{item.impact}%
          </span>
        </div>
      ))}
    </div>
  )
}

function ProbabilityBar({ label, probability }: { label: string; probability: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-slate-400">{label}</span>
        <span className="font-mono text-white">{probability.toFixed(0)}%</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${
            probability >= 80 ? 'bg-green-500' : 
            probability >= 60 ? 'bg-amber-500' : 'bg-red-500'
          }`}
          style={{ width: `${probability}%` }}
        />
      </div>
    </div>
  )
}

export function ScenarioModeling() {
  const { state } = useAllocationData()
  const [activeScenarioId, setActiveScenarioId] = useState('base')
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [comparisonScenarios, setComparisonScenarios] = useState<string[]>(['base'])
  
  // Scenario parameters
  const [constraints, setConstraints] = useState({
    budgetReduction: 0,
    complianceExtension: 0,
    fteLimit: 100,
    minIRR: 10
  })
  
  const [riskFactors, setRiskFactors] = useState({
    projectDelay: 0,
    costIncrease: 0,
    benefitReduction: 0
  })
  
  if (!state) {
    return <div className="p-6 text-center">Loading...</div>
  }

  const { priorities, projects } = state

  const handleSaveScenario = () => {
    const newScenario: Scenario = {
      id: `scenario-${Date.now()}`,
      name: `Scenario ${scenarios.length + 1}`,
      description: 'Custom scenario',
      parameters: {
        priorityAdjustments: [],
        constraints,
        riskFactors,
        marketConditions: {
          interestRateChange: 0,
          fxImpact: 0,
          inflationRate: 2.5
        }
      },
      results: {
        portfolioNPV: 0,
        portfolioIRR: 0,
        projectsIncluded: [],
        budgetUsed: 0,
        riskScore: 0
      },
      createdAt: new Date()
    }
    
    setScenarios(prev => [...prev, newScenario])
  }

  const handleRunScenario = () => {
    if (!state) return
    
    // Apply scenario parameters to projects and priorities
    const mockScenario: Scenario = {
      id: 'current',
      name: 'Current Scenario',
      description: 'Current parameter settings',
      parameters: {
        priorityAdjustments: [],
        constraints,
        riskFactors,
        marketConditions: { interestRateChange: 0, fxImpact: 0, inflationRate: 2.5 }
      },
      results: { portfolioNPV: 0, portfolioIRR: 0, projectsIncluded: [], budgetUsed: 0, riskScore: 0 },
      createdAt: new Date()
    }
    
    const { adjustedProjects, adjustedPriorities } = applyScenario(projects, priorities, mockScenario)
    console.log('Scenario results:', { adjustedProjects, adjustedPriorities })
  }

  const handleComparisonToggle = (scenarioId: string, checked: boolean) => {
    if (checked) {
      setComparisonScenarios(prev => [...prev, scenarioId])
    } else {
      setComparisonScenarios(prev => prev.filter(id => id !== scenarioId))
    }
  }

  // Mock data for demonstration
  const baseResults = {
    portfolioNPV: 87000000,
    portfolioIRR: 24.5,
    projectCount: 12,
    budgetUsed: 75,
    riskScore: 45
  }
  
  const scenarioResults = {
    portfolioNPV: 78300000,
    portfolioIRR: 22.1,
    projectCount: 10,
    budgetUsed: 65,
    riskScore: 38
  }
  
  const monteCarloResults = {
    npvDistribution: Array.from({ length: 20 }, (_, i) => ({
      value: 60 + i * 3,
      frequency: Math.exp(-Math.pow((i - 10) / 5, 2)) * 100
    })),
    meanNPV: 87000000,
    percentiles: { p10: 65000000, p50: 87000000, p90: 110000000 },
    roiProbability: 85,
    budgetProbability: 78,
    scheduleProbability: 72,
    riskProbability: 68
  }

  const sensitivities = [
    { factor: 'Budget', impact: -12.5 },
    { factor: 'Interest Rate', impact: -8.3 },
    { factor: 'Project Delays', impact: -6.7 },
    { factor: 'Cost Overruns', impact: -5.2 },
    { factor: 'FTE Constraints', impact: -3.1 }
  ]

  const getAddedProjects = () => [
    { id: '1', name: 'Emergency Response System' },
    { id: '2', name: 'Cost Optimization Tool' }
  ]

  const getRemovedProjects = () => [
    { id: '3', name: 'AI Research Initiative' },
    { id: '4', name: 'Market Expansion Phase 2' }
  ]

  const getPriorityChange = (priorityId: string) => {
    // Mock priority impact calculation
    return Math.floor(Math.random() * 21) - 10 // Random change between -10 and +10
  }

  const getComparisonData = () => {
    return [
      { metric: 'NPV', base: 87, scenario1: 78, scenario2: 92 },
      { metric: 'IRR', base: 24, scenario1: 22, scenario2: 27 },
      { metric: 'Risk', base: 45, scenario1: 38, scenario2: 52 },
      { metric: 'Projects', base: 12, scenario1: 10, scenario2: 14 }
    ]
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">7. What-If Analysis</h2>
          <p className="text-slate-400">Test portfolio resilience under different conditions</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleSaveScenario}>
            <Save className="w-4 h-4 mr-2" />
            Save Scenario
          </Button>
          <Button onClick={handleRunScenario}>
            <Play className="w-4 h-4 mr-2" />
            Run Analysis
          </Button>
        </div>
      </div>

      {/* Scenario Selection */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Label>Active Scenario:</Label>
            <Select value={activeScenarioId} onValueChange={setActiveScenarioId}>
              <SelectTrigger className="w-64 bg-slate-700 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="base">Base Case</SelectItem>
                {scenarios.map(scenario => (
                  <SelectItem key={scenario.id} value={scenario.id}>
                    {scenario.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm">
              <Copy className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left: Parameter Controls */}
        <div className="col-span-4 space-y-4">
          {/* Priority Adjustments */}
          <Card>
            <CardHeader>
              <CardTitle>Priority Adjustments</CardTitle>
              <CardDescription>Modify priority weights and thresholds</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {priorities.map(priority => (
                  <div key={priority.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">{priority.name}</span>
                      <Badge variant="outline">{priority.weight}%</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Label className="text-xs w-20">Weight</Label>
                        <input
                          type="range"
                          min="-50"
                          max="50"
                          defaultValue="0"
                          className="flex-1"
                        />
                        <span className="text-xs w-12 text-right font-mono text-white">0%</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Label className="text-xs w-20">Threshold</Label>
                        <input
                          type="range"
                          min="-30"
                          max="30"
                          defaultValue="0"
                          className="flex-1"
                        />
                        <span className="text-xs w-12 text-right font-mono text-white">0</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Constraints */}
          <Card>
            <CardHeader>
              <CardTitle>Constraints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label>Budget Reduction</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={constraints.budgetReduction}
                      onChange={(e) => setConstraints({...constraints, budgetReduction: parseInt(e.target.value)})}
                      className="flex-1"
                    />
                    <span className="text-sm font-mono w-12 text-white">{constraints.budgetReduction}%</span>
                  </div>
                </div>
                <div>
                  <Label>Compliance Extension (months)</Label>
                  <Input
                    type="number"
                    value={constraints.complianceExtension}
                    onChange={(e) => setConstraints({...constraints, complianceExtension: parseInt(e.target.value)})}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                <div>
                  <Label>FTE Limit</Label>
                  <Input
                    type="number"
                    value={constraints.fteLimit}
                    onChange={(e) => setConstraints({...constraints, fteLimit: parseInt(e.target.value)})}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                <div>
                  <Label>Minimum IRR (%)</Label>
                  <Input
                    type="number"
                    value={constraints.minIRR}
                    onChange={(e) => setConstraints({...constraints, minIRR: parseFloat(e.target.value)})}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Scenarios */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Factors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label>Project Delays (months)</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="0"
                      max="12"
                      value={riskFactors.projectDelay}
                      onChange={(e) => setRiskFactors({...riskFactors, projectDelay: parseInt(e.target.value)})}
                      className="flex-1"
                    />
                    <span className="text-sm font-mono w-12 text-white">{riskFactors.projectDelay}m</span>
                  </div>
                </div>
                <div>
                  <Label>Cost Increase</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={riskFactors.costIncrease}
                      onChange={(e) => setRiskFactors({...riskFactors, costIncrease: parseInt(e.target.value)})}
                      className="flex-1"
                    />
                    <span className="text-sm font-mono w-12 text-white">{riskFactors.costIncrease}%</span>
                  </div>
                </div>
                <div>
                  <Label>Benefit Reduction</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={riskFactors.benefitReduction}
                      onChange={(e) => setRiskFactors({...riskFactors, benefitReduction: parseInt(e.target.value)})}
                      className="flex-1"
                    />
                    <span className="text-sm font-mono w-12 text-white">{riskFactors.benefitReduction}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Results */}
        <div className="col-span-8 space-y-4">
          {/* Impact Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Scenario Impact Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                {/* Base vs Scenario Metrics */}
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-3">Key Metrics Comparison</h4>
                  <div className="space-y-3">
                    <ComparisonBar
                      label="Portfolio NPV"
                      baseValue={baseResults.portfolioNPV}
                      scenarioValue={scenarioResults.portfolioNPV}
                      format="currency"
                    />
                    <ComparisonBar
                      label="Average IRR"
                      baseValue={baseResults.portfolioIRR}
                      scenarioValue={scenarioResults.portfolioIRR}
                      format="percentage"
                    />
                    <ComparisonBar
                      label="Projects Included"
                      baseValue={baseResults.projectCount}
                      scenarioValue={scenarioResults.projectCount}
                      format="number"
                    />
                    <ComparisonBar
                      label="Budget Utilization"
                      baseValue={baseResults.budgetUsed}
                      scenarioValue={scenarioResults.budgetUsed}
                      format="percentage"
                    />
                    <ComparisonBar
                      label="Risk Score"
                      baseValue={baseResults.riskScore}
                      scenarioValue={scenarioResults.riskScore}
                      format="number"
                      inverse={true}
                    />
                  </div>
                </div>

                {/* Sensitivity Analysis */}
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-3">Sensitivity Analysis</h4>
                  <TornadoChart sensitivities={sensitivities} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Portfolio Changes */}
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Composition Changes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-2">Projects Added</h4>
                  <div className="space-y-1">
                    {getAddedProjects().map(project => (
                      <div key={project.id} className="flex items-center space-x-2">
                        <Plus className="w-3 h-3 text-green-400" />
                        <span className="text-sm text-white">{project.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-2">Projects Removed</h4>
                  <div className="space-y-1">
                    {getRemovedProjects().map(project => (
                      <div key={project.id} className="flex items-center space-x-2">
                        <X className="w-3 h-3 text-red-400" />
                        <span className="text-sm text-white">{project.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-2">Priority Impact</h4>
                  <div className="space-y-2">
                    {priorities.map(priority => {
                      const change = getPriorityChange(priority.id)
                      return (
                        <div key={priority.id} className="flex items-center justify-between">
                          <span className="text-sm text-white">{priority.name}</span>
                          <Badge 
                            className={`${
                              change > 0 ? 'bg-green-500' : 
                              change < 0 ? 'bg-red-500' : 'bg-slate-500'
                            } text-white`}
                          >
                            {change > 0 ? '+' : ''}{change}%
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monte Carlo Simulation */}
          <Card>
            <CardHeader>
              <CardTitle>Monte Carlo Simulation</CardTitle>
              <CardDescription>1000 iterations with random variations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-3">NPV Distribution</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={monteCarloResults.npvDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="value" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip />
                      <Area type="monotone" dataKey="frequency" fill="#3b82f6" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-3">Success Probability</h4>
                  <div className="space-y-3">
                    <ProbabilityBar
                      label="Meets ROI Target"
                      probability={monteCarloResults.roiProbability}
                    />
                    <ProbabilityBar
                      label="Within Budget"
                      probability={monteCarloResults.budgetProbability}
                    />
                    <ProbabilityBar
                      label="On-Time Delivery"
                      probability={monteCarloResults.scheduleProbability}
                    />
                    <ProbabilityBar
                      label="Risk Threshold"
                      probability={monteCarloResults.riskProbability}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Scenario Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Multi-Scenario Comparison</CardTitle>
          <div className="flex space-x-2">
            {scenarios.slice(0, 3).map(scenario => (
              <label key={scenario.id} className="flex items-center space-x-2">
                <Checkbox
                  checked={comparisonScenarios.includes(scenario.id)}
                  onCheckedChange={(checked) => handleComparisonToggle(scenario.id, !!checked)}
                />
                <span className="text-sm text-white">{scenario.name}</span>
              </label>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={getComparisonData()}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8' }} />
              <PolarRadiusAxis tick={{ fill: '#94a3b8' }} />
              <Radar
                name="Base Case"
                dataKey="base"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
              />
              <Radar
                name="Scenario 1"
                dataKey="scenario1"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.3}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}