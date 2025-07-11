// Tab4_BudgetAllocation.tsx - ALL logic for Temporal Budget Allocation tab
'use client'
import React, { useState, useEffect } from 'react';
import { BusinessDomain, Project } from './types';
import { formatCurrency, formatPercent, allocationPatterns } from './mockData';

interface TabProps {
  sharedData: {
    domains?: BusinessDomain[];
    projects?: Project[];
  };
  onDataUpdate: (data: { projects: Project[] }) => void;
}

export const BudgetAllocationTab: React.FC<TabProps> = ({ sharedData, onDataUpdate }) => {
  // ===== STATE SECTION =====
  const [domains] = useState<BusinessDomain[]>(sharedData.domains || []);
  const [projects, setProjects] = useState<Project[]>(sharedData.projects || []);
  const [quarterlyLimit, setQuarterlyLimit] = useState<number>(50000000); // $50M per quarter
  const [selectedPattern, setSelectedPattern] = useState<string>('even');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  // ===== QUARTER GENERATION =====
  const generateQuarters = () => {
    const quarters = [];
    const startYear = 2025;
    for (let year = startYear; year < startYear + 5; year++) {
      for (let q = 1; q <= 4; q++) {
        quarters.push(`Q${q}'${year.toString().slice(-2)}`);
      }
    }
    return quarters;
  };

  const quarters = generateQuarters();

  // ===== DISTRIBUTION PATTERNS =====
  const distributionPatterns = {
    even: 'evenSpread',
    frontLoaded: 'frontLoaded',
    backLoaded: 'backLoaded',
    sCurve: 'sCurve'
  };

  // ===== HANDLERS SECTION =====
  const applyDistributionPattern = (projectId: string, pattern: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const patternKey = distributionPatterns[pattern as keyof typeof distributionPatterns];
    const patternFunction = allocationPatterns[patternKey as keyof typeof allocationPatterns];
    
    if (!patternFunction) return;
    
    const quarterlyAmounts = patternFunction(project.capex, 4);

    const updatedProjects = projects.map(p => {
      if (p.id === projectId) {
        const newAllocation = quarters.slice(0, 4).map((quarter, index) => ({
          quarter,
          amount: Math.round(quarterlyAmounts[index] || 0)
        }));
        return { ...p, quarterlyAllocation: newAllocation };
      }
      return p;
    });

    setProjects(updatedProjects);
    onDataUpdate({ projects: updatedProjects });
  };

  const updateQuarterlyAmount = (projectId: string, quarter: string, amount: number) => {
    const updatedProjects = projects.map(p => {
      if (p.id === projectId) {
        const existingAllocation = p.quarterlyAllocation || [];
        const updatedAllocation = existingAllocation.map(qa => 
          qa.quarter === quarter ? { ...qa, amount } : qa
        );
        
        // Add new quarter if it doesn't exist
        if (!updatedAllocation.some(qa => qa.quarter === quarter)) {
          updatedAllocation.push({ quarter, amount });
        }
        
        return { ...p, quarterlyAllocation: updatedAllocation };
      }
      return p;
    });

    setProjects(updatedProjects);
    onDataUpdate({ projects: updatedProjects });
  };

  const bulkApplyPattern = (pattern: string) => {
    selectedProjects.forEach(projectId => {
      applyDistributionPattern(projectId, pattern);
    });
    setSelectedProjects([]);
  };

  const exportToExcel = () => {
    const selectedProjectsData = projects.filter(p => p.isSelected);
    const csvContent = generateCSVContent(selectedProjectsData);
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'budget-allocation.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateCSVContent = (projectsData: Project[]) => {
    const headers = ['Project', 'Domain', 'Total CAPEX', ...quarters];
    const rows = projectsData.map(project => {
      const domain = domains.find(d => d.id === project.domain);
      const row = [
        project.name,
        domain?.name || '',
        formatCurrency(project.capex),
        ...quarters.map(q => {
          const allocation = project.quarterlyAllocation?.find(qa => qa.quarter === q);
          return allocation ? formatCurrency(allocation.amount) : '$0';
        })
      ];
      return row.join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  };

  // ===== CALCULATIONS =====
  const selectedProjectsData = projects.filter(p => p.isSelected);
  const quarterlyTotals = quarters.map(quarter => {
    return selectedProjectsData.reduce((sum, project) => {
      const allocation = project.quarterlyAllocation?.find(qa => qa.quarter === quarter);
      return sum + (allocation?.amount || 0);
    }, 0);
  });

  const quarterlyAvailable = quarters.map((quarter, index) => {
    return quarterlyLimit - quarterlyTotals[index];
  });

  const projectsByDomain = domains.map(domain => ({
    domain,
    projects: selectedProjectsData.filter(p => p.domain === domain.id)
  }));

  // ===== SUB-COMPONENTS SECTION =====
  const BudgetCell = ({ 
    project, 
    quarter, 
    value, 
    isOverBudget 
  }: { 
    project: Project; 
    quarter: string; 
    value: number; 
    isOverBudget: boolean;
  }) => (
    <div className={`budget-cell ${isOverBudget ? 'over-budget' : ''}`}>
      <input
        type="number"
        value={value || ''}
        onChange={(e) => updateQuarterlyAmount(project.id, quarter, parseFloat(e.target.value) || 0)}
        className="budget-input"
        min="0"
        step="100000"
      />
    </div>
  );

  const ProjectRow = ({ project }: { project: Project }) => {
    const domain = domains.find(d => d.id === project.domain);
    const totalAllocated = project.quarterlyAllocation?.reduce((sum, qa) => sum + qa.amount, 0) || 0;
    const isComplete = Math.abs(totalAllocated - project.capex) < 1000;

    return (
      <div className="project-row">
        <div className="project-info">
          <div className="project-name">{project.name}</div>
          <div className="project-domain">{domain?.name}</div>
          <div className="project-id">{project.id}</div>
        </div>
        
        <div className="project-controls">
          <select 
            value={selectedPattern}
            onChange={(e) => applyDistributionPattern(project.id, e.target.value)}
            className="pattern-select"
          >
            <option value="even">Even Spread</option>
            <option value="frontLoaded">Front-loaded</option>
            <option value="backLoaded">Back-loaded</option>
            <option value="sCurve">S-Curve</option>
          </select>
          
          <div className="project-total">
            <span className="total-label">Total:</span>
            <span className={`total-value ${isComplete ? 'complete' : 'incomplete'}`}>
              {formatCurrency(totalAllocated)} / {formatCurrency(project.capex)}
            </span>
          </div>
        </div>

        <div className="quarter-cells">
          {quarters.map(quarter => {
            const allocation = project.quarterlyAllocation?.find(qa => qa.quarter === quarter);
            const quarterIndex = quarters.indexOf(quarter);
            const isOverBudget = quarterlyTotals[quarterIndex] > quarterlyLimit;
            
            return (
              <BudgetCell
                key={quarter}
                project={project}
                quarter={quarter}
                value={allocation?.amount || 0}
                isOverBudget={isOverBudget}
              />
            );
          })}
        </div>
      </div>
    );
  };

  const QuarterlyTotalsRow = () => (
    <div className="quarterly-totals-row">
      <div className="totals-label">Quarterly Totals</div>
      <div className="quarter-totals">
        {quarters.map((quarter, index) => (
          <div 
            key={quarter}
            className={`quarter-total ${quarterlyTotals[index] > quarterlyLimit ? 'over-limit' : ''}`}
          >
            {formatCurrency(quarterlyTotals[index])}
          </div>
        ))}
      </div>
    </div>
  );

  const QuarterlyLimitsRow = () => (
    <div className="quarterly-limits-row">
      <div className="limits-label">Quarterly Limits</div>
      <div className="quarter-limits">
        {quarters.map(quarter => (
          <div key={quarter} className="quarter-limit">
            {formatCurrency(quarterlyLimit)}
          </div>
        ))}
      </div>
    </div>
  );

  const QuarterlyAvailableRow = () => (
    <div className="quarterly-available-row">
      <div className="available-label">Available</div>
      <div className="quarter-available">
        {quarters.map((quarter, index) => (
          <div 
            key={quarter}
            className={`quarter-available ${quarterlyAvailable[index] < 0 ? 'negative' : ''}`}
          >
            {formatCurrency(quarterlyAvailable[index])}
          </div>
        ))}
      </div>
    </div>
  );

  // ===== RENDER SECTION =====
  return (
    <div className="tab-budget-allocation">
      <div className="tab-header">
        <div className="header-content">
          <h1>Temporal Budget Allocation</h1>
          <p>Distribute project budgets across quarters for cash flow planning</p>
        </div>
        <div className="header-actions">
          <div className="quarterly-limit-control">
            <label>Quarterly Limit:</label>
            <input
              type="number"
              value={quarterlyLimit / 1000000}
              onChange={(e) => setQuarterlyLimit(parseFloat(e.target.value) * 1000000 || 0)}
              className="limit-input"
              min="1"
              step="1"
            />
            <span>$M</span>
          </div>
          <button className="btn-secondary" onClick={exportToExcel}>
            Export to Excel
          </button>
        </div>
      </div>

      <div className="allocation-controls">
        <div className="bulk-controls">
          <span>Bulk Apply Pattern:</span>
          <select 
            value={selectedPattern}
            onChange={(e) => setSelectedPattern(e.target.value)}
            className="pattern-select"
          >
            <option value="even">Even Spread (25-25-25-25)</option>
            <option value="frontLoaded">Front-loaded (40-30-20-10)</option>
            <option value="backLoaded">Back-loaded (10-20-30-40)</option>
            <option value="sCurve">S-Curve (smooth acceleration)</option>
          </select>
          <button 
            className="btn-primary"
            onClick={() => bulkApplyPattern(selectedPattern)}
            disabled={selectedProjects.length === 0}
          >
            Apply to Selected
          </button>
        </div>
        
        <div className="summary-stats">
          <div className="stat">
            <span className="stat-label">Projects:</span>
            <span className="stat-value">{selectedProjectsData.length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Total CAPEX:</span>
            <span className="stat-value">
              {formatCurrency(selectedProjectsData.reduce((sum, p) => sum + p.capex, 0))}
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">Critical Quarters:</span>
            <span className={`stat-value ${quarterlyTotals.filter((total, index) => total > quarterlyLimit).length > 0 ? 'error' : 'success'}`}>
              {quarterlyTotals.filter((total, index) => total > quarterlyLimit).length}
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">Avg Utilization:</span>
            <span className="stat-value">
              {quarterlyTotals.length > 0 ? formatPercent(((quarterlyTotals.reduce((sum, total) => sum + total, 0) / quarterlyTotals.length) / quarterlyLimit * 100)) : formatPercent(0)}
            </span>
          </div>
        </div>
      </div>

      <div className="budget-grid-container">
        <div className="budget-grid">
          <div className="grid-header">
            <div className="project-header">Project</div>
            <div className="quarters-header">
              {quarters.map(quarter => (
                <div key={quarter} className="quarter-header">{quarter}</div>
              ))}
            </div>
          </div>

          <div className="grid-body">
            {projectsByDomain.map(({ domain, projects }) => (
              <div key={domain.id} className="domain-section">
                <div className="domain-header">
                  <span className="domain-icon">{domain.icon}</span>
                  <span className="domain-name">{domain.name}</span>
                  <span className="domain-count">({projects.length} projects)</span>
                </div>
                
                {projects.map(project => (
                  <ProjectRow key={project.id} project={project} />
                ))}
              </div>
            ))}
            
            {selectedProjectsData.length === 0 && (
              <div className="empty-state">
                <p>No projects selected for budget allocation.</p>
                <p>Select projects in the Portfolio Builder tab first.</p>
              </div>
            )}
          </div>

          {selectedProjectsData.length > 0 && (
            <div className="grid-footer">
              <QuarterlyTotalsRow />
              <QuarterlyLimitsRow />
              <QuarterlyAvailableRow />
            </div>
          )}
        </div>
      </div>

      <div className="cash-flow-visualization">
        <h3>Cash Flow Projection</h3>
        <div className="chart-container">
          <svg width="100%" height="300" className="cash-flow-chart">
            <defs>
              <linearGradient id="cashFlowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1"/>
              </linearGradient>
            </defs>
            
            {quarters.slice(0, 12).map((quarter, index) => {
              const height = (quarterlyTotals[index] / quarterlyLimit) * 200;
              const x = (index * 60) + 40;
              const isOver = quarterlyTotals[index] > quarterlyLimit;
              
              return (
                <g key={quarter}>
                  <rect
                    x={x}
                    y={250 - height}
                    width="40"
                    height={height}
                    fill={isOver ? "#ef4444" : "#3b82f6"}
                    opacity="0.7"
                  />
                  <text
                    x={x + 20}
                    y={270}
                    textAnchor="middle"
                    className="chart-label"
                  >
                    {quarter}
                  </text>
                </g>
              );
            })}
            
            <line x1="30" y1="50" x2="750" y2="50" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5" />
            <text x="760" y="55" className="chart-label">Limit</text>
          </svg>
        </div>
      </div>
    </div>
  );
};