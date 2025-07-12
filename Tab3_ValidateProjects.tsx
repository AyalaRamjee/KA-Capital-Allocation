'use client'
import React, { useState, useEffect } from 'react';
import { ValidatedProject, InvestmentPriority, Opportunity, AdaniSector } from './types';
import { formatCurrency } from './mockDataAdani';
import FileUploadModal from './FileUploadModal';
import { parseFile, parseValidatedProjectsData } from './fileParsingUtils';
import { useToast } from './ToastContainer';

interface Tab3Props {
  sharedData: {
    opportunities: Opportunity[];
    priorities: InvestmentPriority[];
    validatedProjects: ValidatedProject[];
    sectors: AdaniSector[];
  };
  onDataUpdate: (data: { validatedProjects: ValidatedProject[] }) => void;
}

const Tab3_ValidateProjects: React.FC<Tab3Props> = ({ sharedData, onDataUpdate }) => {
  const [validatedProjects, setValidatedProjects] = useState<ValidatedProject[]>(sharedData.validatedProjects);
  const [selectedProject, setSelectedProject] = useState<ValidatedProject | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState<'summary' | 'financial' | 'risk' | 'alignment' | 'decision'>('summary');
  const [sortBy, setSortBy] = useState<'score' | 'grade' | 'investment' | 'irr'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterGrade, setFilterGrade] = useState<'all' | 'A' | 'B' | 'C' | 'Non-Investment'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'in_review' | 'validated' | 'rejected'>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const toast = useToast();

  // Calculate composite score
  const calculateCompositeScore = (opportunity: Opportunity, priorities: InvestmentPriority[]): number => {
    const strategicAlignment = opportunity.strategicFitScore;
    const financialScore = Math.min(100, (opportunity.investmentRange.min / 10000000) * 10);
    const riskAdjustment = 100 - opportunity.preliminaryRiskScore;
    const synergyScore = Math.random() * 30 + 50;
    
    return (
      (strategicAlignment * 0.4) +
      (financialScore * 0.3) +
      (riskAdjustment * 0.2) +
      (synergyScore * 0.1)
    );
  };

  // Determine investment grade
  const getInvestmentGrade = (compositeScore: number, riskScore: number): 'A' | 'B' | 'C' | 'Non-Investment' => {
    if (compositeScore > 80 && riskScore < 30) return 'A';
    if (compositeScore >= 60 && compositeScore <= 80 && riskScore >= 30 && riskScore <= 50) return 'B';
    if (compositeScore >= 40 && compositeScore <= 60 && riskScore >= 50 && riskScore <= 70) return 'C';
    return 'Non-Investment';
  };

  // Convert opportunity to project
  const convertOpportunityToProject = (opportunity: Opportunity): ValidatedProject => {
    const compositeScore = calculateCompositeScore(opportunity, sharedData.priorities);
    const investmentGrade = getInvestmentGrade(compositeScore, opportunity.preliminaryRiskScore);
    
    return {
      id: `VAL-${opportunity.id.split('-')[1]}`,
      opportunityId: opportunity.id,
      name: opportunity.name,
      description: opportunity.description,
      sponsor: opportunity.sponsor,
      status: 'planning',
      
      capex: opportunity.investmentRange.max,
      opex: opportunity.investmentRange.max * 0.1,
      revenuePotential: opportunity.investmentRange.max * 1.5,
      
      npv: opportunity.investmentRange.max * 0.3,
      irr: 15 + (compositeScore / 10),
      mirr: 12 + (compositeScore / 15),
      paybackYears: 8 - (compositeScore / 25),
      
      compositeScore,
      investmentGrade,
      
      riskScore: opportunity.preliminaryRiskScore,
      duration: opportunity.duration,
      geography: opportunity.source.includes('Australia') ? 'Australia' : 'India',
      businessUnit: opportunity.source,
      createdAt: new Date(),
      updatedAt: new Date(),
      
      validationId: `VAL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      validationStatus: 'pending',
      validationDate: new Date(),
      validatedBy: 'System',
      
      businessPlan: {
        executiveSummary: opportunity.description,
        marketAnalysis: `Market analysis for ${opportunity.name}`,
        marketSize: opportunity.investmentRange.max * 5,
        competitiveLandscape: `Competitive analysis for ${opportunity.name}`,
        investmentThesis: `Investment thesis: ${opportunity.recommendations}`,
        keySuccessFactors: [
          'Strong market demand',
          'Operational excellence',
          'Cost competitive position',
          'Regulatory support'
        ],
        expectedOutcomes: [
          'Market leadership position',
          'Sustainable competitive advantage',
          'Strong financial returns',
          'Synergies with existing businesses'
        ],
        
        financials: Array.from({ length: 20 }, (_, i) => ({
          year: Math.floor(i / 4) + 1,
          quarter: (i % 4) + 1,
          revenue: opportunity.investmentRange.max * 0.2 * (1 + i * 0.05),
          costs: opportunity.investmentRange.max * 0.15 * (1 + i * 0.03),
          ebitda: opportunity.investmentRange.max * 0.05 * (1 + i * 0.07),
          ebitdaMargin: 25 + i * 0.5,
          cashFlow: opportunity.investmentRange.max * 0.04 * (1 + i * 0.06),
          capexDeployment: i < 8 ? opportunity.investmentRange.max * 0.125 : 0,
          cumulativeCapex: opportunity.investmentRange.max * Math.min(1, (i + 1) * 0.125),
          roic: 12 + i * 0.3
        })),
        
        financialProjections: [],
        riskMitigation: [],
        
        risks: [
          {
            id: 'R001',
            category: 'market',
            description: 'Market demand volatility',
            probability: 40,
            impact: 60,
            riskScore: 24,
            mitigation: 'Diversified customer base and flexible operations',
            mitigationCost: opportunity.investmentRange.max * 0.02,
            owner: opportunity.sponsor,
            status: 'identified'
          },
          {
            id: 'R002',
            category: 'execution',
            description: 'Project delivery delays',
            probability: 30,
            impact: 50,
            riskScore: 15,
            mitigation: 'Experienced project team and proven contractors',
            mitigationCost: opportunity.investmentRange.max * 0.01,
            owner: opportunity.sponsor,
            status: 'identified'
          }
        ],
        
        synergies: [
          {
            id: 'S001',
            businessUnit: opportunity.source,
            type: 'revenue',
            description: 'Cross-selling opportunities with existing customers',
            valueEstimate: opportunity.investmentRange.max * 0.05,
            timeToRealize: 18,
            confidence: 'medium',
            dependencies: ['Customer integration', 'Sales alignment']
          },
          {
            id: 'S002',
            businessUnit: opportunity.source,
            type: 'cost',
            description: 'Shared infrastructure and operational synergies',
            valueEstimate: opportunity.investmentRange.max * 0.03,
            timeToRealize: 12,
            confidence: 'high',
            dependencies: ['Operational integration']
          }
        ]
      },
      
      scoringBreakdown: {
        strategicAlignment: opportunity.strategicFitScore,
        financialScore: Math.min(100, (opportunity.investmentRange.min / 10000000) * 10),
        riskAdjustment: 100 - opportunity.preliminaryRiskScore,
        synergyScore: Math.random() * 30 + 50,
        compositeScore
      }
    };
  };

  // Initialize validated projects
  useEffect(() => {
    const approvedOpportunities = sharedData.opportunities.filter(opp => opp.status === 'approved');
    const existingProjectIds = sharedData.validatedProjects.map(proj => proj.opportunityId);
    
    const newProjects = approvedOpportunities
      .filter(opp => !existingProjectIds.includes(opp.id))
      .map(opp => convertOpportunityToProject(opp));
    
    if (newProjects.length > 0) {
      const updatedProjects = [...sharedData.validatedProjects, ...newProjects];
      setValidatedProjects(updatedProjects);
      onDataUpdate({ validatedProjects: updatedProjects });
    }
  }, [sharedData.opportunities, sharedData.validatedProjects]);

  // Calculate metrics
  const totalProjects = validatedProjects.length;
  const gradeAProjects = validatedProjects.filter(p => p.investmentGrade === 'A').length;
  const gradeBProjects = validatedProjects.filter(p => p.investmentGrade === 'B').length;
  const gradeCProjects = validatedProjects.filter(p => p.investmentGrade === 'C').length;
  const nonInvestmentProjects = validatedProjects.filter(p => p.investmentGrade === 'Non-Investment').length;
  const pendingValidation = validatedProjects.filter(p => p.validationStatus === 'pending' || p.validationStatus === 'in_review').length;
  const totalPipelineValue = validatedProjects.reduce((sum, p) => sum + p.capex, 0);

  // Get risk level
  const getRiskLevel = (riskScore: number): 'Low' | 'Medium' | 'High' => {
    if (riskScore <= 30) return 'Low';
    if (riskScore <= 60) return 'Medium';
    return 'High';
  };

  // Sort and filter projects
  const filteredProjects = validatedProjects.filter(p => {
    const gradeMatch = filterGrade === 'all' || p.investmentGrade === filterGrade;
    const statusMatch = filterStatus === 'all' || p.validationStatus === filterStatus;
    return gradeMatch && statusMatch;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    let aVal, bVal;
    switch (sortBy) {
      case 'score':
        aVal = a.compositeScore;
        bVal = b.compositeScore;
        break;
      case 'grade':
        const gradeOrder = { 'A': 4, 'B': 3, 'C': 2, 'Non-Investment': 1 };
        aVal = gradeOrder[a.investmentGrade];
        bVal = gradeOrder[b.investmentGrade];
        break;
      case 'investment':
        aVal = a.capex;
        bVal = b.capex;
        break;
      case 'irr':
        aVal = a.irr;
        bVal = b.irr;
        break;
      default:
        aVal = a.compositeScore;
        bVal = b.compositeScore;
    }
    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
  });

  // Handle validation status update
  const handleValidationStatusUpdate = (projectId: string, newStatus: ValidatedProject['validationStatus']) => {
    const updatedProjects = validatedProjects.map(proj => 
      proj.id === projectId 
        ? { ...proj, validationStatus: newStatus, validationDate: new Date() }
        : proj
    );
    setValidatedProjects(updatedProjects);
    onDataUpdate({ validatedProjects: updatedProjects });
  };

  // Open business plan view
  const openBusinessPlan = (project: ValidatedProject) => {
    setSelectedProject(project);
    setShowModal(true);
    setModalTab('summary');
  };

  // Handle sorting
  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  // Get grade color
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'grade-a';
      case 'B': return 'grade-b';
      case 'C': return 'grade-c';
      default: return 'grade-non';
    }
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    try {
      const rawData = await parseFile(file);
      const result = parseValidatedProjectsData(rawData);
      
      if (result.errors.length > 0) {
        toast.error(
          'Upload Failed', 
          `Found ${result.errors.length} validation error(s) in the uploaded file.`
        );
        return;
      }
      
      // Convert imported data to ValidatedProject format
      const newProjects: ValidatedProject[] = result.data.map(project => ({
        id: project.id,
        opportunityId: project.id,
        name: project.name,
        description: `Imported project: ${project.name}`,
        sponsor: 'Imported User',
        status: 'planning',
        capex: project.investmentAmount,
        opex: project.investmentAmount * 0.1,
        revenuePotential: project.investmentAmount * 1.5,
        npv: project.npv,
        irr: project.expectedIRR,
        mirr: project.expectedIRR * 0.8,
        paybackYears: project.paybackPeriod,
        compositeScore: project.strategicAlignmentScore,
        investmentGrade: project.strategicAlignmentScore > 80 ? 'A' : 
                        project.strategicAlignmentScore > 60 ? 'B' : 
                        project.strategicAlignmentScore > 40 ? 'C' : 'Non-Investment',
        riskScore: project.riskScore,
        duration: Math.floor(project.paybackPeriod * 12),
        geography: 'India',
        businessUnit: 'Imported',
        createdAt: new Date(),
        updatedAt: new Date(),
        validationId: `VAL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        validationStatus: 'pending',
        validationDate: new Date(),
        validatedBy: 'System',
        businessPlan: {
          executiveSummary: `Imported project: ${project.name}`,
          marketAnalysis: 'Market analysis pending',
          marketSize: project.investmentAmount * 5,
          competitiveLandscape: 'Competitive analysis pending',
          investmentThesis: 'Investment thesis pending',
          keySuccessFactors: ['Market demand', 'Operational excellence'],
          expectedOutcomes: ['Market position', 'ROI achievement'],
          financials: [],
          financialProjections: [],
          operationalPlan: 'Operational plan pending',
          timeline: 'Timeline pending',
          budgetBreakdown: 'Budget breakdown pending',
          riskMitigation: [],
          risks: [],
          synergies: []
        },
        scoringBreakdown: {
          strategicAlignment: project.strategicAlignmentScore,
          financialScore: Math.min(100, project.expectedIRR * 4),
          riskAdjustment: 100 - project.riskScore,
          synergyScore: 75,
          compositeScore: project.strategicAlignmentScore
        }
      }));
      
      const updatedProjects = [...validatedProjects, ...newProjects];
      setValidatedProjects(updatedProjects);
      onDataUpdate({ validatedProjects: updatedProjects });
      
      toast.success(
        'Projects Imported!', 
        `Successfully imported ${newProjects.length} validated projects with scoring and analysis.`
      );
      
    } catch (error) {
      toast.error(
        'Import Error', 
        `Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  return (
    <div className="tab3-validate-clean">
      <div className="main-layout">
        <div className="table-section">
          <div className="section-header">
            <h2>Validated Projects</h2>
            <div className="header-filters">
              <button 
                className="upload-btn"
                onClick={() => setShowUploadModal(true)}
                style={{
                  background: '#1e293b',
                  border: '1px solid #3b82f6',
                  color: '#e2e8f0',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  marginRight: '16px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#334155';
                  e.currentTarget.style.boxShadow = '0 0 10px rgba(59, 130, 246, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#1e293b';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                📤 Import Excel/CSV
              </button>
              <select 
                value={filterGrade} 
                onChange={(e) => setFilterGrade(e.target.value as any)}
                className="filter-select-clean"
              >
                <option value="all">All Grades</option>
                <option value="A">Grade A</option>
                <option value="B">Grade B</option>
                <option value="C">Grade C</option>
                <option value="Non-Investment">Non-Investment</option>
              </select>
              
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="filter-select-clean"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_review">In Review</option>
                <option value="validated">Validated</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <table className="projects-table-clean">
            <thead>
              <tr>
                <th onClick={() => handleSort('grade')} className="sortable">
                  GRADE {sortBy === 'grade' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th>PROJECT NAME</th>
                <th onClick={() => handleSort('score')} className="sortable">
                  SCORE {sortBy === 'score' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('investment')} className="sortable">
                  INVESTMENT {sortBy === 'investment' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th>NPV</th>
                <th onClick={() => handleSort('irr')} className="sortable">
                  IRR {sortBy === 'irr' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th>PAYBACK</th>
                <th>RISK</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {sortedProjects.map(project => (
                <tr key={project.id}>
                  <td>
                    <span className={`grade-badge-clean ${getGradeColor(project.investmentGrade)}`}>
                      {project.investmentGrade}
                    </span>
                  </td>
                  <td>
                    <a 
                      href="#" 
                      className="project-link"
                      onClick={(e) => {
                        e.preventDefault();
                        openBusinessPlan(project);
                      }}
                    >
                      {project.name}
                    </a>
                    <div className="project-subtitle">{project.businessUnit}</div>
                  </td>
                  <td>
                    <span className="score-value">{Math.round(project.compositeScore)}%</span>
                  </td>
                  <td>{formatCurrency(project.capex)}</td>
                  <td>{formatCurrency(project.npv)}</td>
                  <td>{project.irr.toFixed(1)}%</td>
                  <td>{project.paybackYears.toFixed(1)}y</td>
                  <td>
                    <span className={`risk-badge-clean risk-${getRiskLevel(project.riskScore).toLowerCase()}`}>
                      {getRiskLevel(project.riskScore)} ({project.riskScore})
                    </span>
                  </td>
                  <td>
                    <span className={`validation-status-badge status-${project.validationStatus}`}>
                      {project.validationStatus.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="action-btn view-btn"
                        onClick={() => openBusinessPlan(project)}
                        title="View Business Plan"
                      >
                        📄
                      </button>
                      {project.validationStatus === 'pending' && (
                        <button 
                          className="action-btn review-btn"
                          onClick={() => handleValidationStatusUpdate(project.id, 'in_review')}
                          title="Start Review"
                        >
                          ▶️
                        </button>
                      )}
                      {project.validationStatus === 'in_review' && (
                        <>
                          <button 
                            className="action-btn approve-btn"
                            onClick={() => handleValidationStatusUpdate(project.id, 'validated')}
                            title="Validate"
                          >
                            ✅
                          </button>
                          <button 
                            className="action-btn reject-btn"
                            onClick={() => handleValidationStatusUpdate(project.id, 'rejected')}
                            title="Reject"
                          >
                            ❌
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right side - Summary */}
        <div className="summary-section">
          <div className="summary-card">
            <h3>Portfolio Summary</h3>
            <div className="summary-item">
              <span className="summary-label">Total Projects:</span>
              <span className="summary-value">{totalProjects}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Pipeline:</span>
              <span className="summary-value">{formatCurrency(totalPipelineValue)}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Pending Validation:</span>
              <span className="summary-value">{pendingValidation}</span>
            </div>
          </div>

          <div className="grade-distribution-card">
            <h3>Grade Distribution</h3>
            <div className="grade-chart-container">
              <svg width="150" height="150" className="grade-donut">
                {[
                  { grade: 'A', count: gradeAProjects, color: '#10b981', startAngle: 0 },
                  { grade: 'B', count: gradeBProjects, color: '#f59e0b', startAngle: (gradeAProjects / totalProjects) * 360 },
                  { grade: 'C', count: gradeCProjects, color: '#ef4444', startAngle: ((gradeAProjects + gradeBProjects) / totalProjects) * 360 },
                  { grade: 'Non', count: nonInvestmentProjects, color: '#6b7280', startAngle: ((gradeAProjects + gradeBProjects + gradeCProjects) / totalProjects) * 360 }
                ].map((item, index) => {
                  if (item.count === 0) return null;
                  const angle = (item.count / totalProjects) * 360;
                  const endAngle = item.startAngle + angle;
                  const radius = 60;
                  const centerX = 75;
                  const centerY = 75;
                  
                  const x1 = centerX + radius * Math.cos((item.startAngle - 90) * Math.PI / 180);
                  const y1 = centerY + radius * Math.sin((item.startAngle - 90) * Math.PI / 180);
                  const x2 = centerX + radius * Math.cos((endAngle - 90) * Math.PI / 180);
                  const y2 = centerY + radius * Math.sin((endAngle - 90) * Math.PI / 180);
                  
                  const largeArc = angle > 180 ? 1 : 0;
                  
                  return (
                    <path
                      key={item.grade}
                      d={`M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                      fill={item.color}
                      stroke="#1e293b"
                      strokeWidth="2"
                    />
                  );
                })}
                <circle cx="75" cy="75" r="30" fill="#0f172a" />
              </svg>
            </div>
            
            <div className="grade-legend">
              <div className="grade-item">
                <div className="grade-color" style={{ backgroundColor: '#10b981' }}></div>
                <span className="grade-label">Grade A:</span>
                <span className="grade-count">{gradeAProjects}</span>
              </div>
              <div className="grade-item">
                <div className="grade-color" style={{ backgroundColor: '#f59e0b' }}></div>
                <span className="grade-label">Grade B:</span>
                <span className="grade-count">{gradeBProjects}</span>
              </div>
              <div className="grade-item">
                <div className="grade-color" style={{ backgroundColor: '#ef4444' }}></div>
                <span className="grade-label">Grade C:</span>
                <span className="grade-count">{gradeCProjects}</span>
              </div>
              <div className="grade-item">
                <div className="grade-color" style={{ backgroundColor: '#6b7280' }}></div>
                <span className="grade-label">Non-Inv:</span>
                <span className="grade-count">{nonInvestmentProjects}</span>
              </div>
            </div>
          </div>

          <div className="validation-tips">
            <h3>Validation Criteria</h3>
            <div className="tip-item">
              <span className="tip-icon">🏆</span>
              <span className="tip-text">Grade A: Score &gt;80%, Risk &lt;30%</span>
            </div>
            <div className="tip-item">
              <span className="tip-icon">✅</span>
              <span className="tip-text">Grade B: Score 60-80%, Risk 30-50%</span>
            </div>
            <div className="tip-item">
              <span className="tip-icon">⚠️</span>
              <span className="tip-text">Grade C: Score 40-60%, Risk 50-70%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Business Plan Modal */}
      {showModal && selectedProject && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content business-plan-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedProject.name} - Business Plan</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="modal-tabs">
                <button 
                  className={`modal-tab ${modalTab === 'summary' ? 'active' : ''}`}
                  onClick={() => setModalTab('summary')}
                >
                  Executive Summary
                </button>
                <button 
                  className={`modal-tab ${modalTab === 'financial' ? 'active' : ''}`}
                  onClick={() => setModalTab('financial')}
                >
                  Financial Analysis
                </button>
                <button 
                  className={`modal-tab ${modalTab === 'risk' ? 'active' : ''}`}
                  onClick={() => setModalTab('risk')}
                >
                  Risk Assessment
                </button>
                <button 
                  className={`modal-tab ${modalTab === 'alignment' ? 'active' : ''}`}
                  onClick={() => setModalTab('alignment')}
                >
                  Strategic Alignment
                </button>
                <button 
                  className={`modal-tab ${modalTab === 'decision' ? 'active' : ''}`}
                  onClick={() => setModalTab('decision')}
                >
                  Investment Decision
                </button>
              </div>
              
              {modalTab === 'summary' && (
                <div className="tab-content">
                  <div className="content-section">
                    <h3>Project Overview</h3>
                    <p>{selectedProject.businessPlan.executiveSummary}</p>
                  </div>
                  
                  <div className="content-section">
                    <h3>Investment Thesis</h3>
                    <p>{selectedProject.businessPlan.investmentThesis}</p>
                  </div>
                  
                  <div className="content-grid">
                    <div className="content-card">
                      <h4>Key Success Factors</h4>
                      <ul>
                        {selectedProject.businessPlan.keySuccessFactors.map((factor, index) => (
                          <li key={index}>{factor}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="content-card">
                      <h4>Expected Outcomes</h4>
                      <ul>
                        {selectedProject.businessPlan.expectedOutcomes.map((outcome, index) => (
                          <li key={index}>{outcome}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              {modalTab === 'financial' && (
                <div className="tab-content">
                  <div className="financial-summary">
                    <div className="metric-card">
                      <span className="metric-label">Total Investment</span>
                      <span className="metric-value">{formatCurrency(selectedProject.capex)}</span>
                    </div>
                    <div className="metric-card">
                      <span className="metric-label">NPV</span>
                      <span className="metric-value">{formatCurrency(selectedProject.npv)}</span>
                    </div>
                    <div className="metric-card">
                      <span className="metric-label">IRR</span>
                      <span className="metric-value">{selectedProject.irr.toFixed(1)}%</span>
                    </div>
                    <div className="metric-card">
                      <span className="metric-label">Payback</span>
                      <span className="metric-value">{selectedProject.paybackYears.toFixed(1)} years</span>
                    </div>
                  </div>
                  
                  <div className="financial-table">
                    <h3>5-Year Financial Projections</h3>
                    <table className="projections-table">
                      <thead>
                        <tr>
                          <th>Year</th>
                          <th>Revenue</th>
                          <th>EBITDA</th>
                          <th>EBITDA %</th>
                          <th>Cash Flow</th>
                          <th>ROIC</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedProject.businessPlan.financials
                          .filter(f => f.quarter === 4)
                          .map((financial, index) => (
                          <tr key={index}>
                            <td>Year {financial.year}</td>
                            <td>{formatCurrency(financial.revenue)}</td>
                            <td>{formatCurrency(financial.ebitda)}</td>
                            <td>{financial.ebitdaMargin.toFixed(1)}%</td>
                            <td>{formatCurrency(financial.cashFlow)}</td>
                            <td>{financial.roic.toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {modalTab === 'risk' && (
                <div className="tab-content">
                  <div className="risk-overview">
                    <h3>Risk Assessment Overview</h3>
                    <div className="risk-summary-grid">
                      <div className="risk-metric-card">
                        <span className="risk-label">Overall Risk Score</span>
                        <span className="risk-value">{selectedProject.riskScore}/100</span>
                        <span className="risk-level">{getRiskLevel(selectedProject.riskScore)}</span>
                      </div>
                      <div className="risk-metric-card">
                        <span className="risk-label">Risk Mitigation Cost</span>
                        <span className="risk-value">
                          {formatCurrency(
                            selectedProject.businessPlan.risks.reduce((sum, r) => sum + r.mitigationCost, 0)
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="risks-table">
                    <h3>Identified Risks</h3>
                    <table className="risk-assessment-table">
                      <thead>
                        <tr>
                          <th>Risk Category</th>
                          <th>Description</th>
                          <th>Probability</th>
                          <th>Impact</th>
                          <th>Score</th>
                          <th>Mitigation</th>
                          <th>Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedProject.businessPlan.risks.map((risk) => (
                          <tr key={risk.id}>
                            <td>
                              <span className={`risk-category ${risk.category}`}>
                                {risk.category.toUpperCase()}
                              </span>
                            </td>
                            <td>{risk.description}</td>
                            <td>{risk.probability}%</td>
                            <td>{risk.impact}%</td>
                            <td>
                              <span className={`risk-score ${risk.riskScore > 50 ? 'high' : risk.riskScore > 25 ? 'medium' : 'low'}`}>
                                {risk.riskScore}
                              </span>
                            </td>
                            <td>{risk.mitigation}</td>
                            <td>{formatCurrency(risk.mitigationCost)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {modalTab === 'alignment' && (
                <div className="tab-content">
                  <div className="alignment-overview">
                    <h3>Strategic Alignment Scoring</h3>
                    <div className="scoring-breakdown">
                      <div className="score-component">
                        <div className="score-header">
                          <span className="score-label">Strategic Alignment</span>
                          <span className="score-value">{selectedProject.scoringBreakdown.strategicAlignment.toFixed(1)}%</span>
                        </div>
                        <div className="score-bar">
                          <div 
                            className="score-fill strategic"
                            style={{ width: `${selectedProject.scoringBreakdown.strategicAlignment}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="score-component">
                        <div className="score-header">
                          <span className="score-label">Financial Score</span>
                          <span className="score-value">{selectedProject.scoringBreakdown.financialScore.toFixed(1)}%</span>
                        </div>
                        <div className="score-bar">
                          <div 
                            className="score-fill financial"
                            style={{ width: `${selectedProject.scoringBreakdown.financialScore}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="score-component">
                        <div className="score-header">
                          <span className="score-label">Risk Adjustment</span>
                          <span className="score-value">{selectedProject.scoringBreakdown.riskAdjustment.toFixed(1)}%</span>
                        </div>
                        <div className="score-bar">
                          <div 
                            className="score-fill risk"
                            style={{ width: `${selectedProject.scoringBreakdown.riskAdjustment}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="score-component">
                        <div className="score-header">
                          <span className="score-label">Synergy Score</span>
                          <span className="score-value">{selectedProject.scoringBreakdown.synergyScore.toFixed(1)}%</span>
                        </div>
                        <div className="score-bar">
                          <div 
                            className="score-fill synergy"
                            style={{ width: `${selectedProject.scoringBreakdown.synergyScore}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="score-component total">
                        <div className="score-header">
                          <span className="score-label">Composite Score</span>
                          <span className="score-value">{selectedProject.scoringBreakdown.compositeScore.toFixed(1)}%</span>
                        </div>
                        <div className="score-bar">
                          <div 
                            className="score-fill composite"
                            style={{ width: `${selectedProject.scoringBreakdown.compositeScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="synergies-section">
                    <h3>Business Synergies</h3>
                    <div className="synergies-grid">
                      {selectedProject.businessPlan.synergies.map((synergy) => (
                        <div key={synergy.id} className="synergy-card">
                          <div className="synergy-header">
                            <span className={`synergy-type ${synergy.type}`}>
                              {synergy.type.toUpperCase()}
                            </span>
                            <span className="synergy-value">{formatCurrency(synergy.valueEstimate)}</span>
                          </div>
                          <p className="synergy-description">{synergy.description}</p>
                          <div className="synergy-details">
                            <span>Timeline: {synergy.timeToRealize} months</span>
                            <span className={`confidence ${synergy.confidence}`}>
                              {synergy.confidence.toUpperCase()} confidence
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {modalTab === 'decision' && (
                <div className="tab-content">
                  <div className="decision-summary">
                    <h3>Investment Decision Summary</h3>
                    
                    <div className="decision-grid">
                      <div className="decision-card">
                        <h4>Investment Grade</h4>
                        <div className={`grade-display ${getGradeColor(selectedProject.investmentGrade)}`}>
                          {selectedProject.investmentGrade}
                        </div>
                        <p className="grade-description">
                          {selectedProject.investmentGrade === 'A' && 'Highly recommended for investment'}
                          {selectedProject.investmentGrade === 'B' && 'Recommended with conditions'}
                          {selectedProject.investmentGrade === 'C' && 'Marginal investment opportunity'}
                          {selectedProject.investmentGrade === 'Non-Investment' && 'Does not meet investment criteria'}
                        </p>
                      </div>
                      
                      <div className="decision-card">
                        <h4>Key Strengths</h4>
                        <ul className="decision-list">
                          <li>Strong strategic alignment ({selectedProject.scoringBreakdown.strategicAlignment.toFixed(0)}%)</li>
                          <li>IRR of {selectedProject.irr.toFixed(1)}% exceeds hurdle rate</li>
                          <li>Payback period of {selectedProject.paybackYears.toFixed(1)} years</li>
                          <li>Positive NPV of {formatCurrency(selectedProject.npv)}</li>
                        </ul>
                      </div>
                      
                      <div className="decision-card">
                        <h4>Key Risks</h4>
                        <ul className="decision-list">
                          <li>Overall risk score: {selectedProject.riskScore}/100</li>
                          <li>{selectedProject.businessPlan.risks.filter(r => r.probability > 50).length} high probability risks</li>
                          <li>Mitigation cost: {formatCurrency(
                            selectedProject.businessPlan.risks.reduce((sum, r) => sum + r.mitigationCost, 0)
                          )}</li>
                        </ul>
                      </div>
                      
                      <div className="decision-card">
                        <h4>Recommendation</h4>
                        <div className="recommendation-box">
                          <div className={`recommendation-status ${selectedProject.validationStatus}`}>
                            Current Status: {selectedProject.validationStatus.replace('_', ' ').toUpperCase()}
                          </div>
                          <div className="recommendation-actions">
                            {selectedProject.validationStatus !== 'validated' && (
                              <button 
                                className="decision-btn approve"
                                onClick={() => {
                                  handleValidationStatusUpdate(selectedProject.id, 'validated');
                                  setShowModal(false);
                                }}
                              >
                                Validate Project
                              </button>
                            )}
                            {selectedProject.validationStatus !== 'rejected' && (
                              <button 
                                className="decision-btn reject"
                                onClick={() => {
                                  handleValidationStatusUpdate(selectedProject.id, 'rejected');
                                  setShowModal(false);
                                }}
                              >
                                Reject Project
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="validation-notes">
                      <h4>Validation Notes</h4>
                      <textarea 
                        className="notes-textarea"
                        placeholder="Add validation notes or conditions..."
                        rows={4}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <FileUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onFileSelect={handleFileUpload}
        title="Import Validated Projects"
        description="Upload an Excel or CSV file with project data. Required columns: Project Name, Investment Amount, Expected IRR (%), Risk Score, NPV, Payback Period (years), Strategic Alignment Score"
      />
    </div>
  );
};

export { Tab3_ValidateProjects };