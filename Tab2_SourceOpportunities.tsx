'use client'
import React, { useState, useEffect } from 'react';
import { Opportunity, InvestmentPriority, AdaniSector } from './types';
import { formatCurrency } from './mockDataAdani';

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
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [sortBy, setSortBy] = useState<'name' | 'investment' | 'fit' | 'risk' | 'date'>('fit');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState({
    status: 'all' as 'all' | 'new' | 'under_review' | 'approved' | 'rejected',
    source: 'all',
    investmentMin: 0,
    investmentMax: 5000000000,
    riskLevel: 'all' as 'all' | 'low' | 'medium' | 'high',
    fitScore: 0,
    search: ''
  });
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Calculate metrics
  const totalOpportunities = opportunities.length;
  const newOpportunities = opportunities.filter(o => o.status === 'new').length;
  const underReview = opportunities.filter(o => o.status === 'under_review').length;
  const approved = opportunities.filter(o => o.status === 'approved').length;
  const rejected = opportunities.filter(o => o.status === 'rejected').length;
  
  const totalPipelineValue = opportunities.reduce((sum, o) => sum + o.investmentRange.max, 0);
  const approvedValue = opportunities.filter(o => o.status === 'approved').reduce((sum, o) => sum + o.investmentRange.max, 0);
  const conversionRate = totalOpportunities > 0 ? (approved / totalOpportunities) * 100 : 0;
  
  const avgFitScore = opportunities.reduce((sum, o) => sum + o.strategicFitScore, 0) / totalOpportunities;
  const avgRiskScore = opportunities.reduce((sum, o) => sum + o.preliminaryRiskScore, 0) / totalOpportunities;

  // Get unique sources for filtering
  const uniqueSources = [...new Set(opportunities.map(o => o.source))];

  // Risk level calculation
  const getRiskLevel = (riskScore: number): 'low' | 'medium' | 'high' => {
    if (riskScore <= 30) return 'low';
    if (riskScore <= 60) return 'medium';
    return 'high';
  };

  // Filter and sort opportunities
  const filteredOpportunities = opportunities.filter(opp => {
    const matchesStatus = filters.status === 'all' || opp.status === filters.status;
    const matchesSource = filters.source === 'all' || opp.source === filters.source;
    const matchesInvestment = opp.investmentRange.min >= filters.investmentMin && 
                             opp.investmentRange.max <= filters.investmentMax;
    const matchesRisk = filters.riskLevel === 'all' || getRiskLevel(opp.preliminaryRiskScore) === filters.riskLevel;
    const matchesFit = opp.strategicFitScore >= filters.fitScore;
    const matchesSearch = filters.search === '' || 
                         opp.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         opp.description.toLowerCase().includes(filters.search.toLowerCase()) ||
                         opp.sponsor.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesStatus && matchesSource && matchesInvestment && matchesRisk && matchesFit && matchesSearch;
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

  // Handle bulk actions
  const handleBulkStatusUpdate = (newStatus: Opportunity['status']) => {
    const updatedOpportunities = opportunities.map(opp => 
      selectedItems.has(opp.id) ? { 
        ...opp, 
        status: newStatus,
        approvedBy: newStatus === 'approved' ? 'Gautam Adani' : opp.approvedBy,
        updatedDate: new Date()
      } : opp
    );
    
    setOpportunities(updatedOpportunities);
    onDataUpdate({ opportunities: updatedOpportunities });
    setSelectedItems(new Set());
  };

  // Toggle selection
  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedItems(newSelection);
  };

  // Select all filtered items
  const selectAllFiltered = () => {
    const filteredIds = sortedOpportunities.map(opp => opp.id);
    setSelectedItems(new Set(filteredIds));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedItems(new Set());
  };

  // Open 360° view
  const open360View = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedOpportunity(null);
  };

  useEffect(() => {
    setOpportunities(sharedData.opportunities);
  }, [sharedData.opportunities]);

  return (
    <div className="tab2-opportunities">
      {/* Header Metrics */}
      <div className="opportunities-header">
        <div className="header-metrics">
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon">🔍</div>
              <div className="metric-content">
                <div className="metric-value">{totalOpportunities}</div>
                <div className="metric-label">Total Opportunities</div>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-icon">💰</div>
              <div className="metric-content">
                <div className="metric-value">{formatCurrency(totalPipelineValue)}</div>
                <div className="metric-label">Pipeline Value</div>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-icon">✅</div>
              <div className="metric-content">
                <div className="metric-value">{conversionRate.toFixed(1)}%</div>
                <div className="metric-label">Conversion Rate</div>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-icon">🎯</div>
              <div className="metric-content">
                <div className="metric-value">{avgFitScore.toFixed(0)}</div>
                <div className="metric-label">Avg Fit Score</div>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-icon">⚠️</div>
              <div className="metric-content">
                <div className="metric-value">{avgRiskScore.toFixed(0)}</div>
                <div className="metric-label">Avg Risk Score</div>
              </div>
            </div>
          </div>
          
          {/* Funnel Visualization */}
          <div className="funnel-chart">
            <div className="funnel-stage">
              <div className="stage-bar new-stage" style={{ width: `${(newOpportunities / totalOpportunities) * 100}%` }}></div>
              <span className="stage-label">New ({newOpportunities})</span>
            </div>
            <div className="funnel-stage">
              <div className="stage-bar review-stage" style={{ width: `${(underReview / totalOpportunities) * 100}%` }}></div>
              <span className="stage-label">Under Review ({underReview})</span>
            </div>
            <div className="funnel-stage">
              <div className="stage-bar approved-stage" style={{ width: `${(approved / totalOpportunities) * 100}%` }}></div>
              <span className="stage-label">Approved ({approved})</span>
            </div>
            <div className="funnel-stage">
              <div className="stage-bar rejected-stage" style={{ width: `${(rejected / totalOpportunities) * 100}%` }}></div>
              <span className="stage-label">Rejected ({rejected})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="opportunities-controls">
        <div className="filter-section">
          <div className="filter-group">
            <label>Search:</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Search opportunities..."
              className="search-input"
            />
          </div>
          
          <div className="filter-group">
            <label>Status:</label>
            <select 
              value={filters.status} 
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Source:</label>
            <select 
              value={filters.source} 
              onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
              className="filter-select"
            >
              <option value="all">All Sources</option>
              {uniqueSources.map(source => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Risk Level:</label>
            <select 
              value={filters.riskLevel} 
              onChange={(e) => setFilters(prev => ({ ...prev, riskLevel: e.target.value as any }))}
              className="filter-select"
            >
              <option value="all">All Risk Levels</option>
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Min Fit Score:</label>
            <input
              type="range"
              min="0"
              max="100"
              value={filters.fitScore}
              onChange={(e) => setFilters(prev => ({ ...prev, fitScore: parseInt(e.target.value) }))}
              className="range-input"
            />
            <span className="range-value">{filters.fitScore}+</span>
          </div>
        </div>
        
        <div className="view-controls">
          <div className="view-toggle">
            <button 
              className={`view-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
            >
              🔲 Cards
            </button>
            <button 
              className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              📋 Table
            </button>
          </div>
          
          <div className="sort-controls">
            <label>Sort by:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as any)}
              className="sort-select"
            >
              <option value="fit">Strategic Fit</option>
              <option value="investment">Investment Size</option>
              <option value="risk">Risk Score</option>
              <option value="name">Name</option>
              <option value="date">Updated Date</option>
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

      {/* Bulk Actions */}
      {selectedItems.size > 0 && (
        <div className="bulk-actions">
          <div className="bulk-info">
            <span>{selectedItems.size} opportunities selected</span>
            <button className="btn btn-link" onClick={clearSelection}>Clear Selection</button>
          </div>
          <div className="bulk-buttons">
            <button 
              className="btn btn-primary"
              onClick={() => handleBulkStatusUpdate('under_review')}
            >
              Move to Review
            </button>
            <button 
              className="btn btn-success"
              onClick={() => handleBulkStatusUpdate('approved')}
            >
              Approve
            </button>
            <button 
              className="btn btn-danger"
              onClick={() => handleBulkStatusUpdate('rejected')}
            >
              Reject
            </button>
          </div>
        </div>
      )}

      {/* Opportunities Display */}
      <div className="opportunities-display">
        <div className="display-header">
          <h3>Opportunities ({sortedOpportunities.length})</h3>
          <button 
            className="btn btn-secondary"
            onClick={selectAllFiltered}
          >
            Select All Filtered
          </button>
        </div>
        
        {viewMode === 'cards' ? (
          <div className="opportunities-grid">
            {sortedOpportunities.map(opportunity => (
              <div key={opportunity.id} className={`opportunity-card ${selectedItems.has(opportunity.id) ? 'selected' : ''}`}>
                <div className="card-header">
                  <div className="card-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(opportunity.id)}
                      onChange={() => toggleSelection(opportunity.id)}
                    />
                  </div>
                  <div className="card-title">
                    <h4>{opportunity.name}</h4>
                    <span className="card-source">{opportunity.source}</span>
                  </div>
                  <div className={`status-badge status-${opportunity.status}`}>
                    {opportunity.status.replace('_', ' ')}
                  </div>
                </div>
                
                <div className="card-content">
                  <div className="card-description">
                    {opportunity.description}
                  </div>
                  
                  <div className="card-metrics">
                    <div className="metric">
                      <span className="metric-label">Investment:</span>
                      <span className="metric-value">
                        {formatCurrency(opportunity.investmentRange.min)} - {formatCurrency(opportunity.investmentRange.max)}
                      </span>
                    </div>
                    
                    <div className="metric">
                      <span className="metric-label">Strategic Fit:</span>
                      <div className="score-display">
                        <span className="score-value">{opportunity.strategicFitScore}</span>
                        <div className="score-bar">
                          <div 
                            className="score-fill fit-score"
                            style={{ width: `${opportunity.strategicFitScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="metric">
                      <span className="metric-label">Risk:</span>
                      <span className={`risk-pill risk-${getRiskLevel(opportunity.preliminaryRiskScore)}`}>
                        {getRiskLevel(opportunity.preliminaryRiskScore)} ({opportunity.preliminaryRiskScore})
                      </span>
                    </div>
                    
                    <div className="metric">
                      <span className="metric-label">Sponsor:</span>
                      <span className="sponsor-name">{opportunity.sponsor}</span>
                    </div>
                  </div>
                </div>
                
                <div className="card-actions">
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => open360View(opportunity)}
                  >
                    360° View
                  </button>
                  
                  <div className="status-actions">
                    {opportunity.status === 'new' && (
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleStatusUpdate(opportunity.id, 'under_review')}
                      >
                        Start Review
                      </button>
                    )}
                    
                    {opportunity.status === 'under_review' && (
                      <>
                        <button 
                          className="btn btn-success btn-sm"
                          onClick={() => handleStatusUpdate(opportunity.id, 'approved')}
                        >
                          Approve
                        </button>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleStatusUpdate(opportunity.id, 'rejected')}
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
        ) : (
          <div className="opportunities-table">
            <table className="data-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedItems.size === sortedOpportunities.length}
                      onChange={selectedItems.size === sortedOpportunities.length ? clearSelection : selectAllFiltered}
                    />
                  </th>
                  <th>Opportunity</th>
                  <th>Status</th>
                  <th>Investment Range</th>
                  <th>Strategic Fit</th>
                  <th>Risk</th>
                  <th>Sponsor</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedOpportunities.map(opportunity => (
                  <tr key={opportunity.id} className={selectedItems.has(opportunity.id) ? 'selected' : ''}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedItems.has(opportunity.id)}
                        onChange={() => toggleSelection(opportunity.id)}
                      />
                    </td>
                    <td className="opportunity-info">
                      <div className="opportunity-name">{opportunity.name}</div>
                      <div className="opportunity-source">{opportunity.source}</div>
                    </td>
                    <td>
                      <span className={`status-badge status-${opportunity.status}`}>
                        {opportunity.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <div className="investment-range">
                        <div>{formatCurrency(opportunity.investmentRange.min)}</div>
                        <div>{formatCurrency(opportunity.investmentRange.max)}</div>
                      </div>
                    </td>
                    <td>
                      <div className="score-display">
                        <span className="score-value">{opportunity.strategicFitScore}</span>
                        <div className="score-bar">
                          <div 
                            className="score-fill fit-score"
                            style={{ width: `${opportunity.strategicFitScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`risk-pill risk-${getRiskLevel(opportunity.preliminaryRiskScore)}`}>
                        {getRiskLevel(opportunity.preliminaryRiskScore)}
                      </span>
                    </td>
                    <td>{opportunity.sponsor}</td>
                    <td>{opportunity.updatedDate.toLocaleDateString()}</td>
                    <td>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => open360View(opportunity)}
                      >
                        360° View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 360° View Modal */}
      {showModal && selectedOpportunity && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content opportunity-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedOpportunity.name}</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="modal-tabs">
                <div className="tab-nav">
                  <button className="tab-btn active">Overview</button>
                  <button className="tab-btn">Investment</button>
                  <button className="tab-btn">Assessment</button>
                  <button className="tab-btn">Workflow</button>
                </div>
                
                <div className="tab-content">
                  <div className="overview-content">
                    <div className="overview-grid">
                      <div className="overview-card">
                        <h4>Executive Summary</h4>
                        <p>{selectedOpportunity.description}</p>
                        <div className="recommendations">
                          <strong>Recommendations:</strong>
                          <p>{selectedOpportunity.recommendations}</p>
                        </div>
                      </div>
                      
                      <div className="overview-card">
                        <h4>Investment Details</h4>
                        <div className="investment-details">
                          <div className="detail-item">
                            <span className="detail-label">Investment Range:</span>
                            <span className="detail-value">
                              {formatCurrency(selectedOpportunity.investmentRange.min)} - {formatCurrency(selectedOpportunity.investmentRange.max)}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Estimated Start:</span>
                            <span className="detail-value">{selectedOpportunity.estimatedStart}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Duration:</span>
                            <span className="detail-value">{selectedOpportunity.duration} months</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="overview-card">
                        <h4>Assessment Scores</h4>
                        <div className="assessment-scores">
                          <div className="score-item">
                            <span className="score-label">Strategic Fit</span>
                            <div className="score-display">
                              <span className="score-value">{selectedOpportunity.strategicFitScore}</span>
                              <div className="score-bar">
                                <div 
                                  className="score-fill fit-score"
                                  style={{ width: `${selectedOpportunity.strategicFitScore}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          <div className="score-item">
                            <span className="score-label">Risk Score</span>
                            <div className="score-display">
                              <span className="score-value">{selectedOpportunity.preliminaryRiskScore}</span>
                              <div className="score-bar">
                                <div 
                                  className="score-fill risk-score"
                                  style={{ width: `${selectedOpportunity.preliminaryRiskScore}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="overview-card">
                        <h4>Project Details</h4>
                        <div className="project-details">
                          <div className="detail-item">
                            <span className="detail-label">Source:</span>
                            <span className="detail-value">{selectedOpportunity.source}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Sponsor:</span>
                            <span className="detail-value">{selectedOpportunity.sponsor}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Status:</span>
                            <span className={`status-badge status-${selectedOpportunity.status}`}>
                              {selectedOpportunity.status.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Last Updated:</span>
                            <span className="detail-value">{selectedOpportunity.updatedDate.toLocaleDateString()}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Updated By:</span>
                            <span className="detail-value">{selectedOpportunity.updatedBy}</span>
                          </div>
                          {selectedOpportunity.approvedBy && (
                            <div className="detail-item">
                              <span className="detail-label">Approved By:</span>
                              <span className="detail-value">{selectedOpportunity.approvedBy}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};