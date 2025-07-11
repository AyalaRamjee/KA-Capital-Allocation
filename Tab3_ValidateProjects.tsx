'use client'
import React, { useState, useEffect } from 'react';
import { ValidatedProject, InvestmentPriority, Opportunity, AdaniSector } from './types';
import { formatCurrency } from './mockDataAdani';

interface Tab3Props {
  sharedData: {
    opportunities: Opportunity[];
    priorities: InvestmentPriority[];
    validatedProjects: ValidatedProject[];
    sectors: AdaniSector[];
  };
  onDataUpdate: (data: { validatedProjects: ValidatedProject[] }) => void;
}

export const Tab3_ValidateProjects: React.FC<Tab3Props> = ({ sharedData, onDataUpdate }) => {
  const [validatedProjects, setValidatedProjects] = useState<ValidatedProject[]>(sharedData.validatedProjects);
  const [selectedProject, setSelectedProject] = useState<ValidatedProject | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState<'summary' | 'financial' | 'risk' | 'alignment' | 'decision'>('summary');
  const [sortBy, setSortBy] = useState<'score' | 'grade' | 'investment' | 'risk'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterGrade, setFilterGrade] = useState<'all' | 'A' | 'B' | 'C' | 'Non-Investment'>('all');

  // Calculate composite score based on your specification
  const calculateCompositeScore = (opportunity: Opportunity, priorities: InvestmentPriority[]): number => {
    // Strategic Alignment (40%)
    const strategicAlignment = opportunity.strategicFitScore;
    
    // Financial Score (30%) - normalized
    const financialScore = Math.min(100, (opportunity.investmentRange.min / 10000000) * 10); // Basic calculation
    
    // Risk Adjustment (20%) - inverted risk score
    const riskAdjustment = 100 - opportunity.preliminaryRiskScore;
    
    // Synergy Score (10%) - based on source and sponsor
    const synergyScore = Math.random() * 30 + 50; // Placeholder for now
    
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

  // Convert approved opportunities to validated projects
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
      
      // Financial
      capex: opportunity.investmentRange.max,
      opex: opportunity.investmentRange.max * 0.1, // 10% of capex annually
      revenuePotential: opportunity.investmentRange.max * 1.5, // 1.5x revenue potential
      
      // Analysis
      npv: opportunity.investmentRange.max * 0.3, // 30% NPV
      irr: 15 + (compositeScore / 10), // IRR based on composite score
      mirr: 12 + (compositeScore / 15), // MIRR slightly lower
      paybackYears: 8 - (compositeScore / 25), // Better projects have shorter payback
      
      
      // Scoring
      compositeScore,
      investmentGrade,
      
      // Metadata
      riskScore: opportunity.preliminaryRiskScore,
      duration: opportunity.duration,
      geography: opportunity.source.includes('Australia') ? 'Australia' : 'India',
      businessUnit: opportunity.source,
      createdAt: new Date(),
      updatedAt: new Date(),
      
      // Validated Project specific
      validationId: `VAL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      validationStatus: 'pending',
      validationDate: new Date(),
      validatedBy: 'System',
      
      // Enhanced business plan
      businessPlan: {
        executiveSummary: opportunity.description,
        marketAnalysis: `Market analysis for ${opportunity.name}`,
        marketSize: opportunity.investmentRange.max * 5, // 5x market size
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
        
        // 5-year financial projections (quarterly)
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
        
        // For compatibility with base interface
        financialProjections: [],
        riskMitigation: [],
        
        // Risk assessment
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
        
        // Synergy analysis
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
      
      // Scoring breakdown
      scoringBreakdown: {
        strategicAlignment: opportunity.strategicFitScore,
        financialScore: Math.min(100, (opportunity.investmentRange.min / 10000000) * 10),
        riskAdjustment: 100 - opportunity.preliminaryRiskScore,
        synergyScore: Math.random() * 30 + 50,
        compositeScore
      }
    };
  };

  // Initialize validated projects from approved opportunities
  useEffect(() => {
    const approvedOpportunities = sharedData.opportunities.filter(opp => opp.status === 'approved');
    const existingProjectIds = sharedData.validatedProjects.map(proj => proj.opportunityId);
    
    // Create new validated projects for approved opportunities that don't exist yet
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
  const projectsInValidation = validatedProjects.filter(p => p.validationStatus === 'pending' || p.validationStatus === 'in_review').length;
  const gradeAProjects = validatedProjects.filter(p => p.investmentGrade === 'A').length;
  const totalPipelineValue = validatedProjects.reduce((sum, p) => sum + p.capex, 0);
  const avgCompositeScore = validatedProjects.reduce((sum, p) => sum + p.compositeScore, 0) / validatedProjects.length || 0;
  const validationSuccessRate = validatedProjects.length > 0 ? (validatedProjects.filter(p => p.investmentGrade !== 'Non-Investment').length / validatedProjects.length) * 100 : 0;

  // Sort and filter projects
  const sortedProjects = [...validatedProjects]
    .filter(p => filterGrade === 'all' || p.investmentGrade === filterGrade)
    .sort((a, b) => {
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
        case 'risk':
          aVal = a.riskScore;
          bVal = b.riskScore;
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

  // Open 360° view
  const open360View = (project: ValidatedProject) => {
    setSelectedProject(project);
    setShowModal(true);
    setModalTab('summary');
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedProject(null);
  };

  // Get grade color
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return '#00c853';
      case 'B': return '#ff9800';
      case 'C': return '#f44336';
      case 'Non-Investment': return '#757575';
      default: return '#757575';
    }
  };

  // Get risk level
  const getRiskLevel = (riskScore: number): 'Low' | 'Medium' | 'High' => {
    if (riskScore <= 30) return 'Low';
    if (riskScore <= 60) return 'Medium';
    return 'High';
  };

  return (
    <div className="tab3-validate-projects">
      {/* Header Stats */}
      <div className="validation-header">
        <div className="header-stats">
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-content">
              <div className="stat-value">{projectsInValidation}</div>
              <div className="stat-label">Projects in Validation</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-content">
              <div className="stat-value">{gradeAProjects}</div>
              <div className="stat-label">Investment Grade A</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <div className="stat-value">{formatCurrency(totalPipelineValue)}</div>
              <div className="stat-label">Total Pipeline Value</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-value">{avgCompositeScore.toFixed(0)}%</div>
              <div className="stat-label">Average Composite Score</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-value">{validationSuccessRate.toFixed(1)}%</div>
              <div className="stat-label">Validation Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="validation-controls">
        <div className="filter-section">
          <div className="filter-group">
            <label>Investment Grade:</label>
            <select 
              value={filterGrade} 
              onChange={(e) => setFilterGrade(e.target.value as any)}
              className="filter-select"
            >
              <option value="all">All Grades</option>
              <option value="A">Grade A</option>
              <option value="B">Grade B</option>
              <option value="C">Grade C</option>
              <option value="Non-Investment">Non-Investment</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Sort By:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as any)}
              className="filter-select"
            >
              <option value="score">Composite Score</option>
              <option value="grade">Investment Grade</option>
              <option value="investment">Investment Size</option>
              <option value="risk">Risk Score</option>
            </select>
            
            <button 
              className="sort-order-btn"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Project Cards Grid */}
      <div className="projects-grid">
        {sortedProjects.map(project => (
          <div key={project.id} className="project-card">
            <div className="card-header">
              <div className="project-title">
                <div 
                  className="grade-badge"
                  style={{ backgroundColor: getGradeColor(project.investmentGrade) }}
                >
                  {project.investmentGrade}
                </div>
                <div>
                  <h4>{project.name}</h4>
                  <span className="project-id">ID: {project.id}</span>
                </div>
              </div>
            </div>
            
            <div className="card-content">
              <div className="investment-info">
                <div className="metric">
                  <span className="metric-label">Investment:</span>
                  <span className="metric-value">{formatCurrency(project.capex)}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Duration:</span>
                  <span className="metric-value">{project.duration} months</span>
                </div>
              </div>
              
              <div className="composite-score">
                <div className="score-circle">
                  <svg width="80" height="80" className="score-chart">
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      fill="none"
                      stroke="#475569"
                      strokeWidth="6"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      fill="none"
                      stroke={getGradeColor(project.investmentGrade)}
                      strokeWidth="6"
                      strokeDasharray={`${(project.compositeScore / 100) * 220} 220`}
                      strokeDashoffset="0"
                      transform="rotate(-90 40 40)"
                    />
                    <text x="40" y="45" textAnchor="middle" className="score-text">
                      {Math.round(project.compositeScore)}%
                    </text>
                  </svg>
                </div>
                <div className="score-label">Composite Score</div>
              </div>
              
              <div className="financial-metrics">
                <div className="metric">
                  <span className="metric-label">NPV:</span>
                  <span className="metric-value">{formatCurrency(project.npv)}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">IRR:</span>
                  <span className="metric-value">{project.irr.toFixed(1)}%</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Payback:</span>
                  <span className="metric-value">{project.paybackYears.toFixed(1)} years</span>
                </div>
              </div>
              
              <div className="risk-assessment">
                <div className="risk-label">Risk Level:</div>
                <div className={`risk-level risk-${getRiskLevel(project.riskScore).toLowerCase()}`}>
                  {getRiskLevel(project.riskScore)}
                </div>
                <div className="risk-bar">
                  <div 
                    className="risk-fill"
                    style={{ width: `${project.riskScore}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="card-actions">
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => open360View(project)}
              >
                View Plan
              </button>
              
              <div className="validation-actions">
                {project.validationStatus === 'pending' && (
                  <>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleValidationStatusUpdate(project.id, 'in_review')}
                    >
                      Start Review
                    </button>
                  </>
                )}
                
                {project.validationStatus === 'in_review' && (
                  <>
                    <button 
                      className="btn btn-success btn-sm"
                      onClick={() => handleValidationStatusUpdate(project.id, 'validated')}
                    >
                      Validate
                    </button>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleValidationStatusUpdate(project.id, 'rejected')}
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 360° Business Plan Modal */}
      {showModal && selectedProject && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content business-plan-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedProject.name} - Business Plan</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="modal-tabs">
                <div className="tab-nav">
                  <button 
                    className={`tab-btn ${modalTab === 'summary' ? 'active' : ''}`}
                    onClick={() => setModalTab('summary')}
                  >
                    Executive Summary
                  </button>
                  <button 
                    className={`tab-btn ${modalTab === 'financial' ? 'active' : ''}`}
                    onClick={() => setModalTab('financial')}
                  >
                    Financial Analysis
                  </button>
                  <button 
                    className={`tab-btn ${modalTab === 'risk' ? 'active' : ''}`}
                    onClick={() => setModalTab('risk')}
                  >
                    Risk Assessment
                  </button>
                  <button 
                    className={`tab-btn ${modalTab === 'alignment' ? 'active' : ''}`}
                    onClick={() => setModalTab('alignment')}
                  >
                    Strategic Alignment
                  </button>
                  <button 
                    className={`tab-btn ${modalTab === 'decision' ? 'active' : ''}`}
                    onClick={() => setModalTab('decision')}
                  >
                    Investment Decision
                  </button>
                </div>
                
                <div className="tab-content">
                  {modalTab === 'summary' && (
                    <div className="summary-content">
                      <div className="summary-grid">
                        <div className="summary-card">
                          <h4>Project Overview</h4>
                          <p>{selectedProject.businessPlan.executiveSummary}</p>
                        </div>
                        
                        <div className="summary-card">
                          <h4>Investment Thesis</h4>
                          <p>{selectedProject.businessPlan.investmentThesis}</p>
                        </div>
                        
                        <div className="summary-card">
                          <h4>Key Success Factors</h4>
                          <ul>
                            {selectedProject.businessPlan.keySuccessFactors.map((factor, index) => (
                              <li key={index}>{factor}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="summary-card">
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
                    <div className="financial-content">
                      <div className="financial-overview">
                        <div className="metric-card">
                          <div className="metric-label">Total Investment</div>
                          <div className="metric-value">{formatCurrency(selectedProject.capex)}</div>
                        </div>
                        <div className="metric-card">
                          <div className="metric-label">NPV</div>
                          <div className="metric-value">{formatCurrency(selectedProject.npv)}</div>
                        </div>
                        <div className="metric-card">
                          <div className="metric-label">IRR</div>
                          <div className="metric-value">{selectedProject.irr.toFixed(1)}%</div>
                        </div>
                        <div className="metric-card">
                          <div className="metric-label">Payback</div>
                          <div className="metric-value">{selectedProject.paybackYears.toFixed(1)} years</div>
                        </div>
                      </div>
                      
                      <div className="projections-table">
                        <h4>5-Year Financial Projections</h4>
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Year</th>
                              <th>Revenue</th>
                              <th>EBITDA</th>
                              <th>EBITDA Margin</th>
                              <th>Cash Flow</th>
                              <th>ROIC</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedProject.businessPlan.financials
                              .filter(f => f.quarter === 4) // Show yearly data
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
                    <div className="risk-content">
                      <div className="risk-overview">
                        <div className="risk-score-display">
                          <div className="risk-score-large">{selectedProject.riskScore}</div>
                          <div className="risk-level-large">{getRiskLevel(selectedProject.riskScore)} Risk</div>
                        </div>
                      </div>
                      
                      <div className="risk-matrix">
                        <h4>Risk Assessment Matrix</h4>
                        <div className="risks-table">
                          <table className="data-table">
                            <thead>
                              <tr>
                                <th>Risk Category</th>
                                <th>Description</th>
                                <th>Probability</th>
                                <th>Impact</th>
                                <th>Risk Score</th>
                                <th>Mitigation</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedProject.businessPlan.risks.map((risk, index) => (
                                <tr key={index}>
                                  <td>
                                    <span className={`risk-category ${risk.category}`}>
                                      {risk.category}
                                    </span>
                                  </td>
                                  <td>{risk.description}</td>
                                  <td>{risk.probability}%</td>
                                  <td>{risk.impact}%</td>
                                  <td>{risk.riskScore}</td>
                                  <td>{risk.mitigation}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {modalTab === 'alignment' && (
                    <div className="alignment-content">
                      <div className="alignment-overview">
                        <div className="alignment-score">
                          <div className="score-large">{selectedProject.scoringBreakdown.strategicAlignment.toFixed(0)}</div>
                          <div className="score-label">Strategic Alignment Score</div>
                        </div>
                      </div>
                      
                      <div className="scoring-breakdown">
                        <h4>Scoring Breakdown</h4>
                        <div className="score-components">
                          <div className="score-component">
                            <span className="component-label">Strategic Alignment (40%)</span>
                            <div className="score-bar">
                              <div 
                                className="score-fill"
                                style={{ width: `${selectedProject.scoringBreakdown.strategicAlignment}%` }}
                              ></div>
                            </div>
                            <span className="component-value">{selectedProject.scoringBreakdown.strategicAlignment.toFixed(0)}</span>
                          </div>
                          
                          <div className="score-component">
                            <span className="component-label">Financial Score (30%)</span>
                            <div className="score-bar">
                              <div 
                                className="score-fill"
                                style={{ width: `${selectedProject.scoringBreakdown.financialScore}%` }}
                              ></div>
                            </div>
                            <span className="component-value">{selectedProject.scoringBreakdown.financialScore.toFixed(0)}</span>
                          </div>
                          
                          <div className="score-component">
                            <span className="component-label">Risk Adjustment (20%)</span>
                            <div className="score-bar">
                              <div 
                                className="score-fill"
                                style={{ width: `${selectedProject.scoringBreakdown.riskAdjustment}%` }}
                              ></div>
                            </div>
                            <span className="component-value">{selectedProject.scoringBreakdown.riskAdjustment.toFixed(0)}</span>
                          </div>
                          
                          <div className="score-component">
                            <span className="component-label">Synergy Score (10%)</span>
                            <div className="score-bar">
                              <div 
                                className="score-fill"
                                style={{ width: `${selectedProject.scoringBreakdown.synergyScore}%` }}
                              ></div>
                            </div>
                            <span className="component-value">{selectedProject.scoringBreakdown.synergyScore.toFixed(0)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="synergies-section">
                        <h4>Synergy Opportunities</h4>
                        <div className="synergies-list">
                          {selectedProject.businessPlan.synergies.map((synergy, index) => (
                            <div key={index} className="synergy-card">
                              <div className="synergy-header">
                                <span className={`synergy-type ${synergy.type}`}>{synergy.type}</span>
                                <span className="synergy-value">{formatCurrency(synergy.valueEstimate)}</span>
                              </div>
                              <div className="synergy-description">{synergy.description}</div>
                              <div className="synergy-details">
                                <span>Time to Realize: {synergy.timeToRealize} months</span>
                                <span className={`confidence ${synergy.confidence}`}>
                                  {synergy.confidence} confidence
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {modalTab === 'decision' && (
                    <div className="decision-content">
                      <div className="decision-summary">
                        <div className="decision-header">
                          <div 
                            className="investment-grade-large"
                            style={{ backgroundColor: getGradeColor(selectedProject.investmentGrade) }}
                          >
                            Investment Grade: {selectedProject.investmentGrade}
                          </div>
                          <div className="composite-score-large">
                            Composite Score: {selectedProject.compositeScore.toFixed(0)}%
                          </div>
                        </div>
                        
                        <div className="recommendation">
                          <h4>Final Recommendation</h4>
                          <p>
                            {selectedProject.investmentGrade === 'A' && 'Strongly recommend approval. This project meets all investment criteria and offers excellent returns with manageable risk.'}
                            {selectedProject.investmentGrade === 'B' && 'Recommend approval with conditions. This project offers good returns but requires additional risk mitigation.'}
                            {selectedProject.investmentGrade === 'C' && 'Conditional approval required. This project needs special consideration and enhanced oversight.'}
                            {selectedProject.investmentGrade === 'Non-Investment' && 'Do not recommend for investment. This project does not meet minimum investment criteria.'}
                          </p>
                        </div>
                        
                        <div className="conditions-precedent">
                          <h4>Conditions Precedent</h4>
                          <ul>
                            <li>Final due diligence completion</li>
                            <li>Regulatory approvals obtained</li>
                            <li>Financing arrangements finalized</li>
                            <li>Key personnel assignments confirmed</li>
                          </ul>
                        </div>
                        
                        <div className="implementation-timeline">
                          <h4>Implementation Timeline</h4>
                          <div className="timeline-item">
                            <strong>Months 1-3:</strong> Project setup and team mobilization
                          </div>
                          <div className="timeline-item">
                            <strong>Months 4-12:</strong> Phase 1 implementation
                          </div>
                          <div className="timeline-item">
                            <strong>Months 13-24:</strong> Phase 2 implementation
                          </div>
                          <div className="timeline-item">
                            <strong>Months 25+:</strong> Operations and optimization
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};