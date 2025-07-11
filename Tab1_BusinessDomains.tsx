// Tab1_BusinessDomains.tsx - ALL logic for Business Domains tab
'use client'
import React, { useState, useEffect } from 'react';
import { BusinessDomain } from './types';
import { defaultBusinessDomains, formatCurrency, formatPercent, autoBalanceBudgets, filterProjectsByRisk } from './mockData';

interface TabProps {
  sharedData: {
    domains?: BusinessDomain[];
    totalBudget?: number;
  };
  onDataUpdate: (data: { domains: BusinessDomain[]; totalBudget: number }) => void;
}

export const BusinessDomainsTab: React.FC<TabProps> = ({ sharedData, onDataUpdate }) => {
  // ===== STATE SECTION =====
  const [domains, setDomains] = useState<BusinessDomain[]>(sharedData.domains || defaultBusinessDomains);
  const [totalBudget, setTotalBudget] = useState<number>(sharedData.totalBudget || 1000000000);
  const [budgetMode, setBudgetMode] = useState<'percentage' | 'dollar'>('percentage');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDomain, setEditingDomain] = useState<BusinessDomain | null>(null);
  const [newDomain, setNewDomain] = useState<Partial<BusinessDomain>>({
    name: '',
    code: '',
    description: '',
    icon: '💼',
    budgetPercent: 0,
    riskTolerance: 'medium',
    minIRR: 15,
    maxPayback: 5,
    strategicScore: 5,
    isActive: true,
    color: '#6b7280'
  });

  // ===== HANDLERS SECTION =====
  const updateDomainBudget = (id: string, value: number) => {
    const updatedDomains = domains.map(domain => {
      if (domain.id === id) {
        if (budgetMode === 'percentage') {
          return {
            ...domain,
            budgetPercent: value,
            budget: (value / 100) * totalBudget,
            remainingBudget: (value / 100) * totalBudget
          };
        } else {
          return {
            ...domain,
            budget: value,
            budgetPercent: (value / totalBudget) * 100,
            remainingBudget: value
          };
        }
      }
      return domain;
    });
    setDomains(updatedDomains);
    onDataUpdate({ domains: updatedDomains, totalBudget });
  };

  const autoBalanceDomainsHandler = () => {
    const activeDomains = domains.filter(d => d.isActive);
    const equalPercent = 100 / activeDomains.length;
    
    const updatedDomains = domains.map(domain => {
      if (domain.isActive) {
        return {
          ...domain,
          budgetPercent: Math.round(equalPercent * 100) / 100,
          budget: (equalPercent / 100) * totalBudget,
          remainingBudget: (equalPercent / 100) * totalBudget
        };
      }
      return domain;
    });
    
    setDomains(updatedDomains);
    onDataUpdate({ domains: updatedDomains, totalBudget });
  };

  const smartAutoBalance = (changedDomainId: string, newValue: number) => {
    const updatedDomains = autoBalanceBudgets(domains, changedDomainId, newValue);
    setDomains(updatedDomains);
    onDataUpdate({ domains: updatedDomains, totalBudget });
  };

  const toggleDomainActive = (id: string) => {
    const updatedDomains = domains.map(domain => {
      if (domain.id === id) {
        return { ...domain, isActive: !domain.isActive };
      }
      return domain;
    });
    setDomains(updatedDomains);
    onDataUpdate({ domains: updatedDomains, totalBudget });
  };

  const addNewDomainHandler = () => {
    if (!newDomain.name || !newDomain.code) return;
    
    const domain: BusinessDomain = {
      id: `DOM-${Date.now()}`,
      code: newDomain.code!,
      name: newDomain.name!,
      description: newDomain.description || '',
      icon: newDomain.icon || '💼',
      budget: (newDomain.budgetPercent! / 100) * totalBudget,
      budgetPercent: newDomain.budgetPercent || 0,
      riskTolerance: newDomain.riskTolerance || 'medium',
      minIRR: newDomain.minIRR || 15,
      maxPayback: newDomain.maxPayback || 5,
      strategicScore: newDomain.strategicScore || 5,
      isActive: true,
      projectCount: 0,
      color: newDomain.color || '#6b7280',
      remainingBudget: (newDomain.budgetPercent! / 100) * totalBudget,
      projects: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const updatedDomains = [...domains, domain];
    setDomains(updatedDomains);
    onDataUpdate({ domains: updatedDomains, totalBudget });
    setShowAddModal(false);
    setNewDomain({
      name: '',
      code: '',
      description: '',
      icon: '💼',
      budgetPercent: 0,
      riskTolerance: 'medium',
      minIRR: 15,
      maxPayback: 5,
      strategicScore: 5,
      isActive: true,
      color: '#6b7280'
    });
  };

  const deleteDomain = (id: string) => {
    const updatedDomains = domains.filter(d => d.id !== id);
    setDomains(updatedDomains);
    onDataUpdate({ domains: updatedDomains, totalBudget });
  };

  const updateDomainDetails = (id: string, updates: Partial<BusinessDomain>) => {
    const updatedDomains = domains.map(domain => {
      if (domain.id === id) {
        return { ...domain, ...updates, updatedAt: new Date() };
      }
      return domain;
    });
    setDomains(updatedDomains);
    onDataUpdate({ domains: updatedDomains, totalBudget });
  };

  // ===== EFFECTS SECTION =====
  useEffect(() => {
    const totalAllocated = domains.reduce((sum, d) => sum + (d.isActive ? d.budgetPercent : 0), 0);
    if (Math.abs(totalAllocated - 100) > 0.1 && budgetMode === 'percentage') {
      // Auto-adjust if significantly off 100%
      autoBalanceDomainsHandler();
    }
  }, [domains.length]);

  // ===== CALCULATIONS =====
  const totalAllocatedPercent = domains.reduce((sum, d) => sum + (d.isActive ? d.budgetPercent : 0), 0);
  const totalAllocatedBudget = domains.reduce((sum, d) => sum + (d.isActive ? d.budget : 0), 0);
  const isBalanced = Math.abs(totalAllocatedPercent - 100) < 0.1;
  const activeDomains = domains.filter(d => d.isActive);

  // ===== SUB-COMPONENTS SECTION =====
  const DomainCard = ({ domain }: { domain: BusinessDomain }) => (
    <div className={`domain-card ${domain.isActive ? 'active' : 'inactive'}`}>
      <div className="domain-header">
        <div className="domain-icon-name">
          <span className="domain-icon">{domain.icon}</span>
          <div>
            <h3 className="domain-name">{domain.name}</h3>
            <p className="domain-code">{domain.code}</p>
          </div>
        </div>
        <div className="domain-controls">
          <button 
            className="edit-btn"
            onClick={() => setEditingDomain(domain)}
          >
            ✏️
          </button>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={domain.isActive}
              onChange={() => toggleDomainActive(domain.id)}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>
      
      <div className="domain-budget">
        <div className="budget-display">
          <span className="budget-amount">{formatCurrency(domain.budget)}</span>
          <span className="budget-percent">{formatPercent(domain.budgetPercent)}</span>
        </div>
        
        {domain.isActive && (
          <div className="budget-slider">
            <input
              type="range"
              min="0"
              max={budgetMode === 'percentage' ? "50" : totalBudget}
              value={budgetMode === 'percentage' ? domain.budgetPercent : domain.budget}
              onChange={(e) => updateDomainBudget(domain.id, parseFloat(e.target.value))}
              className="slider-input"
            />
          </div>
        )}
      </div>
      
      <div className="domain-metrics">
        <div className="metric">
          <span className="metric-label">Risk</span>
          <span className={`metric-value risk-${domain.riskTolerance}`}>
            {domain.riskTolerance}
          </span>
        </div>
        <div className="metric">
          <span className="metric-label">Min IRR</span>
          <span className="metric-value">{formatPercent(domain.minIRR)}</span>
        </div>
        <div className="metric">
          <span className="metric-label">Projects</span>
          <span className="metric-value">{domain.projects?.length || 0}</span>
        </div>
        <div className="metric">
          <span className="metric-label">Strategic Score</span>
          <span className="metric-value">{domain.strategicScore}/10</span>
        </div>
      </div>
      
      <div className="domain-risk-filter">
        <label>Risk Filter:</label>
        <div className="risk-filter-buttons">
          <button 
            className={`risk-btn ${domain.riskTolerance === 'low' ? 'active' : ''}`}
            onClick={() => updateDomainDetails(domain.id, { riskTolerance: 'low' })}
          >
            Low
          </button>
          <button 
            className={`risk-btn ${domain.riskTolerance === 'medium' ? 'active' : ''}`}
            onClick={() => updateDomainDetails(domain.id, { riskTolerance: 'medium' })}
          >
            Medium
          </button>
          <button 
            className={`risk-btn ${domain.riskTolerance === 'high' ? 'active' : ''}`}
            onClick={() => updateDomainDetails(domain.id, { riskTolerance: 'high' })}
          >
            High
          </button>
        </div>
        <div className="filtered-projects">
          {domain.projects && (
            <small>
              {filterProjectsByRisk(domain.projects, domain.riskTolerance).length} projects match risk tolerance
            </small>
          )}
        </div>
      </div>
      
      <p className="domain-description">{domain.description}</p>
      
      <div className="domain-actions">
        <button 
          className="delete-btn"
          onClick={() => deleteDomain(domain.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );

  const AddDomainModal = () => (
    <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Add New Business Domain</h2>
        <form onSubmit={(e) => { e.preventDefault(); addNewDomainHandler(); }}>
          <div className="form-group">
            <label>Domain Name</label>
            <input
              type="text"
              value={newDomain.name || ''}
              onChange={(e) => setNewDomain({...newDomain, name: e.target.value})}
              placeholder="e.g., Aerospace"
              required
            />
          </div>
          <div className="form-group">
            <label>Domain Code</label>
            <input
              type="text"
              value={newDomain.code || ''}
              onChange={(e) => setNewDomain({...newDomain, code: e.target.value})}
              placeholder="e.g., AER"
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={newDomain.description || ''}
              onChange={(e) => setNewDomain({...newDomain, description: e.target.value})}
              placeholder="Brief description of the domain"
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>Icon</label>
            <input
              type="text"
              value={newDomain.icon || ''}
              onChange={(e) => setNewDomain({...newDomain, icon: e.target.value})}
              placeholder="🚀"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Budget %</label>
              <input
                type="number"
                min="0"
                max="50"
                step="0.1"
                value={newDomain.budgetPercent || ''}
                onChange={(e) => setNewDomain({...newDomain, budgetPercent: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div className="form-group">
              <label>Risk Tolerance</label>
              <select
                value={newDomain.riskTolerance || 'medium'}
                onChange={(e) => setNewDomain({...newDomain, riskTolerance: e.target.value as 'low' | 'medium' | 'high'})}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Min IRR (%)</label>
              <input
                type="number"
                min="0"
                max="50"
                value={newDomain.minIRR || ''}
                onChange={(e) => setNewDomain({...newDomain, minIRR: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div className="form-group">
              <label>Max Payback (years)</label>
              <input
                type="number"
                min="1"
                max="20"
                value={newDomain.maxPayback || ''}
                onChange={(e) => setNewDomain({...newDomain, maxPayback: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Strategic Score (1-10)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={newDomain.strategicScore || ''}
              onChange={(e) => setNewDomain({...newDomain, strategicScore: parseFloat(e.target.value) || 0})}
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={() => setShowAddModal(false)}>Cancel</button>
            <button type="submit">Add Domain</button>
          </div>
        </form>
      </div>
    </div>
  );

  const BudgetSummaryChart = () => (
    <div className="budget-chart">
      <svg width="300" height="300" viewBox="0 0 300 300">
        {activeDomains.map((domain, index) => {
          const startAngle = index === 0 ? 0 : activeDomains.slice(0, index).reduce((sum, d) => sum + (d.budgetPercent / 100) * 360, 0);
          const endAngle = startAngle + (domain.budgetPercent / 100) * 360;
          const largeArc = (endAngle - startAngle) > 180 ? 1 : 0;
          
          const x1 = 150 + 120 * Math.cos((startAngle * Math.PI) / 180);
          const y1 = 150 + 120 * Math.sin((startAngle * Math.PI) / 180);
          const x2 = 150 + 120 * Math.cos((endAngle * Math.PI) / 180);
          const y2 = 150 + 120 * Math.sin((endAngle * Math.PI) / 180);
          
          return (
            <path
              key={domain.id}
              d={`M 150 150 L ${x1} ${y1} A 120 120 0 ${largeArc} 1 ${x2} ${y2} Z`}
              fill={domain.color}
              stroke="white"
              strokeWidth="2"
            />
          );
        })}
        <circle cx="150" cy="150" r="60" fill="white" />
        <text x="150" y="145" textAnchor="middle" className="chart-total-label">Total Budget</text>
        <text x="150" y="165" textAnchor="middle" className="chart-total-value">
          {formatCurrency(totalBudget)}
        </text>
      </svg>
    </div>
  );

  // ===== RENDER SECTION =====
  return (
    <div className="tab-business-domains">
      <div className="tab-header">
        <div className="header-content">
          <h1>Business Domains Configuration</h1>
          <p>Configure and manage business domains with their budgets and parameters</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={autoBalanceDomainsHandler}>
            Auto-Balance
          </button>
          <button className="btn-secondary" onClick={() => {
            const updatedDomains = domains.map(d => ({ ...d, riskTolerance: 'medium' as const }));
            setDomains(updatedDomains);
            onDataUpdate({ domains: updatedDomains, totalBudget });
          }}>
            Reset Risk
          </button>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            + Add Domain
          </button>
        </div>
      </div>

      <div className="summary-section">
        <div className="summary-cards">
          <div className="summary-card">
            <span className="summary-label">Total Budget</span>
            <span className="summary-value">{formatCurrency(totalBudget)}</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Active Domains</span>
            <span className="summary-value">{activeDomains.length}</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Allocated</span>
            <span className={`summary-value ${isBalanced ? 'balanced' : 'unbalanced'}`}>
              {formatPercent(totalAllocatedPercent)}
            </span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Remaining</span>
            <span className="summary-value">
              {formatCurrency(totalBudget - totalAllocatedBudget)}
            </span>
          </div>
        </div>

        <div className="budget-controls">
          <div className="control-group">
            <label>Budget Mode:</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="budgetMode"
                  value="percentage"
                  checked={budgetMode === 'percentage'}
                  onChange={(e) => setBudgetMode(e.target.value as 'percentage' | 'dollar')}
                />
                Percentage
              </label>
              <label>
                <input
                  type="radio"
                  name="budgetMode"
                  value="dollar"
                  checked={budgetMode === 'dollar'}
                  onChange={(e) => setBudgetMode(e.target.value as 'percentage' | 'dollar')}
                />
                Dollar Amount
              </label>
            </div>
          </div>
          
          <div className="control-group">
            <label>Total Budget ($):</label>
            <input
              type="number"
              value={totalBudget / 1000000}
              onChange={(e) => setTotalBudget((parseFloat(e.target.value) || 0) * 1000000)}
              min="0"
              step="1"
              className="budget-input"
            />
            <span className="input-unit">M</span>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="domains-grid">
          {domains.map(domain => (
            <DomainCard key={domain.id} domain={domain} />
          ))}
        </div>

        <div className="sidebar">
          <BudgetSummaryChart />
          
          <div className="domain-legend">
            <h3>Domain Legend</h3>
            {activeDomains.map(domain => (
              <div key={domain.id} className="legend-item">
                <div 
                  className="legend-color" 
                  style={{ backgroundColor: domain.color }}
                ></div>
                <span className="legend-label">{domain.name}</span>
                <span className="legend-value">{formatPercent(domain.budgetPercent)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {!isBalanced && (
        <div className="warning-banner">
          ⚠️ Budget allocation is {formatPercent(totalAllocatedPercent)}. Please adjust to 100%.
        </div>
      )}

      {showAddModal && <AddDomainModal />}
    </div>
  );
};