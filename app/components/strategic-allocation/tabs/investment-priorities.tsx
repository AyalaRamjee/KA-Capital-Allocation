'use client'

import { useState, useEffect } from 'react'
import { Plus, Target, Edit, AlertCircle, DollarSign } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
import { Label } from '../../../components/ui/label'
import { useAllocationData } from '../../../hooks/use-allocation-data'
import { Priority, formatIndianCurrency } from '../../../lib/data-models'
import { cn } from '../../../lib/utils'
import { EXECUTIVE_TEAM } from '../shared/charts'

const PRIORITY_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316']

function ExecutiveAvatar({ executive, size = 'sm' }: { executive: typeof EXECUTIVE_TEAM[0]; size?: 'sm' | 'md' }) {
  const sizeClasses = { sm: 'w-6 h-6 text-xs', md: 'w-8 h-8 text-sm' }
  return (
    <div 
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br flex items-center justify-center text-white font-medium border border-slate-600`}
      style={{ backgroundImage: `linear-gradient(135deg, ${executive.color}, ${executive.color}90)` }}
      title={`${executive.name} - ${executive.title}`}
    >
      {executive.initials}
    </div>
  )
}

function PriorityCard({ priority, index, onEdit, onWeightChange, onThresholdChange, totalWeight }: {
  priority: Priority
  index: number
  onEdit: (priority: Priority) => void
  onWeightChange: (id: string, weight: number) => void
  onThresholdChange: (id: string, threshold: number) => void
  totalWeight: number
}) {
  const executive = EXECUTIVE_TEAM.find(exec => priority.sponsor?.includes(exec.name))
  const isOverAllocated = totalWeight > 100
  const rank = index + 1

  return (
    <div className="bg-white/[0.02] border border-white/[0.08] rounded-lg p-6 hover:bg-white/[0.03] transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-700 rounded flex items-center justify-center text-xs font-medium text-slate-300">
              #{rank}
            </div>
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
              style={{ backgroundColor: priority.color }}
            >
              {priority.code}
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1">{priority.name}</h3>
            <p className="text-sm text-slate-400 line-clamp-2">{priority.description}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="mb-2">
            <div className="text-xs text-slate-500 mb-1">WEIGHT</div>
            <div className={cn(
              "text-2xl font-bold",
              isOverAllocated ? "text-orange-400" : "text-white"
            )}>
              {priority.weight}%
            </div>
          </div>
          <button 
            onClick={() => onEdit(priority)}
            className="p-1 text-slate-500 hover:text-white transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Weight Slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-500 uppercase tracking-wide">Priority Weight</span>
          <span className="text-xs text-slate-400">{priority.weight}% of portfolio</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={priority.weight} 
          onChange={(e) => onWeightChange(priority.id, parseInt(e.target.value))}
          className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer weight-slider"
          style={{
            background: `linear-gradient(to right, ${priority.color} 0%, ${priority.color} ${priority.weight}%, #1e293b ${priority.weight}%, #1e293b 100%)`
          }}
        />
        <style jsx>{`
          .weight-slider::-webkit-slider-thumb {
            appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: ${priority.color};
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
            transition: all 0.15s ease;
          }
          .weight-slider::-webkit-slider-thumb:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          }
        `}</style>
      </div>

      {/* Threshold Gate */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-500 uppercase tracking-wide">Minimum Score Gate</span>
          <span className="text-xs text-slate-400">{priority.minThreshold}% required</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={priority.minThreshold} 
          onChange={(e) => onThresholdChange(priority.id, parseInt(e.target.value))}
          className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer threshold-slider"
        />
        <style jsx>{`
          .threshold-slider::-webkit-slider-thumb {
            appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #ef4444;
            cursor: pointer;
            border: 2px solid white;
            transition: all 0.15s ease;
          }
          .threshold-slider::-webkit-slider-thumb:hover {
            transform: scale(1.1);
          }
        `}</style>
      </div>
      
      {/* Details Grid */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Budget Range</div>
          <div className="text-sm text-white">
            {formatIndianCurrency(priority.budgetMin)} -<br/>
            {formatIndianCurrency(priority.budgetMax)}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Timeline</div>
          <div className="text-sm text-white capitalize">{priority.timeHorizon}-term</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Sponsor</div>
          <div className="flex items-center gap-2">
            {executive && <ExecutiveAvatar executive={executive} size="sm" />}
            <div className="text-sm text-white">{priority.sponsor?.split(',')[0]}</div>
          </div>
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

function PriorityModal({ isOpen, onClose, priority, onSave }: { 
  isOpen: boolean
  onClose: () => void
  priority?: Priority
  onSave: (data: PriorityFormData) => void
}) {
  const [formData, setFormData] = useState<PriorityFormData>({
    code: '', name: '', description: '', weight: 0, minThreshold: 70, budgetMin: 0, budgetMax: 0, timeHorizon: 'medium', sponsor: '', kpis: ''
  })

  useEffect(() => {
    if (priority) {
      setFormData({ ...priority, kpis: priority.kpis.join('\n') })
    } else {
      setFormData({ code: '', name: '', description: '', weight: 0, minThreshold: 70, budgetMin: 0, budgetMax: 0, timeHorizon: 'medium', sponsor: '', kpis: '' })
    }
  }, [priority])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-white">
            {priority ? 'Edit Priority' : 'Add Priority'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-slate-300">Priority Code</Label>
              <Input 
                placeholder="P1, P2, P3..."
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white focus:border-slate-600"
                required 
              />
            </div>
            <div>
              <Label className="text-sm text-slate-300">Initial Weight (%)</Label>
              <Input 
                type="number"
                min="0"
                max="100"
                value={formData.weight}
                onChange={e => setFormData({ ...formData, weight: +e.target.value })}
                className="bg-slate-800 border-slate-700 text-white focus:border-slate-600"
              />
            </div>
          </div>
          
          <div>
            <Label className="text-sm text-slate-300">Priority Name</Label>
            <Input 
              placeholder="Strategic priority name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="bg-slate-800 border-slate-700 text-white focus:border-slate-600"
              required 
            />
          </div>
          
          <div>
            <Label className="text-sm text-slate-300">Description</Label>
            <Textarea 
              placeholder="Detailed description"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="bg-slate-800 border-slate-700 text-white focus:border-slate-600"
            />
          </div>

          <div>
            <Label className="text-sm text-slate-300">Minimum Score Threshold (%)</Label>
            <Input 
              type="number"
              min="0"
              max="100"
              value={formData.minThreshold}
              onChange={e => setFormData({ ...formData, minThreshold: +e.target.value })}
              className="bg-slate-800 border-slate-700 text-white focus:border-slate-600"
              placeholder="70"
            />
            <div className="text-xs text-slate-500 mt-1">Projects must score above this threshold to qualify</div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-slate-300">Min Budget (₹)</Label>
              <Input 
                type="number"
                min="0"
                step="1000000"
                value={formData.budgetMin}
                onChange={e => setFormData({ ...formData, budgetMin: +e.target.value })}
                className="bg-slate-800 border-slate-700 text-white focus:border-slate-600"
              />
            </div>
            <div>
              <Label className="text-sm text-slate-300">Max Budget (₹)</Label>
              <Input 
                type="number"
                min="0"
                step="1000000"
                value={formData.budgetMax}
                onChange={e => setFormData({ ...formData, budgetMax: +e.target.value })}
                className="bg-slate-800 border-slate-700 text-white focus:border-slate-600"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-slate-300">Time Horizon</Label>
              <select 
                value={formData.timeHorizon}
                onChange={e => setFormData({ ...formData, timeHorizon: e.target.value as 'short' | 'medium' | 'long' })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white focus:border-slate-600"
              >
                <option value="short">Short-term (1-2 years)</option>
                <option value="medium">Medium-term (2-5 years)</option>
                <option value="long">Long-term (5+ years)</option>
              </select>
            </div>
            <div>
              <Label className="text-sm text-slate-300">Executive Sponsor</Label>
              <select 
                value={formData.sponsor}
                onChange={e => setFormData({ ...formData, sponsor: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white focus:border-slate-600"
              >
                <option value="">Select sponsor...</option>
                {EXECUTIVE_TEAM.map(exec => (
                  <option key={exec.name} value={exec.name}>{exec.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <Label className="text-sm text-slate-300">Key Performance Indicators</Label>
            <Textarea 
              placeholder="One KPI per line"
              value={formData.kpis}
              onChange={e => setFormData({ ...formData, kpis: e.target.value })}
              rows={4}
              className="bg-slate-800 border-slate-700 text-white focus:border-slate-600"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {priority ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function InvestmentPriorities() {
  const { state, addPriority, updatePriority } = useAllocationData()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPriority, setEditingPriority] = useState<Priority | undefined>()
  const [autoBalanceEnabled, setAutoBalanceEnabled] = useState(true)
  
  if (!state) {
    return <div className="flex items-center justify-center min-h-96"><div className="text-slate-400">Loading priorities...</div></div>
  }

  const { priorities } = state
  const totalWeight = priorities.reduce((sum, p) => sum + p.weight, 0)
  const totalBudgetMin = priorities.reduce((sum, p) => sum + p.budgetMin, 0)
  const totalBudgetMax = priorities.reduce((sum, p) => sum + p.budgetMax, 0)
  const isBalanced = totalWeight === 100
  
  const handleEdit = (priority: Priority) => {
    setEditingPriority(priority)
    setModalOpen(true)
  }
  
  const handleWeightChange = (id: string, newWeight: number) => {
    if (autoBalanceEnabled && priorities.length > 1) {
      // Auto-balance: distribute the difference across other priorities
      const currentPriority = priorities.find(p => p.id === id)
      if (!currentPriority) return
      
      const difference = newWeight - currentPriority.weight
      const otherPriorities = priorities.filter(p => p.id !== id)
      const totalOtherWeight = otherPriorities.reduce((sum, p) => sum + p.weight, 0)
      
      if (totalOtherWeight === 0) {
        updatePriority(id, { weight: newWeight })
        return
      }
      
      // Update the main priority
      updatePriority(id, { weight: newWeight })
      
      // Redistribute the difference proportionally
      otherPriorities.forEach(priority => {
        const proportion = priority.weight / totalOtherWeight
        const adjustment = difference * proportion
        const adjustedWeight = Math.max(0, Math.min(100, priority.weight - adjustment))
        updatePriority(priority.id, { weight: Math.round(adjustedWeight) })
      })
    } else {
      updatePriority(id, { weight: newWeight })
    }
  }
  
  const handleThresholdChange = (id: string, threshold: number) => {
    updatePriority(id, { minThreshold: threshold })
  }
  
  const handleAddPriority = () => {
    setEditingPriority(undefined)
    setModalOpen(true)
  }

  const handleSavePriority = (formData: PriorityFormData) => {
    const kpis = formData.kpis.split('\n').filter(Boolean)
    if (editingPriority) {
      updatePriority(editingPriority.id, { ...formData, kpis })
    } else {
      addPriority({ 
        ...formData, 
        kpis, 
        color: PRIORITY_COLORS[priorities.length % PRIORITY_COLORS.length],
        weight: Math.round((100 - totalWeight) / Math.max(1, priorities.length)) // Smart default weight
      })
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white mb-1">Add Priorities</h1>
            <p className="text-sm text-slate-400">Define strategic priorities and set allocation weights</p>
          </div>
          <Button onClick={handleAddPriority} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Add Priority
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Total Weight</div>
            <div className={cn("text-lg font-semibold", isBalanced ? "text-green-400" : "text-orange-400")}>
              {totalWeight}%
            </div>
            <div className="text-xs text-slate-500 mt-1">{isBalanced ? 'Balanced' : 'Adjust'}</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Priorities</div>
            <div className="text-lg font-semibold text-white">{priorities.length}</div>
            <div className="text-xs text-slate-500 mt-1">Defined</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Min Budget</div>
            <div className="text-lg font-semibold text-white">{formatIndianCurrency(totalBudgetMin)}</div>
            <div className="text-xs text-slate-500 mt-1">Required</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Max Budget</div>
            <div className="text-lg font-semibold text-white">{formatIndianCurrency(totalBudgetMax)}</div>
            <div className="text-xs text-slate-500 mt-1">Available</div>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={autoBalanceEnabled} 
                onChange={(e) => setAutoBalanceEnabled(e.target.checked)} 
                className="w-4 h-4 rounded border-slate-600 text-blue-600 focus:ring-0" 
              />
              <span className="text-sm text-slate-300">Auto-balance weights to 100%</span>
            </label>
          </div>
          {!isBalanced && (
            <div className="flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded text-orange-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Weights must total 100%</span>
            </div>
          )}
        </div>
        
        {/* Priorities List */}
        <div className="space-y-4">
          {priorities.map((priority, index) => (
            <PriorityCard 
              key={priority.id} 
              priority={priority} 
              index={index} 
              onEdit={handleEdit} 
              onWeightChange={handleWeightChange}
              onThresholdChange={handleThresholdChange}
              totalWeight={totalWeight}
            />
          ))}
        </div>
        
        {priorities.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No priorities defined</h3>
            <p className="text-slate-400 mb-4">Create your first strategic priority to begin portfolio allocation</p>
            <Button onClick={handleAddPriority} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
              <Plus className="w-4 h-4 mr-2" />
              Add First Priority
            </Button>
          </div>
        )}
      </div>

      <PriorityModal isOpen={modalOpen} onClose={() => setModalOpen(false)} priority={editingPriority} onSave={handleSavePriority} />
    </div>
  )
}