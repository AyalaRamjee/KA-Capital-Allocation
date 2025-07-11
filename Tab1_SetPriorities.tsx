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

  // Calculate metrics
  const totalWeight = priorities.reduce((sum, p) => sum + p.weight, 0);
  const totalAllocated = priorities.reduce((sum, p) => sum + p.capitalAllocation, 0);
  const isWeightValid = Math.abs(totalWeight - 100) < 0.01;

  // Handle weight changes
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
    <div className="tab1-priorities-clean">
      <div className="main-layout">
        {/* Left side - Table */}
        <div className="table-section">
          <div className="section-header">
            <h2>Investment Priorities</h2>
            <div className="header-actions">
              <span className={`weight-status ${isWeightValid ? 'valid' : 'invalid'}`}>
                Total Weight: {totalWeight.toFixed(1)}%
              </span>
              <button 
                className="btn-auto-balance"
                onClick={autoBalanceWeights}
              >
                Auto-Balance
              </button>
            </div>
          </div>

          <table className="priorities-table-clean">
            <thead>
              <tr>
                <th>PRIORITY NAME</th>
                <th>WEIGHT (%)</th>
                <th>CAPITAL ALLOCATION</th>
                <th>TIME HORIZON</th>
                <th>MIN ROI</th>
                <th>MAX PAYBACK</th>
                <th>RISK APPETITE</th>
                <th>STRATEGIC IMPORTANCE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {priorities.map(priority => (
                <tr key={priority.id}>
                  <td>
                    <a 
                      href="#" 
                      className="priority-link"
                      onClick={(e) => {
                        e.preventDefault();
                        open360View(priority);
                      }}
                    >
                      {priority.icon} {priority.name}
                    </a>
                  </td>
                  <td>
                    <input
                      type="number"
                      value={priority.weight}
                      onChange={(e) => handleWeightChange(priority.id, parseFloat(e.target.value) || 0)}
                      className="weight-input-clean"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </td>
                  <td>
                    <span className="allocation-amount">{formatCurrency(priority.capitalAllocation)}</span>
                  </td>
                  <td>{priority.timeHorizon} years</td>
                  <td>{priority.minROI}%</td>
                  <td>{priority.maxPayback} years</td>
                  <td>
                    <span className={`risk-badge-small risk-${priority.riskAppetite}`}>
                      {priority.riskAppetite.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div className="importance-cell">
                      <span className="importance-value">{priority.strategicImportance}/10</span>
                    </div>
                  </td>
                  <td>
                    <button className="action-btn edit-btn" onClick={() => open360View(priority)}>
                      ✏️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right side - Weight Distribution */}
        <div className="chart-section">
          <div className="chart-card">
            <h3>Weight Distribution</h3>
            <div className="donut-chart-container">
              <svg width="200" height="200" className="donut-chart-small">
                {priorities.map((priority, index) => {
                  const angle = (priority.weight / 100) * 360;
                  const startAngle = priorities.slice(0, index).reduce((sum, p) => sum + (p.weight / 100) * 360, 0);
                  const endAngle = startAngle + angle;
                  
                  const x1 = 100 + 70 * Math.cos((startAngle - 90) * Math.PI / 180);
                  const y1 = 100 + 70 * Math.sin((startAngle - 90) * Math.PI / 180);
                  const x2 = 100 + 70 * Math.cos((endAngle - 90) * Math.PI / 180);
                  const y2 = 100 + 70 * Math.sin((endAngle - 90) * Math.PI / 180);
                  
                  const largeArc = angle > 180 ? 1 : 0;
                  const pathData = [
                    `M 100 100`,
                    `L ${x1} ${y1}`,
                    `A 70 70 0 ${largeArc} 1 ${x2} ${y2}`,
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
                <circle cx="100" cy="100" r="40" fill="#0f172a" />
                <text x="100" y="100" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="600">
                  {totalWeight.toFixed(1)}%
                </text>
              </svg>
            </div>
            
            <div className="legend-list">
              {priorities.filter(p => p.weight > 0).map(priority => (
                <div key={priority.id} className="legend-item-small">
                  <div 
                    className="legend-color-small"
                    style={{ backgroundColor: priority.color }}
                  ></div>
                  <span className="legend-label-small">{priority.name}</span>
                  <span className="legend-value-small">{priority.weight}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="summary-card">
            <h3>Summary</h3>
            <div className="summary-item">
              <span className="summary-label">Total Capital:</span>
              <span className="summary-value">{formatCurrency(totalAllocated)}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Active Priorities:</span>
              <span className="summary-value">{priorities.filter(p => p.weight > 0).length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Avg Min ROI:</span>
              <span className="summary-value">{(priorities.reduce((sum, p) => sum + p.minROI, 0) / priorities.length).toFixed(1)}%</span>
            </div>
          </div>
        </div>
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
              <div className="modal-section">
                <h3>Overview</h3>
                <p>{selectedPriority.description}</p>
              </div>
              
              <div className="modal-grid">
                <div className="modal-item">
                  <label>Capital Allocation:</label>
                  <span>{formatCurrency(selectedPriority.capitalAllocation)}</span>
                </div>
                <div className="modal-item">
                  <label>Weight:</label>
                  <span>{selectedPriority.weight}%</span>
                </div>
                <div className="modal-item">
                  <label>Time Horizon:</label>
                  <span>{selectedPriority.timeHorizon} years</span>
                </div>
                <div className="modal-item">
                  <label>Min ROI:</label>
                  <span>{selectedPriority.minROI}%</span>
                </div>
                <div className="modal-item">
                  <label>Max Payback:</label>
                  <span>{selectedPriority.maxPayback} years</span>
                </div>
                <div className="modal-item">
                  <label>Risk Appetite:</label>
                  <span className={`risk-badge-small risk-${selectedPriority.riskAppetite}`}>
                    {selectedPriority.riskAppetite}
                  </span>
                </div>
                <div className="modal-item">
                  <label>Strategic Importance:</label>
                  <span>{selectedPriority.strategicImportance}/10</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};