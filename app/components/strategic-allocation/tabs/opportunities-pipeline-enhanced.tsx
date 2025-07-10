'use client'

import { useState, useRef } from 'react'
import { Upload, Plus, Kanban, Table, Circle, Edit, BarChart3, Search, Filter, Download, Eye, Trash2, Copy, MoreHorizontal, ArrowUpDown } from 'lucide-react'
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

interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  width?: string
  render?: (value: any, project: Project) => React.ReactNode
}

function ProjectCard({ project, onEdit, onDelete, onClone, priorities }: { 
  project: Project
  onEdit: (project: Project) => void
  onDelete: (projectId: string) => void
  onClone: (project: Project) => void
  priorities: any[]
}) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-500'
      case 'medium': return 'bg-amber-500'
      case 'high': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="p-4 bg-slate-700 rounded-lg border border-slate-600 hover:border-blue-500 transition-all">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-semibold text-white">{project.name}</h4>
          <p className="text-xs text-slate-400">{project.projectId}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={`${getRiskColor(project.riskLevel)} text-white text-xs`}>
            {project.riskLevel}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-800 border-slate-700">
              <DropdownMenuItem onClick={() => onEdit(project)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onClone(project)}>
                <Copy className="w-4 h-4 mr-2" />
                Clone
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(project.id)}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Capital</span>
          <span className="text-white font-mono">${(project.initialCapex / 1000000).toFixed(1)}M</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">NPV</span>
          <span className="text-green-400 font-mono">${(project.npv / 1000000).toFixed(1)}M</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">IRR</span>
          <span className="text-blue-400 font-mono">{project.irr.toFixed(1)}%</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex -space-x-2">
          {project.priorityAlignment.slice(0, 3).map((priorityId, index) => {
            const priority = priorities.find(p => p.id === priorityId)
            return (
              <div
                key={priorityId}
                className="w-6 h-6 rounded-full border-2 border-slate-700 flex items-center justify-center text-xs text-white"
                style={{ backgroundColor: priority?.color || '#6b7280' }}
                title={priority?.name}
              >
                {priority?.code}
              </div>
            )
          })}
          {project.priorityAlignment.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-slate-600 border-2 border-slate-700 flex items-center justify-center text-xs text-white">
              +{project.priorityAlignment.length - 3}
            </div>
          )}
        </div>
        <span className="text-xs text-slate-400">{project.sponsor.split(',')[0]}</span>
      </div>
    </div>
  )
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

export function OpportunitiesPipelineEnhanced() {
  const { state, addProject, updateProject, deleteProject } = useAllocationData()
  const [view, setView] = useState<'kanban' | 'table' | 'bubble'>('kanban')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | undefined>()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [riskFilter, setRiskFilter] = useState<string>('all')
  const [sortColumn, setSortColumn] = useState<string>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [importProgress, setImportProgress] = useState(0)
  const [importErrors, setImportErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  
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

  const handleDeleteProject = (projectId: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      deleteProject(projectId)
      setSelectedProjects(prev => prev.filter(id => id !== projectId))
    }
  }
  
  const handleCloneProject = (project: Project) => {
    const clonedProject = {
      ...project,
      projectId: `${project.projectId}-COPY`,
      name: `${project.name} (Copy)`,
      status: 'ideation' as const
    }
    delete (clonedProject as any).id
    addProject(clonedProject)
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

  const handleBulkImport = () => {
    fileInputRef.current?.click()
  }
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    setImportProgress(0)
    setImportErrors([])
    
    try {
      const text = await file.text()
      const lines = text.split('\n')
      const headers = lines[0].split(',')
      
      const requiredFields = ['projectId', 'name', 'description', 'sponsor']
      const missingFields = requiredFields.filter(field => !headers.includes(field))
      
      if (missingFields.length > 0) {
        setImportErrors([`Missing required columns: ${missingFields.join(', ')}`])
        return
      }
      
      const projectsToImport = []
      const errors = []
      
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue
        
        const values = lines[i].split(',')
        const project: any = {}
        
        headers.forEach((header, index) => {
          project[header.trim()] = values[index]?.trim() || ''
        })
        
        try {
          const processedProject = {
            projectId: project.projectId,
            name: project.name,
            description: project.description || '',
            sponsor: project.sponsor,
            category: project.category || 'technology',
            status: (project.status || 'ideation') as any,
            initialCapex: parseFloat(project.initialCapex) || 0,
            annualOpex: parseFloat(project.annualOpex) || 0,
            revenuePotential: parseFloat(project.revenuePotential) || 0,
            savingsPotential: parseFloat(project.savingsPotential) || 0,
            riskLevel: (project.riskLevel || 'medium') as any,
            businessUnit: project.businessUnit || '',
            geography: project.geography || '',
            priorityAlignment: project.priorityAlignment ? project.priorityAlignment.split(';') : [],
            cashFlows: project.cashFlows ? project.cashFlows.split(';').map((cf: string) => {
              const [year, amount] = cf.split(':')
              return { year: parseInt(year), amount: parseFloat(amount) }
            }) : [],
            npv: 0,
            irr: 0,
            mirr: 0,
            paybackPeriod: 0,
            ebitdaImpact: 0
          }
          
          projectsToImport.push(processedProject)
        } catch (error) {
          errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Invalid data format'}`)
        }
        
        setImportProgress((i / (lines.length - 1)) * 100)
      }
      
      if (errors.length > 0) {
        setImportErrors(errors)
      }
      
      // Import valid projects
      for (const project of projectsToImport) {
        const cashFlows = project.cashFlows
        const npv = calculateNPV(cashFlows)
        const irr = calculateIRR(cashFlows)
        const paybackPeriod = calculatePaybackPeriod(cashFlows)
        
        addProject({
          ...project,
          npv,
          irr,
          mirr: irr * 0.8,
          paybackPeriod,
          ebitdaImpact: (project.revenuePotential + project.savingsPotential) * 0.3
        })
      }
      
      setImportProgress(100)
      
    } catch (error) {
      setImportErrors([`Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`])
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
  
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }
  
  const handleExport = () => {
    const csvContent = [
      // Headers
      ['projectId', 'name', 'description', 'sponsor', 'category', 'status', 'initialCapex', 'annualOpex', 'revenuePotential', 'savingsPotential', 'npv', 'irr', 'paybackPeriod', 'riskLevel', 'businessUnit', 'geography'].join(','),
      // Data
      ...filteredAndSortedProjects.map(project => [
        project.projectId,
        `"${project.name}"`,
        `"${project.description}"`,
        `"${project.sponsor}"`,
        project.category,
        project.status,
        project.initialCapex,
        project.annualOpex,
        project.revenuePotential,
        project.savingsPotential,
        project.npv,
        project.irr,
        project.paybackPeriod,
        project.riskLevel,
        `"${project.businessUnit}"`,
        `"${project.geography}"`
      ].join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `opportunities-pipeline-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }
  
  // Filter and sort projects
  const filteredAndSortedProjects = projects
    .filter(project => {
      const matchesSearch = searchTerm === '' || 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.projectId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.sponsor.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter
      const matchesRisk = riskFilter === 'all' || project.riskLevel === riskFilter
      
      return matchesSearch && matchesStatus && matchesRisk
    })
    .sort((a, b) => {
      let aValue: any = a[sortColumn as keyof Project]
      let bValue: any = b[sortColumn as keyof Project]
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })
  
  const tableColumns: TableColumn[] = [
    {
      key: 'select',
      label: '',
      width: '40px',
      render: (_, project) => (
        <input
          type="checkbox"
          checked={selectedProjects.includes(project.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedProjects(prev => [...prev, project.id])
            } else {
              setSelectedProjects(prev => prev.filter(id => id !== project.id))
            }
          }}
        />
      )
    },
    { key: 'projectId', label: 'ID', sortable: true, width: '100px' },
    { key: 'name', label: 'Project Name', sortable: true, width: '200px' },
    { 
      key: 'status', 
      label: 'Status', 
      sortable: true, 
      width: '120px',
      render: (value) => (
        <Badge className={cn(
          'text-xs',
          value === 'ideation' && 'bg-gray-500',
          value === 'evaluation' && 'bg-blue-500',
          value === 'ready' && 'bg-green-500',
          value === 'approved' && 'bg-purple-500',
          value === 'rejected' && 'bg-red-500'
        )}>
          {value}
        </Badge>
      )
    },
    { 
      key: 'initialCapex', 
      label: 'Investment', 
      sortable: true, 
      width: '120px',
      render: (value) => `$${(value / 1000000).toFixed(1)}M`
    },
    { 
      key: 'npv', 
      label: 'NPV', 
      sortable: true, 
      width: '120px',
      render: (value) => `$${(value / 1000000).toFixed(1)}M`
    },
    { 
      key: 'irr', 
      label: 'IRR', 
      sortable: true, 
      width: '80px',
      render: (value) => `${value.toFixed(1)}%`
    },
    { 
      key: 'riskLevel', 
      label: 'Risk', 
      sortable: true, 
      width: '80px',
      render: (value) => (
        <Badge className={cn(
          'text-xs',
          value === 'low' && 'bg-green-500',
          value === 'medium' && 'bg-amber-500',
          value === 'high' && 'bg-red-500'
        )}>
          {value}
        </Badge>
      )
    },
    { key: 'sponsor', label: 'Sponsor', sortable: true, width: '150px' },
    {
      key: 'actions',
      label: 'Actions',
      width: '100px',
      render: (_, project) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-slate-800 border-slate-700">
            <DropdownMenuItem onClick={() => handleEditProject(project)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCloneProject(project)}>
              <Copy className="w-4 h-4 mr-2" />
              Clone
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDeleteProject(project.id)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ]

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">2. Opportunities Pipeline</h2>
          <p className="text-slate-400">Comprehensive catalog of potential projects and investments</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleBulkImport}>
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleAddProject}>
            <Plus className="w-4 h-4 mr-2" />
            Add Project
          </Button>
        </div>
      </div>
      
      {/* Hidden file input for bulk import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="hidden"
      />
      
      {/* Import Progress */}
      {importProgress > 0 && importProgress < 100 && (
        <Alert>
          <AlertDescription>
            <div className="flex items-center space-x-2">
              <span>Importing projects...</span>
              <Progress value={importProgress} className="flex-1" />
              <span>{Math.round(importProgress)}%</span>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Import Errors */}
      {importErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertDescription>
            <div className="space-y-1">
              <div className="font-medium">Import errors:</div>
              {importErrors.slice(0, 5).map((error, index) => (
                <div key={index} className="text-sm">{error}</div>
              ))}
              {importErrors.length > 5 && (
                <div className="text-sm">... and {importErrors.length - 5} more errors</div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Controls Row */}
      <div className="flex items-center justify-between">
        {/* View Toggle */}
        <div className="flex space-x-2">
          <Button
            variant={view === 'kanban' ? 'default' : 'outline'}
            onClick={() => setView('kanban')}
          >
            <Kanban className="w-4 h-4 mr-2" />
            Pipeline
          </Button>
          <Button
            variant={view === 'table' ? 'default' : 'outline'}
            onClick={() => setView('table')}
          >
            <Table className="w-4 h-4 mr-2" />
            Table
          </Button>
          <Button
            variant={view === 'bubble' ? 'default' : 'outline'}
            onClick={() => setView('bubble')}
          >
            <Circle className="w-4 h-4 mr-2" />
            Bubble Chart
          </Button>
        </div>
        
        {/* Search and Filters */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-700 border-slate-600 w-64"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 bg-slate-700 border-slate-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ideation">Ideation</SelectItem>
              <SelectItem value="evaluation">Evaluation</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-32 bg-slate-700 border-slate-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="all">All Risk</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Kanban View */}
      {view === 'kanban' && (
        <div className="grid grid-cols-5 gap-4">
          {(['ideation', 'evaluation', 'ready', 'approved', 'rejected'] as const).map(status => (
            <div key={status} className="bg-slate-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white capitalize">{status}</h3>
                <Badge variant="secondary">
                  {filteredAndSortedProjects.filter(p => p.status === status).length}
                </Badge>
              </div>
              <div className="space-y-3">
                {filteredAndSortedProjects
                  .filter(p => p.status === status)
                  .map(project => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onEdit={handleEditProject}
                      onDelete={handleDeleteProject}
                      onClone={handleCloneProject}
                      priorities={priorities}
                    />
                  ))}
                {filteredAndSortedProjects.filter(p => p.status === status).length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <p className="text-sm">No projects in {status}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Table View */}
      {view === 'table' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Project Portfolio Table</CardTitle>
                <CardDescription>Detailed view of all projects with sorting and filtering</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                {selectedProjects.length > 0 && (
                  <span className="text-sm text-slate-400">
                    {selectedProjects.length} selected
                  </span>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-600">
                    {tableColumns.map(column => (
                      <th 
                        key={column.key}
                        className={cn(
                          "text-left py-3 px-4 text-slate-300 font-medium",
                          column.width && `w-[${column.width}]`,
                          column.sortable && "cursor-pointer hover:text-white"
                        )}
                        onClick={() => column.sortable && handleSort(column.key)}
                      >
                        <div className="flex items-center space-x-1">
                          <span>{column.label}</span>
                          {column.sortable && (
                            <ArrowUpDown className={cn(
                              "w-4 h-4",
                              sortColumn === column.key ? "text-blue-400" : "text-slate-500"
                            )} />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedProjects.map(project => (
                    <tr key={project.id} className="border-b border-slate-700 hover:bg-slate-800/50">
                      {tableColumns.map(column => (
                        <td key={column.key} className="py-3 px-4 text-slate-200">
                          {column.render 
                            ? column.render(project[column.key as keyof Project], project)
                            : String(project[column.key as keyof Project] || '')
                          }
                        </td>
                      ))}
                    </tr>
                  ))}
                  {filteredAndSortedProjects.length === 0 && (
                    <tr>
                      <td colSpan={tableColumns.length} className="py-8 text-center text-slate-500">
                        No projects found matching current filters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bubble Chart View */}
      {view === 'bubble' && (
        <Card>
          <CardHeader>
            <CardTitle>Risk vs Return Analysis</CardTitle>
            <CardDescription>Bubble size represents investment amount</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="npv" 
                  name="NPV" 
                  unit="M"
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  stroke="#94a3b8"
                />
                <YAxis 
                  dataKey="risk" 
                  name="Risk Score"
                  type="number"
                  domain={[0, 4]}
                  stroke="#94a3b8"
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload[0]) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-slate-800 border border-slate-600 rounded p-3">
                          <p className="text-white font-medium">{data.name}</p>
                          <p className="text-slate-400">NPV: ${(data.npv / 1000000).toFixed(1)}M</p>
                          <p className="text-slate-400">Investment: ${(data.investment / 1000000).toFixed(1)}M</p>
                          <p className="text-slate-400">Risk: {data.riskLevel}</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Scatter
                  name="Projects"
                  data={filteredAndSortedProjects.map(p => ({
                    npv: p.npv / 1000000,
                    risk: p.riskLevel === 'low' ? 1 : p.riskLevel === 'medium' ? 2 : 3,
                    investment: p.initialCapex,
                    name: p.name,
                    riskLevel: p.riskLevel
                  }))}
                  fill="#3b82f6"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <ProjectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        project={editingProject}
        onSave={handleSaveProject}
        priorities={priorities}
      />
    </div>
  )
}