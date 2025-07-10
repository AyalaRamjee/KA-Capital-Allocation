'use client'

import { useState, useEffect } from 'react'
import { Calendar, Users, DollarSign, Clock, AlertTriangle, FileText, Save, Download, Plus, Minus, Edit, Copy, Target, Building, MapPin, TrendingUp, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Textarea } from '../../../components/ui/textarea'
import { Badge } from '../../../components/ui/badge'
import { Progress } from '../../../components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { useAllocationData } from '../../../hooks/use-allocation-data'
import { BusinessCase, Project, Phase, Milestone, Resource, Dependency, Risk } from '../../../lib/data-models'
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine
} from 'recharts'
import { cn } from '../../../lib/utils'

interface TimelineData {
  week: number
  planning: number
  compliance: number
  implementation: number
  rampUp: number
  resources: number
  milestones: string[]
}

interface GanttBarProps {
  phase: Phase
  totalDuration: number
  onEdit: (phase: Phase) => void
}

function GanttBar({ phase, totalDuration, onEdit }: GanttBarProps) {
  const startPercent = (phase.startWeek / totalDuration) * 100
  const widthPercent = (phase.durationWeeks / totalDuration) * 100
  
  const getPhaseColor = (phase: Phase) => {
    switch (phase.type) {
      case 'planning': return 'bg-blue-500'
      case 'compliance': return 'bg-amber-500'
      case 'implementation': return 'bg-green-500'
      case 'ramp-up': return 'bg-purple-500'
      default: return 'bg-slate-500'
    }
  }

  return (
    <div className="relative h-8 bg-slate-700 rounded mb-2 cursor-pointer hover:bg-slate-600" onClick={() => onEdit(phase)}>
      <div 
        className={`absolute top-0 h-full rounded flex items-center px-2 ${getPhaseColor(phase)}`}
        style={{ 
          left: `${startPercent}%`, 
          width: `${widthPercent}%` 
        }}
      >
        <span className="text-xs text-white font-medium truncate">{phase.name}</span>
      </div>
    </div>
  )
}

function PhaseModal({ 
  isOpen, 
  onClose, 
  phase, 
  onSave 
}: {
  isOpen: boolean
  onClose: () => void
  phase?: Phase
  onSave: (phase: Partial<Phase>) => void
}) {
  const [formData, setFormData] = useState({
    name: phase?.name || '',
    type: phase?.type || 'planning' as Phase['type'],
    startWeek: phase?.startWeek || 0,
    durationWeeks: phase?.durationWeeks || 4,
    description: phase?.description || '',
    deliverables: phase?.deliverables?.join('\n') || '',
    dependencies: phase?.dependencies || []
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      deliverables: formData.deliverables.split('\n').filter(Boolean),
      id: phase?.id || `phase-${Date.now()}`
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>{phase ? 'Edit Phase' : 'Add Phase'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Phase Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="bg-slate-700 border-slate-600"
                required
              />
            </div>
            <div>
              <Label>Phase Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: Phase['type']) => setFormData({...formData, type: value})}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="implementation">Implementation</SelectItem>
                  <SelectItem value="ramp-up">Ramp-up</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Week</Label>
              <Input
                type="number"
                value={formData.startWeek}
                onChange={(e) => setFormData({...formData, startWeek: parseInt(e.target.value) || 0})}
                className="bg-slate-700 border-slate-600"
              />
            </div>
            <div>
              <Label>Duration (Weeks)</Label>
              <Input
                type="number"
                value={formData.durationWeeks}
                onChange={(e) => setFormData({...formData, durationWeeks: parseInt(e.target.value) || 1})}
                className="bg-slate-700 border-slate-600"
              />
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="bg-slate-700 border-slate-600"
              rows={3}
            />
          </div>

          <div>
            <Label>Deliverables (one per line)</Label>
            <Textarea
              value={formData.deliverables}
              onChange={(e) => setFormData({...formData, deliverables: e.target.value})}
              className="bg-slate-700 border-slate-600"
              rows={4}
              placeholder="Requirements gathering document&#10;Technical architecture design&#10;Risk assessment report"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {phase ? 'Update Phase' : 'Add Phase'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ResourcePlanningCard({ resources, onResourcesChange }: { 
  resources: Resource[]
  onResourcesChange: (resources: Resource[]) => void 
}) {
  const [newResource, setNewResource] = useState({
    skillType: '',
    totalFTE: 0,
    cost: 0
  })

  const addResource = () => {
    if (newResource.skillType) {
      onResourcesChange([
        ...resources,
        {
          id: `resource-${Date.now()}`,
          ...newResource,
          rampUp: []
        }
      ])
      setNewResource({ skillType: '', totalFTE: 0, cost: 0 })
    }
  }

  const removeResource = (id: string) => {
    onResourcesChange(resources.filter(r => r.id !== id))
  }

  const updateResource = (id: string, updates: Partial<Resource>) => {
    onResourcesChange(resources.map(r => r.id === id ? { ...r, ...updates } : r))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="w-5 h-5" />
          <span>Resource Planning</span>
        </CardTitle>
        <CardDescription>Define team composition and resource requirements</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Resources */}
        <div className="space-y-3">
          {resources.map((resource) => (
            <div key={resource.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
              <div className="flex-1 grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-slate-400">Skill Type</div>
                  <div className="text-white font-medium">{resource.skillType}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">FTE Count</div>
                  <div className="text-white font-mono">{resource.totalFTE}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">Cost ($/month)</div>
                  <div className="text-white font-mono">${resource.cost.toLocaleString()}</div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeResource(resource.id)}
                className="text-red-400 hover:text-red-300"
              >
                <Minus className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Add New Resource */}
        <div className="border border-slate-600 rounded-lg p-4">
          <div className="grid grid-cols-3 gap-4 mb-3">
            <div>
              <Label>Skill Type</Label>
              <Input
                value={newResource.skillType}
                onChange={(e) => setNewResource({ ...newResource, skillType: e.target.value })}
                placeholder="Data Scientist"
                className="bg-slate-700 border-slate-600"
              />
            </div>
            <div>
              <Label>FTE Count</Label>
              <Input
                type="number"
                value={newResource.totalFTE}
                onChange={(e) => setNewResource({ ...newResource, totalFTE: parseFloat(e.target.value) || 0 })}
                className="bg-slate-700 border-slate-600"
              />
            </div>
            <div>
              <Label>Cost ($/month)</Label>
              <Input
                type="number"
                value={newResource.cost}
                onChange={(e) => setNewResource({ ...newResource, cost: parseFloat(e.target.value) || 0 })}
                className="bg-slate-700 border-slate-600"
              />
            </div>
          </div>
          <Button onClick={addResource} disabled={!newResource.skillType}>
            <Plus className="w-4 h-4 mr-2" />
            Add Resource
          </Button>
        </div>

        {/* Resource Summary */}
        {resources.length > 0 && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-800 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {resources.reduce((sum, r) => sum + r.totalFTE, 0)}
              </div>
              <div className="text-sm text-slate-400">Total FTEs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                ${resources.reduce((sum, r) => sum + r.cost, 0).toLocaleString()}
              </div>
              <div className="text-sm text-slate-400">Monthly Cost</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function RiskRegisterCard({ risks, onRisksChange }: { 
  risks: Risk[]
  onRisksChange: (risks: Risk[]) => void 
}) {
  const [newRisk, setNewRisk] = useState({
    description: '',
    category: 'operational' as Risk['category'],
    probability: 3,
    impact: 3,
    mitigation: '',
    owner: ''
  })

  const addRisk = () => {
    if (newRisk.description && newRisk.mitigation) {
      onRisksChange([
        ...risks,
        {
          id: `risk-${Date.now()}`,
          ...newRisk
        }
      ])
      setNewRisk({
        description: '',
        category: 'operational',
        probability: 3,
        impact: 3,
        mitigation: '',
        owner: ''
      })
    }
  }

  const removeRisk = (id: string) => {
    onRisksChange(risks.filter(r => r.id !== id))
  }

  const getRiskScore = (probability: number, impact: number) => probability * impact
  const getRiskLevel = (score: number) => {
    if (score <= 6) return { level: 'Low', color: 'bg-green-500' }
    if (score <= 15) return { level: 'Medium', color: 'bg-amber-500' }
    return { level: 'High', color: 'bg-red-500' }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5" />
          <span>Risk Register</span>
        </CardTitle>
        <CardDescription>Identify and manage project risks with mitigation strategies</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Risks */}
        <div className="space-y-3">
          {risks.map((risk) => {
            const score = getRiskScore(risk.probability, risk.impact)
            const { level, color } = getRiskLevel(score)
            
            return (
              <div key={risk.id} className="p-4 bg-slate-700 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="font-medium text-white mb-1">{risk.description}</div>
                    <div className="text-sm text-slate-400 mb-2">
                      <Badge variant="secondary" className="mr-2">{risk.category}</Badge>
                      Owner: {risk.owner}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={`${color} text-white`}>
                      {level} ({score})
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRisk(risk.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-slate-300">
                  <strong>Mitigation:</strong> {risk.mitigation}
                </div>
              </div>
            )
          })}
        </div>

        {/* Add New Risk */}
        <div className="border border-slate-600 rounded-lg p-4 space-y-4">
          <div>
            <Label>Risk Description</Label>
            <Textarea
              value={newRisk.description}
              onChange={(e) => setNewRisk({ ...newRisk, description: e.target.value })}
              placeholder="Describe the potential risk..."
              className="bg-slate-700 border-slate-600"
              rows={2}
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Category</Label>
              <Select
                value={newRisk.category}
                onValueChange={(value: Risk['category']) => setNewRisk({ ...newRisk, category: value })}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="operational">Operational</SelectItem>
                  <SelectItem value="strategic">Strategic</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="regulatory">Regulatory</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Probability (1-5)</Label>
              <Select
                value={newRisk.probability.toString()}
                onValueChange={(value) => setNewRisk({ ...newRisk, probability: parseInt(value) })}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="1">1 - Very Low</SelectItem>
                  <SelectItem value="2">2 - Low</SelectItem>
                  <SelectItem value="3">3 - Medium</SelectItem>
                  <SelectItem value="4">4 - High</SelectItem>
                  <SelectItem value="5">5 - Very High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Impact (1-5)</Label>
              <Select
                value={newRisk.impact.toString()}
                onValueChange={(value) => setNewRisk({ ...newRisk, impact: parseInt(value) })}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="1">1 - Very Low</SelectItem>
                  <SelectItem value="2">2 - Low</SelectItem>
                  <SelectItem value="3">3 - Medium</SelectItem>
                  <SelectItem value="4">4 - High</SelectItem>
                  <SelectItem value="5">5 - Very High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Mitigation Strategy</Label>
              <Textarea
                value={newRisk.mitigation}
                onChange={(e) => setNewRisk({ ...newRisk, mitigation: e.target.value })}
                placeholder="How will this risk be mitigated?"
                className="bg-slate-700 border-slate-600"
                rows={2}
              />
            </div>
            <div>
              <Label>Risk Owner</Label>
              <Input
                value={newRisk.owner}
                onChange={(e) => setNewRisk({ ...newRisk, owner: e.target.value })}
                placeholder="John Smith, Project Manager"
                className="bg-slate-700 border-slate-600"
              />
            </div>
          </div>

          <Button onClick={addRisk} disabled={!newRisk.description || !newRisk.mitigation}>
            <Plus className="w-4 h-4 mr-2" />
            Add Risk
          </Button>
        </div>

        {/* Risk Summary */}
        {risks.length > 0 && (
          <div className="grid grid-cols-3 gap-4 p-4 bg-slate-800 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {risks.filter(r => getRiskScore(r.probability, r.impact) > 15).length}
              </div>
              <div className="text-sm text-slate-400">High Risk</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">
                {risks.filter(r => {
                  const score = getRiskScore(r.probability, r.impact)
                  return score > 6 && score <= 15
                }).length}
              </div>
              <div className="text-sm text-slate-400">Medium Risk</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {risks.filter(r => getRiskScore(r.probability, r.impact) <= 6).length}
              </div>
              <div className="text-sm text-slate-400">Low Risk</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function BusinessCaseBuilderEnhanced() {
  const { state, updateProject } = useAllocationData()
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [businessCase, setBusinessCase] = useState<Partial<BusinessCase>>({
    phases: [],
    resources: [],
    risks: [],
    dependencies: []
  })
  const [phaseModalOpen, setPhaseModalOpen] = useState(false)
  const [editingPhase, setEditingPhase] = useState<Phase | undefined>()
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])

  // Default phases for new business cases
  const defaultPhases: Phase[] = [
    {
      id: 'planning',
      name: 'Planning',
      type: 'planning',
      startWeek: 0,
      durationWeeks: 12,
      description: 'Project planning and requirements gathering',
      deliverables: ['Project charter', 'Requirements document', 'Resource plan'],
      dependencies: [],
      milestones: []
    },
    {
      id: 'compliance',
      name: 'Compliance & Approvals',
      type: 'compliance',
      startWeek: 8,
      durationWeeks: 8,
      description: 'Regulatory compliance and approvals',
      deliverables: ['Compliance assessment', 'Risk documentation', 'Approval certificates'],
      dependencies: ['planning'],
      milestones: []
    },
    {
      id: 'implementation',
      name: 'Implementation',
      type: 'implementation',
      startWeek: 16,
      durationWeeks: 52,
      description: 'Core project implementation',
      deliverables: ['System deployment', 'Testing results', 'Training materials'],
      dependencies: ['compliance'],
      milestones: []
    },
    {
      id: 'ramp-up',
      name: 'Ramp-up',
      type: 'ramp-up',
      startWeek: 68,
      durationWeeks: 26,
      description: 'Gradual rollout and optimization',
      deliverables: ['Go-live report', 'Performance metrics', 'Support documentation'],
      dependencies: ['implementation'],
      milestones: []
    }
  ]

  useEffect(() => {
    const selectedProject = state?.projects?.find(p => p.id === selectedProjectId)
    if (selectedProject && businessCase.phases?.length === 0) {
      setBusinessCase(prev => ({
        ...prev,
        phases: defaultPhases
      }))
    }
  }, [selectedProjectId, state?.projects, businessCase.phases?.length, defaultPhases])

  if (!state) {
    return <div className="p-6 text-center">Loading...</div>
  }

  const { projects } = state
  const selectedProject = projects.find(p => p.id === selectedProjectId)

  const totalDuration = Math.max(
    ...businessCase.phases?.map(p => p.startWeek + p.durationWeeks) || [0]
  )

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId)
    // Load existing business case if available
    // For now, reset to defaults
    setBusinessCase({
      phases: defaultPhases,
      resources: [],
      risks: [],
      dependencies: []
    })
  }

  const handlePhaseEdit = (phase: Phase) => {
    setEditingPhase(phase)
    setPhaseModalOpen(true)
  }

  const handlePhaseAdd = () => {
    setEditingPhase(undefined)
    setPhaseModalOpen(true)
  }

  const handlePhaseSave = (phaseData: Partial<Phase>) => {
    if (editingPhase) {
      // Update existing phase
      setBusinessCase(prev => ({
        ...prev,
        phases: prev.phases?.map(p => 
          p.id === editingPhase.id ? { ...p, ...phaseData } : p
        ) || []
      }))
    } else {
      // Add new phase
      setBusinessCase(prev => ({
        ...prev,
        phases: [...(prev.phases || []), phaseData as Phase]
      }))
    }
  }

  const handleResourcesChange = (resources: Resource[]) => {
    setBusinessCase(prev => ({
      ...prev,
      resources
    }))
  }

  const handleRisksChange = (risks: Risk[]) => {
    setBusinessCase(prev => ({
      ...prev,
      risks
    }))
  }

  // Create timeline data for resource chart
  const timelineData: TimelineData[] = []
  for (let week = 0; week <= totalDuration; week += 4) {
    const data: TimelineData = {
      week,
      planning: 0,
      compliance: 0,
      implementation: 0,
      rampUp: 0,
      resources: 0,
      milestones: []
    }

    businessCase.phases?.forEach(phase => {
      if (week >= phase.startWeek && week < phase.startWeek + phase.durationWeeks) {
        switch (phase.type) {
          case 'planning':
            data.planning = 1
            break
          case 'compliance':
            data.compliance = 1
            break
          case 'implementation':
            data.implementation = 1
            break
          case 'ramp-up':
            data.rampUp = 1
            break
        }
      }
    })

    // Add resource requirements
    data.resources = businessCase.resources?.reduce((sum, r) => sum + r.totalFTE, 0) || 0

    timelineData.push(data)
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">3. Business Case Builder</h2>
          <p className="text-slate-400">Create detailed implementation plans with timelines, resources, and risk management</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Plan
          </Button>
          <Button>
            <Save className="w-4 h-4 mr-2" />
            Save Business Case
          </Button>
        </div>
      </div>

      {/* Project Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Project</CardTitle>
          <CardDescription>Choose a project to build a detailed business case</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedProjectId} onValueChange={handleProjectSelect}>
            <SelectTrigger className="bg-slate-700 border-slate-600">
              <SelectValue placeholder="Select a project..." />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.projectId} - {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedProject && (
            <div className="mt-4 p-4 bg-slate-800 rounded-lg">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-slate-400">Investment</div>
                  <div className="text-xl font-bold text-white">${(selectedProject.initialCapex / 1000000).toFixed(1)}M</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">NPV</div>
                  <div className="text-xl font-bold text-green-400">${(selectedProject.npv / 1000000).toFixed(1)}M</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">IRR</div>
                  <div className="text-xl font-bold text-blue-400">{selectedProject.irr.toFixed(1)}%</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">Risk Level</div>
                  <Badge className={cn(
                    'text-sm font-bold',
                    selectedProject.riskLevel === 'low' && 'bg-green-500',
                    selectedProject.riskLevel === 'medium' && 'bg-amber-500',
                    selectedProject.riskLevel === 'high' && 'bg-red-500'
                  )}>
                    {selectedProject.riskLevel.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedProject && (
        <>
          {/* Timeline & Gantt Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Project Timeline</span>
                  </CardTitle>
                  <CardDescription>Define project phases and create implementation timeline</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div>
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>
                  <Button onClick={handlePhaseAdd}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Phase
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Phase Legend */}
                <div className="flex space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span>Planning</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-amber-500 rounded"></div>
                    <span>Compliance</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span>Implementation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-purple-500 rounded"></div>
                    <span>Ramp-up</span>
                  </div>
                </div>

                {/* Gantt Chart */}
                <div className="space-y-2">
                  {businessCase.phases?.map(phase => (
                    <div key={phase.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white">{phase.name}</span>
                        <span className="text-xs text-slate-400">
                          Week {phase.startWeek} - {phase.startWeek + phase.durationWeeks} ({phase.durationWeeks}w)
                        </span>
                      </div>
                      <GanttBar
                        phase={phase}
                        totalDuration={totalDuration}
                        onEdit={handlePhaseEdit}
                      />
                    </div>
                  )) || []}
                </div>

                {/* Timeline Chart */}
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timelineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="week" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid #475569',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                        labelFormatter={(week) => `Week ${week}`}
                      />
                      <Area type="monotone" dataKey="resources" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="FTE Resources" />
                      <ReferenceLine y={0} stroke="#64748b" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-6">
            {/* Resource Planning */}
            <ResourcePlanningCard
              resources={businessCase.resources || []}
              onResourcesChange={handleResourcesChange}
            />

            {/* Risk Register */}
            <RiskRegisterCard
              risks={businessCase.risks || []}
              onRisksChange={handleRisksChange}
            />
          </div>

          {/* Phase Modal */}
          <PhaseModal
            isOpen={phaseModalOpen}
            onClose={() => setPhaseModalOpen(false)}
            phase={editingPhase}
            onSave={handlePhaseSave}
          />
        </>
      )}
    </div>
  )
}