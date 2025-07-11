// Tab3_PortfolioBuilder.tsx - ALL logic for Portfolio Construction tab
'use client'
import React, { useState, useEffect } from 'react';
import { BusinessDomain, Project } from './types';
import { formatCurrency, calculatePortfolioMetrics } from './mockData';

interface TabProps {
  sharedData: {
    domains?: BusinessDomain[];
    projects?: Project[];
  };
  onDataUpdate: (data: { projects: Project[] }) => void;
}

export const PortfolioBuilderTab: React.FC<TabProps> = ({ sharedData, onDataUpdate }) => {
  // ===== STATE SECTION =====
  const [domains] = useState<BusinessDomain[]>(sharedData.domains || []);
  const [projects, setProjects] = useState<Project[]>(sharedData.projects || []);
  const [selectedDomain, setSelectedDomain] = useState<string>(domains[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedProject, setDraggedProject] = useState<Project | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // ===== HANDLERS SECTION =====
  const handleDragStart = (e: React.DragEvent, project: Project) => {
    setDraggedProject(project);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', project.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (draggedProject && selectedDomain) {
      const updatedProjects = projects.map(p => {
        if (p.id === draggedProject.id) {
          const rankedProjects = projects.filter(proj => proj.domain === selectedDomain && proj.isSelected);
          return { ...p, isSelected: true, portfolioRank: rankedProjects.length + 1 };
        }
        return p;
      });
      
      setProjects(updatedProjects);
      onDataUpdate({ projects: updatedProjects });
    }
    
    setDraggedProject(null);
  };

  const removeFromPortfolio = (projectId: string) => {
    const updatedProjects = projects.map(p => {
      if (p.id === projectId) {
        return { ...p, isSelected: false, portfolioRank: 0 };
      }
      return p;
    }).map((p, index) => {
      // Reorder remaining projects
      if (p.domain === selectedDomain && p.isSelected) {
        const domainSelectedProjects = projects.filter(proj => proj.domain === selectedDomain && proj.isSelected && proj.id !== projectId);
        const newRank = domainSelectedProjects.findIndex(proj => proj.id === p.id) + 1;
        return { ...p, portfolioRank: newRank };
      }
      return p;
    });
    
    setProjects(updatedProjects);
    onDataUpdate({ projects: updatedProjects });
  };

  const reorderProject = (projectId: string, newRank: number) => {
    const updatedProjects = projects.map(p => {
      if (p.id === projectId) {
        return { ...p, portfolioRank: newRank };
      }
      return p;
    });
    
    setProjects(updatedProjects);
    onDataUpdate({ projects: updatedProjects });
  };

  const toggleMustHave = (projectId: string) => {
    const updatedProjects = projects.map(p => {
      if (p.id === projectId) {
        return { ...p, status: p.status === 'selected' ? 'available' as const : 'selected' as const };
      }
      return p;
    });
    
    setProjects(updatedProjects);
    onDataUpdate({ projects: updatedProjects });
  };

  // ===== CALCULATIONS =====
  const selectedDomainObj = domains.find(d => d.id === selectedDomain);
  const availableProjects = projects.filter(p => 
    p.domain === selectedDomain && 
    !p.isSelected &&
    (!p.status || p.status === 'available') &&
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const rankedProjects = projects
    .filter(p => p.domain === selectedDomain && p.isSelected)
    .sort((a, b) => (a.portfolioRank || 0) - (b.portfolioRank || 0));

  const domainBudgetUsed = rankedProjects.reduce((sum, p) => sum + p.capex, 0);
  const domainBudgetRemaining = (selectedDomainObj?.budget || 0) - domainBudgetUsed;
  const isOverBudget = domainBudgetUsed > (selectedDomainObj?.budget || 0);

  const allSelectedProjects = projects.filter(p => p.isSelected);
  const portfolioMetrics = calculatePortfolioMetrics(allSelectedProjects);
  
  // Enhanced portfolio analytics
  const riskDistribution = {
    low: allSelectedProjects.filter(p => p.riskScore <= 3).length,
    medium: allSelectedProjects.filter(p => p.riskScore >= 4 && p.riskScore <= 6).length,
    high: allSelectedProjects.filter(p => p.riskScore >= 7).length
  };
  
  const strategicFitAvg = allSelectedProjects.length > 0 ? 
    allSelectedProjects.reduce((sum, p) => sum + (p.strategicFit || 0), 0) / allSelectedProjects.length : 0;
  
  const checkBudgetConstraints = (project: Project) => {
    const domain = domains.find(d => d.id === project.domain);
    if (!domain) return true;
    const currentSpend = rankedProjects.reduce((sum, p) => sum + p.capex, 0);
    return (currentSpend + project.capex) <= domain.budget;
  };

  // ===== EFFECTS SECTION =====
  useEffect(() => {
    if (domains.length > 0 && !selectedDomain) {
      setSelectedDomain(domains[0].id);
    }
  }, [domains]);

  // ===== SUB-COMPONENTS SECTION =====
  const DomainSelector = () => (
    <div className="domain-selector">
      <h3>Select Domain</h3>
      <select 
        value={selectedDomain} 
        onChange={(e) => setSelectedDomain(e.target.value)}
        className="domain-select"
      >
        {domains.map(domain => (
          <option key={domain.id} value={domain.id}>
            {domain.icon} {domain.name}
          </option>
        ))}
      </select>
      
      {selectedDomainObj && (
        <div className="domain-info">
          <div className="budget-info">
            <span className="label">Budget:</span>
            <span className="value">{formatCurrency(selectedDomainObj.budget)}</span>
          </div>
          <div className="budget-used">
            <span className="label">Used:</span>
            <span className={`value ${isOverBudget ? 'over-budget' : ''}`}>
              {formatCurrency(domainBudgetUsed)}
            </span>
          </div>
          <div className="budget-remaining">
            <span className="label">Remaining:</span>
            <span className={`value ${isOverBudget ? 'over-budget' : ''}`}>
              {formatCurrency(domainBudgetRemaining)}
            </span>
          </div>
          <div className="domain-constraints">
            <div className="constraint">Min IRR: {selectedDomainObj.minIRR}%</div>
            <div className="constraint">Max Payback: {selectedDomainObj.maxPayback} years</div>
            <div className="constraint">Risk: {selectedDomainObj.riskTolerance}</div>
          </div>
        </div>
      )}
    </div>
  );

  const ProjectItem = ({ project, isDraggable = true }: { project: Project, isDraggable?: boolean }) => (
    <div 
      className={`project-item ${isDraggable ? 'draggable' : ''}`}
      draggable={isDraggable}
      onDragStart={(e) => isDraggable && handleDragStart(e, project)}
    >
      <div className="project-header">
        <div className="project-name">{project.name}</div>
        <div className="project-id">{project.id}</div>
      </div>
      <div className="project-metrics">
        <div className="metric">
          <span className="metric-label">CAPEX</span>
          <span className="metric-value">{formatCurrency(project.capex)}</span>
        </div>
        <div className="metric">
          <span className="metric-label">NPV</span>
          <span className={`metric-value ${project.npv >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(project.npv)}
          </span>
        </div>
        <div className="metric">
          <span className="metric-label">IRR</span>
          <span className="metric-value">{project.irr.toFixed(1)}%</span>
        </div>
      </div>
      <div className="project-risk">
        <span className={`risk-badge risk-${project.risk}`}>
          {project.risk} risk ({project.riskScore}/10)
        </span>
        {project.strategicFit && (
          <span className="strategic-fit">
            Fit: {project.strategicFit}/10
          </span>
        )}
      </div>
    </div>
  );

  const RankedProjectItem = ({ project, rank }: { project: Project, rank: number }) => (
    <div className={`ranked-project ${project.status === 'selected' ? 'must-have' : ''}`}>
      <div className="rank-number">{rank}</div>
      <div className="project-content">
        <ProjectItem project={project} isDraggable={false} />
      </div>
      <div className="project-actions">
        <button 
          className={`must-have-btn ${project.status === 'selected' ? 'active' : ''}`}
          onClick={() => toggleMustHave(project.id)}
          title="Toggle Must Have"
        >
          📌
        </button>
        <button 
          className="remove-btn"
          onClick={() => removeFromPortfolio(project.id)}
          title="Remove from Portfolio"
        >
          ✕
        </button>
      </div>
    </div>
  );

  // ===== RENDER SECTION =====
  return (
    <div className="tab-portfolio-builder">
      <div className="left-panel">
        <DomainSelector />
      </div>

      <div className="center-panel">
        <div className="panel-header">
          <h3>Available Projects</h3>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        
        <div className="available-projects">
          {availableProjects.map(project => (
            <ProjectItem key={project.id} project={project} />
          ))}
          
          {availableProjects.length === 0 && (
            <div className="empty-state">
              <p>No available projects in this domain</p>
            </div>
          )}
        </div>
      </div>

      <div className="right-panel">
        <div className="panel-header">
          <h3>Portfolio Ranking</h3>
          <div className="project-count">{rankedProjects.length} projects</div>
        </div>
        
        <div 
          className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {rankedProjects.length === 0 ? (
            <div className="drop-placeholder">
              <div className="drop-icon">📋</div>
              <p>Drag projects here to rank them</p>
            </div>
          ) : (
            <div className="ranked-projects">
              {rankedProjects.map((project, index) => (
                <RankedProjectItem 
                  key={project.id} 
                  project={project} 
                  rank={index + 1}
                />
              ))}
            </div>
          )}
        </div>

        <div className="portfolio-metrics">
          <h4>Real-time Portfolio Analytics</h4>
          <div className="metrics-grid">
            <div className="metric-card">
              <span className="metric-label">Selected Projects</span>
              <span className="metric-value">{portfolioMetrics.projectCount}</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Total CAPEX</span>
              <span className="metric-value">{formatCurrency(portfolioMetrics.totalCapex)}</span>
              <span className="metric-subtitle">
                {((portfolioMetrics.totalCapex / 1000000000) * 100).toFixed(1)}% of $1B
              </span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Portfolio NPV</span>
              <span className={`metric-value ${portfolioMetrics.totalNPV >= 0 ? 'positive' : 'negative'}`}>
                {formatCurrency(portfolioMetrics.totalNPV)}
              </span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Weighted IRR</span>
              <span className="metric-value">{portfolioMetrics.portfolioIRR.toFixed(1)}%</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Avg Payback</span>
              <span className="metric-value">{portfolioMetrics.avgPayback} years</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Avg Risk Score</span>
              <span className="metric-value">{portfolioMetrics.avgRisk}/10</span>
            </div>
          </div>
          
          <div className="risk-distribution">
            <h5>Risk Distribution</h5>
            <div className="risk-bars">
              <div className="risk-bar">
                <span className="risk-label">Low Risk</span>
                <div className="risk-bar-fill" style={{ width: `${allSelectedProjects.length > 0 ? (riskDistribution.low / allSelectedProjects.length) * 100 : 0}%` }}></div>
                <span className="risk-count">{riskDistribution.low}</span>
              </div>
              <div className="risk-bar">
                <span className="risk-label">Medium Risk</span>
                <div className="risk-bar-fill" style={{ width: `${allSelectedProjects.length > 0 ? (riskDistribution.medium / allSelectedProjects.length) * 100 : 0}%` }}></div>
                <span className="risk-count">{riskDistribution.medium}</span>
              </div>
              <div className="risk-bar">
                <span className="risk-label">High Risk</span>
                <div className="risk-bar-fill" style={{ width: `${allSelectedProjects.length > 0 ? (riskDistribution.high / allSelectedProjects.length) * 100 : 0}%` }}></div>
                <span className="risk-count">{riskDistribution.high}</span>
              </div>
            </div>
          </div>
          
          <div className="strategic-metrics">
            <div className="metric-card">
              <span className="metric-label">Avg Strategic Fit</span>
              <span className="metric-value">{strategicFitAvg.toFixed(1)}/10</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Budget Efficiency</span>
              <span className="metric-value">
                {portfolioMetrics.totalCapex > 0 ? (portfolioMetrics.totalNPV / portfolioMetrics.totalCapex * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};