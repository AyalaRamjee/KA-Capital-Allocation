'use client'
import React, { useState, useEffect } from 'react';
import { ValidatedProject, AdaniSector, SectorAllocation, AllocationConstraint } from './types';
import { formatCurrency } from './mockDataAdani';
import FileUploadModal from './FileUploadModal';
import { parseFile, parseSectorAllocationsData } from './fileParsingUtils';
import { useToast } from './ToastContainer';

interface Tab4Props {
  sharedData: {
    validatedProjects: ValidatedProject[];
    adaniSectors: AdaniSector[];
    sectorAllocations: SectorAllocation[];
    allocationConstraints: AllocationConstraint[];
  };
  onDataUpdate: (data: { 
    sectorAllocations: SectorAllocation[];
    allocationConstraints: AllocationConstraint[];
  }) => void;
}

export const Tab4_AllocateBySector: React.FC<Tab4Props> = ({ sharedData, onDataUpdate }) => {
  const [sectorAllocations, setSectorAllocations] = useState<SectorAllocation[]>(sharedData.sectorAllocations);
  const [allocationConstraints, setAllocationConstraints] = useState<AllocationConstraint[]>(sharedData.allocationConstraints);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [showConstraintsModal, setShowConstraintsModal] = useState(false);
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const toast = useToast();

  // Initialize sector allocations if empty
  useEffect(() => {
    if (sharedData.sectorAllocations.length === 0) {
      initializeSectorAllocations();
    }
  }, [sharedData.validatedProjects, sharedData.adaniSectors]);

  // Initialize constraints
  useEffect(() => {
    if (sharedData.allocationConstraints.length === 0) {
      initializeConstraints();
    }
  }, [sharedData.adaniSectors]);

  const initializeSectorAllocations = () => {
    const investmentGradeProjects = sharedData.validatedProjects.filter(
      p => p.investmentGrade === 'A' || p.investmentGrade === 'B'
    );
    
    const totalCapital = investmentGradeProjects.reduce((sum, p) => sum + p.capex, 0);
    
    const initialAllocations: SectorAllocation[] = sharedData.adaniSectors.map(sector => {
      const sectorProjects = investmentGradeProjects.filter(project => 
        project.businessUnit.toLowerCase().includes(sector.name.toLowerCase()) ||
        (sector.name === 'Renewable Energy' && (project.businessUnit.includes('Green') || project.businessUnit.includes('Solar') || project.businessUnit.includes('Wind'))) ||
        (sector.name === 'Ports & Logistics' && project.businessUnit.includes('Ports')) ||
        (sector.name === 'Airports' && project.businessUnit.includes('Airport')) ||
        (sector.name === 'Data Centers' && project.businessUnit.includes('Connex'))
      );
      
      const sectorCapital = sectorProjects.reduce((sum, p) => sum + p.capex, 0);
      const currentAllocation = totalCapital > 0 ? (sectorCapital / totalCapital) * 100 : 0;
      
      return {
        sectorId: sector.id,
        sector,
        currentAllocation,
        targetAllocation: sector.targetAllocation,
        minAllocation: Math.max(1, sector.targetAllocation - 10),
        maxAllocation: sector.targetAllocation + 15,
        allocatedCapital: sectorCapital,
        projectCount: sectorProjects.length,
        projects: sectorProjects,
        performance: {
          avgIRR: sectorProjects.reduce((sum, p) => sum + p.irr, 0) / sectorProjects.length || 0,
          avgNPV: sectorProjects.reduce((sum, p) => sum + p.npv, 0) / sectorProjects.length || 0,
          avgRisk: sectorProjects.reduce((sum, p) => sum + p.riskScore, 0) / sectorProjects.length || 0,
          totalCapital: sectorCapital
        }
      };
    });
    
    setSectorAllocations(initialAllocations);
    onDataUpdate({ sectorAllocations: initialAllocations, allocationConstraints });
  };

  const initializeConstraints = () => {
    const initialConstraints: AllocationConstraint[] = [
      { sectorId: 'SEC-001', constraintType: 'min', value: 25, isHard: true, reason: 'Strategic priority mandate' },
      { sectorId: 'SEC-001', constraintType: 'max', value: 40, isHard: false, reason: 'Diversification requirement' },
      { sectorId: 'SEC-002', constraintType: 'min', value: 15, isHard: true, reason: 'Core business maintenance' },
      { sectorId: 'SEC-002', constraintType: 'max', value: 25, isHard: false, reason: 'Concentration risk' },
      { sectorId: 'SEC-009', constraintType: 'max', value: 5, isHard: true, reason: 'Risk management policy' },
      { sectorId: 'SEC-004', constraintType: 'min', value: 5, isHard: false, reason: 'Growth opportunity' },
      { sectorId: 'SEC-004', constraintType: 'max', value: 15, isHard: false, reason: 'Market maturity' }
    ];
    
    setAllocationConstraints(initialConstraints);
  };

  // Check constraint violations
  const getConstraintViolations = (allocation: SectorAllocation) => {
    const violations = [];
    const sectorConstraints = allocationConstraints.filter(c => c.sectorId === allocation.sectorId);
    
    for (const constraint of sectorConstraints) {
      if (constraint.constraintType === 'min' && allocation.currentAllocation < constraint.value) {
        violations.push({
          type: 'min',
          constraint,
          current: allocation.currentAllocation,
          required: constraint.value
        });
      } else if (constraint.constraintType === 'max' && allocation.currentAllocation > constraint.value) {
        violations.push({
          type: 'max',
          constraint,
          current: allocation.currentAllocation,
          limit: constraint.value
        });
      }
    }
    
    return violations;
  };

  // Get constraint status
  const getConstraintStatus = (allocation: SectorAllocation) => {
    const violations = getConstraintViolations(allocation);
    if (violations.some(v => v.constraint.isHard)) return 'critical';
    if (violations.length > 0) return 'warning';
    return 'ok';
  };

  // Calculate metrics
  const totalCapital = sectorAllocations.reduce((sum, sa) => sum + sa.allocatedCapital, 0);
  const totalProjects = sectorAllocations.reduce((sum, sa) => sum + sa.projectCount, 0);
  const isBalanced = sectorAllocations.every(sa => 
    Math.abs(sa.currentAllocation - sa.targetAllocation) <= 5
  );
  const constraintViolations = sectorAllocations.filter(sa => {
    const violations = getConstraintViolations(sa);
    return violations.length > 0;
  }).length;

  // Rebalance allocations
  const rebalanceAllocations = () => {
    const rebalancedAllocations = sectorAllocations.map(sa => ({
      ...sa,
      currentAllocation: sa.targetAllocation
    }));
    
    setSectorAllocations(rebalancedAllocations);
    onDataUpdate({ sectorAllocations: rebalancedAllocations, allocationConstraints });
  };

  // Handle allocation adjustment
  const handleAllocationAdjust = (sectorId: string, newAllocation: number) => {
    if (newAllocation < 0 || newAllocation > 100) return;
    
    const updatedAllocations = sectorAllocations.map(sa => 
      sa.sectorId === sectorId ? { ...sa, currentAllocation: newAllocation } : sa
    );
    
    setSectorAllocations(updatedAllocations);
    onDataUpdate({ sectorAllocations: updatedAllocations, allocationConstraints });
  };

  // Open projects modal
  const openProjectsModal = (sectorId: string) => {
    setSelectedSector(sectorId);
    setShowProjectsModal(true);
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    try {
      const rawData = await parseFile(file);
      const result = parseSectorAllocationsData(rawData);
      
      if (result.errors.length > 0) {
        toast.error(
          'Upload Failed', 
          `Found ${result.errors.length} error(s) in sector allocation data.`
        );
        return;
      }
      
      // Update sector allocations with imported data
      const updatedAllocations = sectorAllocations.map(allocation => {
        const importedSector = result.data.find(
          imported => imported.sectorName.toLowerCase() === allocation.sector.name.toLowerCase()
        );
        
        if (importedSector) {
          return {
            ...allocation,
            currentAllocation: importedSector.percentage,
            targetAllocation: importedSector.percentage,
            allocatedCapital: importedSector.allocatedAmount,
            projectCount: importedSector.minProjects || allocation.projectCount
          };
        }
        
        return allocation;
      });
      
      setSectorAllocations(updatedAllocations);
      onDataUpdate({ sectorAllocations: updatedAllocations, allocationConstraints });
      
      toast.success(
        'Allocations Updated!', 
        `Successfully imported sector allocation data and updated portfolio distribution.`
      );
      
    } catch (error) {
      toast.error(
        'Import Error', 
        `Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  return (
    <div className="tab4-allocate-clean">
      <div className="main-layout">
        {/* Left side - Table */}
        <div className="table-section">
          <div className="section-header">
            <h2>Sector Allocation</h2>
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
              <span className={`balance-status ${isBalanced ? 'balanced' : 'imbalanced'}`}>
                {isBalanced ? '✅ Balanced' : '⚠️ Imbalanced'}
              </span>
              <button 
                className="btn-rebalance"
                onClick={rebalanceAllocations}
              >
                Rebalance to Targets
              </button>
              <button 
                className="btn-constraints"
                onClick={() => setShowConstraintsModal(true)}
              >
                Manage Constraints
              </button>
            </div>
          </div>

          <table className="allocation-table-clean">
            <thead>
              <tr>
                <th>SECTOR</th>
                <th>CURRENT %</th>
                <th>TARGET %</th>
                <th>VARIANCE</th>
                <th>CAPITAL</th>
                <th>PROJECTS</th>
                <th>AVG IRR</th>
                <th>AVG RISK</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {sectorAllocations.map(allocation => {
                const variance = allocation.currentAllocation - allocation.targetAllocation;
                const status = getConstraintStatus(allocation);
                const violations = getConstraintViolations(allocation);
                
                return (
                  <tr key={allocation.sectorId}>
                    <td>
                      <div className="sector-info">
                        <span className="sector-icon">{allocation.sector.icon}</span>
                        <span className="sector-name">{allocation.sector.name}</span>
                      </div>
                    </td>
                    <td>
                      <input
                        type="number"
                        value={allocation.currentAllocation.toFixed(1)}
                        onChange={(e) => handleAllocationAdjust(allocation.sectorId, parseFloat(e.target.value) || 0)}
                        className="allocation-input-clean"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </td>
                    <td>{allocation.targetAllocation.toFixed(1)}%</td>
                    <td>
                      <span className={`variance ${variance > 0 ? 'positive' : variance < 0 ? 'negative' : 'neutral'}`}>
                        {variance >= 0 ? '+' : ''}{variance.toFixed(1)}%
                      </span>
                    </td>
                    <td>{formatCurrency(allocation.allocatedCapital)}</td>
                    <td>
                      <a 
                        href="#" 
                        className="projects-link"
                        onClick={(e) => {
                          e.preventDefault();
                          openProjectsModal(allocation.sectorId);
                        }}
                      >
                        {allocation.projectCount} projects
                      </a>
                    </td>
                    <td>{allocation.performance.avgIRR.toFixed(1)}%</td>
                    <td>
                      <span className={`risk-value ${allocation.performance.avgRisk <= 30 ? 'low' : allocation.performance.avgRisk <= 60 ? 'medium' : 'high'}`}>
                        {allocation.performance.avgRisk.toFixed(0)}
                      </span>
                    </td>
                    <td>
                      <span className={`constraint-status ${status}`}>
                        {status === 'ok' ? '✅ OK' : status === 'warning' ? '⚠️ WARN' : '❌ VIOLATION'}
                      </span>
                      {violations.length > 0 && (
                        <div className="violation-details">
                          {violations.map((v, i) => (
                            <div key={i} className="violation-text">
                              {v.type === 'min' ? `Below min ${v.required}%` : `Above max ${v.limit}%`}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="action-btn view-btn"
                          onClick={() => openProjectsModal(allocation.sectorId)}
                          title="View Projects"
                        >
                          📊
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="totals-row">
                <td>TOTAL</td>
                <td>{sectorAllocations.reduce((sum, sa) => sum + sa.currentAllocation, 0).toFixed(1)}%</td>
                <td>100.0%</td>
                <td>-</td>
                <td>{formatCurrency(totalCapital)}</td>
                <td>{totalProjects}</td>
                <td>{(sectorAllocations.reduce((sum, sa) => sum + sa.performance.avgIRR * sa.projectCount, 0) / totalProjects).toFixed(1)}%</td>
                <td>{(sectorAllocations.reduce((sum, sa) => sum + sa.performance.avgRisk * sa.projectCount, 0) / totalProjects).toFixed(0)}</td>
                <td>{constraintViolations} violations</td>
                <td>-</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Right side - Donut Chart & Summary */}
        <div className="chart-section">
          <div className="portfolio-chart-card">
            <h3>Portfolio Allocation</h3>
            <div className="donut-chart-container">
              <svg width="250" height="250" className="allocation-donut">
                {sectorAllocations.map((allocation, index) => {
                  const startAngle = sectorAllocations.slice(0, index).reduce((sum, sa) => sum + (sa.currentAllocation / 100) * 360, 0);
                  const endAngle = startAngle + (allocation.currentAllocation / 100) * 360;
                  
                  const innerRadius = 60;
                  const outerRadius = 100;
                  
                  const x1 = 125 + innerRadius * Math.cos((startAngle - 90) * Math.PI / 180);
                  const y1 = 125 + innerRadius * Math.sin((startAngle - 90) * Math.PI / 180);
                  const x2 = 125 + outerRadius * Math.cos((startAngle - 90) * Math.PI / 180);
                  const y2 = 125 + outerRadius * Math.sin((startAngle - 90) * Math.PI / 180);
                  const x3 = 125 + outerRadius * Math.cos((endAngle - 90) * Math.PI / 180);
                  const y3 = 125 + outerRadius * Math.sin((endAngle - 90) * Math.PI / 180);
                  const x4 = 125 + innerRadius * Math.cos((endAngle - 90) * Math.PI / 180);
                  const y4 = 125 + innerRadius * Math.sin((endAngle - 90) * Math.PI / 180);
                  
                  const largeArc = allocation.currentAllocation > 50 ? 1 : 0;
                  
                  const pathData = [
                    `M ${x1} ${y1}`,
                    `L ${x2} ${y2}`,
                    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x3} ${y3}`,
                    `L ${x4} ${y4}`,
                    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x1} ${y1}`,
                    `Z`
                  ].join(' ');
                  
                  return allocation.currentAllocation > 0 ? (
                    <path
                      key={allocation.sectorId}
                      d={pathData}
                      fill={allocation.sector.color}
                      opacity={0.8}
                      stroke="#1e293b"
                      strokeWidth="2"
                    />
                  ) : null;
                })}
                <text x="125" y="120" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="600">
                  {formatCurrency(totalCapital)}
                </text>
                <text x="125" y="135" textAnchor="middle" fill="#94a3b8" fontSize="12">
                  Total Capital
                </text>
              </svg>
            </div>
          </div>

          <div className="allocation-summary-card">
            <h3>Allocation Summary</h3>
            <div className="summary-item">
              <span className="summary-label">Total Sectors:</span>
              <span className="summary-value">{sectorAllocations.length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Active Sectors:</span>
              <span className="summary-value">{sectorAllocations.filter(sa => sa.projectCount > 0).length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Projects:</span>
              <span className="summary-value">{totalProjects}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Portfolio IRR:</span>
              <span className="summary-value">
                {totalProjects > 0 
                  ? (sectorAllocations.reduce((sum, sa) => sum + sa.performance.avgIRR * sa.projectCount, 0) / totalProjects).toFixed(1)
                  : 0}%
              </span>
            </div>
          </div>

          <div className="constraints-summary-card">
            <h3>Constraint Violations</h3>
            {sectorAllocations.filter(sa => getConstraintViolations(sa).length > 0).map(allocation => {
              const violations = getConstraintViolations(allocation);
              return (
                <div key={allocation.sectorId} className="constraint-violation-item">
                  <div className="violation-sector">
                    <span className="sector-icon">{allocation.sector.icon}</span>
                    <span className="sector-name">{allocation.sector.name}</span>
                  </div>
                  {violations.map((v, i) => (
                    <div key={i} className={`violation-detail ${v.constraint.isHard ? 'hard' : 'soft'}`}>
                      {v.type === 'min' 
                        ? `Below minimum ${v.required}% (current: ${v.current.toFixed(1)}%)`
                        : `Above maximum ${v.limit}% (current: ${v.current.toFixed(1)}%)`
                      }
                    </div>
                  ))}
                </div>
              );
            })}
            {constraintViolations === 0 && (
              <div className="no-violations">
                ✅ All constraints satisfied
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Constraints Modal */}
      {showConstraintsModal && (
        <div className="modal-overlay" onClick={() => setShowConstraintsModal(false)}>
          <div className="modal-content constraints-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Manage Sector Constraints</h2>
              <button className="modal-close" onClick={() => setShowConstraintsModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <table className="constraints-table-clean">
                <thead>
                  <tr>
                    <th>SECTOR</th>
                    <th>TYPE</th>
                    <th>VALUE (%)</th>
                    <th>HARD/SOFT</th>
                    <th>REASON</th>
                  </tr>
                </thead>
                <tbody>
                  {allocationConstraints.map((constraint, index) => {
                    const sector = sharedData.adaniSectors.find(s => s.id === constraint.sectorId);
                    return (
                      <tr key={index}>
                        <td>
                          <span className="sector-icon">{sector?.icon}</span>
                          <span className="sector-name">{sector?.name}</span>
                        </td>
                        <td>
                          <span className={`constraint-type ${constraint.constraintType}`}>
                            {constraint.constraintType.toUpperCase()}
                          </span>
                        </td>
                        <td>{constraint.value}%</td>
                        <td>
                          <span className={`constraint-hardness ${constraint.isHard ? 'hard' : 'soft'}`}>
                            {constraint.isHard ? 'HARD' : 'SOFT'}
                          </span>
                        </td>
                        <td>{constraint.reason}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Projects Modal */}
      {showProjectsModal && selectedSector && (
        <div className="modal-overlay" onClick={() => setShowProjectsModal(false)}>
          <div className="modal-content projects-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {sectorAllocations.find(sa => sa.sectorId === selectedSector)?.sector.icon}
                {' '}
                {sectorAllocations.find(sa => sa.sectorId === selectedSector)?.sector.name} Projects
              </h2>
              <button className="modal-close" onClick={() => setShowProjectsModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <table className="projects-table-clean">
                <thead>
                  <tr>
                    <th>PROJECT NAME</th>
                    <th>GRADE</th>
                    <th>INVESTMENT</th>
                    <th>IRR</th>
                    <th>RISK</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {sectorAllocations.find(sa => sa.sectorId === selectedSector)?.projects.map(project => (
                    <tr key={project.id}>
                      <td>{project.name}</td>
                      <td>
                        <span className={`grade-badge-clean grade-${project.investmentGrade.toLowerCase()}`}>
                          {project.investmentGrade}
                        </span>
                      </td>
                      <td>{formatCurrency(project.capex)}</td>
                      <td>{project.irr.toFixed(1)}%</td>
                      <td>{project.riskScore}</td>
                      <td>
                        <span className={`status-badge-clean status-${project.status}`}>
                          {project.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <FileUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onFileSelect={handleFileUpload}
        title="Import Sector Allocations"
        description="Upload an Excel or CSV file with sector allocation data. Required columns: Sector Name, Allocated Amount (USD), Target Percentage (%), Min Projects, Max Projects"
      />
    </div>
  );
};