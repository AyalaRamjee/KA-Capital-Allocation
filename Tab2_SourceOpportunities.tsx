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
  const [sortBy, setSortBy] = useState<'name' | 'investment' | 'fit' | 'risk' | 'date'>('fit');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
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
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedOpportunity(null);
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
      {/* Header Stats */}
      <div className="header-stats-bar">
        <div className="stat-item">
          <span className="stat-icon">🔍</span>
          <span className="stat-value">{totalOpportunities}</span>
          <span className="stat-label">TOTAL OPPORTUNITIES</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">💰</span>
          <span className="stat-value">{formatCurrency(totalPipelineValue)}</span>
          <span className="stat-label">PIPELINE VALUE</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">✅</span>
          <span className="stat-value">{conversionRate.toFixed(0)}%</span>
          <span className="stat-label">CONVERSION RATE</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">🎯</span>
          <span className="stat-value">{(opportunities.reduce((sum, o) => sum + o.strategicFitScore, 0) / totalOpportunities).toFixed(0)}</span>
          <span className="stat-label">AVG FIT SCORE</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">⚠️</span>
          <span className="stat-value">{(opportunities.reduce((sum, o) => sum + o.preliminaryRiskScore, 0) / totalOpportunities).toFixed(0)}</span>
          <span className="stat-label">AVG RISK SCORE</span>
        </div>
      </div>

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

      {/* 360° View Modal */}
      {showModal && selectedOpportunity && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content opportunity-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedOpportunity.name}</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="modal-section">
                <h3>Executive Summary</h3>
                <p>{selectedOpportunity.description}</p>
              </div>
              
              <div className="modal-section">
                <h3>Investment Details</h3>
                <div className="modal-grid">
                  <div className="modal-item">
                    <label>Investment Range:</label>
                    <span>{formatCurrency(selectedOpportunity.investmentRange.min)} - {formatCurrency(selectedOpportunity.investmentRange.max)}</span>
                  </div>
                  <div className="modal-item">
                    <label>Estimated Start:</label>
                    <span>{selectedOpportunity.estimatedStart}</span>
                  </div>
                  <div className="modal-item">
                    <label>Duration:</label>
                    <span>{selectedOpportunity.duration} months</span>
                  </div>
                  <div className="modal-item">
                    <label>Source:</label>
                    <span>{selectedOpportunity.source}</span>
                  </div>
                  <div className="modal-item">
                    <label>Sponsor:</label>
                    <span>{selectedOpportunity.sponsor}</span>
                  </div>
                  <div className="modal-item">
                    <label>Status:</label>
                    <span className={`status-badge-clean status-${selectedOpportunity.status}`}>
                      {selectedOpportunity.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="modal-section">
                <h3>Assessment</h3>
                <div className="modal-grid">
                  <div className="modal-item">
                    <label>Strategic Fit Score:</label>
                    <span>{selectedOpportunity.strategicFitScore}/100</span>
                  </div>
                  <div className="modal-item">
                    <label>Risk Score:</label>
                    <span className={`risk-pill-clean risk-${getRiskLevel(selectedOpportunity.preliminaryRiskScore)}`}>
                      {selectedOpportunity.preliminaryRiskScore}/100
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="modal-section">
                <h3>Recommendations</h3>
                <p>{selectedOpportunity.recommendations}</p>
              </div>
              
              <div className="modal-section">
                <h3>Metadata</h3>
                <div className="modal-grid">
                  <div className="modal-item">
                    <label>Last Updated:</label>
                    <span>{selectedOpportunity.updatedDate.toLocaleDateString()}</span>
                  </div>
                  <div className="modal-item">
                    <label>Updated By:</label>
                    <span>{selectedOpportunity.updatedBy}</span>
                  </div>
                  {selectedOpportunity.approvedBy && (
                    <div className="modal-item">
                      <label>Approved By:</label>
                      <span>{selectedOpportunity.approvedBy}</span>
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