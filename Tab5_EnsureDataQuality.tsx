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
  const [isValidating, setIsValidating] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All Severities');
  const [selectedStatus, setSelectedStatus] = useState<string>('All Status');

  // Initialize validation rules if empty
  useEffect(() => {
    if (sharedData.validationRules.length === 0) {
      initializeValidationRules();
    }
    // Run initial validation after a short delay
    const timer = setTimeout(() => {
      runValidation();
    }, 500);

    return () => clearTimeout(timer);
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
        checkFunction: 'allocation => true',
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
        checkFunction: 'project => project.capex >= 10000000',
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
      (sharedData.investmentPriorities?.length || 0) * 5 + // 5 checks per priority
      (sharedData.opportunities?.length || 0) * 4 + // 4 checks per opportunity
      (sharedData.validatedProjects?.length || 0) * 8 + // 8 checks per project
      (sharedData.sectorAllocations?.length || 0) * 3; // 3 checks per allocation

    const openIssues = issues.filter(i => i.status === 'open');
    const criticalIssues = openIssues.filter(i => i.severity === 'critical').length;
    const warningIssues = openIssues.filter(i => i.severity === 'warning').length;
    const infoIssues = openIssues.filter(i => i.severity === 'info').length;
    const resolvedIssues = issues.filter(i => i.status === 'resolved').length;

    // Calculate overall score - start at 100 and deduct for issues
    const criticalPenalty = criticalIssues * 15; // 15 points per critical issue
    const warningPenalty = warningIssues * 5;   // 5 points per warning
    const infoPenalty = infoIssues * 2;         // 2 points per info

    // Also consider completeness
    const dataCompleteness = totalDataPoints > 0 ? 
      ((totalDataPoints - openIssues.length) / totalDataPoints) * 100 : 100;

    // Weighted score: 70% data quality, 30% completeness
    const qualityScore = Math.max(0, 100 - criticalPenalty - warningPenalty - infoPenalty);
    const overallScore = Math.max(0, Math.min(100, (qualityScore * 0.7) + (dataCompleteness * 0.3)));

    const categoryBreakdown = openIssues.reduce((acc, issue) => {
      acc[issue.category] = (acc[issue.category] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    return {
      overallScore: Math.round(overallScore),
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

  // Get quality score color
  const getQualityScoreColor = (score: number) => {
    if (score >= 85) return '#10b981';
    if (score >= 70) return '#f59e0b';
    return '#ef4444';
  };

  // Get severity badge color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'financial': return '#3b82f6';
      case 'completeness': return '#8b5cf6';
      case 'consistency': return '#10b981';
      case 'accuracy': return '#f59e0b';
      case 'compliance': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Filter issues based on selections
  const filteredIssues = dataQualityIssues.filter(issue => {
    if (selectedCategory !== 'All Categories' && issue.category !== selectedCategory.toLowerCase()) return false;
    if (selectedSeverity !== 'All Severities' && issue.severity !== selectedSeverity.toLowerCase()) return false;
    if (selectedStatus !== 'All Status' && issue.status !== selectedStatus.toLowerCase()) return false;
    return true;
  });

  return (
    <div className="tab5-data-quality" style={{
      padding: '1.5rem',
      background: '#0a0e27',
      minHeight: 'calc(100vh - 100px)',
      color: '#e2e8f0'
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '2rem'
      }}>
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: '600',
          color: '#ffffff',
          marginBottom: '0.5rem'
        }}>Data Quality Management</h1>
        <p style={{
          color: '#94a3b8',
          fontSize: '0.875rem'
        }}>Ensure data integrity and compliance across all investment data</p>
      </div>

      {/* Score Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '200px 1fr',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {/* Overall Score Card */}
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '16px',
          padding: '2rem',
          border: '1px solid #334155',
          textAlign: 'center',
          position: 'relative'
        }}>
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            border: `8px solid ${getQualityScoreColor(dataQualityMetrics.overallScore)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            background: 'rgba(0, 0, 0, 0.3)',
            position: 'relative'
          }}>
            <span style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: getQualityScoreColor(dataQualityMetrics.overallScore)
            }}>
              {dataQualityMetrics.overallScore}%
            </span>
          </div>
          <h3 style={{
            color: '#94a3b8',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}>Overall Data Quality Score</h3>
        </div>

        {/* Issue Summary Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            borderRadius: '12px',
            padding: '1.5rem',
            border: '1px solid #334155'
          }}>
            <div style={{
              color: '#94a3b8',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
              letterSpacing: '0.5px'
            }}>Critical Issues</div>
            <div style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#ef4444'
            }}>{dataQualityMetrics.criticalIssues}</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            borderRadius: '12px',
            padding: '1.5rem',
            border: '1px solid #334155'
          }}>
            <div style={{
              color: '#94a3b8',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
              letterSpacing: '0.5px'
            }}>Warnings</div>
            <div style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#f59e0b'
            }}>{dataQualityMetrics.warningIssues}</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            borderRadius: '12px',
            padding: '1.5rem',
            border: '1px solid #334155'
          }}>
            <div style={{
              color: '#94a3b8',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
              letterSpacing: '0.5px'
            }}>Info</div>
            <div style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#3b82f6'
            }}>{dataQualityMetrics.infoIssues}</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            borderRadius: '12px',
            padding: '1.5rem',
            border: '1px solid #334155'
          }}>
            <div style={{
              color: '#94a3b8',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
              letterSpacing: '0.5px'
            }}>Resolved</div>
            <div style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#10b981'
            }}>{dataQualityMetrics.resolvedIssues}</div>
          </div>
        </div>
      </div>

      {/* Actions and Filters */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        gap: '1rem'
      }}>
        <div style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center'
        }}>
          <button
            onClick={runValidation}
            disabled={isValidating}
            style={{
              background: '#3b82f6',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              cursor: isValidating ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              opacity: isValidating ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {isValidating ? 'Validating...' : 'Run Validation'}
          </button>

          <button
            onClick={() => setShowRulesModal(true)}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#e2e8f0',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Manage Rules
          </button>
        </div>

        <div style={{
          display: 'flex',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                background: '#1e293b',
                color: '#e2e8f0',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: '1px solid #334155',
                cursor: 'pointer'
              }}
            >
              <option>All Categories</option>
              <option>Financial</option>
              <option>Completeness</option>
              <option>Consistency</option>
              <option>Accuracy</option>
              <option>Compliance</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Severity:</label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              style={{
                background: '#1e293b',
                color: '#e2e8f0',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: '1px solid #334155',
                cursor: 'pointer'
              }}
            >
              <option>All Severities</option>
              <option>Critical</option>
              <option>Warning</option>
              <option>Info</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                background: '#1e293b',
                color: '#e2e8f0',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: '1px solid #334155',
                cursor: 'pointer'
              }}
            >
              <option>All Status</option>
              <option>Open</option>
              <option>Resolved</option>
              <option>Ignored</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Quality Issues Table */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: '16px',
        border: '1px solid #334155',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #334155'
        }}>
          <h2 style={{
            color: '#ffffff',
            fontSize: '1.125rem',
            fontWeight: '600'
          }}>Data Quality Issues ({filteredIssues.length})</h2>
        </div>

        <div style={{
          overflowX: 'auto'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{
                background: '#0f172a'
              }}>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  color: '#94a3b8',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderBottom: '1px solid #334155'
                }}>Issue Type</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  color: '#94a3b8',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderBottom: '1px solid #334155'
                }}>Description</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'center',
                  color: '#94a3b8',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderBottom: '1px solid #334155'
                }}>Severity</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'center',
                  color: '#94a3b8',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderBottom: '1px solid #334155'
                }}>Affected Items</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'center',
                  color: '#94a3b8',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderBottom: '1px solid #334155'
                }}>Category</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'center',
                  color: '#94a3b8',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderBottom: '1px solid #334155'
                }}>Status</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'center',
                  color: '#94a3b8',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderBottom: '1px solid #334155'
                }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredIssues.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{
                    padding: '3rem',
                    textAlign: 'center',
                    color: '#64748b'
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.5 }}>✅</div>
                    No issues found matching the selected filters
                  </td>
                </tr>
              ) : (
                filteredIssues.map((issue) => (
                  <tr key={issue.id} style={{
                    borderBottom: '1px solid #334155',
                    transition: 'background 0.2s ease'
                  }}>
                    <td style={{
                      padding: '1rem',
                      color: '#e2e8f0',
                      fontSize: '0.875rem',
                      verticalAlign: 'middle'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: getSeverityColor(issue.severity)
                        }} />
                        <span style={{ fontWeight: '500' }}>{issue.title}</span>
                      </div>
                    </td>
                    <td style={{
                      padding: '1rem',
                      color: '#94a3b8',
                      fontSize: '0.875rem',
                      verticalAlign: 'middle'
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span>{issue.description}</span>
                        {issue.autoFixSuggestion && (
                          <span style={{
                            fontSize: '0.75rem',
                            color: '#3b82f6',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}>
                            💡 {issue.autoFixSuggestion}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{
                      padding: '1rem',
                      textAlign: 'center',
                      verticalAlign: 'middle'
                    }}>
                      <span style={{
                        background: issue.severity === 'critical' ? 'rgba(239, 68, 68, 0.1)' :
                                    issue.severity === 'warning' ? 'rgba(245, 158, 11, 0.1)' :
                                    'rgba(59, 130, 246, 0.1)',
                        color: getSeverityColor(issue.severity),
                        padding: '0.375rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>
                        {issue.severity}
                      </span>
                    </td>
                    <td style={{
                      padding: '1rem',
                      textAlign: 'center',
                      color: '#e2e8f0',
                      fontSize: '0.875rem',
                      verticalAlign: 'middle',
                      fontWeight: '500'
                    }}>
                      {issue.affectedItems.length} items
                    </td>
                    <td style={{
                      padding: '1rem',
                      textAlign: 'center',
                      verticalAlign: 'middle'
                    }}>
                      <span style={{
                        color: getCategoryColor(issue.category),
                        textTransform: 'uppercase',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        {issue.category}
                      </span>
                    </td>
                    <td style={{
                      padding: '1rem',
                      textAlign: 'center',
                      verticalAlign: 'middle'
                    }}>
                      <span style={{
                        textTransform: 'uppercase',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: issue.status === 'open' ? '#e2e8f0' : '#10b981'
                      }}>
                        {issue.status}
                      </span>
                    </td>
                    <td style={{
                      padding: '1rem',
                      textAlign: 'center',
                      verticalAlign: 'middle'
                    }}>
                      {issue.status === 'open' && (
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleIssueResolution(issue.id, 'resolved')}
                            style={{
                              background: '#10b981',
                              color: 'white',
                              padding: '0.375rem 0.75rem',
                              borderRadius: '6px',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}
                          >
                            Resolve
                          </button>
                          <button
                            onClick={() => handleIssueResolution(issue.id, 'ignored')}
                            style={{
                              background: 'rgba(255, 255, 255, 0.1)',
                              color: '#94a3b8',
                              padding: '0.375rem 0.75rem',
                              borderRadius: '6px',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}
                          >
                            Ignore
                          </button>
                          <button
                            style={{
                              background: 'rgba(255, 255, 255, 0.1)',
                              color: '#94a3b8',
                              padding: '0.375rem 0.75rem',
                              borderRadius: '6px',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}
                          >
                            Details
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Validation Rules Modal */}
      {showRulesModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#1e293b',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '900px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            border: '1px solid #334155',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem'
            }}>
              <h2 style={{ color: '#ffffff', fontSize: '1.5rem', fontWeight: '600' }}>Manage Validation Rules</h2>
              <button 
                onClick={() => setShowRulesModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '1.5rem',
                  cursor: 'pointer'
                }}
              >×</button>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '600' }}>ENABLED</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '600' }}>RULE NAME</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '600' }}>CATEGORY</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '600' }}>SEVERITY</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '600' }}>DESCRIPTION</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '600' }}>AUTO-FIXABLE</th>
                  </tr>
                </thead>
                <tbody>
                  {validationRules.map(rule => (
                    <tr key={rule.id} style={{ borderBottom: '1px solid #334155' }}>
                      <td style={{ padding: '0.75rem' }}>
                        <input
                          type="checkbox"
                          checked={rule.enabled}
                          onChange={() => toggleValidationRule(rule.id)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                      <td style={{ padding: '0.75rem', color: '#e2e8f0' }}>
                        {rule.name}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{
                          color: getCategoryColor(rule.category),
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>
                          {rule.category}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.375rem',
                          fontSize: '0.625rem',
                          fontWeight: '600',
                          background: rule.severity === 'critical' ? 'rgba(239, 68, 68, 0.1)' : 
                                     rule.severity === 'warning' ? 'rgba(245, 158, 11, 0.1)' : 
                                     'rgba(59, 130, 246, 0.1)',
                          color: getSeverityColor(rule.severity),
                          textTransform: 'uppercase'
                        }}>
                          {rule.severity}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                        {rule.description}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        {rule.autoFixable && (
                          <span style={{ color: '#10b981' }}>✅</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};