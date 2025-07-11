'use client'
import React, { useState, useEffect } from 'react';
import { ValidatedProject, AdaniSector, SectorAllocation, AllocationConstraint } from './types';
import { formatCurrency } from './mockDataAdani';

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
  const [draggedProject, setDraggedProject] = useState<ValidatedProject | null>(null);
  const [showConstraintsModal, setShowConstraintsModal] = useState(false);

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
    // Get Grade A and B projects only
    const investmentGradeProjects = sharedData.validatedProjects.filter(
      p => p.investmentGrade === 'A' || p.investmentGrade === 'B'
    );
    
    const totalCapital = investmentGradeProjects.reduce((sum, p) => sum + p.capex, 0);
    
    const initialAllocations: SectorAllocation[] = sharedData.adaniSectors.map(sector => {
      // Auto-assign projects based on their source
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
      // Renewable Energy constraints
      { sectorId: 'SEC-001', constraintType: 'min', value: 25, isHard: true, reason: 'Strategic priority mandate' },
      { sectorId: 'SEC-001', constraintType: 'max', value: 40, isHard: false, reason: 'Diversification requirement' },
      
      // Ports & Logistics constraints
      { sectorId: 'SEC-002', constraintType: 'min', value: 15, isHard: true, reason: 'Core business maintenance' },
      { sectorId: 'SEC-002', constraintType: 'max', value: 25, isHard: false, reason: 'Concentration risk' },
      
      // New Ventures constraints
      { sectorId: 'SEC-009', constraintType: 'max', value: 5, isHard: true, reason: 'Risk management policy' },
      
      // Data Centers constraints
      { sectorId: 'SEC-004', constraintType: 'min', value: 5, isHard: false, reason: 'Growth opportunity' },
      { sectorId: 'SEC-004', constraintType: 'max', value: 15, isHard: false, reason: 'Market maturity' }
    ];
    
    setAllocationConstraints(initialConstraints);
  };

  // Calculate metrics
  const totalCapital = sectorAllocations.reduce((sum, sa) => sum + sa.allocatedCapital, 0);
  const largestConcentration = sectorAllocations.reduce((max, sa) => 
    sa.currentAllocation > max.allocation ? { sector: sa.sector.name, allocation: sa.currentAllocation } : max,
    { sector: '', allocation: 0 }
  );
  const isBalanced = sectorAllocations.every(sa => 
    Math.abs(sa.currentAllocation - sa.targetAllocation) <= 5
  );
  const availableForAllocation = 90000000000 - totalCapital; // $90B total - allocated

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
          required: constraint.value,
          limit: constraint.value
        });
      } else if (constraint.constraintType === 'max' && allocation.currentAllocation > constraint.value) {
        violations.push({
          type: 'max',
          constraint,
          current: allocation.currentAllocation,
          required: constraint.value,
          limit: constraint.value
        });
      }
    }
    
    return violations;
  };

  // Handle drag and drop
  const handleDragStart = (project: ValidatedProject) => {
    setDraggedProject(project);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetSectorId: string) => {
    e.preventDefault();
    
    if (!draggedProject) return;
    
    // Find source and target sectors
    const sourceSector = sectorAllocations.find(sa => 
      sa.projects.some(p => p.id === draggedProject.id)
    );
    const targetSector = sectorAllocations.find(sa => sa.sectorId === targetSectorId);
    
    if (!sourceSector || !targetSector || sourceSector.sectorId === targetSectorId) {
      setDraggedProject(null);
      return;
    }
    
    // Move project between sectors
    const updatedAllocations = sectorAllocations.map(sa => {
      if (sa.sectorId === sourceSector.sectorId) {
        // Remove from source
        const newProjects = sa.projects.filter(p => p.id !== draggedProject.id);
        const newCapital = sa.allocatedCapital - draggedProject.capex;
        return {
          ...sa,
          projects: newProjects,
          allocatedCapital: newCapital,
          currentAllocation: totalCapital > 0 ? (newCapital / totalCapital) * 100 : 0,
          projectCount: newProjects.length,
          performance: {
            ...sa.performance,
            totalCapital: newCapital,
            avgIRR: newProjects.reduce((sum, p) => sum + p.irr, 0) / newProjects.length || 0,
            avgNPV: newProjects.reduce((sum, p) => sum + p.npv, 0) / newProjects.length || 0,
            avgRisk: newProjects.reduce((sum, p) => sum + p.riskScore, 0) / newProjects.length || 0
          }
        };
      } else if (sa.sectorId === targetSector.sectorId) {
        // Add to target
        const newProjects = [...sa.projects, draggedProject];
        const newCapital = sa.allocatedCapital + draggedProject.capex;
        return {
          ...sa,
          projects: newProjects,
          allocatedCapital: newCapital,
          currentAllocation: totalCapital > 0 ? (newCapital / totalCapital) * 100 : 0,
          projectCount: newProjects.length,
          performance: {
            ...sa.performance,
            totalCapital: newCapital,
            avgIRR: newProjects.reduce((sum, p) => sum + p.irr, 0) / newProjects.length || 0,
            avgNPV: newProjects.reduce((sum, p) => sum + p.npv, 0) / newProjects.length || 0,
            avgRisk: newProjects.reduce((sum, p) => sum + p.riskScore, 0) / newProjects.length || 0
          }
        };
      }
      return sa;
    });
    
    setSectorAllocations(updatedAllocations);
    onDataUpdate({ sectorAllocations: updatedAllocations, allocationConstraints });
    setDraggedProject(null);
  };

  // Rebalance allocations
  const rebalanceAllocations = () => {
    const totalProjectCapital = sectorAllocations.reduce((sum, sa) => sum + sa.allocatedCapital, 0);
    
    const rebalancedAllocations = sectorAllocations.map(sa => ({
      ...sa,
      currentAllocation: totalProjectCapital > 0 ? (sa.allocatedCapital / totalProjectCapital) * 100 : 0
    }));
    
    setSectorAllocations(rebalancedAllocations);
    onDataUpdate({ sectorAllocations: rebalancedAllocations, allocationConstraints });
  };

  const getSectorColor = (sectorId: string) => {
    const sector = sharedData.adaniSectors.find(s => s.id === sectorId);
    return sector?.color || '#475569';
  };

  const getConstraintStatus = (allocation: SectorAllocation) => {
    const violations = getConstraintViolations(allocation);
    if (violations.some(v => v.constraint.isHard)) return 'critical';
    if (violations.length > 0) return 'warning';
    return 'ok';
  };

  return (
    <div className="tab4-sector-allocation">
      {/* Header Stats */}
      <div className="allocation-header">
        <div className="header-stats">
          <div className="stat-card">
            <div className="stat-icon">🏭</div>
            <div className="stat-content">
              <div className="stat-value">{sectorAllocations.length}</div>
              <div className="stat-label">Active Sectors</div>
            </div>
          </div>
          
          <div className={`stat-card ${isBalanced ? 'balanced' : 'imbalanced'}`}>
            <div className="stat-icon">{isBalanced ? '⚖️' : '⚠️'}</div>
            <div className="stat-content">
              <div className="stat-value">{isBalanced ? 'Balanced' : 'Imbalanced'}</div>
              <div className="stat-label">Portfolio Balance</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <div className="stat-value">{largestConcentration.allocation.toFixed(1)}%</div>
              <div className="stat-label">Largest Concentration</div>
              <div className="stat-sublabel">({largestConcentration.sector})</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <div className="stat-value">{formatCurrency(availableForAllocation)}</div>
              <div className="stat-label">Available for Allocation</div>
            </div>
          </div>
        </div>
        
        <div className="header-controls">
          <button 
            className="btn btn-primary"
            onClick={rebalanceAllocations}
          >
            Rebalance Portfolio
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => setShowConstraintsModal(true)}
          >
            Manage Constraints
          </button>
        </div>
      </div>

      {/* Three-Column Layout */}
      <div className="allocation-layout">
        {/* Left Panel - Sector List */}
        <div className="sector-list-panel">
          <h3>Sectors</h3>
          <div className="sector-cards">
            {sectorAllocations.map(allocation => {
              const violations = getConstraintViolations(allocation);
              const status = getConstraintStatus(allocation);
              
              return (
                <div 
                  key={allocation.sectorId}
                  className={`sector-card ${selectedSector === allocation.sectorId ? 'selected' : ''} ${status}`}
                  onClick={() => setSelectedSector(allocation.sectorId)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, allocation.sectorId)}
                >
                  <div className="sector-header">
                    <div className="sector-icon">{allocation.sector.icon}</div>
                    <div className="sector-name">{allocation.sector.name}</div>
                    {violations.length > 0 && (
                      <div className={`violation-indicator ${status}`}>
                        {violations.length}
                      </div>
                    )}
                  </div>
                  
                  <div className="sector-metrics">
                    <div className="metric">
                      <span className="metric-label">Current:</span>
                      <span className="metric-value">{allocation.currentAllocation.toFixed(1)}%</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Target:</span>
                      <span className="metric-value">{allocation.targetAllocation.toFixed(1)}%</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Capital:</span>
                      <span className="metric-value">{formatCurrency(allocation.allocatedCapital)}</span>
                    </div>
                  </div>
                  
                  <div className="allocation-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${allocation.currentAllocation}%`,
                          backgroundColor: getSectorColor(allocation.sectorId)
                        }}
                      ></div>
                      <div 
                        className="progress-target"
                        style={{ left: `${allocation.targetAllocation}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="sector-summary">
                    <div className="summary-item">
                      <span className="summary-label">Projects:</span>
                      <span className="summary-value">{allocation.projectCount}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Avg IRR:</span>
                      <span className="summary-value">{allocation.performance.avgIRR.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Panel - Interactive Donut Chart */}
        <div className="donut-chart-panel">
          <h3>Portfolio Allocation</h3>
          <div className="donut-container">
            <svg width="320" height="320" className="allocation-donut">
              {sectorAllocations.map((allocation, index) => {
                const startAngle = sectorAllocations.slice(0, index).reduce((sum, sa) => sum + (sa.currentAllocation / 100) * 360, 0);
                const endAngle = startAngle + (allocation.currentAllocation / 100) * 360;
                
                const innerRadius = 80;
                const outerRadius = 140;
                const targetRadius = 150;
                
                const x1 = 160 + innerRadius * Math.cos((startAngle - 90) * Math.PI / 180);
                const y1 = 160 + innerRadius * Math.sin((startAngle - 90) * Math.PI / 180);
                const x2 = 160 + outerRadius * Math.cos((startAngle - 90) * Math.PI / 180);
                const y2 = 160 + outerRadius * Math.sin((startAngle - 90) * Math.PI / 180);
                const x3 = 160 + outerRadius * Math.cos((endAngle - 90) * Math.PI / 180);
                const y3 = 160 + outerRadius * Math.sin((endAngle - 90) * Math.PI / 180);
                const x4 = 160 + innerRadius * Math.cos((endAngle - 90) * Math.PI / 180);
                const y4 = 160 + innerRadius * Math.sin((endAngle - 90) * Math.PI / 180);
                
                const largeArc = allocation.currentAllocation > 50 ? 1 : 0;
                
                const pathData = [
                  `M ${x1} ${y1}`,
                  `L ${x2} ${y2}`,
                  `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x3} ${y3}`,
                  `L ${x4} ${y4}`,
                  `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x1} ${y1}`,
                  `Z`
                ].join(' ');
                
                // Target allocation ring
                const targetStart = sectorAllocations.slice(0, index).reduce((sum, sa) => sum + (sa.targetAllocation / 100) * 360, 0);
                const targetEnd = targetStart + (allocation.targetAllocation / 100) * 360;
                
                const tx1 = 160 + targetRadius * Math.cos((targetStart - 90) * Math.PI / 180);
                const ty1 = 160 + targetRadius * Math.sin((targetStart - 90) * Math.PI / 180);
                const tx2 = 160 + (targetRadius + 10) * Math.cos((targetStart - 90) * Math.PI / 180);
                const ty2 = 160 + (targetRadius + 10) * Math.sin((targetStart - 90) * Math.PI / 180);
                const tx3 = 160 + (targetRadius + 10) * Math.cos((targetEnd - 90) * Math.PI / 180);
                const ty3 = 160 + (targetRadius + 10) * Math.sin((targetEnd - 90) * Math.PI / 180);
                const tx4 = 160 + targetRadius * Math.cos((targetEnd - 90) * Math.PI / 180);
                const ty4 = 160 + targetRadius * Math.sin((targetEnd - 90) * Math.PI / 180);
                
                const targetLargeArc = allocation.targetAllocation > 50 ? 1 : 0;
                
                const targetPathData = [
                  `M ${tx1} ${ty1}`,
                  `L ${tx2} ${ty2}`,
                  `A ${targetRadius + 10} ${targetRadius + 10} 0 ${targetLargeArc} 1 ${tx3} ${ty3}`,
                  `L ${tx4} ${ty4}`,
                  `A ${targetRadius} ${targetRadius} 0 ${targetLargeArc} 0 ${tx1} ${ty1}`,
                  `Z`
                ].join(' ');
                
                return (
                  <g key={allocation.sectorId}>
                    {/* Target allocation (outer ring) */}
                    <path
                      d={targetPathData}
                      fill={getSectorColor(allocation.sectorId)}
                      opacity={0.3}
                      stroke="#1e293b"
                      strokeWidth="1"
                    />
                    
                    {/* Current allocation (inner ring) */}
                    <path
                      d={pathData}
                      fill={getSectorColor(allocation.sectorId)}
                      opacity={0.8}
                      stroke="#1e293b"
                      strokeWidth="2"
                      className="sector-segment"
                      onClick={() => setSelectedSector(allocation.sectorId)}
                    />
                    
                    {/* Sector label */}
                    {allocation.currentAllocation > 5 && (
                      <text
                        x={160 + (innerRadius + outerRadius) / 2 * Math.cos((startAngle + endAngle) / 2 * Math.PI / 180 - Math.PI / 2)}
                        y={160 + (innerRadius + outerRadius) / 2 * Math.sin((startAngle + endAngle) / 2 * Math.PI / 180 - Math.PI / 2)}
                        textAnchor="middle"
                        className="sector-label"
                        fill="#ffffff"
                        fontSize="12"
                        fontWeight="600"
                      >
                        {allocation.currentAllocation.toFixed(1)}%
                      </text>
                    )}
                  </g>
                );
              })}
              
              {/* Center text */}
              <text x="160" y="150" textAnchor="middle" className="center-text" fill="#ffffff" fontSize="14" fontWeight="600">
                Portfolio
              </text>
              <text x="160" y="170" textAnchor="middle" className="center-text" fill="#94a3b8" fontSize="12">
                {formatCurrency(totalCapital)}
              </text>
            </svg>
          </div>
          
          <div className="donut-legend">
            <div className="legend-title">Legend</div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#475569', opacity: 0.8 }}></div>
              <span>Current Allocation</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#475569', opacity: 0.3 }}></div>
              <span>Target Allocation</span>
            </div>
          </div>
        </div>

        {/* Right Panel - Sector Details */}
        <div className="sector-details-panel">
          <h3>Sector Details</h3>
          {selectedSector ? (
            <div className="sector-details">
              {(() => {
                const allocation = sectorAllocations.find(sa => sa.sectorId === selectedSector);
                if (!allocation) return null;
                
                const violations = getConstraintViolations(allocation);
                
                return (
                  <>
                    <div className="sector-overview">
                      <div className="sector-title">
                        <span className="sector-icon">{allocation.sector.icon}</span>
                        <span className="sector-name">{allocation.sector.name}</span>
                      </div>
                      
                      <div className="sector-metrics-grid">
                        <div className="metric-card">
                          <div className="metric-label">Current Allocation</div>
                          <div className="metric-value">{allocation.currentAllocation.toFixed(1)}%</div>
                        </div>
                        <div className="metric-card">
                          <div className="metric-label">Target Allocation</div>
                          <div className="metric-value">{allocation.targetAllocation.toFixed(1)}%</div>
                        </div>
                        <div className="metric-card">
                          <div className="metric-label">Total Capital</div>
                          <div className="metric-value">{formatCurrency(allocation.allocatedCapital)}</div>
                        </div>
                        <div className="metric-card">
                          <div className="metric-label">Project Count</div>
                          <div className="metric-value">{allocation.projectCount}</div>
                        </div>
                      </div>
                    </div>
                    
                    {violations.length > 0 && (
                      <div className="constraint-violations">
                        <h4>Constraint Violations</h4>
                        <div className="violations-list">
                          {violations.map((violation, index) => (
                            <div key={index} className={`violation-item ${violation.constraint.isHard ? 'hard' : 'soft'}`}>
                              <div className="violation-type">
                                {violation.type === 'min' ? '⬇️' : '⬆️'} 
                                {violation.constraint.isHard ? ' Hard' : ' Soft'} 
                                {violation.type === 'min' ? ' Minimum' : ' Maximum'}
                              </div>
                              <div className="violation-details">
                                Current: {violation.current.toFixed(1)}% | 
                                {violation.type === 'min' ? ' Required: ' : ' Limit: '}
                                {(violation.type === 'min' ? violation.required : violation.limit || 0).toFixed(1)}%
                              </div>
                              <div className="violation-reason">{violation.constraint.reason}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="sector-performance">
                      <h4>Performance Metrics</h4>
                      <div className="performance-grid">
                        <div className="performance-item">
                          <span className="performance-label">Average IRR:</span>
                          <span className="performance-value">{allocation.performance.avgIRR.toFixed(1)}%</span>
                        </div>
                        <div className="performance-item">
                          <span className="performance-label">Average NPV:</span>
                          <span className="performance-value">{formatCurrency(allocation.performance.avgNPV)}</span>
                        </div>
                        <div className="performance-item">
                          <span className="performance-label">Average Risk:</span>
                          <span className="performance-value">{allocation.performance.avgRisk.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="sector-projects">
                      <h4>Projects in Sector</h4>
                      <div className="projects-list">
                        {allocation.projects.map(project => (
                          <div 
                            key={project.id}
                            className="project-item"
                            draggable
                            onDragStart={() => handleDragStart(project)}
                          >
                            <div className="project-header">
                              <div className="project-name">{project.name}</div>
                              <div className={`project-grade grade-${project.investmentGrade}`}>
                                {project.investmentGrade}
                              </div>
                            </div>
                            <div className="project-details">
                              <div className="project-detail">
                                <span className="detail-label">Investment:</span>
                                <span className="detail-value">{formatCurrency(project.capex)}</span>
                              </div>
                              <div className="project-detail">
                                <span className="detail-label">IRR:</span>
                                <span className="detail-value">{project.irr.toFixed(1)}%</span>
                              </div>
                              <div className="project-detail">
                                <span className="detail-label">Risk:</span>
                                <span className="detail-value">{project.riskScore}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="no-sector-selected">
              <div className="placeholder-content">
                <div className="placeholder-icon">🎯</div>
                <div className="placeholder-text">Select a sector to view details</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Constraints Management Modal */}
      {showConstraintsModal && (
        <div className="modal-overlay" onClick={() => setShowConstraintsModal(false)}>
          <div className="modal-content constraints-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Manage Sector Constraints</h2>
              <button className="modal-close" onClick={() => setShowConstraintsModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="constraints-table">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Sector</th>
                      <th>Constraint Type</th>
                      <th>Value (%)</th>
                      <th>Hard/Soft</th>
                      <th>Reason</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allocationConstraints.map((constraint, index) => {
                      const sector = sharedData.adaniSectors.find(s => s.id === constraint.sectorId);
                      return (
                        <tr key={index}>
                          <td>
                            <span className="sector-name">
                              {sector?.icon} {sector?.name}
                            </span>
                          </td>
                          <td>
                            <span className={`constraint-type ${constraint.constraintType}`}>
                              {constraint.constraintType}
                            </span>
                          </td>
                          <td>{constraint.value}%</td>
                          <td>
                            <span className={`constraint-hardness ${constraint.isHard ? 'hard' : 'soft'}`}>
                              {constraint.isHard ? 'Hard' : 'Soft'}
                            </span>
                          </td>
                          <td>{constraint.reason}</td>
                          <td>
                            <button className="btn btn-sm btn-secondary">Edit</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};