'use client'

import { useState, useEffect } from 'react'
import { Calendar, Users, DollarSign, Clock, AlertTriangle, FileText, Save, Download, Plus, Minus, Edit, Copy } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Textarea } from '../../../components/ui/textarea'
import { Badge } from '../../../components/ui/badge'
import { Progress } from '../../../components/ui/progress'
import { useAllocationData } from '../../../hooks/use-allocation-data'
import { BusinessCase, Project, Phase, Milestone, Resource, Dependency, Risk } from '../../../lib/data-models'
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts'

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
      <div className="absolute -top-5 left-0 text-xs text-slate-400">{phase.name}</div>
      <div className="absolute -bottom-5 left-0 text-xs text-slate-500">
        Week {phase.startWeek} - {phase.startWeek + phase.durationWeeks}
      </div>
    </div>
  )
}

function ResourceRampChart({ resources }: { resources: Resource[] }) {
  const maxWeeks = Math.max(...resources.flatMap(r => r.rampUp.map(ru => ru.week)))
  const weeks = Array.from({ length: maxWeeks + 1 }, (_, i) => {
    const week = i
    const weekData: any = { week }
    
    resources.forEach(resource => {
      const rampPoint = resource.rampUp.find(ru => ru.week === week)
      weekData[resource.skillType] = rampPoint ? rampPoint.fte : 0
    })
    
    return weekData
  })

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={weeks}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="week" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#1e293b', 
            border: '1px solid #475569',
            borderRadius: '8px'
          }}
        />
        {resources.map((resource, index) => (
          <Area
            key={resource.id}
            type="monotone"
            dataKey={resource.skillType}
            stackId="1"
            fill={COLORS[index % COLORS.length]}
            stroke={COLORS[index % COLORS.length]}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}

function RiskMatrix({ risks }: { risks: Risk[] }) {
  const matrixSize = 5
  const matrix = Array.from({ length: matrixSize }, () => Array(matrixSize).fill(null))
  
  risks.forEach(risk => {
    const row = Math.min(risk.probability - 1, matrixSize - 1)
    const col = Math.min(risk.impact - 1, matrixSize - 1)
    if (!matrix[row][col]) matrix[row][col] = []
    matrix[row][col].push(risk)
  })

  const getRiskColor = (probability: number, impact: number) => {
    const score = probability * impact
    if (score >= 20) return 'bg-red-500'
    if (score >= 12) return 'bg-amber-500'
    if (score >= 6) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-6 gap-1">
        <div></div>
        {Array.from({ length: matrixSize }, (_, i) => (
          <div key={i} className="text-xs text-center text-slate-400">
            {i + 1}
          </div>
        ))}
        {Array.from({ length: matrixSize }, (_, row) => (
          <>
            <div key={`row-${row}`} className="text-xs text-slate-400 flex items-center">
              {matrixSize - row}
            </div>
            {Array.from({ length: matrixSize }, (_, col) => {
              const cellRisks = matrix[matrixSize - 1 - row][col]
              return (
                <div
                  key={`cell-${row}-${col}`}
                  className={`h-8 rounded border border-slate-600 flex items-center justify-center ${
                    getRiskColor(matrixSize - row, col + 1)
                  }`}
                >
                  {cellRisks && cellRisks.length > 0 && (
                    <span className="text-xs text-white font-bold">
                      {cellRisks.length}
                    </span>
                  )}
                </div>
              )
            })}
          </>
        ))}
      </div>
      <div className="flex justify-between text-xs text-slate-400">
        <span>Impact →</span>
        <span>↑ Probability</span>
      </div>
    </div>
  )
}

export function BusinessCaseBuilder() {
  const { state } = useAllocationData()
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [businessCase, setBusinessCase] = useState<BusinessCase | null>(null)
  const [editingPhase, setEditingPhase] = useState<Phase | null>(null)
  
  useEffect(() => {
    if (selectedProjectId && state) {
      // Create or load business case for selected project
      const project = state.projects.find(p => p.id === selectedProjectId)
      if (project) {
        const existingCase = state.businessCases?.find(bc => bc.projectId === selectedProjectId)
        if (existingCase) {
          setBusinessCase(existingCase)
        } else {
          // Create new business case with default phases
          const newBusinessCase: BusinessCase = {
            id: `bc-${selectedProjectId}`,
            projectId: selectedProjectId,
            status: 'draft',
            phases: [
              {
                id: 'phase-1',
                name: 'Planning & Analysis',
                type: 'planning',
                startWeek: 0,
                durationWeeks: 8,
                description: 'Requirements gathering and detailed analysis',
                deliverables: ['Requirements Document', 'Technical Specification'],
                dependencies: [],
                milestones: []
              },
              {
                id: 'phase-2',
                name: 'Compliance & Approval',
                type: 'compliance',
                startWeek: 8,
                durationWeeks: 4,
                description: 'Regulatory approvals and compliance verification',
                deliverables: ['Compliance Report', 'Regulatory Approval'],
                dependencies: ['phase-1'],
                milestones: []
              },
              {
                id: 'phase-3',
                name: 'Implementation',
                type: 'implementation',
                startWeek: 12,
                durationWeeks: 16,
                description: 'Core development and deployment',
                deliverables: ['System Implementation', 'User Training'],
                dependencies: ['phase-2'],
                milestones: []
              },
              {
                id: 'phase-4',
                name: 'Ramp-up & Optimization',
                type: 'ramp-up',
                startWeek: 28,
                durationWeeks: 8,
                description: 'Performance optimization and scaling',
                deliverables: ['Performance Report', 'Optimization Plan'],
                dependencies: ['phase-3'],
                milestones: []
              }
            ],
            resources: [
              {
                id: 'res-1',
                skillType: 'Project Manager',
                totalFTE: 1,
                rampUp: [
                  { week: 0, fte: 1 },
                  { week: 36, fte: 0 }
                ],
                cost: 150000
              },
              {
                id: 'res-2',
                skillType: 'Developer',
                totalFTE: 4,
                rampUp: [
                  { week: 0, fte: 0 },
                  { week: 8, fte: 2 },
                  { week: 12, fte: 4 },
                  { week: 28, fte: 2 },
                  { week: 36, fte: 0 }
                ],
                cost: 400000
              },
              {
                id: 'res-3',
                skillType: 'Business Analyst',
                totalFTE: 2,
                rampUp: [
                  { week: 0, fte: 2 },
                  { week: 12, fte: 1 },
                  { week: 28, fte: 0 }
                ],
                cost: 200000
              }
            ],
            risks: [
              {
                id: 'risk-1',
                description: 'Technical complexity higher than expected',
                category: 'technical',
                probability: 3,
                impact: 4,
                mitigation: 'Proof of concept development',
                owner: 'Technical Lead'
              },
              {
                id: 'risk-2',
                description: 'Regulatory approval delays',
                category: 'regulatory',
                probability: 2,
                impact: 3,
                mitigation: 'Early engagement with regulators',
                owner: 'Compliance Officer'
              }
            ],
            dependencies: [],
            createdAt: new Date(),
            updatedAt: new Date()
          }
          setBusinessCase(newBusinessCase)
        }
      }
    }
  }, [selectedProjectId, state])

  if (!state) {
    return <div className="p-6 text-center">Loading...</div>
  }

  const { projects } = state
  
  const handleSaveBusinessCase = () => {
    if (businessCase) {
      console.log('Saving business case:', businessCase)
      // TODO: Save to state/storage
    }
  }

  const handleExportBusinessCase = () => {
    if (businessCase) {
      console.log('Exporting business case:', businessCase)
      // TODO: Export functionality
    }
  }

  const totalDuration = businessCase ? Math.max(...businessCase.phases.map(p => p.startWeek + p.durationWeeks)) : 0
  const totalCost = businessCase ? businessCase.resources.reduce((sum, r) => sum + r.cost, 0) : 0
  const totalFTE = businessCase ? Math.max(...businessCase.resources.flatMap(r => r.rampUp.map(ru => ru.fte))) : 0

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">3. Business Case Builder</h2>
          <p className="text-slate-400">Detailed implementation plans with phases and resources</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleSaveBusinessCase} disabled={!businessCase}>
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={handleExportBusinessCase} disabled={!businessCase}>
            <Download className="w-4 h-4 mr-2" />
            Export Case
          </Button>
        </div>
      </div>

      {/* Project Selection */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Label>Select Project:</Label>
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger className="w-96 bg-slate-700 border-slate-600">
                <SelectValue placeholder="Choose a project to build business case" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name} ({project.projectId})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {businessCase && (
        <>
          {/* Business Case Summary */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Total Duration</p>
                    <p className="text-2xl font-bold text-white font-mono">{totalDuration} weeks</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Total Cost</p>
                    <p className="text-2xl font-bold text-white font-mono">${(totalCost / 1000000).toFixed(1)}M</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Peak FTE</p>
                    <p className="text-2xl font-bold text-white font-mono">{totalFTE}</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Risk Score</p>
                    <p className="text-2xl font-bold text-white font-mono">
                      {businessCase.risks.reduce((sum, r) => sum + (r.probability * r.impact), 0)}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-amber-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left: Timeline & Resources */}
            <div className="col-span-8 space-y-6">
              {/* Gantt Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Timeline (Gantt Chart)</CardTitle>
                  <CardDescription>Phase scheduling and dependencies</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {businessCase.phases.map(phase => (
                      <GanttBar
                        key={phase.id}
                        phase={phase}
                        totalDuration={totalDuration}
                        onEdit={setEditingPhase}
                      />
                    ))}
                    <div className="flex justify-between text-xs text-slate-400 mt-4">
                      <span>Week 0</span>
                      <span>Week {Math.floor(totalDuration / 2)}</span>
                      <span>Week {totalDuration}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Resource Planning */}
              <Card>
                <CardHeader>
                  <CardTitle>Resource Planning</CardTitle>
                  <CardDescription>FTE ramp-up curves by skill type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResourceRampChart resources={businessCase.resources} />
                </CardContent>
              </Card>

              {/* Phase Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Phase Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {businessCase.phases.map(phase => (
                      <div key={phase.id} className="border border-slate-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-medium text-white">{phase.name}</h4>
                          <Badge>{phase.type}</Badge>
                        </div>
                        <p className="text-sm text-slate-400 mb-3">{phase.description}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong className="text-slate-300">Duration:</strong> {phase.durationWeeks} weeks
                          </div>
                          <div>
                            <strong className="text-slate-300">Start:</strong> Week {phase.startWeek}
                          </div>
                          <div className="col-span-2">
                            <strong className="text-slate-300">Deliverables:</strong>
                            <ul className="list-disc list-inside ml-2 mt-1">
                              {phase.deliverables.map((deliverable, index) => (
                                <li key={index} className="text-slate-400">{deliverable}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Risk & Dependencies */}
            <div className="col-span-4 space-y-6">
              {/* Risk Matrix */}
              <Card>
                <CardHeader>
                  <CardTitle>Risk Matrix</CardTitle>
                  <CardDescription>Probability vs Impact assessment</CardDescription>
                </CardHeader>
                <CardContent>
                  <RiskMatrix risks={businessCase.risks} />
                </CardContent>
              </Card>

              {/* Risk Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Risk Register</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {businessCase.risks.map(risk => (
                      <div key={risk.id} className="border border-slate-700 rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">{risk.category}</Badge>
                          <span className="text-xs font-mono text-slate-400">
                            P:{risk.probability} I:{risk.impact}
                          </span>
                        </div>
                        <p className="text-sm text-white mb-2">{risk.description}</p>
                        <p className="text-xs text-slate-400 mb-1">
                          <strong>Mitigation:</strong> {risk.mitigation}
                        </p>
                        <p className="text-xs text-slate-500">
                          <strong>Owner:</strong> {risk.owner}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Dependencies */}
              <Card>
                <CardHeader>
                  <CardTitle>Dependencies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {businessCase.dependencies.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-4">No dependencies defined</p>
                    ) : (
                      businessCase.dependencies.map((dep, index) => (
                        <div key={index} className="text-sm text-slate-400">
                          {dep}
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Resource Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Resource Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {businessCase.resources.map(resource => (
                      <div key={resource.id} className="flex items-center justify-between">
                        <span className="text-sm text-white">{resource.skillType}</span>
                        <div className="text-right">
                          <div className="text-sm font-mono text-white">{resource.totalFTE} FTE</div>
                          <div className="text-xs text-slate-400">${(resource.cost / 1000).toFixed(0)}k</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  )
}