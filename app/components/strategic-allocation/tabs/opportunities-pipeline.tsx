'use client'

import { useState, useRef } from 'react'
import { Upload, Plus, Kanban, Table, Circle, Edit, BarChart3, Search, Filter, Download, Eye, Trash2, Copy, MoreHorizontal, ArrowUpDown, Zap, TrendingUp, Clock, Target, Star, AlertTriangle, CheckCircle, XCircle, Calendar, Users, Building, MapPin, DollarSign } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
import { Label } from '../../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { useAllocationData } from '../../../hooks/use-allocation-data'
import { Project } from '../../../lib/data-models'
import { calculateNPV, calculateIRR, calculatePaybackPeriod } from '../../../lib/calculations'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../components/ui/dropdown-menu'
import { Progress } from '../../../components/ui/progress'
import { Alert, AlertDescription } from '../../../components/ui/alert'
import { cn } from '../../../lib/utils'

interface ProjectFormData {
  projectId: string
  name: string
  category: string
  description: string
  sponsor: string
  status: 'ideation' | 'evaluation' | 'ready' | 'approved' | 'rejected'
  initialCapex: number
  annualOpex: number
  revenuePotential: number
  savingsPotential: number
  riskLevel: 'low' | 'medium' | 'high'
  businessUnit: string
  geography: string
  priorityAlignment: string[]
  cashFlows: string
}

function ProjectCard({ project, onEdit, priorities }: { 
  project: Project, 
  onEdit: (project: Project) => void,
  priorities: any[]
}) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-400'
      case 'medium': return 'text-amber-400'
      case 'high': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }
  
  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `₹${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `₹${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
    return `₹${value.toFixed(0)}`;
  };

  return (
    <div 
      className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-4 transition-all duration-200 hover:bg-white/[0.04] hover:border-white/[0.1] cursor-pointer"
      onClick={() => onEdit(project)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="font-semibold text-white text-sm mb-1">{project.name}</h4>
          <p className="text-xs text-slate-500 font-mono">{project.projectId}</p>
        </div>
        <div className="text-right">
          <span className={cn("text-xs px-2 py-1 rounded", 
            project.riskLevel === 'low' ? 'bg-green-500/10 text-green-400' :
            project.riskLevel === 'medium' ? 'bg-amber-500/10 text-amber-400' :
            'bg-red-500/10 text-red-400'
          )}>
            {project.riskLevel} risk
          </span>
        </div>
      </div>
      
      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Investment</div>
          <div className="text-sm font-semibold text-white">{formatCurrency(project.initialCapex)}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">NPV</div>
          <div className={cn("text-sm font-semibold", project.npv >= 0 ? "text-green-400" : "text-red-400")}>
            {formatCurrency(project.npv)}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">IRR</div>
          <div className="text-sm font-semibold text-blue-400">{project.irr.toFixed(1)}%</div>
        </div>
      </div>
      
      {/* Priority Tags */}
      <div className="flex items-center gap-2 mb-3">
        {project.priorityAlignment.slice(0, 3).map((priorityId) => {
          const priority = priorities.find(p => p.id === priorityId);
          return (
            <div
              key={priorityId}
              className="w-6 h-6 rounded flex items-center justify-center text-xs font-medium text-white"
              style={{ backgroundColor: priority?.color || '#6b7280' }}
              title={priority?.name}
            >
              {priority?.code}
            </div>
          );
        })}
        {project.priorityAlignment.length > 3 && (
          <div className="w-6 h-6 rounded bg-slate-700 flex items-center justify-center text-xs text-slate-400">
            +{project.priorityAlignment.length - 3}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>{project.sponsor.split(',')[0]}</span>
        <span className="capitalize">{project.category}</span>
      </div>
    </div>
  );
}

function ProjectModal({ 
  isOpen, 
  onClose, 
  project, 
  onSave,
  priorities 
}: {
  isOpen: boolean
  onClose: () => void
  project?: Project
  onSave: (data: ProjectFormData) => void
  priorities: any[]
}) {
  const [formData, setFormData] = useState<ProjectFormData>({
    projectId: project?.projectId || '',
    name: project?.name || '',
    category: project?.category || 'technology',
    description: project?.description || '',
    sponsor: project?.sponsor || '',
    status: project?.status || 'ideation',
    initialCapex: project?.initialCapex || 0,
    annualOpex: project?.annualOpex || 0,
    revenuePotential: project?.revenuePotential || 0,
    savingsPotential: project?.savingsPotential || 0,
    riskLevel: project?.riskLevel || 'medium',
    businessUnit: project?.businessUnit || '',
    geography: project?.geography || '',
    priorityAlignment: project?.priorityAlignment || [],
    cashFlows: project?.cashFlows ? project.cashFlows.map(cf => `${cf.year}:${cf.amount}`).join(';') : ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{project ? 'Edit Project' : 'Add New Project'}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="general">
          <TabsList className="bg-slate-700">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="alignment">Alignment</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Project ID</Label>
                  <Input
                    value={formData.projectId}
                    onChange={(e) => setFormData({...formData, projectId: e.target.value})}
                    placeholder="PROJ-001"
                    className="bg-slate-700 border-slate-600"
                    required
                  />
                </div>
                <div>
                  <Label>Project Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Digital Platform Modernization"
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
                  rows={3}
                  className="bg-slate-700 border-slate-600"
                  placeholder="Detailed project description..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({...formData, category: value})}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="infrastructure">Infrastructure</SelectItem>
                      <SelectItem value="expansion">Market Expansion</SelectItem>
                      <SelectItem value="efficiency">Operational Efficiency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Risk Level</Label>
                  <Select
                    value={formData.riskLevel}
                    onValueChange={(value: 'low' | 'medium' | 'high') => setFormData({...formData, riskLevel: value})}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({...formData, status: value})}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="ideation">Ideation</SelectItem>
                      <SelectItem value="evaluation">Evaluation</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Business Unit</Label>
                  <Input
                    value={formData.businessUnit}
                    onChange={(e) => setFormData({...formData, businessUnit: e.target.value})}
                    placeholder="Technology"
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                <div>
                  <Label>Geography</Label>
                  <Input
                    value={formData.geography}
                    onChange={(e) => setFormData({...formData, geography: e.target.value})}
                    placeholder="Global"
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
              </div>

              <div>
                <Label>Executive Sponsor</Label>
                <Input
                  value={formData.sponsor}
                  onChange={(e) => setFormData({...formData, sponsor: e.target.value})}
                  placeholder="John Smith, CTO"
                  className="bg-slate-700 border-slate-600"
                  required
                />
              </div>
            </form>
          </TabsContent>

          <TabsContent value="financial" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Initial CAPEX ($M)</Label>
                <Input
                  type="number"
                  value={formData.initialCapex / 1000000}
                  onChange={(e) => setFormData({...formData, initialCapex: parseFloat(e.target.value) * 1000000 || 0})}
                  className="bg-slate-700 border-slate-600"
                />
              </div>
              <div>
                <Label>Annual OPEX ($M)</Label>
                <Input
                  type="number"
                  value={formData.annualOpex / 1000000}
                  onChange={(e) => setFormData({...formData, annualOpex: parseFloat(e.target.value) * 1000000 || 0})}
                  className="bg-slate-700 border-slate-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Revenue Potential ($M)</Label>
                <Input
                  type="number"
                  value={formData.revenuePotential / 1000000}
                  onChange={(e) => setFormData({...formData, revenuePotential: parseFloat(e.target.value) * 1000000 || 0})}
                  className="bg-slate-700 border-slate-600"
                />
              </div>
              <div>
                <Label>Cost Savings ($M)</Label>
                <Input
                  type="number"
                  value={formData.savingsPotential / 1000000}
                  onChange={(e) => setFormData({...formData, savingsPotential: parseFloat(e.target.value) * 1000000 || 0})}
                  className="bg-slate-700 border-slate-600"
                />
              </div>
            </div>

            <div>
              <Label>Cash Flows (format: year:amount; e.g., 0:-5000000;1:1200000;2:2500000)</Label>
              <Textarea
                value={formData.cashFlows}
                onChange={(e) => setFormData({...formData, cashFlows: e.target.value})}
                placeholder="0:-5000000;1:1200000;2:2500000;3:3200000;4:3800000;5:4200000"
                className="bg-slate-700 border-slate-600"
                rows={3}
              />
            </div>
          </TabsContent>

          <TabsContent value="alignment" className="space-y-4">
            <div>
              <Label>Priority Alignment</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {priorities.map(priority => (
                  <label key={priority.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.priorityAlignment.includes(priority.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            priorityAlignment: [...formData.priorityAlignment, priority.id]
                          })
                        } else {
                          setFormData({
                            ...formData,
                            priorityAlignment: formData.priorityAlignment.filter(id => id !== priority.id)
                          })
                        }
                      }}
                      className="rounded"
                    />
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: priority.color }}
                      />
                      <span className="text-sm text-white">{priority.name}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {project ? 'Update Project' : 'Add Project'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function OpportunitiesPipeline() {
  const { state, addProject, updateProject } = useAllocationData()
  const [view, setView] = useState<'kanban' | 'table' | 'bubble'>('kanban')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | undefined>()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedRisk, setSelectedRisk] = useState<string>('all')
  
  if (!state) {
    return <div className="p-6 text-center">Loading...</div>
  }

  const { projects, priorities } = state
  
  const handleAddProject = () => {
    setEditingProject(undefined)
    setModalOpen(true)
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setModalOpen(true)
  }

  const handleSaveProject = (formData: ProjectFormData) => {
    // Parse cash flows
    const cashFlows = formData.cashFlows
      ? formData.cashFlows.split(';').map(cf => {
          const [year, amount] = cf.split(':')
          return { year: parseInt(year), amount: parseFloat(amount) }
        }).filter(cf => !isNaN(cf.year) && !isNaN(cf.amount))
      : []

    // Calculate financial metrics
    const npv = calculateNPV(cashFlows)
    const irr = calculateIRR(cashFlows)
    const paybackPeriod = calculatePaybackPeriod(cashFlows)

    const projectData = {
      ...formData,
      cashFlows,
      npv,
      irr,
      mirr: irr * 0.8, // Simplified MIRR calculation
      paybackPeriod,
      ebitdaImpact: (formData.revenuePotential + formData.savingsPotential) * 0.3
    }

    if (editingProject) {
      updateProject(editingProject.id, projectData)
    } else {
      addProject(projectData)
    }
  }

  // Filter projects based on search and filters
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.projectId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.sponsor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory;
    const matchesRisk = selectedRisk === 'all' || project.riskLevel === selectedRisk;
    return matchesSearch && matchesCategory && matchesRisk;
  });

  const statusCounts = {
    ideation: filteredProjects.filter(p => p.status === 'ideation').length,
    evaluation: filteredProjects.filter(p => p.status === 'evaluation').length,
    ready: filteredProjects.filter(p => p.status === 'ready').length,
    approved: filteredProjects.filter(p => p.status === 'approved').length,
    rejected: filteredProjects.filter(p => p.status === 'rejected').length
  };

  const totalValue = filteredProjects.reduce((sum, p) => sum + p.npv, 0);
  const totalInvestment = filteredProjects.reduce((sum, p) => sum + p.initialCapex, 0);

  const statusConfig = {
    ideation: { color: 'bg-slate-600', icon: Circle, label: 'Ideation', description: 'New concepts and ideas' },
    evaluation: { color: 'bg-amber-600', icon: Search, label: 'Evaluation', description: 'Under assessment' },
    ready: { color: 'bg-blue-600', icon: CheckCircle, label: 'Ready', description: 'Approved for funding' },
    approved: { color: 'bg-green-600', icon: Star, label: 'Approved', description: 'Funded and active' },
    rejected: { color: 'bg-red-600', icon: XCircle, label: 'Rejected', description: 'Not proceeding' }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white mb-1">Manage Projects</h1>
            <p className="text-sm text-slate-400">Track opportunities through the project lifecycle</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="px-4 py-2 border-slate-600 text-slate-300 hover:bg-slate-700">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button onClick={handleAddProject} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Add Project
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Total Projects</div>
            <div className="text-lg font-semibold text-white">{filteredProjects.length}</div>
            <div className="text-xs text-slate-500 mt-1">In Pipeline</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Total Value</div>
            <div className={cn("text-lg font-semibold", totalValue >= 0 ? "text-green-400" : "text-red-400")}>
              ₹{(totalValue / 1000000000).toFixed(1)}B
            </div>
            <div className="text-xs text-slate-500 mt-1">NPV</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Investment</div>
            <div className="text-lg font-semibold text-white">₹{(totalInvestment / 1000000000).toFixed(1)}B</div>
            <div className="text-xs text-slate-500 mt-1">Required</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Ready</div>
            <div className="text-lg font-semibold text-blue-400">{statusCounts.ready + statusCounts.approved}</div>
            <div className="text-xs text-slate-500 mt-1">For Funding</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                placeholder="Search projects..." 
                className="pl-10 pr-4 py-2 w-80 bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:border-slate-600"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48 bg-slate-800 border-slate-700 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="infrastructure">Infrastructure</SelectItem>
                <SelectItem value="expansion">Market Expansion</SelectItem>
                <SelectItem value="efficiency">Operational Efficiency</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedRisk} onValueChange={setSelectedRisk}>
              <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="All Risk Levels" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={view === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('kanban')}
              className="px-4 py-2 text-sm"
            >
              <Kanban className="w-4 h-4 mr-2" />
              Pipeline
            </Button>
            <Button
              variant={view === 'bubble' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('bubble')}
              className="px-4 py-2 text-sm"
            >
              <Circle className="w-4 h-4 mr-2" />
              Analysis
            </Button>
          </div>
        </div>

        {/* Kanban View */}
        {view === 'kanban' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {(['ideation', 'evaluation', 'ready', 'approved', 'rejected'] as const).map(status => {
              const config = statusConfig[status];
              const StatusIcon = config.icon;
              const statusProjects = filteredProjects.filter(p => p.status === status);
              const statusValue = statusProjects.reduce((sum, p) => sum + p.npv, 0);
              
              return (
                <div key={status} className="flex flex-col">
                  {/* Column Header */}
                  <div className="bg-white/[0.02] border border-white/[0.08] rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-8 h-8 rounded flex items-center justify-center", config.color)}>
                          <StatusIcon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-sm">{config.label}</h3>
                          <p className="text-xs text-slate-400">{config.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">{statusCounts[status]}</div>
                        <div className="text-xs text-slate-400">projects</div>
                      </div>
                    </div>
                    {statusValue !== 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-700">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-500">Total Value</span>
                          <span className={cn(
                            "text-xs font-semibold",
                            statusValue >= 0 ? "text-green-400" : "text-red-400"
                          )}>
                            ₹{(statusValue / 1000000).toFixed(1)}M
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Projects Column */}
                  <div className="flex-1 space-y-4 min-h-[400px]">
                    {statusProjects.map(project => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onEdit={handleEditProject}
                        priorities={priorities}
                      />
                    ))}
                    {statusCounts[status] === 0 && (
                      <div className="flex flex-col items-center justify-center py-12 text-slate-500 bg-slate-800/30 rounded-lg border-2 border-dashed border-slate-700">
                        <StatusIcon className="w-12 h-12 text-slate-600 mb-3" />
                        <p className="text-sm font-medium mb-1">No projects in {config.label.toLowerCase()}</p>
                        <p className="text-xs text-slate-600">Add projects to get started</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bubble Chart View */}
        {view === 'bubble' && (
          <div className="bg-white/[0.02] border border-white/[0.08] rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Risk vs Return Analysis</h3>
                <p className="text-sm text-slate-400">Bubble size represents investment amount, position shows risk/return profile</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded border border-slate-700">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span className="text-xs text-slate-300">High Return</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded border border-slate-700">
                  <div className="w-2 h-2 rounded-full bg-red-400"></div>
                  <span className="text-xs text-slate-300">High Risk</span>
                </div>
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
              <ResponsiveContainer width="100%" height={500}>
                <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    dataKey="npv" 
                    name="NPV" 
                    unit="M"
                    type="number"
                    domain={['dataMin', 'dataMax']}
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8' }}
                    label={{ value: 'Net Present Value (₹M)', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fill: '#94a3b8' } }}
                  />
                  <YAxis 
                    dataKey="risk" 
                    name="Risk Score"
                    type="number"
                    domain={[0, 4]}
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8' }}
                    label={{ value: 'Risk Level', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#94a3b8' } }}
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload[0]) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-slate-800 border border-slate-600 rounded-lg p-4 shadow-xl">
                            <p className="text-white font-bold mb-2">{data.name}</p>
                            <div className="space-y-1">
                              <p className="text-slate-400 text-sm">NPV: ₹{(data.npv / 1000000).toFixed(1)}M</p>
                              <p className="text-slate-400 text-sm">Investment: ₹{(data.investment / 1000000).toFixed(1)}M</p>
                              <p className="text-slate-400 text-sm">Risk: {data.riskLevel}</p>
                              <p className="text-slate-400 text-sm">IRR: {data.irr.toFixed(1)}%</p>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Scatter
                    name="Projects"
                    data={filteredProjects.map(p => ({
                      npv: p.npv / 1000000,
                      risk: p.riskLevel === 'low' ? 1 : p.riskLevel === 'medium' ? 2 : 3,
                      investment: p.initialCapex,
                      name: p.name,
                      riskLevel: p.riskLevel,
                      irr: p.irr
                    }))}
                    fill="#3b82f6"
                  >
                    {filteredProjects.map((project, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={project.riskLevel === 'low' ? '#10b981' : project.riskLevel === 'medium' ? '#f59e0b' : '#ef4444'}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No projects in pipeline</h3>
            <p className="text-slate-400 mb-4">Add your first project to start managing the opportunities pipeline</p>
            <Button onClick={handleAddProject} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
              <Plus className="w-4 h-4 mr-2" />
              Add First Project
            </Button>
          </div>
        )}

      </div>

      <ProjectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        project={editingProject}
        onSave={handleSaveProject}
        priorities={priorities}
      />
    </div>

  );

  function getCategoryIcon(category: string) {
    switch (category) {
      case 'technology': return Zap;
      case 'infrastructure': return Building;
      case 'expansion': return TrendingUp;
      case 'efficiency': return Target;
      default: return Circle;
    }
  }
}