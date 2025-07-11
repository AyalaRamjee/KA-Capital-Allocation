// Tab5_DataValidation.tsx - ALL logic for Data Validation & Approval tab
'use client'
import React, { useState, useEffect } from 'react';
import { BusinessDomain, Project, ValidationIssue, ApprovalStatus } from './types';
import { formatCurrency, validationRules } from './mockData';

interface TabProps {
  sharedData: {
    domains?: BusinessDomain[];
    projects?: Project[];
    validationIssues?: ValidationIssue[];
    approvalStatuses?: ApprovalStatus[];
  };
  onDataUpdate: (data: { 
    validationIssues: ValidationIssue[]; 
    approvalStatuses: ApprovalStatus[] 
  }) => void;
}

export const DataValidationTab: React.FC<TabProps> = ({ sharedData, onDataUpdate }) => {
  // ===== STATE SECTION =====
  const [domains] = useState<BusinessDomain[]>(sharedData.domains || []);
  const [projects] = useState<Project[]>(sharedData.projects || []);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>(sharedData.validationIssues || []);
  const [approvalStatuses, setApprovalStatuses] = useState<ApprovalStatus[]>(sharedData.approvalStatuses || []);
  const [lastValidation, setLastValidation] = useState<Date>(new Date());
  const [isValidating, setIsValidating] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<ValidationIssue | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  // ===== VALIDATION RULES =====
  const runValidation = () => {
    setIsValidating(true);
    const issues: ValidationIssue[] = [];

    // Critical Issues
    const selectedProjects = projects.filter(p => p.isSelected);
    const totalBudget = domains.reduce((sum, d) => sum + d.budget, 0);
    const totalAllocation = selectedProjects.reduce((sum, p) => sum + p.capex, 0);

    // Run enhanced validation rules
    domains.forEach(domain => {
      const domainProjects = selectedProjects.filter(p => p.domain === domain.id);
      
      domainProjects.forEach(project => {
        validationRules.forEach(rule => {
          const ruleData = { project, domain, portfolio: selectedProjects };
          if (!rule.check(ruleData)) {
            issues.push({
              id: `${rule.type}-${Date.now()}-${project.id}-${rule.name.replace(/\s+/g, '-')}`,
              severity: rule.type,
              title: rule.name,
              description: rule.message,
              affectedItems: [project.id],
              category: rule.type === 'critical' ? 'consistency' : 'compliance',
              resolved: false
            });
          }
        });
      });
    });

    if (totalAllocation > totalBudget) {
      issues.push({
        id: `critical-${Date.now()}-1`,
        severity: 'critical',
        title: 'Total Allocation Exceeds Available Capital',
        description: `Total project allocation (${formatCurrency(totalAllocation)}) exceeds available capital (${formatCurrency(totalBudget)}).`,
        affectedItems: selectedProjects.map(p => p.id),
        category: 'consistency',
        resolved: false
      });
    }

    // Check for duplicate project selections
    const duplicateProjects = selectedProjects.filter((p, index) => 
      selectedProjects.findIndex(pp => pp.id === p.id) !== index
    );
    if (duplicateProjects.length > 0) {
      issues.push({
        id: `critical-${Date.now()}-2`,
        severity: 'critical',
        title: 'Duplicate Project Selections',
        description: `Found ${duplicateProjects.length} duplicate project selections.`,
        affectedItems: duplicateProjects.map(p => p.id),
        category: 'logic',
        resolved: false
      });
    }
    
    // Timeline clustering validation
    const timelineValidation = validateTimelineClustering(selectedProjects);
    if (timelineValidation.clustered) {
      issues.push({
        id: `warning-${Date.now()}-timeline`,
        severity: 'warning',
        title: 'Timeline Clustering Detected',
        description: `${timelineValidation.clusterCount} projects starting in the same period may strain resources.`,
        affectedItems: timelineValidation.clusteredProjects,
        category: 'logic',
        resolved: false
      });
    }
    
    // Data completeness validation
    const completenessValidation = validateDataCompleteness(selectedProjects);
    if (completenessValidation.incomplete.length > 0) {
      issues.push({
        id: `info-${Date.now()}-completeness`,
        severity: 'info',
        title: 'Incomplete Project Data',
        description: `${completenessValidation.incomplete.length} projects missing optional data (${completenessValidation.missingFields.join(', ')}).`,
        affectedItems: completenessValidation.incomplete,
        category: 'completeness',
        resolved: false
      });
    }

    // Domain budget validation
    domains.forEach(domain => {
      const domainProjects = selectedProjects.filter(p => p.domain === domain.id);
      const domainAllocation = domainProjects.reduce((sum, p) => sum + p.capex, 0);
      
      if (domainAllocation > domain.budget) {
        issues.push({
          id: `critical-${Date.now()}-${domain.id}`,
          severity: 'critical',
          title: `${domain.name} Budget Exceeded`,
          description: `Domain allocation (${formatCurrency(domainAllocation)}) exceeds budget (${formatCurrency(domain.budget)}).`,
          affectedItems: domainProjects.map(p => p.id),
          category: 'consistency',
          resolved: false
        });
      }

      // Warning: IRR below threshold
      const lowIRRProjects = domainProjects.filter(p => p.irr < domain.minIRR);
      if (lowIRRProjects.length > 0) {
        issues.push({
          id: `warning-${Date.now()}-${domain.id}-irr`,
          severity: 'warning',
          title: `${domain.name}: Projects Below IRR Threshold`,
          description: `${lowIRRProjects.length} projects have IRR below ${domain.minIRR}% threshold.`,
          affectedItems: lowIRRProjects.map(p => p.id),
          category: 'accuracy',
          resolved: false
        });
      }

      // Warning: High risk concentration
      const highRiskProjects = domainProjects.filter(p => p.riskScore >= 7);
      const riskConcentration = highRiskProjects.length / domainProjects.length;
      if (riskConcentration > 0.3 && domainProjects.length > 2) {
        issues.push({
          id: `warning-${Date.now()}-${domain.id}-risk`,
          severity: 'warning',
          title: `${domain.name}: High Risk Concentration`,
          description: `${Math.round(riskConcentration * 100)}% of projects are high risk (score ≥7).`,
          affectedItems: highRiskProjects.map(p => p.id),
          category: 'compliance',
          resolved: false
        });
      }
      
      // Strategic alignment validation
      const lowStrategicFitProjects = domainProjects.filter(p => (p.strategicFit || 0) < 5);
      if (lowStrategicFitProjects.length > 0) {
        issues.push({
          id: `warning-${Date.now()}-${domain.id}-strategic`,
          severity: 'warning',
          title: `${domain.name}: Low Strategic Alignment`,
          description: `${lowStrategicFitProjects.length} projects have low strategic fit scores (<5).`,
          affectedItems: lowStrategicFitProjects.map(p => p.id),
          category: 'accuracy',
          resolved: false
        });
      }
    });

    // Financial validation
    const financialValidation = validateFinancialMetrics(selectedProjects);
    if (financialValidation.outliers.length > 0) {
      issues.push({
        id: `warning-${Date.now()}-financial`,
        severity: 'warning',
        title: 'Financial Metric Outliers',
        description: `${financialValidation.outliers.length} projects have unusual financial metrics that may need review.`,
        affectedItems: financialValidation.outliers,
        category: 'accuracy',
        resolved: false
      });
    }

    // Portfolio balance check
    const portfolioBalance = calculatePortfolioBalance(selectedProjects);
    if (portfolioBalance.imbalance > 0.3) {
      issues.push({
        id: `warning-${Date.now()}-balance`,
        severity: 'warning',
        title: 'Unbalanced Portfolio',
        description: `Portfolio allocation is heavily skewed towards ${portfolioBalance.topDomain}.`,
        affectedItems: [],
        category: 'logic',
        resolved: false
      });
    }

    setValidationIssues(issues);
    setLastValidation(new Date());
    setIsValidating(false);
    
    onDataUpdate({ validationIssues: issues, approvalStatuses });
  };

  const calculatePortfolioBalance = (selectedProjects: Project[]) => {
    const domainAllocations = domains.map(domain => {
      const domainProjects = selectedProjects.filter(p => p.domain === domain.id);
      const allocation = domainProjects.reduce((sum, p) => sum + p.capex, 0);
      return { domain: domain.name, allocation };
    });

    const totalAllocation = domainAllocations.reduce((sum, d) => sum + d.allocation, 0);
    const maxAllocation = Math.max(...domainAllocations.map(d => d.allocation));
    const imbalance = totalAllocation > 0 ? maxAllocation / totalAllocation : 0;
    const topDomain = domainAllocations.find(d => d.allocation === maxAllocation)?.domain || '';

    return { imbalance, topDomain };
  };
  
  const validateTimelineClustering = (selectedProjects: Project[]) => {
    const quarterStarts = selectedProjects.map(p => p.startQuarter || 1);
    const quarterCounts = quarterStarts.reduce((acc, quarter) => {
      acc[quarter] = (acc[quarter] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    const maxCluster = Math.max(...Object.values(quarterCounts));
    const clusteredProjects = selectedProjects.filter(p => quarterCounts[p.startQuarter || 1] >= 5).map(p => p.id);
    
    return {
      clustered: maxCluster >= 5,
      clusterCount: maxCluster,
      clusteredProjects
    };
  };
  
  const validateDataCompleteness = (selectedProjects: Project[]) => {
    const requiredFields = ['businessUnit', 'geography', 'sponsor'];
    const incomplete = selectedProjects.filter(p => 
      requiredFields.some(field => !p[field as keyof Project])
    ).map(p => p.id);
    
    const missingFields = requiredFields.filter(field => 
      selectedProjects.some(p => !p[field as keyof Project])
    );
    
    return { incomplete, missingFields };
  };
  
  const validateFinancialMetrics = (selectedProjects: Project[]) => {
    const outliers = selectedProjects.filter(p => {
      const irrOutlier = p.irr < 5 || p.irr > 50;
      const paybackOutlier = p.paybackYears < 0.5 || p.paybackYears > 15;
      const npvNegative = p.npv < 0;
      return irrOutlier || paybackOutlier || npvNegative;
    }).map(p => p.id);
    
    return { outliers };
  };

  // ===== APPROVAL WORKFLOW =====
  const initializeApprovals = () => {
    const newApprovals: ApprovalStatus[] = [];
    
    domains.forEach(domain => {
      const roles = ['domainOwner', 'finance', 'risk', 'executive'];
      roles.forEach(role => {
        newApprovals.push({
          id: `${domain.id}-${role}`,
          domain: domain.name,
          role: role as any,
          status: 'not_started',
          approver: getApproverName(role),
          date: undefined,
          comments: undefined
        });
      });
    });

    setApprovalStatuses(newApprovals);
    onDataUpdate({ validationIssues, approvalStatuses: newApprovals });
  };

  const getApproverName = (role: string): string => {
    const approvers = {
      domainOwner: 'Domain Owner',
      finance: 'Finance Team',
      risk: 'Risk Management',
      executive: 'Executive Committee'
    };
    return approvers[role as keyof typeof approvers] || role;
  };

  const updateApprovalStatus = (approvalId: string, status: ApprovalStatus['status'], comments?: string) => {
    const updatedApprovals = approvalStatuses.map(approval => {
      if (approval.id === approvalId) {
        return {
          ...approval,
          status,
          date: new Date(),
          comments
        };
      }
      return approval;
    });

    setApprovalStatuses(updatedApprovals);
    onDataUpdate({ validationIssues, approvalStatuses: updatedApprovals });
  };

  const resolveIssue = (issueId: string, comments?: string) => {
    const updatedIssues = validationIssues.map(issue => {
      if (issue.id === issueId) {
        return { ...issue, resolved: true, comments };
      }
      return issue;
    });

    setValidationIssues(updatedIssues);
    onDataUpdate({ validationIssues: updatedIssues, approvalStatuses });
  };

  // ===== CALCULATIONS =====
  const criticalIssues = validationIssues.filter(i => i.severity === 'critical' && !i.resolved);
  const warningIssues = validationIssues.filter(i => i.severity === 'warning' && !i.resolved);
  const infoIssues = validationIssues.filter(i => i.severity === 'info' && !i.resolved);
  
  const totalIssues = criticalIssues.length + warningIssues.length + infoIssues.length;
  const healthScore = totalIssues === 0 ? 100 : Math.max(0, 100 - (criticalIssues.length * 30) - (warningIssues.length * 10) - (infoIssues.length * 5));

  const filteredIssues = validationIssues.filter(issue => {
    if (filterSeverity === 'all') return true;
    return issue.severity === filterSeverity;
  });

  // ===== EFFECTS SECTION =====
  useEffect(() => {
    if (approvalStatuses.length === 0) {
      initializeApprovals();
    }
  }, [domains]);

  useEffect(() => {
    runValidation();
  }, [projects, domains]);

  // ===== SUB-COMPONENTS SECTION =====
  const ValidationDashboard = () => (
    <div className="validation-dashboard">
      <div className="dashboard-card health-score">
        <h3>Overall Health Score</h3>
        <div className={`score ${healthScore >= 80 ? 'excellent' : healthScore >= 60 ? 'good' : 'poor'}`}>
          {healthScore}%
        </div>
        <div className="score-subtitle">
          {healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : 'Needs Attention'}
        </div>
      </div>

      <div className="dashboard-card issues-summary">
        <h3>Issues Summary</h3>
        <div className="issues-count">
          <div className="issue-type critical">
            <span className="count">{criticalIssues.length}</span>
            <span className="label">Critical</span>
          </div>
          <div className="issue-type warning">
            <span className="count">{warningIssues.length}</span>
            <span className="label">Warning</span>
          </div>
          <div className="issue-type info">
            <span className="count">{infoIssues.length}</span>
            <span className="label">Info</span>
          </div>
        </div>
      </div>

      <div className="dashboard-card validation-info">
        <h3>Last Validation</h3>
        <div className="validation-time">
          {lastValidation.toLocaleTimeString()}
        </div>
        <div className="validation-date">
          {lastValidation.toLocaleDateString()}
        </div>
      </div>

      <div className="dashboard-card validation-actions">
        <h3>Actions</h3>
        <button 
          className="btn-primary"
          onClick={runValidation}
          disabled={isValidating}
        >
          {isValidating ? 'Validating...' : 'Run Validation'}
        </button>
      </div>
    </div>
  );

  const IssueItem = ({ issue }: { issue: ValidationIssue }) => (
    <div className={`issue-item ${issue.severity} ${issue.resolved ? 'resolved' : ''}`}>
      <div className="issue-header">
        <div className="issue-title">{issue.title}</div>
        <div className="issue-badges">
          <span className={`severity-badge ${issue.severity}`}>
            {issue.severity.toUpperCase()}
          </span>
          <span className="category-badge">{issue.category}</span>
        </div>
      </div>
      
      <div className="issue-description">{issue.description}</div>
      
      {issue.affectedItems.length > 0 && (
        <div className="affected-items">
          <span className="affected-label">Affected Items:</span>
          <span className="affected-count">{issue.affectedItems.length} items</span>
        </div>
      )}
      
      <div className="issue-actions">
        {!issue.resolved && (
          <>
            <button 
              className="btn-secondary"
              onClick={() => setSelectedIssue(issue)}
            >
              View Details
            </button>
            <button 
              className="btn-primary"
              onClick={() => resolveIssue(issue.id, 'Issue resolved manually')}
            >
              Mark Resolved
            </button>
          </>
        )}
        {issue.resolved && (
          <span className="resolved-badge">✓ Resolved</span>
        )}
      </div>
    </div>
  );

  const ApprovalMatrix = () => (
    <div className="approval-matrix">
      <h3>Approval Matrix</h3>
      <div className="approval-grid">
        <div className="grid-header">
          <div className="domain-header">Domain</div>
          <div className="role-header">Domain Owner</div>
          <div className="role-header">Finance</div>
          <div className="role-header">Risk</div>
          <div className="role-header">Executive</div>
        </div>
        
        {domains.map(domain => (
          <div key={domain.id} className="approval-row">
            <div className="domain-cell">
              <span className="domain-icon">{domain.icon}</span>
              <span className="domain-name">{domain.name}</span>
            </div>
            
            {['domainOwner', 'finance', 'risk', 'executive'].map(role => {
              const approval = approvalStatuses.find(a => a.domain === domain.name && a.role === role);
              return (
                <div key={role} className="approval-cell">
                  <select
                    value={approval?.status || 'not_started'}
                    onChange={(e) => updateApprovalStatus(approval?.id || '', e.target.value as any)}
                    className={`approval-select ${approval?.status || 'not_started'}`}
                  >
                    <option value="not_started">Not Started</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  // ===== RENDER SECTION =====
  return (
    <div className="tab-data-validation">
      <div className="tab-header">
        <div className="header-content">
          <h1>Data Validation & Approval</h1>
          <p>Ensure data quality and manage approval workflow</p>
        </div>
      </div>

      <ValidationDashboard />

      <div className="main-content">
        <div className="issues-section">
          <div className="section-header">
            <h2>Validation Issues ({totalIssues} total)</h2>
            <div className="issues-filters">
              <select 
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Issues ({totalIssues})</option>
                <option value="critical">Critical Only ({criticalIssues.length})</option>
                <option value="warning">Warning Only ({warningIssues.length})</option>
                <option value="info">Info Only ({infoIssues.length})</option>
              </select>
              <button 
                className="btn-secondary"
                onClick={() => {
                  const unresolvedIssues = validationIssues.filter(i => !i.resolved);
                  const updatedIssues = validationIssues.map(i => ({ ...i, resolved: true }));
                  setValidationIssues(updatedIssues);
                  onDataUpdate({ validationIssues: updatedIssues, approvalStatuses });
                }}
                disabled={totalIssues === 0}
              >
                Resolve All
              </button>
            </div>
          </div>

          <div className="issues-list">
            {filteredIssues.map(issue => (
              <IssueItem key={issue.id} issue={issue} />
            ))}
            
            {filteredIssues.length === 0 && (
              <div className="no-issues">
                <div className="no-issues-icon">✅</div>
                <h3>No Issues Found</h3>
                <p>All validation checks passed successfully!</p>
              </div>
            )}
          </div>
        </div>

        <ApprovalMatrix />
      </div>

      {criticalIssues.length > 0 && (
        <div className="critical-warning">
          <div className="warning-content">
            <span className="warning-icon">⚠️</span>
            <span className="warning-text">
              {criticalIssues.length} critical issue(s) must be resolved before proceeding.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};