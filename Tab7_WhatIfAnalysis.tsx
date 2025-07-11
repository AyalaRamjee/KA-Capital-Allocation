'use client'
import React, { useState, useEffect } from 'react';
import { ValidatedProject, InvestmentPriority, AdaniSector } from './types';
import { formatCurrency } from './mockDataAdani';

interface Tab7Props {
  sharedData: {
    validatedProjects: ValidatedProject[];
    investmentPriorities: InvestmentPriority[];
    adaniSectors: AdaniSector[];
  };
  onDataUpdate: (data: any) => void;
}

interface ScenarioSettings {
  id: string;
  name: string;
  riskThreshold: number;
  returnThreshold: number;
  timeHorizon: number;
  requireSynergies: boolean;
}

export const Tab7_WhatIfAnalysis: React.FC<Tab7Props> = ({ sharedData, onDataUpdate }) => {
  // Current threshold settings
  const [riskThreshold, setRiskThreshold] = useState(50);
  const [returnThreshold, setReturnThreshold] = useState(15);
  const [timeHorizon, setTimeHorizon] = useState(8);
  const [requireSynergies, setRequireSynergies] = useState(true);
  
  // Scenario management
  const [savedScenarios, setSavedScenarios] = useState<ScenarioSettings[]>([
    { id: 'conservative', name: 'Conservative', riskThreshold: 40, returnThreshold: 20, timeHorizon: 6, requireSynergies: true },
    { id: 'balanced', name: 'Balanced', riskThreshold: 60, returnThreshold: 15, timeHorizon: 8, requireSynergies: true },
    { id: 'aggressive', name: 'Aggressive', riskThreshold: 80, returnThreshold: 12, timeHorizon: 10, requireSynergies: false }
  ]);
  
  const [selectedScenario, setSelectedScenario] = useState<string>('balanced');
  const [compareScenarios, setCompareScenarios] = useState<string[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState('');

  // Base portfolio (current qualifying projects)
  const baseProjects = sharedData.validatedProjects.filter(p => 
    p.investmentGrade === 'A' || p.investmentGrade === 'B'
  );

  // Filter projects based on current thresholds
  const filterProjects = (risk: number, returnRate: number, horizon: number, synergies: boolean) => {
    return sharedData.validatedProjects.filter(project => {
      const meetsRisk = project.riskScore <= risk;
      const meetsReturn = project.irr >= returnRate;
      const meetsHorizon = project.duration <= horizon * 12; // Convert years to months
      const meetsSynergies = !synergies || (project.businessPlan?.synergies?.length || 0) > 0;
      
      return meetsRisk && meetsReturn && meetsHorizon && meetsSynergies;
    });
  };

  // Current filtered projects
  const currentProjects = filterProjects(riskThreshold, returnThreshold, timeHorizon, requireSynergies);

  // Calculate impact for each threshold change
  const calculateImpact = (newRisk: number, newReturn: number, newHorizon: number, newSynergies: boolean) => {
    const newProjects = filterProjects(newRisk, newReturn, newHorizon, newSynergies);
    const oldProjects = filterProjects(riskThreshold, returnThreshold, timeHorizon, requireSynergies);
    
    return {
      projectDelta: newProjects.length - oldProjects.length,
      capitalDelta: newProjects.reduce((sum, p) => sum + p.capex, 0) - oldProjects.reduce((sum, p) => sum + p.capex, 0),
      irrDelta: (newProjects.reduce((sum, p) => sum + p.irr, 0) / newProjects.length || 0) - (oldProjects.reduce((sum, p) => sum + p.irr, 0) / oldProjects.length || 0)
    };
  };

  // Calculate individual threshold impacts
  const riskImpact = calculateImpact(riskThreshold, returnThreshold, timeHorizon, requireSynergies);
  const returnImpact = calculateImpact(50, returnThreshold, timeHorizon, requireSynergies); // Compare to baseline 50%
  const timeImpact = calculateImpact(riskThreshold, returnThreshold, timeHorizon, requireSynergies);
  const synergyImpact = calculateImpact(riskThreshold, returnThreshold, timeHorizon, requireSynergies);

  // Base portfolio metrics
  const baseCapital = baseProjects.reduce((sum, p) => sum + p.capex, 0);
  const currentCapital = currentProjects.reduce((sum, p) => sum + p.capex, 0);
  const currentAvgIRR = currentProjects.reduce((sum, p) => sum + p.irr, 0) / currentProjects.length || 0;
  const currentAvgRisk = currentProjects.reduce((sum, p) => sum + p.riskScore, 0) / currentProjects.length || 0;

  // Waterfall chart data
  const waterfallData = [
    { name: 'Base Portfolio', value: baseCapital, type: 'base' },
    { name: 'Risk Adjustment', value: riskImpact.capitalDelta, type: riskImpact.capitalDelta >= 0 ? 'positive' : 'negative' },
    { name: 'Return Adjustment', value: returnImpact.capitalDelta, type: returnImpact.capitalDelta >= 0 ? 'positive' : 'negative' },
    { name: 'Time Adjustment', value: timeImpact.capitalDelta, type: timeImpact.capitalDelta >= 0 ? 'positive' : 'negative' },
    { name: 'Synergy Adjustment', value: synergyImpact.capitalDelta, type: synergyImpact.capitalDelta >= 0 ? 'positive' : 'negative' },
    { name: 'Final Portfolio', value: currentCapital, type: 'final' }
  ];

  // Project comparison - added vs removed
  const addedProjects = currentProjects.filter(p => !baseProjects.some(bp => bp.id === p.id));
  const removedProjects = baseProjects.filter(p => !currentProjects.some(cp => cp.id === p.id));
  const unchangedProjects = currentProjects.filter(p => baseProjects.some(bp => bp.id === p.id));

  // Load scenario
  const loadScenario = (scenarioId: string) => {
    const scenario = savedScenarios.find(s => s.id === scenarioId);
    if (scenario) {
      setRiskThreshold(scenario.riskThreshold);
      setReturnThreshold(scenario.returnThreshold);
      setTimeHorizon(scenario.timeHorizon);
      setRequireSynergies(scenario.requireSynergies);
      setSelectedScenario(scenarioId);
    }
  };

  // Save current settings as scenario
  const saveScenario = () => {
    if (newScenarioName.trim()) {
      const newScenario: ScenarioSettings = {
        id: Date.now().toString(),
        name: newScenarioName,
        riskThreshold,
        returnThreshold,
        timeHorizon,
        requireSynergies
      };
      setSavedScenarios([...savedScenarios, newScenario]);
      setShowSaveModal(false);
      setNewScenarioName('');
    }
  };

  return (
    <div className="tab7-whatif-analysis">
      {/* Control Panel */}
      <div className="control-panel">
        <h3>Investment Threshold Controls</h3>
        
        <div className="threshold-controls">
          {/* Risk Threshold */}
          <div className="threshold-control">
            <div className="control-header">
              <label>Risk Threshold</label>
              <span className="threshold-value">{riskThreshold}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={riskThreshold}
              onChange={(e) => setRiskThreshold(Number(e.target.value))}
              className="threshold-slider"
            />
            <div className="threshold-impact">
              Currently: {baseProjects.length} projects | 
              With {riskThreshold}%: {filterProjects(riskThreshold, 15, 8, true).length} projects 
              ({filterProjects(riskThreshold, 15, 8, true).length - baseProjects.length >= 0 ? '+' : ''}
              {filterProjects(riskThreshold, 15, 8, true).length - baseProjects.length})
            </div>
          </div>

          {/* Return Threshold */}
          <div className="threshold-control">
            <div className="control-header">
              <label>Return Threshold</label>
              <span className="threshold-value">{returnThreshold}%</span>
            </div>
            <input
              type="range"
              min="8"
              max="25"
              value={returnThreshold}
              onChange={(e) => setReturnThreshold(Number(e.target.value))}
              className="threshold-slider"
            />
            <div className="threshold-impact">
              Currently: {baseProjects.length} projects | 
              With {returnThreshold}%: {filterProjects(50, returnThreshold, 8, true).length} projects 
              ({filterProjects(50, returnThreshold, 8, true).length - baseProjects.length >= 0 ? '+' : ''}
              {filterProjects(50, returnThreshold, 8, true).length - baseProjects.length})
            </div>
          </div>

          {/* Time Horizon */}
          <div className="threshold-control">
            <div className="control-header">
              <label>Time Horizon</label>
              <span className="threshold-value">{timeHorizon} years</span>
            </div>
            <input
              type="range"
              min="3"
              max="15"
              value={timeHorizon}
              onChange={(e) => setTimeHorizon(Number(e.target.value))}
              className="threshold-slider"
            />
            <div className="threshold-impact">
              Currently: {baseProjects.length} projects | 
              With {timeHorizon} years: {filterProjects(50, 15, timeHorizon, true).length} projects 
              ({filterProjects(50, 15, timeHorizon, true).length - baseProjects.length >= 0 ? '+' : ''}
              {filterProjects(50, 15, timeHorizon, true).length - baseProjects.length})
            </div>
          </div>

          {/* Synergy Requirements */}
          <div className="threshold-control">
            <div className="control-header">
              <label>
                <input
                  type="checkbox"
                  checked={requireSynergies}
                  onChange={(e) => setRequireSynergies(e.target.checked)}
                />
                Require Synergies
              </label>
            </div>
            <div className="threshold-impact">
              Currently: {filterProjects(50, 15, 8, true).length} projects | 
              If {requireSynergies ? 'unchecked' : 'checked'}: {filterProjects(50, 15, 8, !requireSynergies).length} projects 
              ({filterProjects(50, 15, 8, !requireSynergies).length - filterProjects(50, 15, 8, true).length >= 0 ? '+' : ''}
              {filterProjects(50, 15, 8, !requireSynergies).length - filterProjects(50, 15, 8, true).length})
            </div>
          </div>
        </div>
      </div>

      {/* Impact Visualization */}
      <div className="impact-visualization">
        <div className="impact-left">
          <h4>Portfolio Impact Analysis</h4>
          
          {/* Summary Cards */}
          <div className="impact-summary">
            <div className="impact-card">
              <div className="impact-label">Projects</div>
              <div className="impact-value">{currentProjects.length}</div>
              <div className={`impact-delta ${currentProjects.length - baseProjects.length >= 0 ? 'positive' : 'negative'}`}>
                {currentProjects.length - baseProjects.length >= 0 ? '+' : ''}
                {currentProjects.length - baseProjects.length}
              </div>
            </div>
            
            <div className="impact-card">
              <div className="impact-label">Capital</div>
              <div className="impact-value">{formatCurrency(currentCapital)}</div>
              <div className={`impact-delta ${currentCapital - baseCapital >= 0 ? 'positive' : 'negative'}`}>
                {formatCurrency(currentCapital - baseCapital)}
              </div>
            </div>
            
            <div className="impact-card">
              <div className="impact-label">Avg IRR</div>
              <div className="impact-value">{currentAvgIRR.toFixed(1)}%</div>
              <div className={`impact-delta ${currentAvgIRR - 15 >= 0 ? 'positive' : 'negative'}`}>
                {currentAvgIRR - 15 >= 0 ? '+' : ''}{(currentAvgIRR - 15).toFixed(1)}%
              </div>
            </div>
            
            <div className="impact-card">
              <div className="impact-label">Avg Risk</div>
              <div className="impact-value">{currentAvgRisk.toFixed(0)}</div>
              <div className={`impact-delta ${currentAvgRisk - 50 <= 0 ? 'positive' : 'negative'}`}>
                {currentAvgRisk - 50 >= 0 ? '+' : ''}{(currentAvgRisk - 50).toFixed(0)}
              </div>
            </div>
          </div>

          {/* Waterfall Chart */}
          <div className="waterfall-chart">
            <h5>Capital Waterfall Analysis</h5>
            <svg width="600" height="300" viewBox="0 0 600 300">
              {waterfallData.map((item, index) => {
                const barWidth = 80;
                const barX = 50 + index * 90;
                const maxValue = Math.max(...waterfallData.map(d => Math.abs(d.value)));
                const barHeight = Math.abs(item.value) / maxValue * 150;
                const barY = item.type === 'negative' ? 150 : 150 - barHeight;
                
                let barColor = '#64748b';
                if (item.type === 'positive') barColor = '#10b981';
                if (item.type === 'negative') barColor = '#ef4444';
                if (item.type === 'base') barColor = '#3b82f6';
                if (item.type === 'final') barColor = '#8b5cf6';
                
                return (
                  <g key={index}>
                    <rect
                      x={barX}
                      y={barY}
                      width={barWidth}
                      height={barHeight}
                      fill={barColor}
                      stroke="#1e293b"
                      strokeWidth="1"
                    />
                    <text
                      x={barX + barWidth / 2}
                      y={barY - 10}
                      textAnchor="middle"
                      fill="#e5e7eb"
                      fontSize="10"
                    >
                      {formatCurrency(item.value)}
                    </text>
                    <text
                      x={barX + barWidth / 2}
                      y={280}
                      textAnchor="middle"
                      fill="#9ca3af"
                      fontSize="9"
                    >
                      {item.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        <div className="impact-right">
          <h4>Project Changes</h4>
          
          <div className="project-changes">
            {addedProjects.length > 0 && (
              <div className="change-section added">
                <h5>Projects Added ({addedProjects.length})</h5>
                <div className="project-list">
                  {addedProjects.slice(0, 5).map(project => (
                    <div key={project.id} className="project-item added">
                      <div className="project-name">{project.name}</div>
                      <div className="project-details">
                        <span className="project-investment">{formatCurrency(project.capex)}</span>
                        <span className="project-irr">{project.irr.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                  {addedProjects.length > 5 && (
                    <div className="project-item more">
                      +{addedProjects.length - 5} more projects
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {removedProjects.length > 0 && (
              <div className="change-section removed">
                <h5>Projects Removed ({removedProjects.length})</h5>
                <div className="project-list">
                  {removedProjects.slice(0, 5).map(project => (
                    <div key={project.id} className="project-item removed">
                      <div className="project-name">{project.name}</div>
                      <div className="project-details">
                        <span className="project-investment">{formatCurrency(project.capex)}</span>
                        <span className="project-irr">{project.irr.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                  {removedProjects.length > 5 && (
                    <div className="project-item more">
                      +{removedProjects.length - 5} more projects
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="change-section unchanged">
              <h5>Projects Unchanged ({unchangedProjects.length})</h5>
              <div className="unchanged-summary">
                {unchangedProjects.length} projects remain in the portfolio
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scenario Management */}
      <div className="scenario-management">
        <div className="scenario-header">
          <h4>Scenario Management</h4>
          <div className="scenario-controls">
            <button 
              className="btn btn-primary"
              onClick={() => setShowSaveModal(true)}
            >
              Save Current Scenario
            </button>
            <select 
              value={selectedScenario}
              onChange={(e) => loadScenario(e.target.value)}
              className="scenario-select"
            >
              <option value="">Load Scenario</option>
              {savedScenarios.map(scenario => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="saved-scenarios">
          <h5>Saved Scenarios</h5>
          <div className="scenario-cards">
            {savedScenarios.map(scenario => (
              <div key={scenario.id} className="scenario-card">
                <div className="scenario-name">{scenario.name}</div>
                <div className="scenario-details">
                  <div>Risk ≤ {scenario.riskThreshold}%</div>
                  <div>IRR ≥ {scenario.returnThreshold}%</div>
                  <div>Time ≤ {scenario.timeHorizon}y</div>
                  <div>Synergies: {scenario.requireSynergies ? 'Yes' : 'No'}</div>
                </div>
                <div className="scenario-actions">
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={() => loadScenario(scenario.id)}
                  >
                    Load
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save Scenario Modal */}
      {showSaveModal && (
        <div className="modal-overlay" onClick={() => setShowSaveModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Save Scenario</h3>
              <button className="modal-close" onClick={() => setShowSaveModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Scenario Name:</label>
                <input
                  type="text"
                  value={newScenarioName}
                  onChange={(e) => setNewScenarioName(e.target.value)}
                  placeholder="Enter scenario name"
                  className="form-input"
                />
              </div>
              <div className="scenario-preview">
                <h4>Current Settings:</h4>
                <ul>
                  <li>Risk Threshold: {riskThreshold}%</li>
                  <li>Return Threshold: {returnThreshold}%</li>
                  <li>Time Horizon: {timeHorizon} years</li>
                  <li>Require Synergies: {requireSynergies ? 'Yes' : 'No'}</li>
                </ul>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowSaveModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={saveScenario}>
                Save Scenario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};