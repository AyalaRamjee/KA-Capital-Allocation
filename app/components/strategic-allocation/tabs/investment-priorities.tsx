'use client'

import { useState, useEffect } from 'react'
import { Plus, Target, Percent, DollarSign, Edit, GripVertical, AlertCircle, Search, BarChart3, Activity, Zap, Save, X } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
import { Label } from '../../../components/ui/label'
import { useAllocationData } from '../../../hooks/use-allocation-data'
import { Priority, formatIndianCurrency } from '../../../lib/data-models'
import { cn } from '../../../lib/utils'
import { EXECUTIVE_TEAM } from '../shared/charts' // Using the shared executive team

const PRIORITY_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1', '#ef4444'];


function ExecutiveAvatar({ executive, size = 'md' }: { executive: typeof EXECUTIVE_TEAM[0]; size?: 'sm' | 'md' | 'lg' }) {
    const sizeClasses = { sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' };
    return (
        <div className="relative group">
            <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold border-2 border-slate-600 hover:border-blue-400 transition-all cursor-pointer`}
                 style={{ backgroundImage: `linear-gradient(135deg, ${executive.color}, ${executive.color}90)` }}
                 title={`${executive.name} - ${executive.title}`}>
                {executive.initials}
            </div>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-slate-800 text-white text-xs rounded-lg border border-slate-600 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                {executive.name}<br />
                <span className="text-slate-400">{executive.title}</span>
            </div>
        </div>
    );
}

function PriorityCard({ priority, index, onEdit, onWeightChange, onReorder, isDragging }: {
    priority: Priority;
    index: number;
    onEdit: (priority: Priority) => void;
    onWeightChange: (id: string, weight: number) => void;
    onReorder: (dragIndex: number, hoverIndex: number) => void;
    isDragging?: boolean;
}) {
    const [draggedOver, setDraggedOver] = useState(false);
    
    const handleDragStart = (e: React.DragEvent) => e.dataTransfer.setData('text/plain', index.toString());
    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDraggedOver(true); };
    const handleDragLeave = () => setDraggedOver(false);
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        onReorder(parseInt(e.dataTransfer.getData('text/plain')), index);
        setDraggedOver(false);
    };

    const executive = EXECUTIVE_TEAM.find(exec => priority.sponsor?.includes(exec.name));

    return (
        <div
            className={cn("priority-card card-primary card-hover transition-all duration-300 relative overflow-hidden", isDragging && "opacity-50 scale-95", draggedOver && "border-white/20 shadow-2xl")}
            style={{ minHeight: '420px', padding: '0' }}
            draggable onDragStart={handleDragStart} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
            <div className="edit-overlay">
                <button className="edit-button" onClick={() => onEdit(priority)} title="Edit Priority"><Edit className="w-4 h-4" /></button>
            </div>
            <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: priority.color }} />
            <div className="priority-card-header" style={{ padding: '24px 24px 0 24px', marginBottom: '16px' }}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="cursor-move text-slate-400 hover:text-white transition-colors"><GripVertical className="w-5 h-5" /></div>
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg" style={{ backgroundColor: priority.color }}>{priority.code}</div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white" style={{ fontSize: '16px', fontWeight: 600, lineHeight: '1.4' }}>{priority.name}</h3>
                        </div>
                    </div>
                    <div className="text-xl font-bold text-white font-mono animate-number ml-4">{priority.weight}%</div>
                </div>
            </div>
            <div className="priority-card-divider" style={{ margin: '0 24px 16px 24px' }}></div>
            <div style={{ padding: '0 20px 20px 20px' }}>
                <div style={{ marginBottom: '18px' }}>
                    <div className="form-label-sm">SPONSOR</div>
                    <div className="flex items-center gap-2">
                        {executive && <ExecutiveAvatar executive={executive} size="sm" />}
                        <div className="text-sm text-white">{priority.sponsor}</div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-6 mb-4">
                    <div>
                        <div className="form-label-sm">BUDGET RANGE</div>
                        <div className="text-sm font-semibold text-white">{formatIndianCurrency(priority.budgetMin)} - {formatIndianCurrency(priority.budgetMax)}</div>
                    </div>
                    <div>
                        <div className="form-label-sm">TIMELINE</div>
                        <div className="text-sm text-white">{priority.timeHorizon}</div>
                    </div>
                </div>
                <div>
                    <div className="form-label-sm">KEY INITIATIVES</div>
                    <ul className="list-disc list-inside space-y-1">
                        {priority.kpis.slice(0, 3).map((kpi, index) => (
                            <li key={index} className="text-xs text-slate-300">{kpi}</li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className="p-4 mt-auto border-t border-slate-700/50">
                <div className="form-label-sm">WEIGHT ADJUSTMENT</div>
                <input type="range" min="0" max="100" value={priority.weight} onChange={(e) => onWeightChange(priority.id, parseInt(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
            </div>
        </div>
    );
}

interface PriorityFormData {
    code: string; name: string; description: string; weight: number; minThreshold: number; budgetMin: number; budgetMax: number; timeHorizon: 'short' | 'medium' | 'long'; sponsor: string; kpis: string;
}

function PriorityModal({ isOpen, onClose, priority, onSave }: { isOpen: boolean; onClose: () => void; priority?: Priority; onSave: (data: PriorityFormData) => void; }) {
    const [formData, setFormData] = useState<PriorityFormData>({
        code: '', name: '', description: '', weight: 0, minThreshold: 0, budgetMin: 0, budgetMax: 0, timeHorizon: 'medium', sponsor: '', kpis: ''
    });

    useEffect(() => {
        if (priority) {
            setFormData({ ...priority, kpis: priority.kpis.join('\n') });
        } else {
            setFormData({ code: '', name: '', description: '', weight: 0, minThreshold: 0, budgetMin: 0, budgetMax: 0, timeHorizon: 'medium', sponsor: '', kpis: '' });
        }
    }, [priority]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="modal-content border-slate-700 text-white max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{priority ? 'Edit' : 'Add'} Priority</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input placeholder="Code" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} required />
                    <Input placeholder="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                    <Textarea placeholder="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                    <Input type="number" placeholder="Weight" value={formData.weight} onChange={e => setFormData({ ...formData, weight: +e.target.value })} />
                    <Input type="number" placeholder="Budget Min" value={formData.budgetMin} onChange={e => setFormData({ ...formData, budgetMin: +e.target.value })} />
                    <Input type="number" placeholder="Budget Max" value={formData.budgetMax} onChange={e => setFormData({ ...formData, budgetMax: +e.target.value })} />
                    <Textarea placeholder="KPIs (one per line)" value={formData.kpis} onChange={e => setFormData({ ...formData, kpis: e.target.value })} />
                    <div className="flex justify-end space-x-2">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Save</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}


export function InvestmentPriorities() {
  const { state, addPriority, updatePriority, deletePriority, reorderPriorities } = useAllocationData()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPriority, setEditingPriority] = useState<Priority | undefined>()
  const [autoBalanceEnabled, setAutoBalanceEnabled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
  
  if (!state) {
    return <div className="p-6 text-center text-slate-400">Loading strategic priorities...</div>
  }

  const { priorities } = state
  
  const filteredPriorities = priorities.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const totalWeight = priorities.reduce((sum, p) => sum + p.weight, 0)
  
  const handleEdit = (priority: Priority) => {
    setEditingPriority(priority);
    setModalOpen(true);
  };
  
  const handleWeightChange = (id: string, weight: number) => {
    updatePriority(id, { weight });
  };
  
  const handleReorder = (dragIndex: number, hoverIndex: number) => {
    reorderPriorities(dragIndex, hoverIndex);
  };
  
  const handleAddPriority = () => {
    setEditingPriority(undefined);
    setModalOpen(true);
  };

  const handleSavePriority = (formData: PriorityFormData) => {
    const kpis = formData.kpis.split('\n').filter(Boolean);
    if (editingPriority) {
      updatePriority(editingPriority.id, { ...formData, kpis });
    } else {
      addPriority({ ...formData, kpis, color: PRIORITY_COLORS[priorities.length % PRIORITY_COLORS.length] });
    }
  };

  return (
    <div className="space-y-6 p-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">Investment Priorities</h2>
                    <p className="text-slate-400">Define and weight strategic priorities to guide allocation.</p>
                </div>
            </div>
            <div className="flex items-center space-x-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search priorities..." className="search-input w-64" />
                </div>
                <Button onClick={handleAddPriority} className="btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Priority
                </Button>
            </div>
        </div>

        <div className="card-primary space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 p-4 bg-slate-800/50 rounded-lg border border-slate-600">
                <div className="flex flex-wrap items-center gap-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={autoBalanceEnabled} onChange={(e) => setAutoBalanceEnabled(e.target.checked)} className="rounded border-slate-500 text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm font-medium text-slate-300">Auto-balance weights</span>
                    </label>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="text-right">
                        <div className="text-xs text-slate-400">Total Weight</div>
                        <div className={cn("text-lg font-mono font-bold", totalWeight === 100 ? "text-green-400" : "text-red-400")}>{totalWeight}%</div>
                    </div>
                    {totalWeight !== 100 && (
                        <div className="flex items-center space-x-2 px-3 py-2 bg-red-900/20 border border-red-500/30 rounded-lg">
                            <AlertCircle className="w-4 h-4 text-red-400" />
                            <span className="text-xs text-red-300 font-medium">Must be 100%</span>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="space-y-4">
                {filteredPriorities.map((priority, index) => (
                    <PriorityCard key={priority.id} priority={priority} index={index} onEdit={handleEdit} onWeightChange={handleWeightChange} onReorder={handleReorder} />
                ))}
            </div>
        </div>

        <PriorityModal isOpen={modalOpen} onClose={() => setModalOpen(false)} priority={editingPriority} onSave={handleSavePriority} />
    </div>
  );
}
