'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, Users, DollarSign, Clock, AlertTriangle, FileText, Save, Download, Plus, Minus, Edit, Copy, Target, Zap, Building, TrendingUp, CheckCircle, XCircle, ArrowRight, BarChart3, Activity, Layers, Settings, Eye, PlayCircle, PauseCircle, RotateCcw, Circle } from 'lucide-react'
import { cn } from '../../../lib/utils'
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
  const [isHovered, setIsHovered] = useState(false);
  const startPercent = (phase.startWeek / totalDuration) * 100;
  const widthPercent = (phase.durationWeeks / totalDuration) * 100;
  
  const getPhaseConfig = (phase: Phase) => {
    switch (phase.type) {
      case 'planning': return { 
        color: 'from-blue-500 to-blue-600', 
        icon: Target, 
        textColor: 'text-blue-100',
        borderColor: 'border-blue-400'
      };
      case 'compliance': return { 
        color: 'from-amber-500 to-amber-600', 
        icon: CheckCircle, 
        textColor: 'text-amber-100',
        borderColor: 'border-amber-400'
      };
      case 'implementation': return { 
        color: 'from-green-500 to-green-600', 
        icon: Building, 
        textColor: 'text-green-100',
        borderColor: 'border-green-400'
      };
      case 'ramp-up': return { 
        color: 'from-purple-500 to-purple-600', 
        icon: TrendingUp, 
        textColor: 'text-purple-100',
        borderColor: 'border-purple-400'
      };
      default: return { 
        color: 'from-slate-500 to-slate-600', 
        icon: Circle, 
        textColor: 'text-slate-100',
        borderColor: 'border-slate-400'
      };
    }
  };

  const config = getPhaseConfig(phase);
  const PhaseIcon = config.icon;

  return (
    <div className="relative mb-6">
      {/* Phase Label */}
      <div className="mb-2">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <PhaseIcon className="w-4 h-4" />
          <span>{phase.name}</span>
          <span className="text-xs text-slate-400">({phase.durationWeeks} weeks)</span>
        </div>
      </div>
      
      {/* Gantt Bar Track */}
      <div className="relative h-12 bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
        {/* Grid lines */}
        <div className="absolute inset-0 grid grid-cols-10 border-l border-slate-700/30">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="border-r border-slate-700/30 h-full" />
          ))}
        </div>
        
        {/* Progress Bar */}
        <div 
          className={cn(
            "absolute top-1 h-10 rounded-lg flex items-center px-3 transition-all duration-300 cursor-pointer group",
            "bg-gradient-to-r shadow-lg border-2",
            config.color,
            config.borderColor,
            isHovered && "shadow-xl scale-105"
          )}
          style={{ 
            left: `${startPercent}%`, 
            width: `${widthPercent}%` 
          }}
          onClick={() => onEdit(phase)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="flex items-center gap-2 w-full">
            <PhaseIcon className="w-4 h-4 text-white flex-shrink-0" />
            <span className="text-xs font-bold text-white truncate">{phase.name}</span>
            <div className={cn(
              "ml-auto transition-opacity duration-300",
              isHovered ? "opacity-100" : "opacity-0"
            )}>
              <Edit className="w-3 h-3 text-white" />
            </div>
          </div>
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-lg pointer-events-none" />
        </div>
        
        {/* Milestone markers */}
        {phase.milestones?.map((milestone, index) => {
          const milestonePercent = ((milestone.week - phase.startWeek) / phase.durationWeeks) * widthPercent + startPercent;
          return (
            <div 
              key={index}
              className="absolute top-0 bottom-0 w-0.5 bg-white/80 z-10"
              style={{ left: `${milestonePercent}%` }}
            >
              <div className="absolute -top-1 -left-1 w-2 h-2 bg-white rounded-full border border-slate-700" />
            </div>
          );
        })}
      </div>
      
      {/* Phase Details */}
      <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
        <span>Week {phase.startWeek} → Week {phase.startWeek + phase.durationWeeks}</span>
        <span className="capitalize">{phase.type} phase</span>
      </div>
      
      {/* Dependencies */}
      {phase.dependencies && phase.dependencies.length > 0 && (
        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
          <ArrowRight className="w-3 h-3" />
          <span>Depends on: {phase.dependencies.join(', ')}</span>
        </div>
      )}
    </div>
  );
}

function ResourceRampChart({ resources }: { resources: Resource[] }) {
  const maxWeeks = Math.max(...resources.flatMap(r => r.rampUp.map(ru => ru.week)));
  const weeks = Array.from({ length: maxWeeks + 1 }, (_, i) => {
    const week = i;
    const weekData: any = { week };
    
    resources.forEach(resource => {
      const rampPoint = resource.rampUp.find(ru => ru.week === week);
      weekData[resource.skillType] = rampPoint ? rampPoint.fte : 0;
    });
    
    return weekData;
  });

  const COLORS = [
    { fill: '#3b82f6', stroke: '#2563eb' },
    { fill: '#10b981', stroke: '#059669' },
    { fill: '#f59e0b', stroke: '#d97706' },
    { fill: '#ef4444', stroke: '#dc2626' },
    { fill: '#8b5cf6', stroke: '#7c3aed' },
    { fill: '#06b6d4', stroke: '#0891b2' }
  ];

  return (
    <div className="space-y-4">
      {/* Resource Legend */}
      <div className="flex flex-wrap gap-4">
        {resources.map((resource, index) => {
          const colors = COLORS[index % COLORS.length];
          return (
            <div key={resource.id} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full border-2 border-white/20"
                style={{ backgroundColor: colors.fill }}
              />
              <span className="text-sm font-medium text-white">{resource.skillType}</span>
              <span className="text-xs text-slate-400">({resource.totalFTE} FTE max)</span>
            </div>
          );
        })}
      </div>
      
      {/* Enhanced Chart */}
      <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={weeks} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <defs>
              {resources.map((resource, index) => {
                const colors = COLORS[index % COLORS.length];
                return (
                  <linearGradient key={resource.id} id={`gradient-${resource.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colors.fill} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={colors.fill} stopOpacity={0.2} />
                  </linearGradient>
                );
              })}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.3} />
            <XAxis 
              dataKey="week" 
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              axisLine={{ stroke: '#475569' }}
              tickLine={{ stroke: '#475569' }}
              label={{ value: 'Week', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fill: '#94a3b8' } }}
            />
            <YAxis 
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              axisLine={{ stroke: '#475569' }}
              tickLine={{ stroke: '#475569' }}
              label={{ value: 'FTE', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#94a3b8' } }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #475569',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
              }}
              labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
              itemStyle={{ color: '#f8fafc' }}
              formatter={(value: any, name: string) => [
                `${value} FTE`,
                name
              ]}
              labelFormatter={(label) => `Week ${label}`}
            />
            {resources.map((resource, index) => {
              const colors = COLORS[index % COLORS.length];
              return (
                <Area
                  key={resource.id}
                  type="monotone"
                  dataKey={resource.skillType}
                  stackId="1"
                  fill={`url(#gradient-${resource.id})`}
                  stroke={colors.stroke}
                  strokeWidth={2}
                  dot={{ fill: colors.stroke, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: colors.stroke, strokeWidth: 2 }}
                />
              );
            })}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Resource Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {resources.map((resource, index) => {
          const colors = COLORS[index % COLORS.length];
          const peakWeek = resource.rampUp.reduce((max, current) => 
            current.fte > max.fte ? current : max
          );
          
          return (
            <div key={resource.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: colors.fill }}
                >
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{resource.skillType}</div>
                  <div className="text-xs text-slate-400">₹{(resource.cost / 1000).toFixed(0)}k total</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Peak FTE</span>
                  <span className="font-mono text-white">{peakWeek.fte}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Peak Week</span>
                  <span className="font-mono text-white">{peakWeek.week}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Cost/FTE</span>
                  <span className="font-mono text-white">₹{(resource.cost / resource.totalFTE / 1000).toFixed(0)}k</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RiskMatrix({ risks }: { risks: Risk[] }) {
  const matrixSize = 5;
  const matrix = Array.from({ length: matrixSize }, () => Array(matrixSize).fill(null));
  
  risks.forEach(risk => {
    const row = Math.min(risk.probability - 1, matrixSize - 1);
    const col = Math.min(risk.impact - 1, matrixSize - 1);
    if (!matrix[row][col]) matrix[row][col] = [];
    matrix[row][col].push(risk);
  });

  const getRiskConfig = (probability: number, impact: number) => {
    const score = probability * impact;
    if (score >= 20) return { 
      color: 'bg-gradient-to-br from-red-500 to-red-600', 
      textColor: 'text-white', 
      borderColor: 'border-red-400',
      label: 'Critical'
    };
    if (score >= 12) return { 
      color: 'bg-gradient-to-br from-amber-500 to-amber-600', 
      textColor: 'text-white', 
      borderColor: 'border-amber-400',
      label: 'High'
    };
    if (score >= 6) return { 
      color: 'bg-gradient-to-br from-yellow-500 to-yellow-600', 
      textColor: 'text-white', 
      borderColor: 'border-yellow-400',
      label: 'Medium'
    };
    return { 
      color: 'bg-gradient-to-br from-green-500 to-green-600', 
      textColor: 'text-white', 
      borderColor: 'border-green-400',
      label: 'Low'
    };
  };

  return (
    <div className="space-y-4">
      {/* Risk Matrix */}
      <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
        <div className="grid grid-cols-6 gap-2">
          {/* Empty corner */}
          <div className="flex items-center justify-center">
            <div className="text-xs font-medium text-slate-400">Risk Matrix</div>
          </div>
          
          {/* Impact header */}
          {Array.from({ length: matrixSize }, (_, i) => (
            <div key={i} className="text-xs text-center font-medium text-slate-300 py-2">
              <div className="mb-1">{i + 1}</div>
              <div className="text-slate-500">
                {i === 0 ? 'Low' : i === 4 ? 'High' : ''}
              </div>
            </div>
          ))}
          
          {/* Matrix cells */}
          {Array.from({ length: matrixSize }, (_, row) => (
            <React.Fragment key={`row-fragment-${row}`}>
              {/* Probability label */}
              <div className="text-xs text-slate-300 flex items-center justify-center font-medium">
                <div className="text-center">
                  <div className="mb-1">{matrixSize - row}</div>
                  <div className="text-slate-500 rotate-90 text-center">
                    {row === 0 ? 'High' : row === 4 ? 'Low' : ''}
                  </div>
                </div>
              </div>
              
              {/* Risk cells */}
              {Array.from({ length: matrixSize }, (_, col) => {
                const cellRisks = matrix[matrixSize - 1 - row][col];
                const config = getRiskConfig(matrixSize - row, col + 1);
                const hasRisks = cellRisks && cellRisks.length > 0;
                
                return (
                  <div
                    key={`cell-${row}-${col}`}
                    className={cn(
                      "h-16 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105",
                      hasRisks ? config.color : 'bg-slate-800/50 border-slate-700',
                      hasRisks ? config.borderColor : 'border-slate-600',
                      hasRisks && "shadow-lg"
                    )}
                    title={hasRisks ? `${cellRisks.length} risk(s) - ${config.label}` : `${config.label} risk zone`}
                  >
                    {hasRisks ? (
                      <>
                        <div className="text-lg font-bold text-white">
                          {cellRisks.length}
                        </div>
                        <div className="text-xs text-white/80">
                          {cellRisks.length === 1 ? 'risk' : 'risks'}
                        </div>
                      </>
                    ) : (
                      <div className="text-xs text-slate-500">
                        {config.label}
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
        
        {/* Axis labels */}
        <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4" />
            <span className="font-medium">Impact Level</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Probability Level</span>
            <div className="rotate-90">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Risk Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Low', color: 'bg-green-500', count: risks.filter(r => r.probability * r.impact < 6).length },
          { label: 'Medium', color: 'bg-yellow-500', count: risks.filter(r => r.probability * r.impact >= 6 && r.probability * r.impact < 12).length },
          { label: 'High', color: 'bg-amber-500', count: risks.filter(r => r.probability * r.impact >= 12 && r.probability * r.impact < 20).length },
          { label: 'Critical', color: 'bg-red-500', count: risks.filter(r => r.probability * r.impact >= 20).length }
        ].map((risk) => (
          <div key={risk.label} className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <div className={cn("w-4 h-4 rounded-full", risk.color)} />
            <div className="flex-1">
              <div className="text-xs font-medium text-white">{risk.label}</div>
              <div className="text-xs text-slate-400">{risk.count} risks</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
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