'use client'

import { useState } from 'react'
import { Plus, Target, Percent, DollarSign, Filter, Edit, Trash2 } from 'lucide-react'
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
import { formatLargeNumber } from '../../../lib/utils'

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
  onEdit: (priority: Priority) => void
  onDelete: (id: string) => void
  onWeightChange: (id: string, weight: number) => void
}

function PriorityCard({ priority, onEdit, onDelete, onWeightChange }: PriorityCardProps) {
  return (
    <div className="p-4 bg-slate-700 rounded-lg border border-slate-600 hover:border-blue-500/50 transition-all space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: priority.color }}
          >
            <span className="text-white font-bold">{priority.code}</span>
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
          <span className="text-white font-mono">{priority.weight}%</span>
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
  const { state, addPriority, updatePriority, deletePriority } = useAllocationData()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPriority, setEditingPriority] = useState<Priority | undefined>()
  
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
    updatePriority(id, { weight })
  }
  
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
                {priorities.map((priority) => (
                  <PriorityCard
                    key={priority.id}
                    priority={priority}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onWeightChange={handleWeightChange}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Visualizations (4 cols) */}
        <div className="col-span-4 space-y-4">
          {/* Weight Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Weight Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {priorities.map((priority) => (
                  <div key={priority.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: priority.color }}
                      />
                      <span className="text-sm text-slate-300">{priority.code}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-slate-700 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${(priority.weight / 100) * 100}%`,
                            backgroundColor: priority.color 
                          }}
                        />
                      </div>
                      <span className="text-sm font-mono text-slate-400 w-10">{priority.weight}%</span>
                    </div>
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
              <div className="space-y-3">
                {priorities.map((priority) => (
                  <div key={priority.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-300">{priority.code}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-slate-700 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                          style={{ 
                            width: `${(priority.budgetMax / totalBudgetMax) * 100}%`
                          }}
                        />
                      </div>
                      <span className="text-sm font-mono text-slate-400 w-20">${priority.budgetMax}M</span>
                    </div>
                  </div>
                ))}
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