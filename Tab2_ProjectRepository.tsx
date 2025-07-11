// Tab2_ProjectRepository.tsx - ALL logic for Project Repository tab
'use client'
import React, { useState, useEffect } from 'react';
import { BusinessDomain, Project } from './types';
import { defaultProjects, formatCurrency, formatPercent, calculateNPV, calculateIRR } from './mockData';

interface TabProps {
  sharedData: {
    domains?: BusinessDomain[];
    projects?: Project[];
  };
  onDataUpdate: (data: { projects: Project[] }) => void;
}

export const ProjectRepositoryTab: React.FC<TabProps> = ({ sharedData, onDataUpdate }) => {
  // ===== STATE SECTION =====
  const [projects, setProjects] = useState<Project[]>(sharedData.projects || defaultProjects);
  const [domains] = useState<BusinessDomain[]>(sharedData.domains || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'npv' | 'irr' | 'capex'>('npv');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: '',
    projectId: '',
    category: 'renewable_energy',
    description: '',
    sponsor: '',
    status: 'available',
    capex: 0,
    opex: 0,
    revenuePotential: 0,
    savingsPotential: 0,
    riskLevel: 'medium',
    riskScore: 5,
    businessUnit: '',
    geography: '',
    duration: 12,
    cashFlows: []
  });

  // ===== HANDLERS SECTION =====
  const updateProjectStatus = (projectId: string, status: Project['status']) => {
    const updatedProjects = projects.map(project => {
      if (project.id === projectId) {
        return { ...project, status, isSelected: status === 'selected' };
      }
      return project;
    });
    setProjects(updatedProjects);
    onDataUpdate({ projects: updatedProjects });
  };

  const bulkUpdateProjects = (projectIds: string[], updates: Partial<Project>) => {
    const updatedProjects = projects.map(project => {
      if (projectIds.includes(project.id)) {
        return { ...project, ...updates };
      }
      return project;
    });
    setProjects(updatedProjects);
    onDataUpdate({ projects: updatedProjects });
  };

  const updateExistingProject = () => {
    if (!editingProject || !editingProject.name || !editingProject.projectId) return;
    
    const updatedProjects = projects.map(p => {
      if (p.id === editingProject.id) {
        return { ...editingProject, updatedAt: new Date() };
      }
      return p;
    });
    
    setProjects(updatedProjects);
    onDataUpdate({ projects: updatedProjects });
    setEditingProject(null);
  };

  const addNewProject = () => {
    if (!newProject.name || !newProject.projectId) return;
    
    const cashFlows = newProject.cashFlows || [
      { year: 0, amount: -(newProject.capex || 0) },
      { year: 1, amount: (newProject.revenuePotential || 0) + (newProject.savingsPotential || 0) },
      { year: 2, amount: (newProject.revenuePotential || 0) + (newProject.savingsPotential || 0) },
      { year: 3, amount: (newProject.revenuePotential || 0) + (newProject.savingsPotential || 0) },
      { year: 4, amount: (newProject.revenuePotential || 0) + (newProject.savingsPotential || 0) },
      { year: 5, amount: (newProject.revenuePotential || 0) + (newProject.savingsPotential || 0) }
    ];
    
    const npv = calculateNPV(cashFlows);
    const irr = calculateIRR(cashFlows);
    const paybackYears = calculatePaybackPeriod(cashFlows) / 12;
    
    const project: Project = {
      id: `PROJ-${Date.now()}`,
      projectId: newProject.projectId!,
      name: newProject.name!,
      category: newProject.category || 'technology',
      description: newProject.description || '',
      sponsor: newProject.sponsor || '',
      status: 'available',
      capex: newProject.capex || 0,
      opex: newProject.opex || 0,
      revenuePotential: newProject.revenuePotential || 0,
      savingsPotential: newProject.savingsPotential || 0,
      npv,
      irr,
      mirr: irr * 0.8,
      paybackYears: paybackYears,
      riskLevel: newProject.riskLevel || 'medium',
      risk: (newProject.riskLevel || 'medium') as 'low' | 'medium' | 'high',
      riskScore: newProject.riskScore || 5,
      domain: newProject.domain || domains[0]?.id || 'DOM-001',
      businessUnit: newProject.businessUnit || '',
      geography: newProject.geography || '',
      duration: newProject.duration || 12,
      isSelected: false,
      portfolioRank: 0,
      quarterlyAllocation: [],
      cashFlows,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const updatedProjects = [...projects, project];
    setProjects(updatedProjects);
    onDataUpdate({ projects: updatedProjects });
    setShowAddModal(false);
    resetNewProject();
  };

  const resetNewProject = () => {
    setNewProject({
      name: '',
      projectId: '',
      category: 'renewable_energy',
      description: '',
      sponsor: '',
      status: 'available',
      capex: 0,
      opex: 0,
      revenuePotential: 0,
      savingsPotential: 0,
      riskLevel: 'medium',
      riskScore: 5,
      businessUnit: '',
      geography: '',
      duration: 12,
      cashFlows: []
    });
  };

  const calculatePaybackPeriod = (cashFlows: { year: number; amount: number }[]): number => {
    let cumulativeCashFlow = 0;
    for (let i = 0; i < cashFlows.length; i++) {
      cumulativeCashFlow += cashFlows[i].amount;
      if (cumulativeCashFlow > 0) {
        return i * 12; // Convert to months
      }
    }
    return cashFlows.length * 12;
  };

  const toggleDomainExpansion = (domainId: string) => {
    const newExpanded = new Set(expandedDomains);
    if (newExpanded.has(domainId)) {
      newExpanded.delete(domainId);
    } else {
      newExpanded.add(domainId);
    }
    setExpandedDomains(newExpanded);
  };

  const importProjectsFromCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split('\n');
      const headers = lines[0].split(',');
      
      const importedProjects: Project[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length >= headers.length) {
          const projectData: any = {};
          headers.forEach((header, index) => {
            projectData[header.trim()] = values[index]?.trim();
          });
          
          if (projectData.name && projectData.projectId) {
            const cashFlows = [
              { year: 0, amount: -(parseFloat(projectData.capex) || 0) },
              { year: 1, amount: parseFloat(projectData.revenuePotential) || 0 },
              { year: 2, amount: parseFloat(projectData.revenuePotential) || 0 },
              { year: 3, amount: parseFloat(projectData.revenuePotential) || 0 },
              { year: 4, amount: parseFloat(projectData.revenuePotential) || 0 },
              { year: 5, amount: parseFloat(projectData.revenuePotential) || 0 }
            ];
            
            const project: Project = {
              id: `IMPORT-${Date.now()}-${i}`,
              projectId: projectData.projectId,
              name: projectData.name,
              category: projectData.category || 'technology',
              description: projectData.description || '',
              sponsor: projectData.sponsor || '',
              status: 'available',
              capex: parseFloat(projectData.capex) || 0,
              opex: parseFloat(projectData.opex) || 0,
              revenuePotential: parseFloat(projectData.revenuePotential) || 0,
              savingsPotential: parseFloat(projectData.savingsPotential) || 0,
              npv: calculateNPV(cashFlows),
              irr: calculateIRR(cashFlows),
              mirr: calculateIRR(cashFlows) * 0.8,
              paybackYears: calculatePaybackPeriod(cashFlows),
              riskLevel: (projectData.riskLevel as any) || 'medium',
              risk: ((projectData.riskLevel as any) || 'medium') as 'low' | 'medium' | 'high',
              riskScore: parseInt(projectData.riskScore) || 5,
              domain: projectData.domain || domains[0]?.id || 'DOM-001',
              businessUnit: projectData.businessUnit || '',
              geography: projectData.geography || '',
              duration: parseInt(projectData.duration) || 12,
              isSelected: false,
              portfolioRank: 0,
              quarterlyAllocation: [],
              cashFlows,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            
            importedProjects.push(project);
          }
        }
      }
      
      const updatedProjects = [...projects, ...importedProjects];
      setProjects(updatedProjects);
      onDataUpdate({ projects: updatedProjects });
    };
    
    reader.readAsText(file);
  };

  // ===== FILTERING AND SORTING =====
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (project.projectId?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDomain = selectedDomain === 'all' || project.domain === selectedDomain;
    const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory;
    const matchesRisk = selectedRisk === 'all' || project.risk === selectedRisk || project.riskLevel === selectedRisk;
    
    return matchesSearch && matchesDomain && matchesCategory && matchesRisk;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'npv':
        comparison = a.npv - b.npv;
        break;
      case 'irr':
        comparison = a.irr - b.irr;
        break;
      case 'capex':
        comparison = a.capex - b.capex;
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const projectsByDomain = selectedDomain === 'all' 
    ? domains.map(domain => ({
        domain,
        projects: sortedProjects.filter(p => p.domain === domain.id)
      }))
    : domains.filter(domain => domain.id === selectedDomain).map(domain => ({
        domain,
        projects: sortedProjects.filter(p => p.domain === domain.id)
      }));

  // ===== EFFECTS SECTION =====
  useEffect(() => {
    // Expand all domains by default
    setExpandedDomains(new Set(domains.map(d => d.id)));
  }, [domains]);

  // ===== CALCULATIONS =====
  const totalProjects = filteredProjects.length;
  const selectedProjects = filteredProjects.filter(p => p.status === 'selected').length;
  const totalCapex = filteredProjects.reduce((sum, p) => sum + p.capex, 0);
  const totalNPV = filteredProjects.reduce((sum, p) => sum + p.npv, 0);
  const avgIRR = filteredProjects.length > 0 ? filteredProjects.reduce((sum, p) => sum + p.irr, 0) / filteredProjects.length : 0;

  // ===== SUB-COMPONENTS SECTION =====
  const ProjectCard = ({ project }: { project: Project }) => (
    <div className={`project-card ${project.status}`}>
      <div className="project-card-header">
        <div>
          <h4 className="project-card-title">{project.name}</h4>
          <p className="project-card-id">{project.projectId}</p>
        </div>
        <span className={`project-card-status status-${project.status}`}>
          {project.status}
        </span>
      </div>
      
      <div className="project-card-metrics">
        <div className="project-metric">
          <span className="project-metric-label">CAPEX</span>
          <span className="project-metric-value">{formatCurrency(project.capex)}</span>
        </div>
        <div className="project-metric">
          <span className="project-metric-label">NPV</span>
          <span className={`project-metric-value ${project.npv >= 0 ? 'text-green' : 'text-red'}`}>
            {formatCurrency(project.npv)}
          </span>
        </div>
        <div className="project-metric">
          <span className="project-metric-label">IRR</span>
          <span className="project-metric-value">{formatPercent(project.irr)}</span>
        </div>
        <div className="project-metric">
          <span className="project-metric-label">Risk</span>
          <span className={`project-metric-value risk-${project.risk || project.riskLevel}`}>
            {project.risk || project.riskLevel}
          </span>
        </div>
        <div className="project-metric">
          <span className="project-metric-label">Duration</span>
          <span className="project-metric-value">{project.duration}mo</span>
        </div>
        <div className="project-metric">
          <span className="project-metric-label">Payback</span>
          <span className="project-metric-value">{project.paybackYears.toFixed(1)} yr</span>
        </div>
      </div>
      
      <p className="project-card-description">{project.description}</p>
      
      <div className="project-card-actions">
        {project.status === 'available' && (
          <button
            className="project-action-btn btn-select"
            onClick={() => updateProjectStatus(project.id, 'selected')}
          >
            Select
          </button>
        )}
        {project.status === 'selected' && (
          <button
            className="project-action-btn btn-exclude"
            onClick={() => updateProjectStatus(project.id, 'available')}
          >
            Deselect
          </button>
        )}
        <button
          className="project-action-btn btn-exclude"
          onClick={() => updateProjectStatus(project.id, 'excluded')}
        >
          Exclude
        </button>
        <button
          className="project-action-btn btn-edit"
          onClick={() => setEditingProject(project)}
        >
          Edit
        </button>
      </div>
    </div>
  );

  const DomainSection = ({ domain, projects }: { domain: BusinessDomain; projects: Project[] }) => {
    const isExpanded = expandedDomains.has(domain.id);
    const domainStats = {
      totalProjects: projects.length,
      totalCapex: projects.reduce((sum, p) => sum + p.capex, 0),
      avgIRR: projects.length > 0 ? projects.reduce((sum, p) => sum + p.irr, 0) / projects.length : 0,
      selectedCount: projects.filter(p => p.status === 'selected').length
    };
    
    return (
      <div className="domain-section">
        <div 
          className="domain-section-header"
          onClick={() => toggleDomainExpansion(domain.id)}
        >
          <div className="domain-section-title">
            <span className="domain-section-icon">{domain.icon}</span>
            <span className="domain-section-name">{domain.name}</span>
            <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
          </div>
          <div className="domain-section-stats">
            <span>{domainStats.totalProjects} projects</span>
            <span>{formatCurrency(domainStats.totalCapex)} CAPEX</span>
            <span>{formatPercent(domainStats.avgIRR)} avg IRR</span>
            <span>{domainStats.selectedCount} selected</span>
          </div>
        </div>
        
        {isExpanded && (
          <div className="domain-section-content">
            {projects.length > 0 ? (
              <div className="project-grid">
                {projects.map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No projects in this domain matching current filters.</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const EditProjectModal = () => (
    <div className="modal-overlay" onClick={() => setEditingProject(null)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Edit Project</h2>
        <form onSubmit={(e) => { e.preventDefault(); updateExistingProject(); }}>
          <div className="form-row">
            <div className="form-group">
              <label>Project ID</label>
              <input
                type="text"
                value={editingProject?.projectId || ''}
                onChange={(e) => setEditingProject(prev => prev ? {...prev, projectId: e.target.value} : null)}
                placeholder="PROJ-001"
                required
              />
            </div>
            <div className="form-group">
              <label>Project Name</label>
              <input
                type="text"
                value={editingProject?.name || ''}
                onChange={(e) => setEditingProject(prev => prev ? {...prev, name: e.target.value} : null)}
                placeholder="Project name"
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={editingProject?.description || ''}
              onChange={(e) => setEditingProject(prev => prev ? {...prev, description: e.target.value} : null)}
              placeholder="Project description"
              rows={3}
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Domain</label>
              <select
                value={editingProject?.domain || ''}
                onChange={(e) => setEditingProject(prev => prev ? {...prev, domain: e.target.value} : null)}
              >
                {domains.map(domain => (
                  <option key={domain.id} value={domain.id}>{domain.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Category</label>
              <select
                value={editingProject?.category || 'renewable_energy'}
                onChange={(e) => setEditingProject(prev => prev ? {...prev, category: e.target.value} : null)}
              >
                <option value="renewable_energy">Renewable Energy</option>
                <option value="energy_storage">Energy Storage</option>
                <option value="geothermal">Geothermal</option>
                <option value="grid_infrastructure">Grid Infrastructure</option>
                <option value="hydrogen">Hydrogen</option>
                <option value="hydroelectric">Hydroelectric</option>
                <option value="cybersecurity">Cybersecurity</option>
                <option value="space_technology">Space Technology</option>
                <option value="unmanned_systems">Unmanned Systems</option>
                <option value="electronic_warfare">Electronic Warfare</option>
                <option value="radar_systems">Radar Systems</option>
                <option value="space_surveillance">Space Surveillance</option>
                <option value="quantum_technology">Quantum Technology</option>
                <option value="biotechnology">Biotechnology</option>
                <option value="medical_ai">Medical AI</option>
                <option value="medical_robotics">Medical Robotics</option>
                <option value="genomics">Genomics</option>
                <option value="diagnostics">Diagnostics</option>
                <option value="telemedicine">Telemedicine</option>
                <option value="digital_health">Digital Health</option>
                <option value="digital_transformation">Digital Transformation</option>
                <option value="process_improvement">Process Improvement</option>
                <option value="product_launch">Product Launch</option>
                <option value="innovation">Innovation</option>
                <option value="research_development">Research & Development</option>
                <option value="development">Development</option>
                <option value="test_facilities">Test Facilities</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="sustainability">Sustainability</option>
                <option value="compliance">Compliance</option>
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>CAPEX ($)</label>
              <input
                type="number"
                value={editingProject?.capex || ''}
                onChange={(e) => setEditingProject(prev => prev ? {...prev, capex: parseFloat(e.target.value) || 0} : null)}
                min="0"
                step="1000"
              />
            </div>
            <div className="form-group">
              <label>Annual Revenue ($)</label>
              <input
                type="number"
                value={editingProject?.revenuePotential || ''}
                onChange={(e) => setEditingProject(prev => prev ? {...prev, revenuePotential: parseFloat(e.target.value) || 0} : null)}
                min="0"
                step="1000"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Risk Level</label>
              <select
                value={editingProject?.riskLevel || 'medium'}
                onChange={(e) => {
                  const riskLevel = e.target.value as 'low' | 'medium' | 'high';
                  setEditingProject(prev => prev ? {...prev, riskLevel, risk: riskLevel} : null);
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="form-group">
              <label>Risk Score (1-10)</label>
              <input
                type="number"
                value={editingProject?.riskScore || ''}
                onChange={(e) => setEditingProject(prev => prev ? {...prev, riskScore: parseInt(e.target.value) || 5} : null)}
                min="1"
                max="10"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Duration (months)</label>
              <input
                type="number"
                value={editingProject?.duration || ''}
                onChange={(e) => setEditingProject(prev => prev ? {...prev, duration: parseInt(e.target.value) || 12} : null)}
                min="1"
                max="120"
              />
            </div>
            <div className="form-group">
              <label>Strategic Fit (1-10)</label>
              <input
                type="number"
                value={editingProject?.strategicFit || ''}
                onChange={(e) => setEditingProject(prev => prev ? {...prev, strategicFit: parseInt(e.target.value) || 5} : null)}
                min="1"
                max="10"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Sponsor</label>
            <input
              type="text"
              value={editingProject?.sponsor || ''}
              onChange={(e) => setEditingProject(prev => prev ? {...prev, sponsor: e.target.value} : null)}
              placeholder="Executive sponsor"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Business Unit</label>
              <input
                type="text"
                value={editingProject?.businessUnit || ''}
                onChange={(e) => setEditingProject(prev => prev ? {...prev, businessUnit: e.target.value} : null)}
                placeholder="Business unit"
              />
            </div>
            <div className="form-group">
              <label>Geography</label>
              <input
                type="text"
                value={editingProject?.geography || ''}
                onChange={(e) => setEditingProject(prev => prev ? {...prev, geography: e.target.value} : null)}
                placeholder="Location"
              />
            </div>
          </div>
          
          <div className="modal-actions">
            <button type="button" onClick={() => setEditingProject(null)}>Cancel</button>
            <button type="submit">Update Project</button>
          </div>
        </form>
      </div>
    </div>
  );

  const AddProjectModal = () => (
    <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Add New Project</h2>
        <form onSubmit={(e) => { e.preventDefault(); addNewProject(); }}>
          <div className="form-row">
            <div className="form-group">
              <label>Project ID</label>
              <input
                type="text"
                value={newProject.projectId || ''}
                onChange={(e) => setNewProject({...newProject, projectId: e.target.value})}
                placeholder="PROJ-001"
                required
              />
            </div>
            <div className="form-group">
              <label>Project Name</label>
              <input
                type="text"
                value={newProject.name || ''}
                onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                placeholder="Project name"
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={newProject.description || ''}
              onChange={(e) => setNewProject({...newProject, description: e.target.value})}
              placeholder="Project description"
              rows={3}
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Domain</label>
              <select
                value={newProject.domain || ''}
                onChange={(e) => setNewProject({...newProject, domain: e.target.value})}
              >
                {domains.map(domain => (
                  <option key={domain.id} value={domain.id}>{domain.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Category</label>
              <select
                value={newProject.category || 'renewable_energy'}
                onChange={(e) => setNewProject({...newProject, category: e.target.value})}
              >
                <option value="renewable_energy">Renewable Energy</option>
                <option value="energy_storage">Energy Storage</option>
                <option value="geothermal">Geothermal</option>
                <option value="grid_infrastructure">Grid Infrastructure</option>
                <option value="hydrogen">Hydrogen</option>
                <option value="hydroelectric">Hydroelectric</option>
                <option value="cybersecurity">Cybersecurity</option>
                <option value="space_technology">Space Technology</option>
                <option value="unmanned_systems">Unmanned Systems</option>
                <option value="electronic_warfare">Electronic Warfare</option>
                <option value="radar_systems">Radar Systems</option>
                <option value="space_surveillance">Space Surveillance</option>
                <option value="quantum_technology">Quantum Technology</option>
                <option value="biotechnology">Biotechnology</option>
                <option value="medical_ai">Medical AI</option>
                <option value="medical_robotics">Medical Robotics</option>
                <option value="genomics">Genomics</option>
                <option value="diagnostics">Diagnostics</option>
                <option value="telemedicine">Telemedicine</option>
                <option value="digital_health">Digital Health</option>
                <option value="digital_transformation">Digital Transformation</option>
                <option value="process_improvement">Process Improvement</option>
                <option value="product_launch">Product Launch</option>
                <option value="innovation">Innovation</option>
                <option value="research_development">Research & Development</option>
                <option value="development">Development</option>
                <option value="test_facilities">Test Facilities</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="sustainability">Sustainability</option>
                <option value="compliance">Compliance</option>
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>CAPEX ($)</label>
              <input
                type="number"
                value={newProject.capex || ''}
                onChange={(e) => setNewProject({...newProject, capex: parseFloat(e.target.value) || 0})}
                min="0"
                step="1000"
              />
            </div>
            <div className="form-group">
              <label>Annual Revenue ($)</label>
              <input
                type="number"
                value={newProject.revenuePotential || ''}
                onChange={(e) => setNewProject({...newProject, revenuePotential: parseFloat(e.target.value) || 0})}
                min="0"
                step="1000"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Risk Level</label>
              <select
                value={newProject.riskLevel || 'medium'}
                onChange={(e) => setNewProject({...newProject, riskLevel: e.target.value as 'low' | 'medium' | 'high'})}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="form-group">
              <label>Duration (months)</label>
              <input
                type="number"
                value={newProject.duration || ''}
                onChange={(e) => setNewProject({...newProject, duration: parseInt(e.target.value) || 12})}
                min="1"
                max="120"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Sponsor</label>
            <input
              type="text"
              value={newProject.sponsor || ''}
              onChange={(e) => setNewProject({...newProject, sponsor: e.target.value})}
              placeholder="Executive sponsor"
            />
          </div>
          
          <div className="modal-actions">
            <button type="button" onClick={() => setShowAddModal(false)}>Cancel</button>
            <button type="submit">Add Project</button>
          </div>
        </form>
      </div>
    </div>
  );

  // ===== RENDER SECTION =====
  return (
    <div className="tab-project-repository">
      <div className="tab-header">
        <div className="header-content">
          <h1>Project Repository</h1>
          <p>Central repository of all projects organized by business domain</p>
        </div>
        <div className="header-actions">
          <label className="btn-secondary">
            Import CSV
            <input
              type="file"
              accept=".csv"
              onChange={importProjectsFromCSV}
              style={{ display: 'none' }}
            />
          </label>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            + Add Project
          </button>
        </div>
      </div>

      <div className="project-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Domains</option>
            {domains.map(domain => (
              <option key={domain.id} value={domain.id}>{domain.name}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            <option value="renewable_energy">Renewable Energy</option>
            <option value="energy_storage">Energy Storage</option>
            <option value="geothermal">Geothermal</option>
            <option value="grid_infrastructure">Grid Infrastructure</option>
            <option value="hydrogen">Hydrogen</option>
            <option value="hydroelectric">Hydroelectric</option>
            <option value="cybersecurity">Cybersecurity</option>
            <option value="space_technology">Space Technology</option>
            <option value="unmanned_systems">Unmanned Systems</option>
            <option value="electronic_warfare">Electronic Warfare</option>
            <option value="radar_systems">Radar Systems</option>
            <option value="space_surveillance">Space Surveillance</option>
            <option value="quantum_technology">Quantum Technology</option>
            <option value="biotechnology">Biotechnology</option>
            <option value="medical_ai">Medical AI</option>
            <option value="medical_robotics">Medical Robotics</option>
            <option value="genomics">Genomics</option>
            <option value="diagnostics">Diagnostics</option>
            <option value="telemedicine">Telemedicine</option>
            <option value="digital_health">Digital Health</option>
            <option value="digital_transformation">Digital Transformation</option>
            <option value="process_improvement">Process Improvement</option>
            <option value="product_launch">Product Launch</option>
            <option value="innovation">Innovation</option>
            <option value="research_development">Research & Development</option>
            <option value="development">Development</option>
            <option value="test_facilities">Test Facilities</option>
            <option value="infrastructure">Infrastructure</option>
            <option value="sustainability">Sustainability</option>
            <option value="compliance">Compliance</option>
          </select>
        </div>
        
        <div className="filter-group">
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Risk Levels</option>
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
          </select>
        </div>
        
        <div className="filter-group">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="filter-select"
          >
            <option value="npv">Sort by NPV</option>
            <option value="irr">Sort by IRR</option>
            <option value="capex">Sort by CAPEX</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
        
        <div className="filter-group">
          <button
            className="btn-secondary"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      <div className="summary-section">
        <div className="summary-cards">
          <div className="summary-card">
            <span className="summary-label">Total Projects</span>
            <span className="summary-value">{totalProjects}</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Selected</span>
            <span className="summary-value">{selectedProjects}</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Total CAPEX</span>
            <span className="summary-value">{formatCurrency(totalCapex)}</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Total NPV</span>
            <span className={`summary-value ${totalNPV >= 0 ? 'text-green' : 'text-red'}`}>
              {formatCurrency(totalNPV)}
            </span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Avg IRR</span>
            <span className="summary-value">{formatPercent(avgIRR)}</span>
          </div>
        </div>
      </div>

      <div className="domain-sections">
        {projectsByDomain.map(({ domain, projects }) => (
          <DomainSection key={domain.id} domain={domain} projects={projects} />
        ))}
      </div>

      {showAddModal && <AddProjectModal />}
      {editingProject && <EditProjectModal />}
    </div>
  );
};