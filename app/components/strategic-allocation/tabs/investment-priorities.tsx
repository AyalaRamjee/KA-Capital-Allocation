'use client'

import { useState, useEffect } from 'react'
import { Plus, Target, Percent, DollarSign, Filter, Edit, Trash2, GripVertical, TrendingUp, AlertCircle } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
import { Label } from '../../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { useAllocationData } from '../../../hooks/use-allocation-data'
import { Priority } from '../../../lib/data-models'
import { formatLargeNumber, cn } from '../../../lib/utils'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

const PRIORITY_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
]

interface MetricCardProps {
  title: string
  value: string | number
  icon: React.ElementType
  color?: string
  subtitle?: string
}

function MetricCard({ title, value, icon: Icon, color = 'blue', subtitle }: MetricCardProps) {
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
          </div>
          <div className={`w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center ${colorClasses[color as keyof typeof colorClasses]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
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
  
  return (
    <div 
      className={cn(
        "p-4 bg-slate-700 rounded-lg border border-slate-600 hover:border-blue-500/50 transition-all space-y-3",
        isDragging && "opacity-50",
        draggedOver && "border-blue-400 bg-slate-600"
      )}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="cursor-move text-slate-400 hover:text-white transition-colors">
            <GripVertical className="w-5 h-5" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 text-sm font-mono">#{index + 1}</span>
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: priority.color }}
            >
              <span className="text-white font-bold">{priority.code}</span>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-white">{priority.name}</h3>
            <p className="text-sm text-slate-400">{priority.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(priority)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(priority.id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Weight Slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Weight</span>
          <div className="flex items-center space-x-2">
            <span className="text-white font-mono">{priority.weight}%</span>
            {priority.weight > 0 && (
              <div className="w-16 h-2 bg-slate-600 rounded-full">
                <div 
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(priority.weight / 100) * 100}%`,
                    backgroundColor: priority.color 
                  }}
                />
              </div>
            )}
          </div>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={priority.weight}
          onChange={(e) => onWeightChange(priority.id, parseInt(e.target.value))}
          className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <span className="text-slate-400">Threshold</span>
          <div className="text-white font-mono">{priority.minThreshold}%</div>
        </div>
        <div>
          <span className="text-slate-400">Budget</span>
          <div className="text-white font-mono">${priority.budgetMin}M-${priority.budgetMax}M</div>
        </div>
        <div>
          <span className="text-slate-400">Horizon</span>
          <div className="text-white capitalize">{priority.timeHorizon}</div>
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
    kpis: priority?.kpis?.join(', ') || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>{priority ? 'Edit Priority' : 'Add New Priority'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Priority Code</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                placeholder="P1"
                className="bg-slate-700 border-slate-600"
                required
              />
            </div>
            <div>
              <Label>Priority Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Digital Transformation"
                className="bg-slate-700 border-slate-600"
                required
              />
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Strategic rationale and objectives..."
              className="bg-slate-700 border-slate-600"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Weight (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: parseInt(e.target.value) || 0})}
                className="bg-slate-700 border-slate-600"
                required
              />
            </div>
            <div>
              <Label>Min Threshold (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.minThreshold}
                onChange={(e) => setFormData({...formData, minThreshold: parseInt(e.target.value) || 0})}
                className="bg-slate-700 border-slate-600"
              />
            </div>
            <div>
              <Label>Time Horizon</Label>
              <Select
                value={formData.timeHorizon}
                onValueChange={(value: 'short' | 'medium' | 'long') => setFormData({...formData, timeHorizon: value})}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="short">Short (0-2 years)</SelectItem>
                  <SelectItem value="medium">Medium (2-5 years)</SelectItem>
                  <SelectItem value="long">Long (5+ years)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Budget Min ($M)</Label>
              <Input
                type="number"
                min="0"
                value={formData.budgetMin}
                onChange={(e) => setFormData({...formData, budgetMin: parseFloat(e.target.value) || 0})}
                className="bg-slate-700 border-slate-600"
              />
            </div>
            <div>
              <Label>Budget Max ($M)</Label>
              <Input
                type="number"
                min="0"
                value={formData.budgetMax}
                onChange={(e) => setFormData({...formData, budgetMax: parseFloat(e.target.value) || 0})}
                className="bg-slate-700 border-slate-600"
              />
            </div>
          </div>

          <div>
            <Label>Executive Sponsor</Label>
            <Input
              value={formData.sponsor}
              onChange={(e) => setFormData({...formData, sponsor: e.target.value})}
              placeholder="John Smith, CFO"
              className="bg-slate-700 border-slate-600"
              required
            />
          </div>

          <div>
            <Label>Key Performance Indicators (comma-separated)</Label>
            <Textarea
              value={formData.kpis}
              onChange={(e) => setFormData({...formData, kpis: e.target.value})}
              placeholder="Revenue growth, Cost reduction, Customer satisfaction"
              className="bg-slate-700 border-slate-600"
              rows={2}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {priority ? 'Update Priority' : 'Add Priority'}
            </Button>
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
    return <div className="p-6 text-center">Loading...</div>
  }

  const { priorities } = state
  const totalWeight = priorities.reduce((sum, p) => sum + p.weight, 0)
  const totalBudgetMin = priorities.reduce((sum, p) => sum + p.budgetMin, 0)
  const totalBudgetMax = priorities.reduce((sum, p) => sum + p.budgetMax, 0)
  const activeThresholds = priorities.filter(p => p.minThreshold > 0).length
  
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
  
  const pieChartData = priorities.map(priority => ({
    name: priority.code,
    value: priority.weight,
    color: priority.color,
    label: `${priority.code}: ${priority.weight}%`
  }))
  
  const budgetChartData = priorities.map(priority => ({
    name: priority.code,
    min: priority.budgetMin,
    max: priority.budgetMax,
    color: priority.color
  }))
  
  const handleAddPriority = () => {
    setEditingPriority(undefined)
    setModalOpen(true)
  }

  const handleSavePriority = (formData: PriorityFormData) => {
    const kpis = formData.kpis.split(',').map(kpi => kpi.trim()).filter(Boolean)
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">1. Investment Priorities</h2>
          <p className="text-slate-400">Define strategic priorities that guide investment decisions</p>
        </div>
        <Button onClick={handleAddPriority} className="hover-glow">
          <Plus className="w-4 h-4 mr-2" />
          Add Priority
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="Total Priorities"
          value={priorities.length}
          icon={Target}
          color="blue"
        />
        <MetricCard
          title="Total Weight"
          value={`${totalWeight}%`}
          icon={Percent}
          color={totalWeight === 100 ? 'green' : 'red'}
          subtitle={totalWeight === 100 ? 'Balanced' : 'Must equal 100%'}
        />
        <MetricCard
          title="Budget Range"
          value={`$${totalBudgetMin}M - $${totalBudgetMax}M`}
          icon={DollarSign}
          color="amber"
        />
        <MetricCard
          title="Active Thresholds"
          value={activeThresholds}
          icon={Filter}
          color="purple"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left: Priority List (8 cols) */}
        <div className="col-span-8">
          <Card>
            <CardHeader>
              <CardTitle>Priority Configuration</CardTitle>
              <CardDescription>Configure priorities by importance and strategic value</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Auto-balance controls */}
                <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-600">
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoBalanceEnabled}
                        onChange={(e) => setAutoBalanceEnabled(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm text-slate-300">Auto-balance weights</span>
                    </label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAutoBalance}
                      className="text-xs"
                    >
                      Balance Now
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-400">Total Weight:</span>
                    <span className={cn(
                      "text-sm font-mono font-bold",
                      totalWeight === 100 ? "text-green-400" : "text-red-400"
                    )}>
                      {totalWeight}%
                    </span>
                    {totalWeight !== 100 && (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                </div>
                
                {priorities.map((priority, index) => (
                  <PriorityCard
                    key={priority.id}
                    priority={priority}
                    index={index}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onWeightChange={handleWeightChange}
                    onReorder={handleReorder}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Visualizations (4 cols) */}
        <div className="col-span-4 space-y-4">
          {/* Weight Distribution Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Weight Distribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #475569',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Legend */}
              <div className="mt-4 space-y-2">
                {priorities.map((priority) => (
                  <div key={priority.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: priority.color }}
                      />
                      <span className="text-slate-300">{priority.code}</span>
                    </div>
                    <span className="text-slate-400 font-mono">{priority.weight}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Budget Allocation */}
          <Card>
            <CardHeader>
              <CardTitle>Budget Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={budgetChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #475569',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                      formatter={(value: number, name: string) => [
                        `$${value}M`,
                        name === 'min' ? 'Min Budget' : 'Max Budget'
                      ]}
                    />
                    <Bar dataKey="min" fill="#64748b" name="Min Budget" />
                    <Bar dataKey="max" fill="#3b82f6" name="Max Budget" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              {/* Budget Summary */}
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-slate-400">Total Min</div>
                  <div className="text-white font-mono">${totalBudgetMin}M</div>
                </div>
                <div className="text-center">
                  <div className="text-slate-400">Total Max</div>
                  <div className="text-white font-mono">${totalBudgetMax}M</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time Horizon Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Time Horizon</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {['short', 'medium', 'long'].map((horizon) => {
                  const count = priorities.filter(p => p.timeHorizon === horizon).length
                  return (
                    <div key={horizon} className="flex items-center justify-between">
                      <span className="text-sm text-slate-300 capitalize">{horizon}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <PriorityModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        priority={editingPriority}
        onSave={handleSavePriority}
      />
    </div>
  )
}