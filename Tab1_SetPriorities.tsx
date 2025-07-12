'use client'
import React, { useState, useEffect } from 'react';
import { InvestmentPriority, AdaniSector } from './types';
import { formatCurrency } from './mockDataAdani';
import FileUploadModal from './FileUploadModal';
import { parseFile, parsePrioritiesData } from './fileParsingUtils';
import { useToast } from './ToastContainer';

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
  const [showUploadModal, setShowUploadModal] = useState(false);
  const toast = useToast();

  // Calculate metrics
  const totalWeight = priorities.reduce((sum, p) => sum + p.weight, 0);
  const totalAllocated = priorities.reduce((sum, p) => sum + p.capitalAllocation, 0);
  const isWeightValid = Math.abs(totalWeight - 100) < 0.01;

  // Handle weight changes with auto-adjustment
  const handleWeightChange = (id: string, newWeight: number) => {
    if (newWeight < 0 || newWeight > 100) return;
    
    const oldPriorities = [...priorities];
    const changingPriority = oldPriorities.find(p => p.id === id);
    if (!changingPriority) return;
    
    const oldWeight = changingPriority.weight;
    const weightDifference = newWeight - oldWeight;
    
    // Update the changing priority
    changingPriority.weight = newWeight;
    
    // Auto-adjust other priorities
    if (weightDifference !== 0) {
      const otherPriorities = oldPriorities.filter(p => p.id !== id);
      const totalOtherWeight = otherPriorities.reduce((sum, p) => sum + p.weight, 0);
      
      if (totalOtherWeight > 0) {
        // Distribute the difference proportionally
        otherPriorities.forEach(priority => {
          const proportion = priority.weight / totalOtherWeight;
          priority.weight = Math.max(0, priority.weight - (weightDifference * proportion));
          priority.weight = Math.round(priority.weight * 10) / 10; // Round to 1 decimal
        });
      } else if (newWeight < 100) {
        // If all others are 0, distribute evenly
        const sharePerPriority = (100 - newWeight) / otherPriorities.length;
        otherPriorities.forEach(priority => {
          priority.weight = Math.round(sharePerPriority * 10) / 10;
        });
      }
    }
    
    // Ensure total is exactly 100
    const newTotal = oldPriorities.reduce((sum, p) => sum + p.weight, 0);
    if (Math.abs(newTotal - 100) > 0.01) {
      const adjustment = 100 - newTotal;
      const firstNonZero = oldPriorities.find(p => p.id !== id && p.weight > 0);
      if (firstNonZero) {
        firstNonZero.weight = Math.round((firstNonZero.weight + adjustment) * 10) / 10;
      }
    }
    
    // Update capital allocations based on weights
    const updatedPriorities = oldPriorities.map(p => ({
      ...p,
      capitalAllocation: (p.weight / 100) * sharedData.totalCapital
    }));
    
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

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    try {
      const rawData = await parseFile(file);
      const result = parsePrioritiesData(rawData);
      
      if (result.errors.length > 0) {
        toast.error(
          'Upload Failed', 
          `Found ${result.errors.length} error(s):\n${result.errors.slice(0, 3).join('\n')}${result.errors.length > 3 ? '\n...' : ''}`
        );
        return;
      }
      
      // Update capital allocations based on total capital
      const updatedPriorities = result.data.map(p => ({
        ...p,
        capitalAllocation: (p.weight / 100) * sharedData.totalCapital
      }));
      
      setPriorities(updatedPriorities);
      onDataUpdate({ priorities: updatedPriorities });
      
      toast.success(
        'Priorities Imported Successfully!', 
        `${result.data.length} investment priorities have been imported and weights have been auto-calculated.`
      );
      
    } catch (error) {
      toast.error(
        'Import Error', 
        `Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  useEffect(() => {
    setPriorities(sharedData.priorities);
  }, [sharedData.priorities]);

  // Format currency for professional display
  const formatProfessionalCurrency = (value: number): string => {
    const formatted = formatCurrency(value);
    return formatted;
  };

  return (
    <div className="tab1-priorities-clean">
      <div className="main-layout">
        {/* Left side - Table */}
        <div className="table-section">
          <div className="section-header">
            <h2>Investment Priorities</h2>
            <div className="header-actions">
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
              <span className={`weight-status ${isWeightValid ? 'valid' : 'invalid'}`}>
                Total Weight: {totalWeight.toFixed(1)}%
              </span>
            </div>
          </div>

          <table className="priorities-table-clean">
            <thead>
              <tr>
                <th>PRIORITY NAME</th>
                <th style={{ width: '200px' }}>WEIGHT (%)</th>
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
                    <div className="weight-slider-container">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="0.1"
                        value={priority.weight}
                        onChange={(e) => handleWeightChange(priority.id, parseFloat(e.target.value))}
                        className="weight-slider"
                        style={{
                          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${priority.weight}%, #334155 ${priority.weight}%, #334155 100%)`
                        }}
                      />
                      <span className="weight-value">{priority.weight.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td>
                    <span className="allocation-amount-professional">
                      {formatProfessionalCurrency(priority.capitalAllocation)}
                    </span>
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
              <span className="summary-value">{formatProfessionalCurrency(sharedData.totalCapital)}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Allocated:</span>
              <span className="summary-value">{formatProfessionalCurrency(totalAllocated)}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Active Priorities:</span>
              <span className="summary-value">{priorities.filter(p => p.weight > 0).length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Avg Min ROI:</span>
              <span className="summary-value">{(priorities.reduce((sum, p) => sum + p.minROI * p.weight, 0) / 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <FileUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onFileSelect={handleFileUpload}
        title="Import Investment Priorities"
        description="Upload an Excel or CSV file with priority data. Required columns: Priority Name, Description, Weight (%), Time Horizon (years), Min ROI (%), Max Payback (years), Risk Appetite, Strategic Importance"
      />

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
                  <span>{formatProfessionalCurrency(selectedPriority.capitalAllocation)}</span>
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

      <style jsx>{`
        /* Weight Slider Styles */
        .weight-slider-container {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
        }

        .weight-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 140px;
          height: 6px;
          border-radius: 3px;
          outline: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .weight-slider:hover {
          transform: translateY(-1px);
        }

        .weight-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: all 0.2s ease;
        }

        .weight-slider::-webkit-slider-thumb:hover {
          width: 20px;
          height: 20px;
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
        }

        .weight-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: all 0.2s ease;
        }

        .weight-slider::-moz-range-thumb:hover {
          width: 20px;
          height: 20px;
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
        }

        .weight-value {
          min-width: 45px;
          text-align: right;
          color: #cbd5e1;
          font-weight: 600;
          font-size: 0.875rem;
        }

        /* Professional Capital Allocation Styling */
        .allocation-amount-professional {
          color: #e2e8f0;
          font-weight: 600;
          font-size: 0.95rem;
          letter-spacing: 0.025em;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* Update table styling for better alignment */
        .priorities-table-clean td {
          padding: 1rem 0.75rem;
          vertical-align: middle;
        }

        /* Ensure proper width for weight column */
        .priorities-table-clean th:nth-child(2),
        .priorities-table-clean td:nth-child(2) {
          width: 200px;
          min-width: 200px;
        }
      `}</style>
    </div>
  );
};