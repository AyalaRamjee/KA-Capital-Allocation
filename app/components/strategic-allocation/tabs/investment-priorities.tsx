'use client'

import { useState } from 'react'
import { Plus, Target, Percent, DollarSign, Filter, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAllocationData } from '@/hooks/use-allocation-data'
import { Priority } from '@/lib/data-models'
import { formatLargeNumber } from '@/lib/utils'

// Mock data for now
const mockPriorities = [
  {
    id: '1',
    code: 'P1',
    name: 'Digital Transformation',
    description: 'Modernize digital infrastructure and capabilities',
    weight: 30,
    minThreshold: 15,
    budgetMin: 20,
    budgetMax: 50,
    timeHorizon: 'medium' as const,
    sponsor: 'John Smith, CTO',
    color: '#3b82f6'
  },
  {
    id: '2',
    code: 'P2',
    name: 'Market Expansion',
    description: 'Enter new geographical markets and segments',
    weight: 25,
    minThreshold: 10,
    budgetMin: 15,
    budgetMax: 40,
    timeHorizon: 'long' as const,
    sponsor: 'Sarah Johnson, CMO',
    color: '#10b981'
  },
  {
    id: '3',
    code: 'P3',
    name: 'Operational Excellence',
    description: 'Improve efficiency and reduce operational costs',
    weight: 20,
    minThreshold: 12,
    budgetMin: 10,
    budgetMax: 30,
    timeHorizon: 'short' as const,
    sponsor: 'Mike Davis, COO',
    color: '#f59e0b'
  },
  {
    id: '4',
    code: 'P4',
    name: 'Customer Experience',
    description: 'Enhance customer satisfaction and retention',
    weight: 15,
    minThreshold: 8,
    budgetMin: 5,
    budgetMax: 25,
    timeHorizon: 'medium' as const,
    sponsor: 'Lisa Chen, CCO',
    color: '#ef4444'
  },
  {
    id: '5',
    code: 'P5',
    name: 'Innovation & R&D',
    description: 'Invest in future technologies and innovation',
    weight: 10,
    minThreshold: 5,
    budgetMin: 8,
    budgetMax: 20,
    timeHorizon: 'long' as const,
    sponsor: 'Alex Rodriguez, CIO',
    color: '#8b5cf6'
  }
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
  priority: typeof mockPriorities[0]
  onEdit: (id: string) => void
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
          <Button variant="ghost" size="sm" onClick={() => onEdit(priority.id)}>
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

export function InvestmentPriorities() {
  const [priorities, setPriorities] = useState(mockPriorities)
  
  const totalWeight = priorities.reduce((sum, p) => sum + p.weight, 0)
  const totalBudgetMin = priorities.reduce((sum, p) => sum + p.budgetMin, 0)
  const totalBudgetMax = priorities.reduce((sum, p) => sum + p.budgetMax, 0)
  const activeThresholds = priorities.filter(p => p.minThreshold > 0).length
  
  const handleEdit = (id: string) => {
    // TODO: Open edit modal
    console.log('Edit priority:', id)
  }
  
  const handleDelete = (id: string) => {
    // TODO: Show confirmation dialog
    console.log('Delete priority:', id)
  }
  
  const handleWeightChange = (id: string, weight: number) => {
    setPriorities(prev => 
      prev.map(p => p.id === id ? { ...p, weight } : p)
    )
  }
  
  const handleAddPriority = () => {
    // TODO: Open add priority modal
    console.log('Add new priority')
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
    </div>
  )
}