'use client'
import React, { useState, useEffect } from 'react';
import { ValidatedProject, AdaniSector, InvestmentPriority } from './types';
import { formatCurrency } from './mockDataAdani';

interface Tab6Props {
  sharedData: {
    validatedProjects: ValidatedProject[];
    investmentPriorities: InvestmentPriority[];
    adaniSectors: AdaniSector[];
  };
  onDataUpdate: (data: any) => void;
}

export const Tab6_MonitorPortfolio: React.FC<Tab6Props> = ({ sharedData, onDataUpdate }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [selectedView, setSelectedView] = useState<'overview' | 'performance' | 'geography'>('overview');
  const [selectedSector, setSelectedSector] = useState<string | null>(null);

  // Filter active projects (Grade A and B)
  const activeProjects = sharedData.validatedProjects.filter(
    p => p.investmentGrade === 'A' || p.investmentGrade === 'B'
  );

  // Calculate deployment metrics
  const totalDeployedCapital = activeProjects.reduce((sum, p) => sum + p.capex, 0);
  const targetMonthly = 1500000000; // $1.5B target per month
  const targetTotal = 90000000000; // $90B total target
  const deploymentProgress = (totalDeployedCapital / targetTotal) * 100;
  const currentMonthlyRate = totalDeployedCapital / 12; // Assuming 12 months
  const deploymentVelocity = (currentMonthlyRate / targetMonthly) * 100;

  // Calculate portfolio IRR (weighted average)
  const portfolioIRR = activeProjects.length > 0 
    ? activeProjects.reduce((sum, p) => sum + (p.irr * p.capex), 0) / totalDeployedCapital
    : 0;

  // Calculate sector distribution
  const sectorData = sharedData.adaniSectors.map(sector => {
    const sectorProjects = activeProjects.filter(p => 
      p.businessUnit.toLowerCase().includes(sector.name.toLowerCase()) ||
      (sector.name === 'Renewable Energy' && (p.businessUnit.includes('Green') || p.businessUnit.includes('Solar') || p.businessUnit.includes('Wind')))
    );
    const sectorCapital = sectorProjects.reduce((sum, p) => sum + p.capex, 0);
    return {
      id: sector.id,
      name: sector.name,
      value: sectorCapital,
      percentage: totalDeployedCapital > 0 ? (sectorCapital / totalDeployedCapital) * 100 : 0,
      projects: sectorProjects.length,
      color: sector.color
    };
  }).filter(s => s.value > 0);

  // Calculate risk distribution
  const riskDistribution = {
    low: activeProjects.filter(p => p.riskScore <= 30).length,
    medium: activeProjects.filter(p => p.riskScore > 30 && p.riskScore <= 60).length,
    high: activeProjects.filter(p => p.riskScore > 60).length
  };

  // Generate monthly deployment data
  const monthlyDeploymentData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(2024, i).toLocaleString('default', { month: 'short' });
    const deployed = totalDeployedCapital * (0.05 + Math.random() * 0.15); // Simulate monthly variation
    return {
      month,
      deployed,
      target: targetMonthly,
      cumulative: deployed * (i + 1)
    };
  });

  // Geographic distribution (India states)
  const geographicData = [
    { state: 'Gujarat', projects: 15, investment: 18000000000, x: 320, y: 280 },
    { state: 'Maharashtra', projects: 12, investment: 14000000000, x: 340, y: 250 },
    { state: 'Rajasthan', projects: 8, investment: 12000000000, x: 280, y: 220 },
    { state: 'Odisha', projects: 10, investment: 8000000000, x: 420, y: 260 },
    { state: 'Jharkhand', projects: 6, investment: 6000000000, x: 430, y: 240 },
    { state: 'Tamil Nadu', projects: 5, investment: 4000000000, x: 360, y: 380 },
    { state: 'Karnataka', projects: 4, investment: 3000000000, x: 340, y: 350 }
  ];

  // Performance comparison data
  const performanceData = activeProjects.map(project => ({
    ...project,
    actualIRR: project.irr * (0.85 + Math.random() * 0.3), // Simulate actual performance
    variance: function() { return this.actualIRR - project.irr; }
  }));

  return (
    <div className="tab6-monitor-portfolio">
      {/* Header Stats Cards */}
      <div className="portfolio-header">
        <div className="header-stats">
          <div className="stat-card deployed">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <div className="stat-value">{formatCurrency(totalDeployedCapital)}</div>
              <div className="stat-label">Deployed Capital</div>
              <div className="stat-trend positive">↑ {deploymentProgress.toFixed(1)}%</div>
            </div>
          </div>
          
          <div className="stat-card velocity">
            <div className="stat-icon">🚀</div>
            <div className="stat-content">
              <div className="stat-value">{formatCurrency(currentMonthlyRate)}/mo</div>
              <div className="stat-label">Deployment Rate</div>
              <div className={`stat-trend ${deploymentVelocity >= 100 ? 'positive' : 'negative'}`}>
                {deploymentVelocity >= 100 ? '↑' : '↓'} {Math.abs(deploymentVelocity - 100).toFixed(1)}%
              </div>
            </div>
          </div>
          
          <div className="stat-card performance">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-value">{portfolioIRR.toFixed(1)}%</div>
              <div className="stat-label">Portfolio IRR</div>
              <div className="stat-trend positive">↑ 0.5%</div>
            </div>
          </div>
          
          <div className="stat-card projects">
            <div className="stat-icon">🏗️</div>
            <div className="stat-content">
              <div className="stat-value">{activeProjects.length}</div>
              <div className="stat-label">Active Projects</div>
            </div>
          </div>
        </div>
        
        <div className="header-controls">
          <div className="view-selector">
            <button 
              className={`view-btn ${selectedView === 'overview' ? 'active' : ''}`}
              onClick={() => setSelectedView('overview')}
            >
              Overview
            </button>
            <button 
              className={`view-btn ${selectedView === 'performance' ? 'active' : ''}`}
              onClick={() => setSelectedView('performance')}
            >
              Performance
            </button>
            <button 
              className={`view-btn ${selectedView === 'geography' ? 'active' : ''}`}
              onClick={() => setSelectedView('geography')}
            >
              Geography
            </button>
          </div>
          
          <div className="timeframe-selector">
            <select 
              value={selectedTimeframe} 
              onChange={(e) => setSelectedTimeframe(e.target.value as any)}
              className="timeframe-select"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="dashboard-content">
        {selectedView === 'overview' && (
          <>
            {/* Section 1: Deployment Velocity Chart */}
            <div className="dashboard-section deployment-velocity">
              <h3>Capital Deployment Velocity</h3>
              <div className="velocity-chart">
                <svg width="100%" height="300" viewBox="0 0 800 300">
                  {/* Grid lines */}
                  {Array.from({ length: 6 }, (_, i) => (
                    <line
                      key={i}
                      x1={60}
                      y1={50 + i * 40}
                      x2={750}
                      y2={50 + i * 40}
                      stroke="#374151"
                      strokeWidth="1"
                      opacity="0.3"
                    />
                  ))}
                  
                  {/* Target line */}
                  <line
                    x1={60}
                    y1={130}
                    x2={750}
                    y2={130}
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                  <text x={60} y={125} fill="#10b981" fontSize="12">Target: $1.5B/mo</text>
                  
                  {/* Deployment line */}
                  <polyline
                    points={monthlyDeploymentData.map((d, i) => 
                      `${60 + i * 55},${250 - (d.deployed / targetMonthly) * 150}`
                    ).join(' ')}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                  />
                  
                  {/* Data points */}
                  {monthlyDeploymentData.map((d, i) => (
                    <g key={i}>
                      <circle
                        cx={60 + i * 55}
                        cy={250 - (d.deployed / targetMonthly) * 150}
                        r="4"
                        fill="#3b82f6"
                      />
                      <text
                        x={60 + i * 55}
                        y={270}
                        textAnchor="middle"
                        fill="#9ca3af"
                        fontSize="10"
                      >
                        {d.month}
                      </text>
                    </g>
                  ))}
                  
                  {/* Y-axis labels */}
                  {Array.from({ length: 6 }, (_, i) => (
                    <text
                      key={i}
                      x={50}
                      y={255 - i * 40}
                      textAnchor="end"
                      fill="#9ca3af"
                      fontSize="10"
                    >
                      ${(i * 0.5).toFixed(1)}B
                    </text>
                  ))}
                </svg>
              </div>
            </div>

            {/* Section 2: Portfolio Composition */}
            <div className="dashboard-section portfolio-composition">
              <div className="composition-grid">
                {/* Sector Allocation Pie Chart */}
                <div className="composition-card">
                  <h4>Sector Allocation</h4>
                  <div className="pie-chart">
                    <svg width="200" height="200" viewBox="0 0 200 200">
                      {sectorData.map((sector, index) => {
                        const startAngle = sectorData.slice(0, index).reduce((sum, s) => sum + (s.percentage / 100) * 360, 0);
                        const endAngle = startAngle + (sector.percentage / 100) * 360;
                        const radius = 80;
                        const centerX = 100;
                        const centerY = 100;
                        
                        const x1 = centerX + radius * Math.cos((startAngle - 90) * Math.PI / 180);
                        const y1 = centerY + radius * Math.sin((startAngle - 90) * Math.PI / 180);
                        const x2 = centerX + radius * Math.cos((endAngle - 90) * Math.PI / 180);
                        const y2 = centerY + radius * Math.sin((endAngle - 90) * Math.PI / 180);
                        
                        const largeArc = sector.percentage > 50 ? 1 : 0;
                        
                        return (
                          <g key={sector.id}>
                            <path
                              d={`M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                              fill={sector.color}
                              stroke="#1e293b"
                              strokeWidth="2"
                              onClick={() => setSelectedSector(sector.id)}
                              className="sector-slice"
                            />
                            {sector.percentage > 5 && (
                              <text
                                x={centerX + (radius * 0.6) * Math.cos((startAngle + endAngle) / 2 * Math.PI / 180 - Math.PI / 2)}
                                y={centerY + (radius * 0.6) * Math.sin((startAngle + endAngle) / 2 * Math.PI / 180 - Math.PI / 2)}
                                textAnchor="middle"
                                fill="white"
                                fontSize="10"
                                fontWeight="600"
                              >
                                {sector.percentage.toFixed(0)}%
                              </text>
                            )}
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                  <div className="sector-legend">
                    {sectorData.map(sector => (
                      <div key={sector.id} className="legend-item">
                        <div className="legend-color" style={{ backgroundColor: sector.color }}></div>
                        <span>{sector.name}</span>
                        <span className="legend-value">{sector.percentage.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risk Distribution Bar Chart */}
                <div className="composition-card">
                  <h4>Risk Distribution</h4>
                  <div className="risk-chart">
                    <div className="risk-bar">
                      <div className="risk-category low">
                        <div className="risk-label">Low Risk</div>
                        <div className="risk-count">{riskDistribution.low} projects</div>
                        <div className="risk-visual" style={{ width: `${(riskDistribution.low / activeProjects.length) * 100}%` }}></div>
                      </div>
                      <div className="risk-category medium">
                        <div className="risk-label">Medium Risk</div>
                        <div className="risk-count">{riskDistribution.medium} projects</div>
                        <div className="risk-visual" style={{ width: `${(riskDistribution.medium / activeProjects.length) * 100}%` }}></div>
                      </div>
                      <div className="risk-category high">
                        <div className="risk-label">High Risk</div>
                        <div className="risk-count">{riskDistribution.high} projects</div>
                        <div className="risk-visual" style={{ width: `${(riskDistribution.high / activeProjects.length) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Geographic Map */}
                <div className="composition-card">
                  <h4>Geographic Distribution</h4>
                  <div className="geo-map">
                    <svg width="400" height="300" viewBox="0 0 500 400">
                      {/* Simplified India outline */}
                      <path
                        d="M150 50 L400 50 L450 100 L430 150 L450 200 L400 250 L380 300 L300 350 L200 340 L150 300 L100 250 L80 200 L100 150 L120 100 Z"
                        fill="#374151"
                        stroke="#4b5563"
                        strokeWidth="2"
                      />
                      
                      {/* Investment bubbles */}
                      {geographicData.map((location, index) => {
                        const bubbleSize = Math.sqrt(location.investment / 1000000000) * 8;
                        return (
                          <g key={index}>
                            <circle
                              cx={location.x}
                              cy={location.y}
                              r={bubbleSize}
                              fill="#3b82f6"
                              opacity="0.7"
                              stroke="#1e40af"
                              strokeWidth="2"
                            />
                            <text
                              x={location.x}
                              y={location.y - bubbleSize - 5}
                              textAnchor="middle"
                              fill="#e5e7eb"
                              fontSize="10"
                              fontWeight="600"
                            >
                              {location.state}
                            </text>
                            <text
                              x={location.x}
                              y={location.y + 3}
                              textAnchor="middle"
                              fill="white"
                              fontSize="8"
                            >
                              {location.projects}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>

                {/* Investment Timeline */}
                <div className="composition-card">
                  <h4>Investment Timeline</h4>
                  <div className="timeline-chart">
                    <div className="timeline-quarters">
                      {Array.from({ length: 8 }, (_, i) => (
                        <div key={i} className="quarter">
                          <div className="quarter-label">Q{(i % 4) + 1} {2024 + Math.floor(i / 4)}</div>
                          <div className="quarter-projects">
                            {Math.floor(activeProjects.length * 0.125 * (1 + Math.random()))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {selectedView === 'performance' && (
          <div className="dashboard-section performance-view">
            <h3>Project Performance Analysis</h3>
            <div className="performance-table">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Project Name</th>
                    <th>Sector</th>
                    <th>Investment</th>
                    <th>Status</th>
                    <th>Expected IRR</th>
                    <th>Actual IRR</th>
                    <th>Variance</th>
                    <th>Risk Level</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceData.map(project => {
                    const variance = project.actualIRR - project.irr;
                    const riskLevel = project.riskScore <= 30 ? 'Low' : project.riskScore <= 60 ? 'Medium' : 'High';
                    
                    return (
                      <tr key={project.id}>
                        <td>
                          <div className="project-name">
                            <div className={`grade-badge grade-${project.investmentGrade}`}>
                              {project.investmentGrade}
                            </div>
                            {project.name}
                          </div>
                        </td>
                        <td>{project.businessUnit}</td>
                        <td>{formatCurrency(project.capex)}</td>
                        <td>
                          <span className={`status-badge ${project.status}`}>
                            {project.status}
                          </span>
                        </td>
                        <td>{project.irr.toFixed(1)}%</td>
                        <td>{project.actualIRR.toFixed(1)}%</td>
                        <td className={variance >= 0 ? 'positive' : 'negative'}>
                          {variance >= 0 ? '+' : ''}{variance.toFixed(1)}%
                        </td>
                        <td>
                          <span className={`risk-level risk-${riskLevel.toLowerCase()}`}>
                            {riskLevel}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedView === 'geography' && (
          <div className="dashboard-section geography-view">
            <h3>Geographic Analysis</h3>
            <div className="geography-details">
              <div className="geo-stats">
                {geographicData.map((location, index) => (
                  <div key={index} className="geo-stat-card">
                    <div className="geo-state">{location.state}</div>
                    <div className="geo-projects">{location.projects} projects</div>
                    <div className="geo-investment">{formatCurrency(location.investment)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};