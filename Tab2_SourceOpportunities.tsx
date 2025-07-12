'use client'
import React, { useState, useEffect } from 'react';
import { Opportunity, InvestmentPriority, AdaniSector } from './types';
import { formatCurrency } from './mockDataAdani';
import FileUploadModal from './FileUploadModal';
import { parseFile, parseOpportunitiesData } from './fileParsingUtils';
import { useToast } from './ToastContainer';

interface Tab2Props {
  sharedData: {
    opportunities: Opportunity[];
    priorities: InvestmentPriority[];
    sectors: AdaniSector[];
  };
  onDataUpdate: (data: { opportunities: Opportunity[] }) => void;
}

export const Tab2_SourceOpportunities: React.FC<Tab2Props> = ({ sharedData, onDataUpdate }) => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(sharedData.opportunities);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState<'summary' | 'financial' | 'risk' | 'strategic'>('summary');
  const [sortBy, setSortBy] = useState<'name' | 'investment' | 'fit' | 'risk' | 'date'>('fit');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const toast = useToast();
  const [filters, setFilters] = useState({
    status: 'all' as 'all' | 'new' | 'under_review' | 'approved' | 'rejected',
    source: 'all',
    riskLevel: 'all' as 'all' | 'low' | 'medium' | 'high',
    fitScore: 0,
    search: ''
  });

  // Calculate metrics
  const totalOpportunities = opportunities.length;
  const newOpportunities = opportunities.filter(o => o.status === 'new').length;
  const underReview = opportunities.filter(o => o.status === 'under_review').length;
  const approved = opportunities.filter(o => o.status === 'approved').length;
  const rejected = opportunities.filter(o => o.status === 'rejected').length;
  
  const totalPipelineValue = opportunities.reduce((sum, o) => sum + o.investmentRange.max, 0);
  const conversionRate = totalOpportunities > 0 ? (approved / totalOpportunities) * 100 : 0;

  // Get unique sources for filtering
  const uniqueSources = [...new Set(opportunities.map(o => o.source))];

  // Risk level calculation
  const getRiskLevel = (riskScore: number): 'low' | 'medium' | 'high' => {
    if (riskScore <= 30) return 'low';
    if (riskScore <= 60) return 'medium';
    return 'high';
  };

  // Helper function to ensure date is properly formatted
  const formatDate = (date: Date | string): string => {
    if (typeof date === 'string') {
      return new Date(date).toLocaleDateString();
    }
    return date.toLocaleDateString();
  };

  // Generate mock financial projections for the selected opportunity
  const generateFinancialProjections = (opportunity: Opportunity) => {
    const baseRevenue = opportunity.investmentRange.max * 0.25;
    const projections = [];
    
    for (let year = 1; year <= 5; year++) {
      const growthRate = 1 + (year * 0.15);
      projections.push({
        year,
        revenue: baseRevenue * growthRate,
        costs: baseRevenue * growthRate * 0.65,
        ebitda: baseRevenue * growthRate * 0.35,
        ebitdaMargin: 35,
        capex: year <= 2 ? opportunity.investmentRange.max * 0.3 : opportunity.investmentRange.max * 0.05,
        fcf: baseRevenue * growthRate * 0.25
      });
    }
    return projections;
  };

  // Generate mock risk assessment
  const generateRiskAssessment = (opportunity: Opportunity) => {
    return [
      {
        category: 'Market Risk',
        description: 'Demand volatility and competitive pressure',
        probability: Math.min(90, opportunity.preliminaryRiskScore + 10),
        impact: 'High',
        mitigation: 'Diversified customer base and flexible operations',
        owner: opportunity.sponsor
      },
      {
        category: 'Execution Risk',
        description: 'Project delivery and operational challenges',
        probability: Math.max(20, opportunity.preliminaryRiskScore - 20),
        impact: 'Medium',
        mitigation: 'Experienced project management and phased delivery',
        owner: opportunity.sponsor
      },
      {
        category: 'Regulatory Risk',
        description: 'Policy changes and compliance requirements',
        probability: opportunity.preliminaryRiskScore,
        impact: 'Medium',
        mitigation: 'Active government relations and compliance monitoring',
        owner: 'Legal Team'
      },
      {
        category: 'Financial Risk',
        description: 'Funding availability and cost overruns',
        probability: Math.max(15, opportunity.preliminaryRiskScore - 30),
        impact: 'High',
        mitigation: 'Robust financial planning and contingency reserves',
        owner: 'CFO Office'
      }
    ];
  };

  // Generate strategic alignment details
  const generateStrategicAlignment = (opportunity: Opportunity) => {
    const alignedPriorities = sharedData.priorities.filter(p => 
      opportunity.name.toLowerCase().includes(p.name.toLowerCase().split(' ')[0]) ||
      opportunity.source.toLowerCase().includes(p.name.toLowerCase().split(' ')[0])
    ).slice(0, 3);

    return {
      primaryAlignment: alignedPriorities[0] || sharedData.priorities[0],
      secondaryAlignments: alignedPriorities.slice(1),
      strategicThemes: [
        'Market Leadership',
        'Operational Excellence', 
        'Innovation & Technology',
        'Sustainability'
      ],
      competitiveAdvantages: [
        'First-mover advantage in key markets',
        'Proven operational capabilities',
        'Strong government relationships',
        'Integrated value chain benefits'
      ],
      synergies: [
        {
          type: 'Revenue',
          description: 'Cross-selling to existing customer base',
          value: opportunity.investmentRange.max * 0.08,
          timeframe: '12-18 months'
        },
        {
          type: 'Cost',
          description: 'Shared infrastructure and operations',
          value: opportunity.investmentRange.max * 0.05,
          timeframe: '6-12 months'
        }
      ]
    };
  };

  // Filter and sort opportunities
  const filteredOpportunities = opportunities.filter(opp => {
    const matchesStatus = filters.status === 'all' || opp.status === filters.status;
    const matchesSource = filters.source === 'all' || opp.source === filters.source;
    const matchesRisk = filters.riskLevel === 'all' || getRiskLevel(opp.preliminaryRiskScore) === filters.riskLevel;
    const matchesFit = opp.strategicFitScore >= filters.fitScore;
    const matchesSearch = filters.search === '' || 
                         opp.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         opp.description.toLowerCase().includes(filters.search.toLowerCase()) ||
                         opp.sponsor.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesStatus && matchesSource && matchesRisk && matchesFit && matchesSearch;
  });

  const sortedOpportunities = [...filteredOpportunities].sort((a, b) => {
    let aVal, bVal;
    switch (sortBy) {
      case 'name':
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      case 'investment':
        aVal = a.investmentRange.max;
        bVal = b.investmentRange.max;
        break;
      case 'fit':
        aVal = a.strategicFitScore;
        bVal = b.strategicFitScore;
        break;
      case 'risk':
        aVal = a.preliminaryRiskScore;
        bVal = b.preliminaryRiskScore;
        break;
      case 'date':
        aVal = new Date(a.updatedDate).getTime();
        bVal = new Date(b.updatedDate).getTime();
        break;
      default:
        aVal = a.strategicFitScore;
        bVal = b.strategicFitScore;
    }
    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
  });

  // Handle status update
  const handleStatusUpdate = (id: string, newStatus: Opportunity['status']) => {
    const updatedOpportunities = opportunities.map(opp => 
      opp.id === id ? { 
        ...opp, 
        status: newStatus,
        approvedBy: newStatus === 'approved' ? 'Gautam Adani' : opp.approvedBy,
        updatedDate: new Date()
      } : opp
    );
    
    setOpportunities(updatedOpportunities);
    onDataUpdate({ opportunities: updatedOpportunities });
  };

  // Open 360° view
  const open360View = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setShowModal(true);
    setModalTab('summary');
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedOpportunity(null);
    setModalTab('summary');
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    try {
      const rawData = await parseFile(file);
      const result = parseOpportunitiesData(rawData);
      
      if (result.errors.length > 0) {
        toast.error(
          'Upload Failed', 
          `Found ${result.errors.length} error(s) in the uploaded file. Please check the data format and try again.`
        );
        return;
      }
      
      const updatedOpportunities = [...opportunities, ...result.data];
      setOpportunities(updatedOpportunities);
      onDataUpdate({ opportunities: updatedOpportunities });
      
      toast.success(
        'Opportunities Imported!', 
        `Successfully imported ${result.data.length} new opportunities to the pipeline.`
      );
      
    } catch (error) {
      toast.error(
        'Import Error', 
        `Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
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

  useEffect(() => {
    setOpportunities(sharedData.opportunities);
  }, [sharedData.opportunities]);

  return (
    <div className="tab2-opportunities-clean">
      {/* Pipeline Status Bar */}
      <div className="pipeline-status-bar">
        <div className="status-segment new" style={{ width: `${(newOpportunities / totalOpportunities) * 100}%` }}>
          <span className="status-count">New ({newOpportunities})</span>
        </div>
        <div className="status-segment review" style={{ width: `${(underReview / totalOpportunities) * 100}%` }}>
          <span className="status-count">Under Review ({underReview})</span>
        </div>
        <div className="status-segment approved" style={{ width: `${(approved / totalOpportunities) * 100}%` }}>
          <span className="status-count">Approved ({approved})</span>
        </div>
        <div className="status-segment rejected" style={{ width: `${(rejected / totalOpportunities) * 100}%` }}>
          <span className="status-count">Rejected ({rejected})</span>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
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
        
        <div className="filter-item">
          <label>Search:</label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            placeholder="Search opportunities..."
            className="search-input-clean"
          />
        </div>
        
        <div className="filter-item">
          <label>Status:</label>
          <select 
            value={filters.status} 
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
            className="filter-select-clean"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        
        <div className="filter-item">
          <label>Source:</label>
          <select 
            value={filters.source} 
            onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
            className="filter-select-clean"
          >
            <option value="all">All Sources</option>
            {uniqueSources.map(source => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-item">
          <label>Risk Level:</label>
          <select 
            value={filters.riskLevel} 
            onChange={(e) => setFilters(prev => ({ ...prev, riskLevel: e.target.value as any }))}
            className="filter-select-clean"
          >
            <option value="all">All Risk Levels</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        
        <div className="filter-item">
          <label>Min Fit Score: {filters.fitScore}+</label>
          <input
            type="range"
            min="0"
            max="100"
            value={filters.fitScore}
            onChange={(e) => setFilters(prev => ({ ...prev, fitScore: parseInt(e.target.value) }))}
            className="range-input-clean"
          />
        </div>
      </div>

      {/* Opportunities Table */}
      <div className="table-container">
        <table className="opportunities-table-clean">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')} className="sortable">
                OPPORTUNITY NAME {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>STATUS</th>
              <th>SOURCE</th>
              <th>SPONSOR</th>
              <th onClick={() => handleSort('investment')} className="sortable">
                INVESTMENT {sortBy === 'investment' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>TIMELINE</th>
              <th onClick={() => handleSort('fit')} className="sortable">
                STRATEGIC FIT {sortBy === 'fit' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('risk')} className="sortable">
                RISK {sortBy === 'risk' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {sortedOpportunities.map(opportunity => (
              <tr key={opportunity.id}>
                <td>
                  <a 
                    href="#" 
                    className="opportunity-link"
                    onClick={(e) => {
                      e.preventDefault();
                      open360View(opportunity);
                    }}
                  >
                    {opportunity.name}
                  </a>
                </td>
                <td>
                  <span className={`status-badge-clean status-${opportunity.status}`}>
                    {opportunity.status.replace('_', ' ').toUpperCase()}
                  </span>
                </td>
                <td>{opportunity.source}</td>
                <td>{opportunity.sponsor}</td>
                <td>
                  <div className="investment-range">
                    <span className="investment-value">{formatCurrency(opportunity.investmentRange.min)} - {formatCurrency(opportunity.investmentRange.max)}</span>
                  </div>
                </td>
                <td>
                  <span className="timeline">{opportunity.estimatedStart}</span>
                  <span className="duration">({opportunity.duration}m)</span>
                </td>
                <td>
                  <span className="fit-score">{opportunity.strategicFitScore}</span>
                </td>
                <td>
                  <span className={`risk-pill-clean risk-${getRiskLevel(opportunity.preliminaryRiskScore)}`}>
                    {getRiskLevel(opportunity.preliminaryRiskScore).toUpperCase()} ({opportunity.preliminaryRiskScore})
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="action-btn view-btn"
                      onClick={() => open360View(opportunity)}
                      title="360° View"
                    >
                      👁️
                    </button>
                    {opportunity.status === 'new' && (
                      <button 
                        className="action-btn review-btn"
                        onClick={() => handleStatusUpdate(opportunity.id, 'under_review')}
                        title="Start Review"
                      >
                        ▶️
                      </button>
                    )}
                    {opportunity.status === 'under_review' && (
                      <>
                        <button 
                          className="action-btn approve-btn"
                          onClick={() => handleStatusUpdate(opportunity.id, 'approved')}
                          title="Approve"
                        >
                          ✅
                        </button>
                        <button 
                          className="action-btn reject-btn"
                          onClick={() => handleStatusUpdate(opportunity.id, 'rejected')}
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

      {/* Enhanced 360° View Modal */}
      {showModal && selectedOpportunity && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content opportunity-360-modal" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="modal-header-360">
              <div className="header-left">
                <div className="project-title">
                  <h2>{selectedOpportunity.name}</h2>
                  <div className="project-meta">
                    <span className="project-source">{selectedOpportunity.source}</span>
                    <span className="project-sponsor">Sponsored by {selectedOpportunity.sponsor}</span>
                  </div>
                </div>
              </div>
              <div className="header-right">
                <div className="status-indicator">
                  <span className={`status-badge-360 status-${selectedOpportunity.status}`}>
                    {selectedOpportunity.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <button className="modal-close-360" onClick={closeModal}>×</button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="modal-tabs-360">
              <button 
                className={`modal-tab-360 ${modalTab === 'summary' ? 'active' : ''}`}
                onClick={() => setModalTab('summary')}
              >
                <span className="tab-icon">📊</span>
                Executive Summary
              </button>
              <button 
                className={`modal-tab-360 ${modalTab === 'financial' ? 'active' : ''}`}
                onClick={() => setModalTab('financial')}
              >
                <span className="tab-icon">💰</span>
                Financial Analysis
              </button>
              <button 
                className={`modal-tab-360 ${modalTab === 'risk' ? 'active' : ''}`}
                onClick={() => setModalTab('risk')}
              >
                <span className="tab-icon">⚠️</span>
                Risk Assessment
              </button>
              <button 
                className={`modal-tab-360 ${modalTab === 'strategic' ? 'active' : ''}`}
                onClick={() => setModalTab('strategic')}
              >
                <span className="tab-icon">🎯</span>
                Strategic Alignment
              </button>
            </div>
            
            {/* Tab Content */}
            <div className="modal-body-360">
              {modalTab === 'summary' && (
                <div className="tab-content summary-tab">
                  {/* Key Metrics Cards */}
                  <div className="metrics-grid">
                    <div className="metric-card">
                      <div className="metric-label">Investment Range</div>
                      <div className="metric-value">{formatCurrency(selectedOpportunity.investmentRange.min)} - {formatCurrency(selectedOpportunity.investmentRange.max)}</div>
                      <div className="metric-trend">Target deployment</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-label">Strategic Fit</div>
                      <div className="metric-value">{selectedOpportunity.strategicFitScore}%</div>
                      <div className="metric-trend">High alignment</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-label">Risk Score</div>
                      <div className="metric-value">{selectedOpportunity.preliminaryRiskScore}</div>
                      <div className="metric-trend">{getRiskLevel(selectedOpportunity.preliminaryRiskScore)} risk</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-label">Timeline</div>
                      <div className="metric-value">{selectedOpportunity.duration}m</div>
                      <div className="metric-trend">Est. start {selectedOpportunity.estimatedStart}</div>
                    </div>
                  </div>

                  {/* Project Overview */}
                  <div className="content-section">
                    <h3>Project Overview</h3>
                    <p className="project-description">{selectedOpportunity.description}</p>
                  </div>

                  {/* Investment Thesis */}
                  <div className="content-section">
                    <h3>Investment Thesis</h3>
                    <div className="thesis-content">
                      <div className="thesis-point">
                        <strong>Market Opportunity:</strong> Large and growing market with strong fundamentals and regulatory support.
                      </div>
                      <div className="thesis-point">
                        <strong>Competitive Position:</strong> Leverages Adani's existing infrastructure and market presence.
                      </div>
                      <div className="thesis-point">
                        <strong>Value Creation:</strong> Multiple value drivers including operational synergies and market expansion.
                      </div>
                    </div>
                  </div>

                  {/* Key Milestones */}
                  <div className="content-section">
                    <h3>Key Milestones</h3>
                    <div className="milestone-timeline">
                      <div className="milestone">
                        <div className="milestone-date">Month 1-3</div>
                        <div className="milestone-title">Project Approval & Financing</div>
                        <div className="milestone-desc">Secure final approvals and project financing</div>
                      </div>
                      <div className="milestone">
                        <div className="milestone-date">Month 4-12</div>
                        <div className="milestone-title">Construction & Development</div>
                        <div className="milestone-desc">Begin construction and development activities</div>
                      </div>
                      <div className="milestone">
                        <div className="milestone-date">Month 13-18</div>
                        <div className="milestone-title">Commissioning & Testing</div>
                        <div className="milestone-desc">Complete testing and begin operations</div>
                      </div>
                      <div className="milestone">
                        <div className="milestone-date">Month 19+</div>
                        <div className="milestone-title">Full Operations</div>
                        <div className="milestone-desc">Achieve full operational capacity</div>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="content-section">
                    <h3>Strategic Recommendations</h3>
                    <div className="recommendations">
                      <div className="recommendation-item">
                        <span className="recommendation-icon">🚀</span>
                        <span className="recommendation-text">{selectedOpportunity.recommendations}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {modalTab === 'financial' && (
                <div className="tab-content financial-tab">
                  {/* Financial Summary */}
                  <div className="financial-summary">
                    <h3>Financial Summary</h3>
                    <div className="financial-metrics">
                      <div className="financial-metric">
                        <span className="metric-label">Total Investment</span>
                        <span className="metric-value">{formatCurrency(selectedOpportunity.investmentRange.max)}</span>
                      </div>
                      <div className="financial-metric">
                        <span className="metric-label">Expected IRR</span>
                        <span className="metric-value">18.5%</span>
                      </div>
                      <div className="financial-metric">
                        <span className="metric-label">NPV</span>
                        <span className="metric-value">{formatCurrency(selectedOpportunity.investmentRange.max * 0.3)}</span>
                      </div>
                      <div className="financial-metric">
                        <span className="metric-label">Payback Period</span>
                        <span className="metric-value">6.2 years</span>
                      </div>
                    </div>
                  </div>

                  {/* Investment Breakdown */}
                  <div className="content-section">
                    <h3>Investment Breakdown</h3>
                    <div className="investment-breakdown">
                      <div className="breakdown-item">
                        <div className="breakdown-category">Land & Site Preparation</div>
                        <div className="breakdown-amount">{formatCurrency(selectedOpportunity.investmentRange.max * 0.15)}</div>
                        <div className="breakdown-percentage">15%</div>
                      </div>
                      <div className="breakdown-item">
                        <div className="breakdown-category">Equipment & Machinery</div>
                        <div className="breakdown-amount">{formatCurrency(selectedOpportunity.investmentRange.max * 0.45)}</div>
                        <div className="breakdown-percentage">45%</div>
                      </div>
                      <div className="breakdown-item">
                        <div className="breakdown-category">Construction & Installation</div>
                        <div className="breakdown-amount">{formatCurrency(selectedOpportunity.investmentRange.max * 0.25)}</div>
                        <div className="breakdown-percentage">25%</div>
                      </div>
                      <div className="breakdown-item">
                        <div className="breakdown-category">Working Capital</div>
                        <div className="breakdown-amount">{formatCurrency(selectedOpportunity.investmentRange.max * 0.10)}</div>
                        <div className="breakdown-percentage">10%</div>
                      </div>
                      <div className="breakdown-item">
                        <div className="breakdown-category">Contingency</div>
                        <div className="breakdown-amount">{formatCurrency(selectedOpportunity.investmentRange.max * 0.05)}</div>
                        <div className="breakdown-percentage">5%</div>
                      </div>
                    </div>
                  </div>

                  {/* 5-Year Projections */}
                  <div className="content-section">
                    <h3>5-Year Financial Projections</h3>
                    <div className="projections-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Year</th>
                            <th>Revenue</th>
                            <th>Costs</th>
                            <th>EBITDA</th>
                            <th>EBITDA %</th>
                            <th>CAPEX</th>
                            <th>FCF</th>
                          </tr>
                        </thead>
                        <tbody>
                          {generateFinancialProjections(selectedOpportunity).map(projection => (
                            <tr key={projection.year}>
                              <td>Year {projection.year}</td>
                              <td>{formatCurrency(projection.revenue)}</td>
                              <td>{formatCurrency(projection.costs)}</td>
                              <td>{formatCurrency(projection.ebitda)}</td>
                              <td>{projection.ebitdaMargin}%</td>
                              <td>{formatCurrency(projection.capex)}</td>
                              <td>{formatCurrency(projection.fcf)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Funding Structure */}
                  <div className="content-section">
                    <h3>Funding Structure</h3>
                    <div className="funding-structure">
                      <div className="funding-source">
                        <div className="source-label">Adani Equity</div>
                        <div className="source-amount">{formatCurrency(selectedOpportunity.investmentRange.max * 0.3)}</div>
                        <div className="source-percentage">30%</div>
                      </div>
                      <div className="funding-source">
                        <div className="source-label">Bank Debt</div>
                        <div className="source-amount">{formatCurrency(selectedOpportunity.investmentRange.max * 0.50)}</div>
                        <div className="source-percentage">50%</div>
                      </div>
                      <div className="funding-source">
                        <div className="source-label">Green Bonds</div>
                        <div className="source-amount">{formatCurrency(selectedOpportunity.investmentRange.max * 0.20)}</div>
                        <div className="source-percentage">20%</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {modalTab === 'risk' && (
                <div className="tab-content risk-tab">
                  {/* Risk Overview */}
                  <div className="risk-overview">
                    <h3>Risk Assessment Overview</h3>
                    <div className="risk-score-display">
                      <div className="risk-score-circle">
                        <div className="risk-score-value">{selectedOpportunity.preliminaryRiskScore}</div>
                        <div className="risk-score-label">{getRiskLevel(selectedOpportunity.preliminaryRiskScore).toUpperCase()} RISK</div>
                      </div>
                      <div className="risk-distribution">
                        <div className="risk-dist-item">
                          <div className="risk-category-label">Market Risk</div>
                          <div className="risk-bar">
                            <div className="risk-fill" style={{ width: '60%', backgroundColor: '#ef4444' }}></div>
                          </div>
                          <div className="risk-value">60%</div>
                        </div>
                        <div className="risk-dist-item">
                          <div className="risk-category-label">Execution Risk</div>
                          <div className="risk-bar">
                            <div className="risk-fill" style={{ width: '40%', backgroundColor: '#f59e0b' }}></div>
                          </div>
                          <div className="risk-value">40%</div>
                        </div>
                        <div className="risk-dist-item">
                          <div className="risk-category-label">Regulatory Risk</div>
                          <div className="risk-bar">
                            <div className="risk-fill" style={{ width: '30%', backgroundColor: '#10b981' }}></div>
                          </div>
                          <div className="risk-value">30%</div>
                        </div>
                        <div className="risk-dist-item">
                          <div className="risk-category-label">Financial Risk</div>
                          <div className="risk-bar">
                            <div className="risk-fill" style={{ width: '25%', backgroundColor: '#10b981' }}></div>
                          </div>
                          <div className="risk-value">25%</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Risk Matrix */}
                  <div className="content-section">
                    <h3>Risk Assessment Matrix</h3>
                    <div className="risk-assessment-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Risk Category</th>
                            <th>Description</th>
                            <th>Probability</th>
                            <th>Impact</th>
                            <th>Mitigation Strategy</th>
                            <th>Owner</th>
                          </tr>
                        </thead>
                        <tbody>
                          {generateRiskAssessment(selectedOpportunity).map((risk, index) => (
                            <tr key={index}>
                              <td>
                                <span className={`risk-category-badge ${risk.category.toLowerCase().replace(' ', '-')}`}>
                                  {risk.category}
                                </span>
                              </td>
                              <td>{risk.description}</td>
                              <td>
                                <span className={`probability-badge ${risk.probability > 70 ? 'high' : risk.probability > 40 ? 'medium' : 'low'}`}>
                                  {risk.probability}%
                                </span>
                              </td>
                              <td>
                                <span className={`impact-badge ${risk.impact.toLowerCase()}`}>
                                  {risk.impact}
                                </span>
                              </td>
                              <td>{risk.mitigation}</td>
                              <td>{risk.owner}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Risk Mitigation Plan */}
                  <div className="content-section">
                    <h3>Risk Mitigation Plan</h3>
                    <div className="mitigation-plan">
                      <div className="mitigation-phase">
                        <div className="phase-title">Phase 1: Pre-Construction</div>
                        <div className="phase-actions">
                          <div className="action-item">✓ Secure all regulatory approvals</div>
                          <div className="action-item">✓ Finalize EPC contracts with penalties</div>
                          <div className="action-item">✓ Establish contingency reserves (5% of CAPEX)</div>
                        </div>
                      </div>
                      <div className="mitigation-phase">
                        <div className="phase-title">Phase 2: Construction</div>
                        <div className="phase-actions">
                          <div className="action-item">✓ Weekly progress monitoring</div>
                          <div className="action-item">✓ Quality assurance protocols</div>
                          <div className="action-item">✓ Supply chain diversification</div>
                        </div>
                      </div>
                      <div className="mitigation-phase">
                        <div className="phase-title">Phase 3: Operations</div>
                        <div className="phase-actions">
                          <div className="action-item">✓ Performance guarantees</div>
                          <div className="action-item">✓ Insurance coverage</div>
                          <div className="action-item">✓ Continuous monitoring systems</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {modalTab === 'strategic' && (
                <div className="tab-content strategic-tab">
                  {/* Strategic Fit Score */}
                  <div className="strategic-overview">
                    <h3>Strategic Alignment Score</h3>
                    <div className="strategic-score-display">
                      <div className="score-circle">
                        <div className="score-value">{selectedOpportunity.strategicFitScore}%</div>
                        <div className="score-label">STRATEGIC FIT</div>
                      </div>
                      <div className="score-breakdown">
                        <div className="score-component">
                          <div className="component-label">Priority Alignment</div>
                          <div className="component-bar">
                            <div className="component-fill" style={{ width: '85%' }}></div>
                          </div>
                          <div className="component-value">85%</div>
                        </div>
                        <div className="score-component">
                          <div className="component-label">Market Synergies</div>
                          <div className="component-bar">
                            <div className="component-fill" style={{ width: '75%' }}></div>
                          </div>
                          <div className="component-value">75%</div>
                        </div>
                        <div className="score-component">
                          <div className="component-label">Operational Fit</div>
                          <div className="component-bar">
                            <div className="component-fill" style={{ width: '90%' }}></div>
                          </div>
                          <div className="component-value">90%</div>
                        </div>
                        <div className="score-component">
                          <div className="component-label">Technology Alignment</div>
                          <div className="component-bar">
                            <div className="component-fill" style={{ width: '80%' }}></div>
                          </div>
                          <div className="component-value">80%</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Priority Alignment */}
                  <div className="content-section">
                    <h3>Investment Priority Alignment</h3>
                    <div className="priority-alignment">
                      {(() => {
                        const alignment = generateStrategicAlignment(selectedOpportunity);
                        return (
                          <>
                            <div className="primary-alignment">
                              <div className="alignment-label">Primary Alignment</div>
                              <div className="alignment-priority">
                                <span className="priority-icon">{alignment.primaryAlignment.icon}</span>
                                <span className="priority-name">{alignment.primaryAlignment.name}</span>
                                <span className="priority-weight">{alignment.primaryAlignment.weight}% allocation</span>
                              </div>
                            </div>
                            {alignment.secondaryAlignments.length > 0 && (
                              <div className="secondary-alignments">
                                <div className="alignment-label">Secondary Alignments</div>
                                {alignment.secondaryAlignments.map(priority => (
                                  <div key={priority.id} className="alignment-priority secondary">
                                    <span className="priority-icon">{priority.icon}</span>
                                    <span className="priority-name">{priority.name}</span>
                                    <span className="priority-weight">{priority.weight}% allocation</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Strategic Themes */}
                  <div className="content-section">
                    <h3>Strategic Themes</h3>
                    <div className="strategic-themes">
                      {generateStrategicAlignment(selectedOpportunity).strategicThemes.map((theme, index) => (
                        <div key={index} className="theme-item">
                          <span className="theme-icon">🎯</span>
                          <span className="theme-text">{theme}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Competitive Advantages */}
                  <div className="content-section">
                    <h3>Competitive Advantages</h3>
                    <div className="competitive-advantages">
                      {generateStrategicAlignment(selectedOpportunity).competitiveAdvantages.map((advantage, index) => (
                        <div key={index} className="advantage-item">
                          <span className="advantage-icon">⚡</span>
                          <span className="advantage-text">{advantage}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Synergies */}
                  <div className="content-section">
                    <h3>Business Synergies</h3>
                    <div className="synergies-grid">
                      {generateStrategicAlignment(selectedOpportunity).synergies.map((synergy, index) => (
                        <div key={index} className="synergy-card">
                          <div className="synergy-header">
                            <div className="synergy-type">{synergy.type} Synergy</div>
                            <div className="synergy-value">{formatCurrency(synergy.value)}</div>
                          </div>
                          <div className="synergy-description">{synergy.description}</div>
                          <div className="synergy-timeframe">Expected realization: {synergy.timeframe}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ESG Alignment */}
                  <div className="content-section">
                    <h3>ESG Alignment</h3>
                    <div className="esg-metrics">
                      <div className="esg-metric">
                        <div className="esg-category">Environmental</div>
                        <div className="esg-score">85%</div>
                        <div className="esg-description">Clean energy contribution and carbon reduction</div>
                      </div>
                      <div className="esg-metric">
                        <div className="esg-category">Social</div>
                        <div className="esg-score">78%</div>
                        <div className="esg-description">Job creation and community development</div>
                      </div>
                      <div className="esg-metric">
                        <div className="esg-category">Governance</div>
                        <div className="esg-score">92%</div>
                        <div className="esg-description">Transparent processes and compliance</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer with Actions */}
            <div className="modal-footer-360">
              <div className="footer-left">
                <div className="last-updated">
                  Last updated: {formatDate(selectedOpportunity.updatedDate)} by {selectedOpportunity.updatedBy}
                </div>
              </div>
              <div className="footer-right">
                <button className="btn btn-secondary" onClick={closeModal}>
                  Close
                </button>
                {selectedOpportunity.status === 'new' && (
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      handleStatusUpdate(selectedOpportunity.id, 'under_review');
                      closeModal();
                    }}
                  >
                    Start Review
                  </button>
                )}
                {selectedOpportunity.status === 'under_review' && (
                  <>
                    <button 
                      className="btn btn-success"
                      onClick={() => {
                        handleStatusUpdate(selectedOpportunity.id, 'approved');
                        closeModal();
                      }}
                    >
                      Approve
                    </button>
                    <button 
                      className="btn btn-danger"
                      onClick={() => {
                        handleStatusUpdate(selectedOpportunity.id, 'rejected');
                        closeModal();
                      }}
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <FileUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onFileSelect={handleFileUpload}
        title="Import Opportunities"
        description="Upload an Excel or CSV file with opportunity data. Required columns: Opportunity Name, Description, Source, Sponsor, Status, Investment Min (USD), Investment Max (USD), ROI (%), Timeline (months), Strategic Fit Score, Risk Score, Category"
      />

      <style jsx>{`
        /* Enhanced 360° Modal Styles */
        .opportunity-360-modal {
          max-width: 1200px;
          width: 95vw;
          max-height: 90vh;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border: 1px solid #334155;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.7);
        }

        .modal-header-360 {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          border-bottom: 1px solid #334155;
        }

        .project-title h2 {
          color: #ffffff;
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .project-meta {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .project-source {
          color: #94a3b8;
          font-size: 0.875rem;
          padding: 0.25rem 0.75rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 6px;
        }

        .project-sponsor {
          color: #94a3b8;
          font-size: 0.875rem;
        }

        .status-badge-360 {
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-new { background: rgba(59, 130, 246, 0.2); color: #3b82f6; border: 1px solid #3b82f6; }
        .status-under_review { background: rgba(245, 158, 11, 0.2); color: #f59e0b; border: 1px solid #f59e0b; }
        .status-approved { background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid #10b981; }
        .status-rejected { background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid #ef4444; }

        .modal-close-360 {
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 2rem;
          cursor: pointer;
          transition: color 0.3s ease;
        }

        .modal-close-360:hover {
          color: #ffffff;
        }

        .modal-tabs-360 {
          display: flex;
          background: #0f172a;
          border-bottom: 1px solid #334155;
        }

        .modal-tab-360 {
          flex: 1;
          padding: 1rem 1.5rem;
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          justify-content: center;
          position: relative;
        }

        .modal-tab-360:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.05);
        }

        .modal-tab-360.active {
          color: #3b82f6;
          background: rgba(59, 130, 246, 0.1);
        }

        .modal-tab-360.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
        }

        .tab-icon {
          font-size: 1.125rem;
        }

        .modal-body-360 {
          padding: 2rem;
          overflow-y: auto;
          max-height: 60vh;
          color: #e2e8f0;
        }

        /* Summary Tab Styles */
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .metric-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
        }

        .metric-label {
          color: #94a3b8;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.5rem;
        }

        .metric-value {
          color: #ffffff;
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .metric-trend {
          color: #94a3b8;
          font-size: 0.75rem;
        }

        .content-section {
          margin-bottom: 2rem;
        }

        .content-section h3 {
          color: #ffffff;
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #334155;
        }

        .project-description {
          color: #e2e8f0;
          line-height: 1.6;
          font-size: 1rem;
        }

        .thesis-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .thesis-point {
          color: #e2e8f0;
          line-height: 1.6;
        }

        .milestone-timeline {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .milestone {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1.5rem;
          position: relative;
        }

        .milestone-date {
          color: #3b82f6;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .milestone-title {
          color: #ffffff;
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .milestone-desc {
          color: #94a3b8;
          font-size: 0.875rem;
          line-height: 1.4;
        }

        .recommendations {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .recommendation-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
        }

        .recommendation-icon {
          font-size: 1.5rem;
        }

        .recommendation-text {
          color: #e2e8f0;
          flex: 1;
        }

        /* Financial Tab Styles */
        .financial-summary {
          margin-bottom: 2rem;
        }

        .financial-metrics {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }

        .financial-metric {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
        }

        .investment-breakdown,
        .funding-structure {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .breakdown-item,
        .funding-source {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
        }

        .breakdown-category,
        .source-label {
          color: #e2e8f0;
          font-weight: 500;
        }

        .breakdown-amount,
        .source-amount {
          color: #3b82f6;
          font-weight: 600;
        }

        .breakdown-percentage,
        .source-percentage {
          color: #94a3b8;
          font-size: 0.875rem;
        }

        .projections-table table {
          width: 100%;
          border-collapse: collapse;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          overflow: hidden;
        }

        .projections-table th,
        .projections-table td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .projections-table th {
          background: rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          font-weight: 600;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .projections-table td {
          color: #e2e8f0;
        }

        /* Risk Tab Styles */
        .risk-overview {
          margin-bottom: 2rem;
        }

        .risk-score-display {
          display: flex;
          gap: 2rem;
          align-items: center;
        }

        .risk-score-circle {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: conic-gradient(#ef4444 0deg, #ef4444 ${(selectedOpportunity?.preliminaryRiskScore ?? 0) * 3.6}deg, rgba(255, 255, 255, 0.1) ${(selectedOpportunity?.preliminaryRiskScore ?? 0) * 3.6}deg);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .risk-score-circle::before {
          content: '';
          position: absolute;
          width: 80px;
          height: 80px;
          background: #1e293b;
          border-radius: 50%;
        }

        .risk-score-value {
          color: #ffffff;
          font-size: 1.5rem;
          font-weight: 700;
          position: relative;
          z-index: 1;
        }

        .risk-score-label {
          color: #94a3b8;
          font-size: 0.75rem;
          position: relative;
          z-index: 1;
        }

        .risk-distribution {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .risk-dist-item {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .risk-category-label {
          color: #e2e8f0;
          font-size: 0.875rem;
          min-width: 120px;
        }

        .risk-bar {
          flex: 1;
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
        }

        .risk-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .risk-value {
          color: #94a3b8;
          font-size: 0.875rem;
          min-width: 40px;
        }

        .risk-assessment-table table {
          width: 100%;
          border-collapse: collapse;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          overflow: hidden;
        }

        .risk-assessment-table th,
        .risk-assessment-table td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .risk-assessment-table th {
          background: rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .risk-category-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .market-risk { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        .execution-risk { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
        .regulatory-risk { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
        .financial-risk { background: rgba(139, 92, 246, 0.2); color: #8b5cf6; }

        .probability-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .probability-badge.high { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        .probability-badge.medium { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
        .probability-badge.low { background: rgba(16, 185, 129, 0.2); color: #10b981; }

        .impact-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .impact-badge.high { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        .impact-badge.medium { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
        .impact-badge.low { background: rgba(16, 185, 129, 0.2); color: #10b981; }

        .mitigation-plan {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .mitigation-phase {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1.5rem;
        }

        .phase-title {
          color: #3b82f6;
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .phase-actions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .action-item {
          color: #e2e8f0;
          font-size: 0.875rem;
          line-height: 1.4;
        }

        /* Strategic Tab Styles */
        .strategic-overview {
          margin-bottom: 2rem;
        }

        .strategic-score-display {
          display: flex;
          gap: 2rem;
          align-items: center;
        }

        .score-circle {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: conic-gradient(#3b82f6 0deg, #3b82f6 ${(selectedOpportunity?.strategicFitScore ?? 0) * 3.6}deg, rgba(255, 255, 255, 0.1) ${(selectedOpportunity?.strategicFitScore ?? 0) * 3.6}deg);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .score-circle::before {
          content: '';
          position: absolute;
          width: 80px;
          height: 80px;
          background: #1e293b;
          border-radius: 50%;
        }

        .score-value {
          color: #ffffff;
          font-size: 1.5rem;
          font-weight: 700;
          position: relative;
          z-index: 1;
        }

        .score-label {
          color: #94a3b8;
          font-size: 0.75rem;
          position: relative;
          z-index: 1;
        }

        .score-breakdown {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .score-component {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .component-label {
          color: #e2e8f0;
          font-size: 0.875rem;
          min-width: 140px;
        }

        .component-bar {
          flex: 1;
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
        }

        .component-fill {
          height: 100%;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .component-value {
          color: #94a3b8;
          font-size: 0.875rem;
          min-width: 40px;
        }

        .priority-alignment {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .alignment-label {
          color: #94a3b8;
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .alignment-priority {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
        }

        .alignment-priority.secondary {
          opacity: 0.8;
        }

        .priority-icon {
          font-size: 1.5rem;
        }

        .priority-name {
          color: #e2e8f0;
          font-weight: 500;
          flex: 1;
        }

        .priority-weight {
          color: #3b82f6;
          font-weight: 600;
        }

        .strategic-themes,
        .competitive-advantages {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .theme-item,
        .advantage-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
        }

        .theme-icon,
        .advantage-icon {
          font-size: 1.25rem;
        }

        .theme-text,
        .advantage-text {
          color: #e2e8f0;
        }

        .synergies-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .synergy-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1.5rem;
        }

        .synergy-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .synergy-type {
          color: #3b82f6;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .synergy-value {
          color: #10b981;
          font-weight: 700;
          font-size: 1rem;
        }

        .synergy-description {
          color: #e2e8f0;
          font-size: 0.875rem;
          line-height: 1.4;
          margin-bottom: 0.5rem;
        }

        .synergy-timeframe {
          color: #94a3b8;
          font-size: 0.75rem;
        }

        .esg-metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }

        .esg-metric {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
        }

        .esg-category {
          color: #94a3b8;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .esg-score {
          color: #10b981;
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .esg-description {
          color: #e2e8f0;
          font-size: 0.75rem;
          line-height: 1.4;
        }

        /* Modal Footer */
        .modal-footer-360 {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          background: rgba(255, 255, 255, 0.05);
          border-top: 1px solid #334155;
        }

        .last-updated {
          color: #94a3b8;
          font-size: 0.875rem;
        }

        .footer-right {
          display: flex;
          gap: 1rem;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.1);
          color: #e2e8f0;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .btn-primary {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          color: #ffffff;
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .btn-success {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #ffffff;
        }

        .btn-success:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .btn-danger {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: #ffffff;
        }

        .btn-danger:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }
      `}</style>
    </div>
  );
};