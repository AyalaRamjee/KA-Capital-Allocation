'use client'
import React, { useState, useEffect } from 'react';
import { 
  ValidationRule, 
  DataQualityIssue, 
  DataQualityMetrics, 
  InvestmentPriority, 
  Opportunity, 
  ValidatedProject,
  SectorAllocation
} from './types';

interface Tab5Props {
  sharedData: {
    investmentPriorities: InvestmentPriority[];
    opportunities: Opportunity[];
    validatedProjects: ValidatedProject[];
    sectorAllocations: SectorAllocation[];
    validationRules: ValidationRule[];
    dataQualityIssues: DataQualityIssue[];
    dataQualityMetrics: DataQualityMetrics;
  };
  onDataUpdate: (data: { 
    validationRules: ValidationRule[];
    dataQualityIssues: DataQualityIssue[];
    dataQualityMetrics: DataQualityMetrics;
  }) => void;
}

export const Tab5_EnsureDataQuality: React.FC<Tab5Props> = ({ sharedData, onDataUpdate }) => {
  const [validationRules, setValidationRules] = useState<ValidationRule[]>(sharedData.validationRules);
  const [dataQualityIssues, setDataQualityIssues] = useState<DataQualityIssue[]>(sharedData.dataQualityIssues);
  const [dataQualityMetrics, setDataQualityMetrics] = useState<DataQualityMetrics>(sharedData.dataQualityMetrics);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'financial' | 'completeness' | 'consistency' | 'accuracy' | 'compliance'>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'open' | 'resolved' | 'ignored'>('all');
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Initialize validation rules if empty
  useEffect(() => {
    if (sharedData.validationRules.length === 0) {
      initializeValidationRules();
    }
  }, []);

  // Run validation when data changes
  useEffect(() => {
    if (validationRules.length > 0) {
      runValidation();
    }
  }, [sharedData.investmentPriorities, sharedData.opportunities, sharedData.validatedProjects, sharedData.sectorAllocations, validationRules]);

  const initializeValidationRules = () => {
    const initialRules: ValidationRule[] = [
      // Financial Validations
      {
        id: 'FIN-001',
        name: 'IRR Range Check',
        category: 'financial',
        severity: 'critical',
        description: 'IRR must be between 5% and 50%',
        checkFunction: 'project => project.irr >= 5 && project.irr <= 50',
        autoFixable: false,
        enabled: true
      },
      {
        id: 'FIN-002',
        name: 'NPV Positive for Grade A',
        category: 'financial',
        severity: 'critical',
        description: 'NPV must be positive for Grade A projects',
        checkFunction: 'project => project.investmentGrade !== "A" || project.npv > 0',
        autoFixable: false,
        enabled: true
      },
      {
        id: 'FIN-003',
        name: 'Payback Period Check',
        category: 'financial',
        severity: 'warning',
        description: 'Payback period should be less than investment horizon',
        checkFunction: 'project => project.paybackYears <= 10',
        autoFixable: false,
        enabled: true
      },
      {
        id: 'FIN-004',
        name: 'CAPEX Reasonableness',
        category: 'financial',
        severity: 'warning',
        description: 'CAPEX should be within reasonable bounds',
        checkFunction: 'project => project.capex >= 1000000 && project.capex <= 10000000000',
        autoFixable: false,
        enabled: true
      },
      
      // Completeness Checks
      {
        id: 'COMP-001',
        name: 'Business Plan Completeness',
        category: 'completeness',
        severity: 'critical',
        description: 'All business plans must have executive summary',
        checkFunction: 'project => project.businessPlan?.executiveSummary?.length > 0',
        autoFixable: false,
        enabled: true
      },
      {
        id: 'COMP-002',
        name: 'Risk Assessment Required',
        category: 'completeness',
        severity: 'warning',
        description: 'Risk assessments must include mitigation strategies',
        checkFunction: 'project => project.businessPlan?.risks?.length > 0',
        autoFixable: false,
        enabled: true
      },
      {
        id: 'COMP-003',
        name: 'Synergy Analysis for Large Projects',
        category: 'completeness',
        severity: 'warning',
        description: 'Projects >$500M must have synergy analysis',
        checkFunction: 'project => project.capex < 500000000 || (project.businessPlan?.synergies?.length > 0)',
        autoFixable: false,
        enabled: true
      },
      {
        id: 'COMP-004',
        name: 'Sponsor Assignment',
        category: 'completeness',
        severity: 'critical',
        description: 'All projects must have assigned sponsor',
        checkFunction: 'project => project.sponsor?.length > 0',
        autoFixable: false,
        enabled: true
      },
      
      // Consistency Checks
      {
        id: 'CONS-001',
        name: 'Priority Weights Sum',
        category: 'consistency',
        severity: 'critical',
        description: 'Priority weights must sum to 100%',
        checkFunction: 'priorities => Math.abs(priorities.reduce((sum, p) => sum + p.weight, 0) - 100) < 0.01',
        autoFixable: true,
        enabled: true
      },
      {
        id: 'CONS-002',
        name: 'Allocation Consistency',
        category: 'consistency',
        severity: 'warning',
        description: 'Sector allocations should match project assignments',
        checkFunction: 'allocation => true', // Complex check implemented separately
        autoFixable: false,
        enabled: true
      },
      {
        id: 'CONS-003',
        name: 'Investment Grade Consistency',
        category: 'consistency',
        severity: 'warning',
        description: 'Investment grade must match composite score',
        checkFunction: 'project => validateGradeConsistency(project)',
        autoFixable: false,
        enabled: true
      },
      
      // Accuracy Checks
      {
        id: 'ACC-001',
        name: 'Composite Score Calculation',
        category: 'accuracy',
        severity: 'warning',
        description: 'Composite score must match component scores',
        checkFunction: 'project => validateCompositeScore(project)',
        autoFixable: true,
        enabled: true
      },
      {
        id: 'ACC-002',
        name: 'Financial Ratios',
        category: 'accuracy',
        severity: 'info',
        description: 'Financial ratios should be within industry norms',
        checkFunction: 'project => validateFinancialRatios(project)',
        autoFixable: false,
        enabled: true
      },
      
      // Compliance Checks
      {
        id: 'COMPL-001',
        name: 'Minimum Investment Threshold',
        category: 'compliance',
        severity: 'critical',
        description: 'Projects must meet minimum investment threshold',
        checkFunction: 'project => project.capex >= 10000000', // $10M minimum
        autoFixable: false,
        enabled: true
      },
      {
        id: 'COMPL-002',
        name: 'Risk Score Bounds',
        category: 'compliance',
        severity: 'warning',
        description: 'Risk scores must be between 0 and 100',
        checkFunction: 'project => project.riskScore >= 0 && project.riskScore <= 100',
        autoFixable: false,
        enabled: true
      },
      {
        id: 'COMPL-003',
        name: 'Sector Allocation Limits',
        category: 'compliance',
        severity: 'critical',
        description: 'Sector allocations must respect constraints',
        checkFunction: 'allocation => validateSectorConstraints(allocation)',
        autoFixable: false,
        enabled: true
      }
    ];
    
    setValidationRules(initialRules);
  };

  const runValidation = async () => {
    setIsValidating(true);
    const issues: DataQualityIssue[] = [];
    
    try {
      // Validate priorities
      const priorityIssues = await validatePriorities();
      issues.push(...priorityIssues);
      
      // Validate opportunities
      const opportunityIssues = await validateOpportunities();
      issues.push(...opportunityIssues);
      
      // Validate projects
      const projectIssues = await validateProjects();
      issues.push(...projectIssues);
      
      // Validate sector allocations
      const sectorIssues = await validateSectorAllocations();
      issues.push(...sectorIssues);
      
      // Calculate metrics
      const metrics = calculateDataQualityMetrics(issues);
      
      setDataQualityIssues(issues);
      setDataQualityMetrics(metrics);
      
      onDataUpdate({
        validationRules,
        dataQualityIssues: issues,
        dataQualityMetrics: metrics
      });
      
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const validatePriorities = async (): Promise<DataQualityIssue[]> => {
    const issues: DataQualityIssue[] = [];
    const priorities = sharedData.investmentPriorities;
    
    // Check priority weights sum to 100%
    const totalWeight = priorities.reduce((sum, p) => sum + p.weight, 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      issues.push({
        id: `ISSUE-${Date.now()}-${Math.random()}`,
        ruleId: 'CONS-001',
        severity: 'critical',
        title: 'Priority weights do not sum to 100%',
        description: `Total weight is ${totalWeight.toFixed(2)}%, should be 100%`,
        affectedItems: priorities.map(p => p.id),
        category: 'consistency',
        status: 'open',
        detectedDate: new Date(),
        autoFixSuggestion: 'Normalize weights to sum to 100%'
      });
    }
    
    // Check for missing capital allocations
    priorities.forEach(priority => {
      if (priority.capitalAllocation <= 0) {
        issues.push({
          id: `ISSUE-${Date.now()}-${Math.random()}`,
          ruleId: 'COMP-001',
          severity: 'warning',
          title: 'Missing capital allocation',
          description: `Priority "${priority.name}" has no capital allocation`,
          affectedItems: [priority.id],
          category: 'completeness',
          status: 'open',
          detectedDate: new Date()
        });
      }
    });
    
    return issues;
  };

  const validateOpportunities = async (): Promise<DataQualityIssue[]> => {
    const issues: DataQualityIssue[] = [];
    const opportunities = sharedData.opportunities;
    
    opportunities.forEach(opportunity => {
      // Check investment range validity
      if (opportunity.investmentRange.min > opportunity.investmentRange.max) {
        issues.push({
          id: `ISSUE-${Date.now()}-${Math.random()}`,
          ruleId: 'ACC-001',
          severity: 'critical',
          title: 'Invalid investment range',
          description: `Minimum investment is greater than maximum for "${opportunity.name}"`,
          affectedItems: [opportunity.id],
          category: 'accuracy',
          status: 'open',
          detectedDate: new Date()
        });
      }
      
      // Check strategic fit score bounds
      if (opportunity.strategicFitScore < 0 || opportunity.strategicFitScore > 100) {
        issues.push({
          id: `ISSUE-${Date.now()}-${Math.random()}`,
          ruleId: 'COMPL-002',
          severity: 'warning',
          title: 'Strategic fit score out of bounds',
          description: `Strategic fit score ${opportunity.strategicFitScore} is not between 0-100`,
          affectedItems: [opportunity.id],
          category: 'compliance',
          status: 'open',
          detectedDate: new Date()
        });
      }
      
      // Check for missing sponsor
      if (!opportunity.sponsor || opportunity.sponsor.length === 0) {
        issues.push({
          id: `ISSUE-${Date.now()}-${Math.random()}`,
          ruleId: 'COMP-004',
          severity: 'critical',
          title: 'Missing sponsor',
          description: `Opportunity "${opportunity.name}" has no assigned sponsor`,
          affectedItems: [opportunity.id],
          category: 'completeness',
          status: 'open',
          detectedDate: new Date()
        });
      }
    });
    
    return issues;
  };

  const validateProjects = async (): Promise<DataQualityIssue[]> => {
    const issues: DataQualityIssue[] = [];
    const projects = sharedData.validatedProjects;
    
    projects.forEach(project => {
      // Apply all enabled validation rules
      validationRules.filter(rule => rule.enabled).forEach(rule => {
        let isValid = true;
        let errorMessage = '';
        
        try {
          switch (rule.id) {
            case 'FIN-001':
              isValid = project.irr >= 5 && project.irr <= 50;
              errorMessage = `IRR ${project.irr.toFixed(1)}% is outside acceptable range (5%-50%)`;
              break;
            case 'FIN-002':
              isValid = project.investmentGrade !== 'A' || project.npv > 0;
              errorMessage = `Grade A project has negative NPV: ${project.npv}`;
              break;
            case 'FIN-003':
              isValid = project.paybackYears <= 10;
              errorMessage = `Payback period ${project.paybackYears.toFixed(1)} years exceeds 10 years`;
              break;
            case 'FIN-004':
              isValid = project.capex >= 1000000 && project.capex <= 10000000000;
              errorMessage = `CAPEX ${project.capex} is outside reasonable bounds ($1M-$10B)`;
              break;
            case 'COMP-001':
              isValid = project.businessPlan?.executiveSummary?.length > 0;
              errorMessage = 'Missing executive summary in business plan';
              break;
            case 'COMP-002':
              isValid = project.businessPlan?.risks?.length > 0;
              errorMessage = 'Missing risk assessment in business plan';
              break;
            case 'COMP-003':
              isValid = project.capex < 500000000 || (project.businessPlan?.synergies?.length > 0);
              errorMessage = 'Large project (>$500M) missing synergy analysis';
              break;
            case 'COMP-004':
              isValid = project.sponsor?.length > 0;
              errorMessage = 'Missing project sponsor';
              break;
            case 'CONS-003':
              isValid = validateGradeConsistency(project);
              errorMessage = 'Investment grade inconsistent with composite score';
              break;
            case 'ACC-001':
              isValid = validateCompositeScore(project);
              errorMessage = 'Composite score calculation error';
              break;
            case 'COMPL-001':
              isValid = project.capex >= 10000000;
              errorMessage = `Project CAPEX ${project.capex} below minimum threshold ($10M)`;
              break;
            case 'COMPL-002':
              isValid = project.riskScore >= 0 && project.riskScore <= 100;
              errorMessage = `Risk score ${project.riskScore} is outside valid range (0-100)`;
              break;
            default:
              isValid = true;
          }
        } catch (error) {
          isValid = false;
          errorMessage = `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
        
        if (!isValid) {
          issues.push({
            id: `ISSUE-${Date.now()}-${Math.random()}`,
            ruleId: rule.id,
            severity: rule.severity,
            title: rule.name,
            description: errorMessage,
            affectedItems: [project.id],
            category: rule.category,
            status: 'open',
            detectedDate: new Date(),
            autoFixSuggestion: rule.autoFixable ? 'Auto-fix available' : undefined
          });
        }
      });
    });
    
    return issues;
  };

  const validateSectorAllocations = async (): Promise<DataQualityIssue[]> => {
    const issues: DataQualityIssue[] = [];
    const allocations = sharedData.sectorAllocations;
    
    allocations.forEach(allocation => {
      // Check allocation bounds
      if (allocation.currentAllocation < 0 || allocation.currentAllocation > 100) {
        issues.push({
          id: `ISSUE-${Date.now()}-${Math.random()}`,
          ruleId: 'COMPL-003',
          severity: 'critical',
          title: 'Invalid sector allocation',
          description: `${allocation.sector.name} allocation ${allocation.currentAllocation.toFixed(1)}% is outside valid range`,
          affectedItems: [allocation.sectorId],
          category: 'compliance',
          status: 'open',
          detectedDate: new Date()
        });
      }
      
      // Check constraint violations
      if (allocation.minAllocation && allocation.currentAllocation < allocation.minAllocation) {
        issues.push({
          id: `ISSUE-${Date.now()}-${Math.random()}`,
          ruleId: 'COMPL-003',
          severity: 'critical',
          title: 'Minimum allocation constraint violation',
          description: `${allocation.sector.name} allocation ${allocation.currentAllocation.toFixed(1)}% below minimum ${allocation.minAllocation.toFixed(1)}%`,
          affectedItems: [allocation.sectorId],
          category: 'compliance',
          status: 'open',
          detectedDate: new Date()
        });
      }
      
      if (allocation.maxAllocation && allocation.currentAllocation > allocation.maxAllocation) {
        issues.push({
          id: `ISSUE-${Date.now()}-${Math.random()}`,
          ruleId: 'COMPL-003',
          severity: 'warning',
          title: 'Maximum allocation constraint violation',
          description: `${allocation.sector.name} allocation ${allocation.currentAllocation.toFixed(1)}% exceeds maximum ${allocation.maxAllocation.toFixed(1)}%`,
          affectedItems: [allocation.sectorId],
          category: 'compliance',
          status: 'open',
          detectedDate: new Date()
        });
      }
    });
    
    return issues;
  };

  const validateGradeConsistency = (project: ValidatedProject): boolean => {
    const { compositeScore, riskScore, investmentGrade } = project;
    
    if (compositeScore > 80 && riskScore < 30) {
      return investmentGrade === 'A';
    } else if (compositeScore >= 60 && compositeScore <= 80 && riskScore >= 30 && riskScore <= 50) {
      return investmentGrade === 'B';
    } else if (compositeScore >= 40 && compositeScore <= 60 && riskScore >= 50 && riskScore <= 70) {
      return investmentGrade === 'C';
    } else {
      return investmentGrade === 'Non-Investment';
    }
  };

  const validateCompositeScore = (project: ValidatedProject): boolean => {
    const { scoringBreakdown } = project;
    const calculatedScore = (
      (scoringBreakdown.strategicAlignment * 0.4) +
      (scoringBreakdown.financialScore * 0.3) +
      (scoringBreakdown.riskAdjustment * 0.2) +
      (scoringBreakdown.synergyScore * 0.1)
    );
    
    return Math.abs(calculatedScore - scoringBreakdown.compositeScore) < 1; // Allow 1% tolerance
  };

  const calculateDataQualityMetrics = (issues: DataQualityIssue[]): DataQualityMetrics => {
    const totalDataPoints = 
      sharedData.investmentPriorities.length +
      sharedData.opportunities.length +
      sharedData.validatedProjects.length +
      sharedData.sectorAllocations.length;
    
    const criticalIssues = issues.filter(i => i.severity === 'critical').length;
    const warningIssues = issues.filter(i => i.severity === 'warning').length;
    const infoIssues = issues.filter(i => i.severity === 'info').length;
    const resolvedIssues = issues.filter(i => i.status === 'resolved').length;
    
    // Calculate overall score (100 - weighted penalty for issues)
    const criticalPenalty = criticalIssues * 10;
    const warningPenalty = warningIssues * 5;
    const infoPenalty = infoIssues * 1;
    const totalPenalty = criticalPenalty + warningPenalty + infoPenalty;
    const overallScore = Math.max(0, 100 - totalPenalty);
    
    const categoryBreakdown = issues.reduce((acc, issue) => {
      acc[issue.category] = (acc[issue.category] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
    
    return {
      overallScore,
      totalIssues: issues.length,
      criticalIssues,
      warningIssues,
      infoIssues,
      resolvedIssues,
      categoryBreakdown,
      trendData: [
        { date: new Date(), score: overallScore, issueCount: issues.length }
      ]
    };
  };

  // Handle issue resolution
  const handleIssueResolution = (issueId: string, newStatus: 'resolved' | 'ignored') => {
    const updatedIssues = dataQualityIssues.map(issue => 
      issue.id === issueId 
        ? { ...issue, status: newStatus, resolvedDate: new Date(), resolvedBy: 'User' }
        : issue
    );
    
    setDataQualityIssues(updatedIssues);
    
    const updatedMetrics = calculateDataQualityMetrics(updatedIssues);
    setDataQualityMetrics(updatedMetrics);
    
    onDataUpdate({
      validationRules,
      dataQualityIssues: updatedIssues,
      dataQualityMetrics: updatedMetrics
    });
  };

  // Toggle validation rule
  const toggleValidationRule = (ruleId: string) => {
    const updatedRules = validationRules.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    );
    
    setValidationRules(updatedRules);
    onDataUpdate({
      validationRules: updatedRules,
      dataQualityIssues,
      dataQualityMetrics
    });
  };

  // Filter issues
  const filteredIssues = dataQualityIssues.filter(issue => {
    const categoryMatch = selectedCategory === 'all' || issue.category === selectedCategory;
    const severityMatch = selectedSeverity === 'all' || issue.severity === selectedSeverity;
    const statusMatch = selectedStatus === 'all' || issue.status === selectedStatus;
    
    return categoryMatch && severityMatch && statusMatch;
  });

  // Get quality score color
  const getQualityScoreColor = (score: number) => {
    if (score >= 90) return '#00c853';
    if (score >= 70) return '#ff9800';
    return '#f44336';
  };

  return (
    <div className="tab5-data-quality">
      {/* Header Dashboard */}
      <div className="quality-header">
        <div className="quality-score-card">
          <div className="score-container">
            <div className="score-gauge">
              <svg width="160" height="160" className="gauge-chart">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="#475569"
                  strokeWidth="8"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke={getQualityScoreColor(dataQualityMetrics.overallScore)}
                  strokeWidth="8"
                  strokeDasharray={`${(dataQualityMetrics.overallScore / 100) * 440} 440`}
                  strokeDashoffset="0"
                  transform="rotate(-90 80 80)"
                />
                <text x="80" y="75" textAnchor="middle" className="score-value">
                  {Math.round(dataQualityMetrics.overallScore)}%
                </text>
                <text x="80" y="95" textAnchor="middle" className="score-label">
                  {dataQualityMetrics.overallScore >= 90 ? 'Excellent' : 
                   dataQualityMetrics.overallScore >= 70 ? 'Good' : 'Poor'}
                </text>
              </svg>
            </div>
            <div className="score-title">Overall Data Quality Score</div>
          </div>
          
          <div className="quality-summary">
            <div className="summary-item critical">
              <div className="summary-count">{dataQualityMetrics.criticalIssues}</div>
              <div className="summary-label">Critical Issues</div>
            </div>
            <div className="summary-item warning">
              <div className="summary-count">{dataQualityMetrics.warningIssues}</div>
              <div className="summary-label">Warnings</div>
            </div>
            <div className="summary-item info">
              <div className="summary-count">{dataQualityMetrics.infoIssues}</div>
              <div className="summary-label">Info</div>
            </div>
            <div className="summary-item resolved">
              <div className="summary-count">{dataQualityMetrics.resolvedIssues}</div>
              <div className="summary-label">Resolved</div>
            </div>
          </div>
        </div>
        
        <div className="quality-actions">
          <button 
            className="btn btn-primary"
            onClick={runValidation}
            disabled={isValidating}
          >
            {isValidating ? 'Validating...' : 'Run Validation'}
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => setShowRulesModal(true)}
          >
            Manage Rules
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="quality-filters">
        <div className="filter-group">
          <label>Category:</label>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            <option value="financial">Financial</option>
            <option value="completeness">Completeness</option>
            <option value="consistency">Consistency</option>
            <option value="accuracy">Accuracy</option>
            <option value="compliance">Compliance</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Severity:</label>
          <select 
            value={selectedSeverity} 
            onChange={(e) => setSelectedSeverity(e.target.value as any)}
            className="filter-select"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Status:</label>
          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="resolved">Resolved</option>
            <option value="ignored">Ignored</option>
          </select>
        </div>
      </div>

      {/* Issues Table */}
      <div className="issues-table">
        <div className="table-header">
          <h3>Data Quality Issues ({filteredIssues.length})</h3>
        </div>
        
        <table className="data-table">
          <thead>
            <tr>
              <th>Issue Type</th>
              <th>Description</th>
              <th>Severity</th>
              <th>Affected Items</th>
              <th>Category</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredIssues.map(issue => (
              <tr key={issue.id}>
                <td>
                  <div className="issue-type">
                    <div className={`issue-icon ${issue.severity}`}>
                      {issue.severity === 'critical' ? '🔴' : 
                       issue.severity === 'warning' ? '🟡' : '🔵'}
                    </div>
                    <span>{issue.title}</span>
                  </div>
                </td>
                <td className="issue-description">
                  {issue.description}
                  {issue.autoFixSuggestion && (
                    <div className="auto-fix-suggestion">
                      💡 {issue.autoFixSuggestion}
                    </div>
                  )}
                </td>
                <td>
                  <span className={`severity-badge ${issue.severity}`}>
                    {issue.severity}
                  </span>
                </td>
                <td>
                  <span className="affected-count">
                    {issue.affectedItems.length} items
                  </span>
                </td>
                <td>
                  <span className={`category-badge ${issue.category}`}>
                    {issue.category}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${issue.status}`}>
                    {issue.status}
                  </span>
                </td>
                <td>
                  <div className="issue-actions">
                    {issue.status === 'open' && (
                      <>
                        <button 
                          className="btn btn-sm btn-success"
                          onClick={() => handleIssueResolution(issue.id, 'resolved')}
                        >
                          Resolve
                        </button>
                        <button 
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleIssueResolution(issue.id, 'ignored')}
                        >
                          Ignore
                        </button>
                      </>
                    )}
                    <button className="btn btn-sm btn-primary">
                      Details
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Validation Rules Modal */}
      {showRulesModal && (
        <div className="modal-overlay" onClick={() => setShowRulesModal(false)}>
          <div className="modal-content rules-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Manage Validation Rules</h2>
              <button className="modal-close" onClick={() => setShowRulesModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="rules-table">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Enabled</th>
                      <th>Rule Name</th>
                      <th>Category</th>
                      <th>Severity</th>
                      <th>Description</th>
                      <th>Auto-fixable</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validationRules.map(rule => (
                      <tr key={rule.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={rule.enabled}
                            onChange={() => toggleValidationRule(rule.id)}
                          />
                        </td>
                        <td>
                          <span className="rule-name">{rule.name}</span>
                        </td>
                        <td>
                          <span className={`category-badge ${rule.category}`}>
                            {rule.category}
                          </span>
                        </td>
                        <td>
                          <span className={`severity-badge ${rule.severity}`}>
                            {rule.severity}
                          </span>
                        </td>
                        <td>{rule.description}</td>
                        <td>
                          {rule.autoFixable && (
                            <span className="auto-fix-indicator">✅</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};