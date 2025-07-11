'use client'
import React, { useState, useEffect } from 'react';
import { InvestmentPriority, AdaniSector } from './types';
import { formatCurrency } from './mockDataAdani';

interface Tab1Props {
  sharedData: {
    priorities: InvestmentPriority[];
    totalCapital: number;
    sectors: AdaniSector[];
  };
  onDataUpdate: (data: { priorities: InvestmentPriority[] }) => void;
}

export const Tab1_SetPriorities: React.FC<Tab1Props> = ({ sharedData, onDataUpdate }) => {
  const [priorities, setPriorities] = useState<InvestmentPriority[]>(sharedData.priorities);
  const [selectedPriority, setSelectedPriority] = useState<InvestmentPriority | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [sortBy, setSortBy] = useState<'weight' | 'allocation' | 'importance'>('weight');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterRisk, setFilterRisk] = useState<'all' | 'conservative' | 'moderate' | 'aggressive'>('all');

  // Calculate metrics
  const totalWeight = priorities.reduce((sum, p) => sum + p.weight, 0);
  const totalAllocated = priorities.reduce((sum, p) => sum + p.capitalAllocation, 0);
  const activePriorities = priorities.filter(p => p.weight > 0).length;
  const avgROI = priorities.reduce((sum, p) => sum + p.minROI, 0) / priorities.length;
  const avgPayback = priorities.reduce((sum, p) => sum + p.maxPayback, 0) / priorities.length;

  // Validation
  const isWeightValid = Math.abs(totalWeight - 100) < 0.01; // Allow for rounding errors
  const weightsSum = priorities.reduce((sum, p) => sum + p.weight, 0);

  // Sort and filter priorities
  const sortedPriorities = [...priorities]
    .filter(p => filterRisk === 'all' || p.riskAppetite === filterRisk)
    .sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case 'weight':
          aVal = a.weight;
          bVal = b.weight;
          break;
        case 'allocation':
          aVal = a.capitalAllocation;
          bVal = b.capitalAllocation;
          break;
        case 'importance':
          aVal = a.strategicImportance;
          bVal = b.strategicImportance;
          break;
        default:
          aVal = a.weight;
          bVal = b.weight;
      }
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

  // Handle weight changes with validation
  const handleWeightChange = (id: string, newWeight: number) => {
    if (newWeight < 0 || newWeight > 100) return;
    
    const updatedPriorities = priorities.map(p => 
      p.id === id ? { ...p, weight: newWeight } : p
    );
    
    setPriorities(updatedPriorities);
    onDataUpdate({ priorities: updatedPriorities });
  };

  // Handle allocation changes
  const handleAllocationChange = (id: string, newAllocation: number) => {
    if (newAllocation < 0) return;
    
    const updatedPriorities = priorities.map(p => 
      p.id === id ? { ...p, capitalAllocation: newAllocation } : p
    );
    
    setPriorities(updatedPriorities);
    onDataUpdate({ priorities: updatedPriorities });
  };

  // Auto-balance weights
  const autoBalanceWeights = () => {
    const activePriorityCount = priorities.filter(p => p.weight > 0).length;
    const targetWeight = 100 / activePriorityCount;
    
    const updatedPriorities = priorities.map(p => 
      p.weight > 0 ? { ...p, weight: Math.round(targetWeight * 100) / 100 } : p
    );
    
    setPriorities(updatedPriorities);
    onDataUpdate({ priorities: updatedPriorities });
  };

  // Open 360° view modal
  const open360View = (priority: InvestmentPriority) => {
    setSelectedPriority(priority);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedPriority(null);
  };

  useEffect(() => {
    setPriorities(sharedData.priorities);
  }, [sharedData.priorities]);

  return (
    <div className="tab1-priorities">
      {/* Header Stats */}
      <div className="priorities-header">
        <div className="header-stats">
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <div className="stat-value">{activePriorities}</div>
              <div className="stat-label">Active Priorities</div>
            </div>
          </div>
          
          <div className={`stat-card ${isWeightValid ? 'valid' : 'invalid'}`}>
            <div className="stat-icon">{isWeightValid ? '✅' : '⚠️'}</div>
            <div className="stat-content">
              <div className="stat-value">{totalWeight.toFixed(1)}%</div>
              <div className="stat-label">Total Weight</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <div className="stat-value">{formatCurrency(totalAllocated)}</div>
              <div className="stat-label">Total Allocated</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <div className="stat-value">{avgROI.toFixed(1)}%</div>
              <div className="stat-label">Avg Min ROI</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⏱️</div>
            <div className="stat-content">
              <div className="stat-value">{avgPayback.toFixed(1)}y</div>
              <div className="stat-label">Avg Max Payback</div>
            </div>
          </div>
        </div>
        
        <div className="header-controls">
          <button 
            className="btn btn-primary"
            onClick={autoBalanceWeights}
            disabled={activePriorities === 0}
          >
            Auto-Balance Weights
          </button>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="priorities-filters">
        <div className="filter-group">
          <label>Risk Appetite:</label>
          <select 
            value={filterRisk} 
            onChange={(e) => setFilterRisk(e.target.value as any)}
            className="filter-select"
          >
            <option value="all">All Risk Levels</option>
            <option value="conservative">Conservative</option>
            <option value="moderate">Moderate</option>
            <option value="aggressive">Aggressive</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Sort By:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)}
            className="filter-select"
          >
            <option value="weight">Weight</option>
            <option value="allocation">Capital Allocation</option>
            <option value="importance">Strategic Importance</option>
          </select>
          
          <button 
            className="sort-order-btn"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Weight Distribution Chart */}
      <div className="weight-distribution">
        <h3>Weight Distribution</h3>
        <div className="distribution-chart">
          <div className="chart-container">
            <svg width="200" height="200" className="donut-chart">
              {priorities.map((priority, index) => {
                const angle = (priority.weight / 100) * 360;
                const startAngle = priorities.slice(0, index).reduce((sum, p) => sum + (p.weight / 100) * 360, 0);
                const endAngle = startAngle + angle;
                
                const x1 = 100 + 80 * Math.cos((startAngle - 90) * Math.PI / 180);
                const y1 = 100 + 80 * Math.sin((startAngle - 90) * Math.PI / 180);
                const x2 = 100 + 80 * Math.cos((endAngle - 90) * Math.PI / 180);
                const y2 = 100 + 80 * Math.sin((endAngle - 90) * Math.PI / 180);
                
                const largeArc = angle > 180 ? 1 : 0;
                const pathData = [
                  `M 100 100`,
                  `L ${x1} ${y1}`,
                  `A 80 80 0 ${largeArc} 1 ${x2} ${y2}`,
                  `Z`
                ].join(' ');
                
                return priority.weight > 0 ? (
                  <path
                    key={priority.id}
                    d={pathData}
                    fill={priority.color}
                    opacity={0.8}
                    stroke="#1e293b"
                    strokeWidth="2"
                  />
                ) : null;
              })}
            </svg>
          </div>
          <div className="chart-legend">
            {priorities.filter(p => p.weight > 0).map(priority => (
              <div key={priority.id} className="legend-item">
                <div 
                  className="legend-color"
                  style={{ backgroundColor: priority.color }}
                ></div>
                <span className="legend-label">{priority.name}</span>
                <span className="legend-value">{priority.weight}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Priorities Table */}
      <div className="priorities-table">
        <table className="data-table">
          <thead>
            <tr>
              <th>Priority</th>
              <th>Weight (%)</th>
              <th>Capital Allocation</th>
              <th>Time Horizon</th>
              <th>Min ROI</th>
              <th>Max Payback</th>
              <th>Risk Appetite</th>
              <th>Strategic Importance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedPriorities.map(priority => (
              <tr key={priority.id} className="priority-row">
                <td className="priority-info">
                  <div className="priority-header">
                    <span className="priority-icon">{priority.icon}</span>
                    <div>
                      <div className="priority-name">{priority.name}</div>
                      <div className="priority-description">{priority.description}</div>
                    </div>
                  </div>
                </td>
                
                <td className="weight-cell">
                  <div className="weight-input-container">
                    <input
                      type="number"
                      value={priority.weight}
                      onChange={(e) => handleWeightChange(priority.id, parseFloat(e.target.value) || 0)}
                      className="weight-input"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <div className="weight-bar">
                      <div 
                        className="weight-fill"
                        style={{ 
                          width: `${priority.weight}%`,
                          backgroundColor: priority.color 
                        }}
                      ></div>
                    </div>
                  </div>
                </td>
                
                <td className="allocation-cell">
                  <input
                    type="number"
                    value={priority.capitalAllocation}
                    onChange={(e) => handleAllocationChange(priority.id, parseFloat(e.target.value) || 0)}
                    className="allocation-input"
                    min="0"
                    step="100000000"
                  />
                  <div className="allocation-display">
                    {formatCurrency(priority.capitalAllocation)}
                  </div>
                </td>
                
                <td>
                  <span className="time-horizon">{priority.timeHorizon} years</span>
                </td>
                
                <td>
                  <span className="roi-value">{priority.minROI}%</span>
                </td>
                
                <td>
                  <span className="payback-value">{priority.maxPayback} years</span>
                </td>
                
                <td>
                  <span className={`risk-badge risk-${priority.riskAppetite}`}>
                    {priority.riskAppetite}
                  </span>
                </td>
                
                <td>
                  <div className="importance-score">
                    <span className="score-value">{priority.strategicImportance}</span>
                    <div className="score-bar">
                      <div 
                        className="score-fill"
                        style={{ width: `${priority.strategicImportance * 10}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                
                <td>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => open360View(priority)}
                  >
                    360° View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 360° View Modal */}
      {showModal && selectedPriority && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content priority-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <span className="modal-icon">{selectedPriority.icon}</span>
                {selectedPriority.name}
              </h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="modal-tabs">
                <div className="tab-nav">
                  <button className="tab-btn active">Overview</button>
                  <button className="tab-btn">Financial</button>
                  <button className="tab-btn">Risk</button>
                  <button className="tab-btn">Alignment</button>
                </div>
                
                <div className="tab-content">
                  <div className="overview-content">
                    <div className="overview-grid">
                      <div className="overview-card">
                        <h4>Investment Focus</h4>
                        <p>{selectedPriority.description}</p>
                      </div>
                      
                      <div className="overview-card">
                        <h4>Capital Allocation</h4>
                        <div className="allocation-breakdown">
                          <div className="allocation-amount">
                            {formatCurrency(selectedPriority.capitalAllocation)}
                          </div>
                          <div className="allocation-percent">
                            {selectedPriority.weight}% of total portfolio
                          </div>
                        </div>
                      </div>
                      
                      <div className="overview-card">
                        <h4>Investment Criteria</h4>
                        <div className="criteria-grid">
                          <div className="criterion">
                            <span className="criterion-label">Min ROI:</span>
                            <span className="criterion-value">{selectedPriority.minROI}%</span>
                          </div>
                          <div className="criterion">
                            <span className="criterion-label">Max Payback:</span>
                            <span className="criterion-value">{selectedPriority.maxPayback} years</span>
                          </div>
                          <div className="criterion">
                            <span className="criterion-label">Time Horizon:</span>
                            <span className="criterion-value">{selectedPriority.timeHorizon} years</span>
                          </div>
                          <div className="criterion">
                            <span className="criterion-label">Risk Appetite:</span>
                            <span className={`criterion-value risk-${selectedPriority.riskAppetite}`}>
                              {selectedPriority.riskAppetite}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="overview-card">
                        <h4>Strategic Importance</h4>
                        <div className="importance-display">
                          <div className="importance-score-large">
                            {selectedPriority.strategicImportance}/10
                          </div>
                          <div className="importance-bar-large">
                            <div 
                              className="importance-fill"
                              style={{ width: `${selectedPriority.strategicImportance * 10}%` }}
                            ></div>
                          </div>
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