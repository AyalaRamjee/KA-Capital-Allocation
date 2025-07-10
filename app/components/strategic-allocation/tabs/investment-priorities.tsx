'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Target, Percent, DollarSign, Filter, Edit, Trash2, GripVertical, TrendingUp, AlertCircle, User, Calendar, Building2, Award, CheckCircle2, Eye, Search, Settings, BarChart3, Users, Activity, Zap, Save, X } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
import { Label } from '../../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Progress } from '../../../components/ui/progress'
import { useAllocationData } from '../../../hooks/use-allocation-data'
import { Priority } from '../../../lib/data-models'
import { formatLargeNumber, cn } from '../../../lib/utils'
import { formatIndianCurrency } from '../../../lib/data-models'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Area, AreaChart } from 'recharts'

const PRIORITY_COLORS = [
  '#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4', 
  '#84cc16', '#f97316', '#ec4899', '#6366f1', '#ef4444'
]

// Enterprise Executive Team
const EXECUTIVE_TEAM = [
  {
    id: 'exec-1',
    name: 'Executive Director',
    title: 'Chief Executive Officer',
    avatar: '/images/executives/exec-1.jpg',
    initials: 'ED',
    color: '#22c55e'
  },
  {
    id: 'exec-2',
    name: 'VP Operations',
    title: 'Vice President',
    avatar: '/images/executives/exec-2.jpg',
    initials: 'VP',
    color: '#3b82f6'
  },
  {
    id: 'exec-3',
    name: 'Chief Strategy Officer',
    title: 'CSO',
    avatar: '/images/executives/exec-3.jpg',
    initials: 'CS',
    color: '#f59e0b'
  },
  {
    id: 'exec-4',
    name: 'Portfolio Manager',
    title: 'Senior Director',
    avatar: '/images/executives/exec-4.jpg',
    initials: 'PM',
    color: '#8b5cf6'
  }
]

interface MetricCardProps {
  title: string
  value: string | number
  icon: React.ElementType
  color?: string
  subtitle?: string
  trend?: { value: number; direction: 'up' | 'down' }
  sparkline?: number[]
}

function MetricCard({ title, value, icon: Icon, color = 'blue', subtitle, trend, sparkline }: MetricCardProps) {
  const iconColors = {
    blue: '#4B7BFF',
    green: '#10b981',
    amber: '#f59e0b',
    purple: '#8b5cf6',
    red: '#ef4444',
    cyan: '#06b6d4'
  }

  return (
    <div className="metric-card card-hover fade-in-up">
      {/* Header with icon and title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center" 
            style={{ backgroundColor: `${iconColors[color as keyof typeof iconColors]}20` }}
          >
            <Icon className="w-5 h-5" style={{ color: iconColors[color as keyof typeof iconColors] }} />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wide">{title}</div>
          </div>
        </div>
        {trend && (
          <div className={`flex items-center text-xs font-semibold ${
            trend.direction === 'up' ? 'text-green-400' : 'text-red-400'
          }`}>
            <TrendingUp className={`w-3 h-3 mr-1 ${
              trend.direction === 'down' ? 'rotate-180' : ''
            }`} />
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      
      {/* Main value */}
      <div className="mt-2">
        <div className="text-2xl font-bold text-white font-mono leading-none">{value}</div>
        {subtitle && (
          <div className="text-xs text-slate-500 mt-1">{subtitle}</div>
        )}
      </div>
      
      {/* Sparkline chart placeholder */}
      {sparkline && (
        <div className="mt-3 h-6 flex items-end space-x-1">
          {sparkline.map((point, index) => (
            <div
              key={index}
              className="flex-1 rounded-sm transition-all duration-300"
              style={{
                height: `${(point / Math.max(...sparkline)) * 100}%`,
                backgroundColor: `${iconColors[color as keyof typeof iconColors]}60`,
                minHeight: '2px'
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ExecutiveAvatar({ executive, size = 'md' }: { 
  executive: typeof EXECUTIVE_TEAM[0]
  size?: 'sm' | 'md' | 'lg' 
}) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  }

  return (
    <div className="relative group">
      <div 
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold border-2 border-slate-600 hover:border-blue-400 transition-all cursor-pointer`}
        style={{ backgroundImage: `linear-gradient(135deg, ${executive.color}, ${executive.color}90)` }}
        title={`${executive.name} - ${executive.title}`}
      >
        {executive.initials}
      </div>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-slate-800 text-white text-xs rounded-lg border border-slate-600 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
        {executive.name}<br />
        <span className="text-slate-400">{executive.title}</span>
      </div>
    </div>
  )
}

interface PriorityCardProps {
  priority: Priority
  index: number
  onEdit: (priority: Priority) => void
  onDelete: (id: string) => void
  onWeightChange: (id: string, weight: number) => void
  onReorder: (dragIndex: number, hoverIndex: number) => void
  isDragging?: boolean
}

function PriorityCard({ priority, index, onEdit, onDelete, onWeightChange, onReorder, isDragging }: PriorityCardProps) {
  const [draggedOver, setDraggedOver] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', index.toString())
  }
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDraggedOver(true)
  }
  
  const handleDragLeave = () => {
    setDraggedOver(false)
  }
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'))
    onReorder(dragIndex, index)
    setDraggedOver(false)
  }

  const executive = EXECUTIVE_TEAM.find(exec => priority.sponsor?.includes(exec.name))
  
  return (
    <div 
      className={cn(
        "priority-card card-primary card-hover transition-all duration-300 relative overflow-hidden",
        isDragging && "opacity-50 scale-95",
        draggedOver && "border-white/20 shadow-2xl"
      )}
      style={{ minHeight: '420px', padding: '0' }}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Edit Overlay */}
      <div className="edit-overlay">
        <button 
          className="edit-button"
          onClick={() => onEdit(priority)}
          title="Edit Priority"
        >
          <Edit className="w-4 h-4" />
        </button>
      </div>
      {/* Priority stripe indicator */}
      <div 
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: priority.color }}
      />

      {/* Professional Header */}
      <div className="priority-card-header" style={{ padding: '24px 24px 0 24px', marginBottom: '16px' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="cursor-move text-slate-400 hover:text-white transition-colors">
              <GripVertical className="w-5 h-5" />
            </div>
            
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg"
              style={{ backgroundColor: priority.color }}
            >
              {priority.code}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white" style={{ fontSize: '16px', fontWeight: 600, lineHeight: '1.4' }}>{priority.name}</h3>
                <div className="text-xl font-bold text-white font-mono animate-number ml-4">{priority.weight}%</div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
      
      <div className="priority-card-divider" style={{ margin: '0 24px 16px 24px' }}></div>

      {/* ALL INFORMATION WITH PROPER SPACING */}
      <div style={{ padding: '0 20px 20px 20px' }}>
        
        {/* Sponsor Section */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#6b7280', marginBottom: '6px', letterSpacing: '0.5px', fontWeight: '500' }}>SPONSOR</div>
          <div className="flex items-center gap-2">
            {executive && <ExecutiveAvatar executive={executive} size="sm" />}
            <div style={{ fontSize: '13px', color: 'white', lineHeight: '1.3' }}>{priority.sponsor}</div>
          </div>
        </div>

        {/* Budget Section */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#6b7280', marginBottom: '6px', letterSpacing: '0.5px', fontWeight: '500' }}>BUDGET RANGE</div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: 'white', lineHeight: '1.2' }}>
            {formatIndianCurrency(priority.budgetMin)} - {formatIndianCurrency(priority.budgetMax)}
          </div>
        </div>

        {/* Timeline and Min Score Grid */}
        <div style={{ marginBottom: '18px' }}>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#6b7280', marginBottom: '6px', letterSpacing: '0.5px', fontWeight: '500' }}>TIMELINE</div>
              <div style={{ fontSize: '13px', color: 'white', lineHeight: '1.2' }}>
                {priority.timeHorizon === 'long' ? '2024-2030' : 
                 priority.timeHorizon === 'medium' ? '2024-2027' : '2024-2026'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#6b7280', marginBottom: '6px', letterSpacing: '0.5px', fontWeight: '500' }}>MIN SCORE</div>
              <div style={{ fontSize: '13px', color: 'white', lineHeight: '1.2' }}>{priority.minThreshold}%</div>
            </div>
          </div>
        </div>

        {/* Key Initiatives Section */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#6b7280', marginBottom: '6px', letterSpacing: '0.5px', fontWeight: '500' }}>KEY INITIATIVES</div>
          <div>
            {priority.kpis.slice(0, 3).map((kpi, index) => (
              <div key={index} className="flex items-start gap-2" style={{ marginBottom: '6px' }}>
                <div style={{ width: '4px', height: '4px', backgroundColor: '#60a5fa', borderRadius: '50%', marginTop: '6px', flexShrink: 0 }} />
                <span style={{ fontSize: '12px', color: '#d1d5db', lineHeight: '1.4' }}>{kpi}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Weight Adjustment Section */}
      <div style={{ padding: '18px 20px', marginTop: '0', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#6b7280', marginBottom: '8px', letterSpacing: '0.5px', fontWeight: '500' }}>WEIGHT ADJUSTMENT</div>
        
        <div className="flex justify-between items-center" style={{ marginBottom: '10px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Current Weight</span>
          <div style={{ fontSize: '13px', color: '#94a3b8', fontFamily: 'monospace' }}>{priority.weight}%</div>
        </div>
        
        <div className="relative" style={{ marginBottom: '6px' }}>
          <div className="weight-slider-track" style={{ width: `${priority.weight}%` }}></div>
          <input
            type="range"
            min="0"
            max="100"
            value={priority.weight}
            onChange={(e) => onWeightChange(priority.id, parseInt(e.target.value))}
            className="weight-slider"
          />
          
          {/* Min threshold marker */}
          {priority.minThreshold > 0 && (
            <div 
              className="absolute top-0 w-0.5 h-2 bg-amber-400 opacity-80"
              style={{ left: `${priority.minThreshold}%`, top: '0px' }}
            />
          )}
        </div>
        
        <div className="flex justify-between" style={{ fontSize: '11px', color: '#6b7280' }}>
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  )
}

interface PriorityFormData {
  code: string
  name: string
  description: string
  weight: number
  minThreshold: number
  budgetMin: number
  budgetMax: number
  timeHorizon: 'short' | 'medium' | 'long'
  sponsor: string
  kpis: string
}

function PriorityModal({ 
  isOpen, 
  onClose, 
  priority, 
  onSave 
}: {
  isOpen: boolean
  onClose: () => void
  priority?: Priority
  onSave: (data: PriorityFormData) => void
}) {
  const [formData, setFormData] = useState<PriorityFormData>({
    code: priority?.code || '',
    name: priority?.name || '',
    description: priority?.description || '',
    weight: priority?.weight || 0,
    minThreshold: priority?.minThreshold || 0,
    budgetMin: priority?.budgetMin || 0,
    budgetMax: priority?.budgetMax || 0,
    timeHorizon: priority?.timeHorizon || 'medium',
    sponsor: priority?.sponsor || '',
    kpis: priority?.kpis?.join('\n') || ''
  })
  const [selectedColor, setSelectedColor] = useState(priority?.color || PRIORITY_COLORS[0])
  const [activeTab, setActiveTab] = useState('basic')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  const presetKPIs = {
    'Green Energy Transition': [
      '50GW renewable capacity by 2030',
      'Green hydrogen production - 1M TPA',
      'Carbon neutrality by 2050',
      'Offshore wind - 5GW capacity'
    ],
    'Infrastructure Expansion': [
      'Port expansion - 5 terminals',
      '200 MT cargo capacity',
      'Digital logistics network',
      'Automation - 80% coverage'
    ],
    'Operational Excellence': [
      '15% cost reduction',
      'Digital automation adoption',
      'Safety zero incidents',
      'Process efficiency improvement'
    ],
    'Market Leadership': [
      'Market share growth',
      'New business verticals',
      'Strategic partnerships',
      'Customer satisfaction score'
    ]
  }

  const addPresetKPI = (kpi: string) => {
    const currentKPIs = formData.kpis.split('\n').filter(Boolean)
    if (!currentKPIs.includes(kpi)) {
      setFormData({...formData, kpis: [...currentKPIs, kpi].join('\n')})
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="modal-content border-slate-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Edit className="w-5 h-5 text-blue-400" />
              <span>Edit Priority - {formData.name || 'New Priority'}</span>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </DialogTitle>
        </DialogHeader>
        
        {/* Premium Tab Navigation */}
        <div className="edit-tabs">
          {[
            { id: 'general', label: 'General', icon: Target },
            { id: 'financial', label: 'Financial', icon: DollarSign },
            { id: 'timeline', label: 'Timeline', icon: Calendar },
            { id: 'stakeholders', label: 'Stakeholders', icon: Users }
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'edit-tab',
                  activeTab === tab.id && 'active'
                )}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            )
          })}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6 fade-in">
              <div className="form-group">
                <label className="form-label">
                  <Target className="w-4 h-4" />
                  Priority Name *
                </label>
                <div className="form-input-with-icon">
                  <Target className="form-icon w-4 h-4" />
                  <input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Green Energy Transition"
                    className="form-input"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  <Edit className="w-4 h-4" />
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Accelerate renewable energy capacity and green hydrogen production..."
                  className="form-input"
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="form-label">
                    <Percent className="w-4 h-4" />
                    Weight
                  </label>
                  <div className="form-input-with-icon">
                    <Percent className="form-icon w-4 h-4" />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: parseInt(e.target.value) || 0})}
                      className="form-input"
                      placeholder="45"
                    />
                  </div>
                  <div className="form-helper-text">Percentage of total allocation</div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    <AlertCircle className="w-4 h-4" />
                    Min Score
                  </label>
                  <div className="form-input-with-icon">
                    <AlertCircle className="form-icon w-4 h-4" />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.minThreshold}
                      onChange={(e) => setFormData({...formData, minThreshold: parseInt(e.target.value) || 0})}
                      className="form-input"
                      placeholder="75"
                    />
                  </div>
                  <div className="form-helper-text">Minimum threshold to pass</div>
                </div>
              </div>
            </div>
          )}

          {/* Financial Tab */}
          {activeTab === 'financial' && (
            <div className="space-y-6 fade-in">
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <Label className="text-sm font-semibold text-slate-300">Priority Weight (%)</Label>
                  <div className="mt-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: parseInt(e.target.value) || 0})}
                      className="form-input"
                      required
                    />
                    <div className="mt-2 h-2 bg-slate-700 rounded-full">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${formData.weight}%`,
                          backgroundColor: selectedColor
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-slate-300">Min Success Threshold (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.minThreshold}
                    onChange={(e) => setFormData({...formData, minThreshold: parseInt(e.target.value) || 0})}
                    className="form-input mt-2"
                  />
                  <p className="text-xs text-slate-500 mt-1">Minimum score to pass</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-slate-300">Risk Level</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger className="form-input mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="low">🟢 Low Risk</SelectItem>
                      <SelectItem value="medium">🟡 Medium Risk</SelectItem>
                      <SelectItem value="high">🔴 High Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-semibold text-slate-300">Budget Range - Minimum (₹ Crores)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.budgetMin}
                    onChange={(e) => setFormData({...formData, budgetMin: parseFloat(e.target.value) || 0})}
                    className="form-input mt-2"
                    placeholder="30000"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-slate-300">Budget Range - Maximum (₹ Crores)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.budgetMax}
                    onChange={(e) => setFormData({...formData, budgetMax: parseFloat(e.target.value) || 0})}
                    className="form-input mt-2"
                    placeholder="45000"
                  />
                </div>
              </div>

              {formData.budgetMin > 0 && formData.budgetMax > 0 && (
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <div className="text-sm text-slate-400 mb-2">Budget Allocation Preview</div>
                  <div className="h-8 bg-slate-700 rounded-lg overflow-hidden">
                    <div 
                      className="h-full transition-all duration-500 flex items-center justify-center text-white text-sm font-semibold"
                      style={{ 
                        backgroundColor: selectedColor,
                        width: `${Math.min((formData.budgetMax / 100000) * 100, 100)}%`
                      }}
                    >
                      ₹{(formData.budgetMin / 10000).toFixed(0)}K - ₹{(formData.budgetMax / 10000).toFixed(0)}K Cr
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Governance Tab */}
          {activeTab === 'governance' && (
            <div className="space-y-6 fade-in">
              <div>
                <Label className="text-sm font-semibold text-slate-300">Executive Sponsor *</Label>
                <Select
                  value={formData.sponsor}
                  onValueChange={(value) => setFormData({...formData, sponsor: value})}
                >
                  <SelectTrigger className="form-input mt-2">
                    <SelectValue placeholder="Select executive sponsor..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {EXECUTIVE_TEAM.map(exec => (
                      <SelectItem key={exec.id} value={`${exec.name}, ${exec.title}`}>
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: exec.color }}
                          >
                            {exec.initials}
                          </div>
                          <div>
                            <div className="font-medium">{exec.name}</div>
                            <div className="text-xs text-slate-400">{exec.title}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-semibold text-slate-300">Review Frequency</Label>
                  <Select defaultValue="quarterly">
                    <SelectTrigger className="form-input mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="monthly">📅 Monthly</SelectItem>
                      <SelectItem value="quarterly">📊 Quarterly</SelectItem>
                      <SelectItem value="biannual">📈 Bi-Annual</SelectItem>
                      <SelectItem value="annual">📋 Annual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-slate-300">Business Unit Alignment</Label>
                  <Select defaultValue="corporate">
                    <SelectTrigger className="form-input mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="green-energy">🌱 Green Energy Division</SelectItem>
                      <SelectItem value="infrastructure">🚢 Infrastructure</SelectItem>
                      <SelectItem value="digital">⚡ Digital Technology</SelectItem>
                      <SelectItem value="operations">🏭 Operations</SelectItem>
                      <SelectItem value="corporate">🏢 Corporate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {EXECUTIVE_TEAM.map(exec => (
                  <div key={exec.id} className="p-4 bg-slate-800/30 rounded-lg border border-slate-600">
                    <div className="flex items-center space-x-3 mb-2">
                      <ExecutiveAvatar executive={exec} size="sm" />
                      <div>
                        <div className="text-sm font-medium text-white">{exec.name}</div>
                        <div className="text-xs text-slate-400">{exec.title}</div>
                      </div>
                    </div>
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm" 
                      className="w-full text-xs"
                      onClick={() => setFormData({...formData, sponsor: `${exec.name}, ${exec.title}`})}
                    >
                      Select as Sponsor
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* KPIs Tab */}
          {activeTab === 'kpis' && (
            <div className="space-y-6 fade-in">
              <div>
                <Label className="text-sm font-semibold text-slate-300">Key Performance Indicators</Label>
                <Textarea
                  value={formData.kpis}
                  onChange={(e) => setFormData({...formData, kpis: e.target.value})}
                  placeholder="Enter each KPI on a new line..."
                  className="form-input mt-2"
                  rows={6}
                />
                <p className="text-xs text-slate-500 mt-1">Enter one KPI per line. These will be tracked for success measurement.</p>
              </div>

              <div>
                <Label className="text-sm font-semibold text-slate-300 mb-4 block">Quick Add: Preset KPIs by Category</Label>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(presetKPIs).map(([category, kpis]) => (
                    <div key={category} className="p-4 bg-slate-800/30 rounded-lg border border-slate-600">
                      <h4 className="text-sm font-medium text-white mb-3">{category}</h4>
                      <div className="space-y-2">
                        {kpis.map((kpi, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => addPresetKPI(kpi)}
                            className="w-full text-left p-2 text-xs text-slate-300 hover:text-white hover:bg-slate-700/50 rounded transition-colors flex items-center space-x-2"
                          >
                            <Plus className="w-3 h-3 text-blue-400" />
                            <span>{kpi}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Premium Footer Actions */}
          <div className="flex justify-between items-center pt-6 border-t border-slate-600">
            <div className="text-sm text-slate-400">
              {priority ? 'Last updated' : 'Creating new priority'} • TADA SCAS
            </div>
            <div className="flex space-x-3">
              <button type="button" onClick={onClose} className="btn-secondary-premium">
                Cancel
              </button>
              <button type="submit" className="btn-primary-premium">
                <Save className="w-4 h-4" />
                {priority ? 'Save Changes' : 'Create Priority'}
              </button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function InvestmentPriorities() {
  const { state, addPriority, updatePriority, deletePriority, reorderPriorities } = useAllocationData()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPriority, setEditingPriority] = useState<Priority | undefined>()
  const [autoBalanceEnabled, setAutoBalanceEnabled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
  
  // Auto-balance weights when enabled
  useEffect(() => {
    if (autoBalanceEnabled && state?.priorities && state.priorities.length > 0) {
      const equalWeight = Math.floor(100 / state.priorities.length)
      const remainder = 100 - (equalWeight * state.priorities.length)
      
      state.priorities.forEach((priority, index) => {
        const newWeight = index === 0 ? equalWeight + remainder : equalWeight
        if (priority.weight !== newWeight) {
          updatePriority(priority.id, { weight: newWeight })
        }
      })
    }
  }, [autoBalanceEnabled, state?.priorities?.length, updatePriority])
  
  if (!state) {
    return (
      <div className="p-6 text-center">
        <div className="loading-shimmer h-32 w-full rounded-lg mb-4"></div>
        <div className="text-slate-400">Loading strategic priorities...</div>
      </div>
    )
  }

  const { priorities } = state
  
  // Filter priorities based on search
  const filteredPriorities = priorities.filter(priority =>
    priority.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    priority.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    priority.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    priority.sponsor.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  const totalWeight = priorities.reduce((sum, p) => sum + p.weight, 0)
  const totalBudgetMin = priorities.reduce((sum, p) => sum + p.budgetMin, 0)
  const totalBudgetMax = priorities.reduce((sum, p) => sum + p.budgetMax, 0)
  const activeThresholds = priorities.filter(p => p.minThreshold > 0).length
  const avgWeight = priorities.length > 0 ? totalWeight / priorities.length : 0
  const weightVariance = priorities.length > 0 ? 
    Math.sqrt(priorities.reduce((sum, p) => sum + Math.pow(p.weight - avgWeight, 2), 0) / priorities.length) : 0
  
  const handleEdit = (priority: Priority) => {
    setEditingPriority(priority)
    setModalOpen(true)
  }
  
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this priority?')) {
      deletePriority(id)
    }
  }
  
  const handleWeightChange = (id: string, weight: number) => {
    if (autoBalanceEnabled) {
      // When auto-balance is enabled, adjust other priorities proportionally
      const currentPriority = priorities.find(p => p.id === id)
      if (!currentPriority) return
      
      const otherPriorities = priorities.filter(p => p.id !== id)
      const otherTotalWeight = otherPriorities.reduce((sum, p) => sum + p.weight, 0)
      const remainingWeight = 100 - weight
      
      if (otherTotalWeight > 0 && remainingWeight >= 0) {
        // Proportionally adjust other priorities
        otherPriorities.forEach(priority => {
          const newWeight = Math.round((priority.weight / otherTotalWeight) * remainingWeight)
          updatePriority(priority.id, { weight: newWeight })
        })
      }
    }
    
    updatePriority(id, { weight })
  }
  
  const handleReorder = (dragIndex: number, hoverIndex: number) => {
    if (dragIndex === hoverIndex) return
    reorderPriorities(dragIndex, hoverIndex)
  }
  
  const handleAutoBalance = () => {
    const equalWeight = Math.floor(100 / priorities.length)
    const remainder = 100 - (equalWeight * priorities.length)
    
    priorities.forEach((priority, index) => {
      const newWeight = index === 0 ? equalWeight + remainder : equalWeight
      updatePriority(priority.id, { weight: newWeight })
    })
  }
  
  // Enhanced chart data with more details
  const donutChartData = priorities.map(priority => ({
    name: priority.code,
    fullName: priority.name,
    value: priority.weight,
    color: priority.color,
    threshold: priority.minThreshold,
    sponsor: priority.sponsor,
    horizon: priority.timeHorizon
  }))
  
  const budgetChartData = priorities.map(priority => ({
    name: priority.code,
    fullName: priority.name,
    min: priority.budgetMin / 10000, // Convert to K Crores
    max: priority.budgetMax / 10000,
    allocated: (priority.weight / 100) * ((priority.budgetMin + priority.budgetMax) / 2) / 10000,
    color: priority.color
  }))
  
  const timeHorizonData = [
    { 
      name: 'Short Term', 
      value: priorities.filter(p => p.timeHorizon === 'short').length,
      color: '#22c55e',
      description: '0-2 years'
    },
    { 
      name: 'Medium Term', 
      value: priorities.filter(p => p.timeHorizon === 'medium').length,
      color: '#f59e0b',
      description: '2-5 years'
    },
    { 
      name: 'Long Term', 
      value: priorities.filter(p => p.timeHorizon === 'long').length,
      color: '#3b82f6',
      description: '5+ years'
    }
  ]
  
  const handleAddPriority = () => {
    setEditingPriority(undefined)
    setModalOpen(true)
  }

  const handleSavePriority = (formData: PriorityFormData) => {
    const kpis = formData.kpis.split('\n').filter(Boolean)
    const colorIndex = priorities.length % PRIORITY_COLORS.length
    
    if (editingPriority) {
      updatePriority(editingPriority.id, {
        ...formData,
        kpis
      })
    } else {
      addPriority({
        ...formData,
        kpis,
        color: PRIORITY_COLORS[colorIndex]
      })
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">1. Investment Priorities</h2>
            <p className="text-slate-400">Define strategic priorities that guide capital allocation decisions</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search priorities..."
              className="search-input w-64"
            />
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center space-x-1 bg-slate-800 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('cards')}
              className={cn(
                'px-3 py-1 rounded-md transition-all',
                viewMode === 'cards' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              )}
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('table')}
              className={cn(
                'px-3 py-1 rounded-md transition-all',
                viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              )}
            >
              <Activity className="w-4 h-4" />
            </Button>
          </div>
          
          <Button onClick={handleAddPriority} className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Priority
          </Button>
        </div>
      </div>


      {/* Enhanced Main Content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left: Priority Management (8 cols) */}
        <div className="col-span-12 lg:col-span-8">
          <div className="card-primary space-y-6">
            {/* Advanced Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 p-4 bg-slate-800/50 rounded-lg border border-slate-600">
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoBalanceEnabled}
                    onChange={(e) => setAutoBalanceEnabled(e.target.checked)}
                    className="rounded border-slate-500 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-300">Auto-balance weights</span>
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAutoBalance}
                  className="text-xs btn-secondary"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Balance Now
                </Button>
                <div className="flex items-center space-x-2 px-3 py-1 bg-slate-700 rounded-lg">
                  <span className="text-xs text-slate-400">Results:</span>
                  <span className="text-xs text-white font-mono">{filteredPriorities.length}/{priorities.length}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-xs text-slate-400">Total Weight</div>
                  <div className={cn(
                    "text-lg font-mono font-bold",
                    totalWeight === 100 ? "text-green-400" : "text-red-400"
                  )}>
                    {totalWeight}%
                  </div>
                </div>
                {totalWeight !== 100 && (
                  <div className="flex items-center space-x-2 px-3 py-2 bg-red-900/20 border border-red-500/30 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-xs text-red-300 font-medium">Must equal 100%</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Priority List */}
            <div className="space-y-4">
              {filteredPriorities.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-400 mb-2">
                    {searchQuery ? 'No priorities found' : 'No priorities yet'}
                  </h3>
                  <p className="text-slate-500 mb-4">
                    {searchQuery 
                      ? `No priorities match "${searchQuery}". Try a different search term.`
                      : 'Create your first strategic priority to start building your investment framework.'}
                  </p>
                  {!searchQuery && (
                    <Button onClick={handleAddPriority} className="btn-primary">
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Priority
                    </Button>
                  )}
                </div>
              ) : (
                filteredPriorities.map((priority, index) => (
                  <PriorityCard
                    key={priority.id}
                    priority={priority}
                    index={index}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onWeightChange={handleWeightChange}
                    onReorder={handleReorder}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Enhanced Analytics (4 cols) */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Interactive Donut Chart */}
          <div className="chart-container">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <span>Weight Distribution</span>
              </h3>
              <Badge variant="secondary" className="text-xs">
                {priorities.length} priorities
              </Badge>
            </div>
            
            <div className="h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {donutChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        stroke={entry.color}
                        strokeWidth={0}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #475569',
                      borderRadius: '12px',
                      color: '#fff',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value: number, name: string, props: any) => [
                      `${value}%`,
                      props.payload.fullName
                    ]}
                    labelFormatter={(label) => `Priority: ${label}`}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Center Summary */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white font-mono">{totalWeight}%</div>
                  <div className="text-xs text-slate-400 uppercase tracking-wide">Total Weight</div>
                </div>
              </div>
            </div>
            
            {/* Enhanced Legend */}
            <div className="mt-6 space-y-3">
              {priorities.map((priority) => {
                const executive = EXECUTIVE_TEAM.find(exec => priority.sponsor?.includes(exec.name))
                return (
                  <div key={priority.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/30 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full border border-slate-600"
                        style={{ backgroundColor: priority.color }}
                      />
                      <div>
                        <div className="text-sm font-medium text-white">{priority.code}</div>
                        <div className="text-xs text-slate-400">{priority.name}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {executive && <ExecutiveAvatar executive={executive} size="sm" />}
                      <span className="text-sm font-mono text-blue-400">{priority.weight}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Enhanced Budget Allocation */}
          <div className="chart-container">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                <span>Budget Allocation</span>
              </h3>
              <Badge variant="secondary" className="text-xs">
                ₹{(totalBudgetMax / 10000).toFixed(0)}K Cr
              </Badge>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={budgetChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#94a3b8" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}K`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #475569',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                    formatter={(value: number, name: string) => [
                      `₹${value.toFixed(1)}K Cr`,
                      name === 'min' ? 'Min Budget' : 
                      name === 'max' ? 'Max Budget' : 'Allocated'
                    ]}
                  />
                  <Bar dataKey="min" fill="#64748b" name="Min Budget" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="max" fill="#3b82f6" name="Max Budget" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="allocated" fill="#22c55e" name="Allocated" radius={[2, 2, 2, 2]} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            
            {/* Budget Insights */}
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div className="text-center p-3 bg-slate-800/30 rounded-lg">
                <div className="text-slate-400 text-xs">Total Min</div>
                <div className="text-white font-mono font-bold">₹{(totalBudgetMin / 10000).toFixed(0)}K Cr</div>
              </div>
              <div className="text-center p-3 bg-slate-800/30 rounded-lg">
                <div className="text-slate-400 text-xs">Total Max</div>
                <div className="text-white font-mono font-bold">₹{(totalBudgetMax / 10000).toFixed(0)}K Cr</div>
              </div>
              <div className="text-center p-3 bg-slate-800/30 rounded-lg">
                <div className="text-slate-400 text-xs">Efficiency</div>
                <div className="text-green-400 font-mono font-bold">
                  {totalBudgetMin > 0 ? ((totalBudgetMax - totalBudgetMin) / totalBudgetMax * 100).toFixed(0) : 0}%
                </div>
              </div>
            </div>
          </div>

          {/* Executive Leadership Panel */}
          <div className="card-primary">
            <h3 className="text-lg font-bold text-white mb-6">Executive Alignment</h3>
            
            <div className="space-y-4">
              {EXECUTIVE_TEAM.map(exec => {
                const priorityCount = priorities.filter(p => p.sponsor?.includes(exec.name)).length
                const execWeight = priorities
                  .filter(p => p.sponsor?.includes(exec.name))
                  .reduce((sum, p) => sum + p.weight, 0)
                const execBudget = priorities
                  .filter(p => p.sponsor?.includes(exec.name))
                  .reduce((sum, p) => sum + p.budgetMax, 0)
                
                return (
                  <div key={exec.id} className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex items-center space-x-3 mb-3">
                      <ExecutiveAvatar executive={exec} size="md" />
                      <div className="flex-1">
                        <div className="text-sm font-bold text-white">{exec.name}</div>
                        <div className="text-xs text-slate-400">{exec.title}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-white font-mono">{execWeight}%</div>
                        <div className="text-xs text-slate-400">Weight</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="text-slate-400">Priorities</div>
                        <div className="text-white font-medium">{priorityCount} active</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Budget</div>
                        <div className="text-white font-medium font-mono">
                          {execBudget > 0 ? formatIndianCurrency(execBudget) : 'None'}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <PriorityModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingPriority(undefined)
        }}
        priority={editingPriority}
        onSave={handleSavePriority}
      />
    </div>
  )
}