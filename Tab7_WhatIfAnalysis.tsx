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

interface PortfolioMetrics {
  projectCount: number;
  totalCapital: number;
  averageIRR: number;
  averageRisk: number;
  deploymentMonths: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  sectorBreakdown: { [key: string]: number };
  quarterlyDeployment: { quarter: string; amount: number }[];
}

export const Tab7_WhatIfAnalysis: React.FC<Tab7Props> = ({ sharedData, onDataUpdate }) => {
  const [riskThreshold, setRiskThreshold] = useState(65);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [animateChanges, setAnimateChanges] = useState(false);

  // Filter projects based on risk threshold
  const qualifyingProjects = sharedData.validatedProjects.filter(
    project => project.riskScore <= riskThreshold
  );

  const excludedProjects = sharedData.validatedProjects.filter(
    project => project.riskScore > riskThreshold
  );

  // Calculate portfolio metrics
  const calculatePortfolioMetrics = (): PortfolioMetrics => {
    if (qualifyingProjects.length === 0) {
      return {
        projectCount: 0,
        totalCapital: 0,
        averageIRR: 0,
        averageRisk: 0,
        deploymentMonths: 0,
        riskDistribution: { low: 0, medium: 0, high: 0 },
        sectorBreakdown: {},
        quarterlyDeployment: []
      };
    }

    const totalCapital = qualifyingProjects.reduce((sum, p) => sum + p.capex, 0);
    const weightedIRR = qualifyingProjects.reduce((sum, p) => sum + (p.irr * p.capex), 0) / totalCapital;
    const averageRisk = qualifyingProjects.reduce((sum, p) => sum + p.riskScore, 0) / qualifyingProjects.length;

    // Risk distribution
    const lowRisk = qualifyingProjects.filter(p => p.riskScore <= 30).length;
    const mediumRisk = qualifyingProjects.filter(p => p.riskScore > 30 && p.riskScore <= 60).length;
    const highRisk = qualifyingProjects.filter(p => p.riskScore > 60).length;

    // Sector breakdown
    const sectorBreakdown: { [key: string]: number } = {};
    qualifyingProjects.forEach(project => {
      const sector = project.businessUnit.split(' ')[0]; // Get first word as sector
      sectorBreakdown[sector] = (sectorBreakdown[sector] || 0) + project.capex;
    });

    // Quarterly deployment schedule
    const targetMonthlyDeployment = 1500000000; // $1.5B per month
    const deploymentMonths = Math.ceil(totalCapital / targetMonthlyDeployment);
    const quarterlyDeployment = [];
    
    for (let i = 0; i < Math.min(20, Math.ceil(deploymentMonths / 3)); i++) {
      const quarter = `Q${(i % 4) + 1} ${2025 + Math.floor(i / 4)}`;
      const quarterlyAmount = Math.min(targetMonthlyDeployment * 3, totalCapital - (i * targetMonthlyDeployment * 3));
      if (quarterlyAmount > 0) {
        quarterlyDeployment.push({
          quarter,
          amount: quarterlyAmount
        });
      }
    }

    return {
      projectCount: qualifyingProjects.length,
      totalCapital,
      averageIRR: weightedIRR,
      averageRisk,
      deploymentMonths,
      riskDistribution: { low: lowRisk, medium: mediumRisk, high: highRisk },
      sectorBreakdown,
      quarterlyDeployment
    };
  };

  const portfolioMetrics = calculatePortfolioMetrics();

  // Animation trigger
  useEffect(() => {
    setAnimateChanges(true);
    const timer = setTimeout(() => setAnimateChanges(false), 500);
    return () => clearTimeout(timer);
  }, [riskThreshold]);

  // Get risk level label
  const getRiskLevel = (score: number): string => {
    if (score <= 30) return 'Low';
    if (score <= 60) return 'Medium';
    return 'High';
  };

  // Get risk level color
  const getRiskColor = (score: number): string => {
    if (score <= 30) return '#10b981';
    if (score <= 60) return '#f59e0b';
    return '#ef4444';
  };

  // Calculate improvement metrics
  const totalProjectsAvailable = sharedData.validatedProjects.length;
  const totalCapitalAvailable = sharedData.validatedProjects.reduce((sum, p) => sum + p.capex, 0);
  const utilizationRate = (portfolioMetrics.totalCapital / totalCapitalAvailable) * 100;
  const targetCapital = 90000000000; // $90B
  const targetAchievement = (portfolioMetrics.totalCapital / targetCapital) * 100;

  return (
    <div className="tab7-whatif-analysis">
      {/* Primary Metrics - MOVED ABOVE RISK TOLERANCE */}
      <div className="dashboard-grid">
        <div className="metric-card primary">
          <div className="metric-icon">🎯</div>
          <div className="metric-content">
            <div className="metric-value">
              <span className={animateChanges ? 'animating' : ''}>{portfolioMetrics.projectCount}</span>
              <span className="metric-unit">projects</span>
            </div>
            <div className="metric-label">Available for Investment</div>
            <div className="metric-detail">
              out of {totalProjectsAvailable} total projects
            </div>
          </div>
        </div>

        <div className="metric-card primary">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <div className="metric-value">
              <span className={animateChanges ? 'animating' : ''}>{formatCurrency(portfolioMetrics.totalCapital)}</span>
            </div>
            <div className="metric-label">Total Investment Capital</div>
            <div className="metric-detail">
              {targetAchievement.toFixed(1)}% of $90B target
            </div>
          </div>
        </div>

        <div className="metric-card primary">
          <div className="metric-icon">📈</div>
          <div className="metric-content">
            <div className="metric-value">
              <span className={animateChanges ? 'animating' : ''}>{portfolioMetrics.averageIRR.toFixed(1)}%</span>
            </div>
            <div className="metric-label">Expected Portfolio IRR</div>
            <div className="metric-detail">
              Weighted average return
            </div>
          </div>
        </div>

        <div className="metric-card primary">
          <div className="metric-icon">⏱️</div>
          <div className="metric-content">
            <div className="metric-value">
              <span className={animateChanges ? 'animating' : ''}>{portfolioMetrics.deploymentMonths}</span>
              <span className="metric-unit">months</span>
            </div>
            <div className="metric-label">Deployment Timeline</div>
            <div className="metric-detail">
              At $1.5B/month rate
            </div>
          </div>
        </div>
      </div>

      {/* Risk Control Header */}
      <div className="risk-control-header">
        <div className="control-section">
          <div className="control-title">
            <h2>Portfolio Risk Tolerance</h2>
            <p>Adjust risk threshold to see immediate impact on available investment opportunities</p>
          </div>
          
          <div className="risk-slider-container">
            <div className="slider-labels">
              <span className="label-conservative">Conservative</span>
              <span className="label-balanced">Balanced</span>
              <span className="label-aggressive">Aggressive</span>
            </div>
            
            <div className="slider-wrapper">
              <input
                type="range"
                min="20"
                max="90"
                value={riskThreshold}
                onChange={(e) => setRiskThreshold(Number(e.target.value))}
                className="risk-threshold-slider"
              />
              <div className="slider-track">
                <div 
                  className="slider-fill"
                  style={{ width: `${((riskThreshold - 20) / 70) * 100}%` }}
                />
              </div>
            </div>
            
            <div className="threshold-display">
              <div className="threshold-value">
                <span className="threshold-number">{riskThreshold}%</span>
                <span className="threshold-label">Risk Threshold</span>
              </div>
              <div className="threshold-description">
                {riskThreshold <= 40 ? 'Conservative approach - Only low-risk projects' :
                 riskThreshold <= 70 ? 'Balanced approach - Mix of risk levels' :
                 'Aggressive approach - Higher risk, higher returns'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Dashboard */}
      <div className="impact-dashboard">
        {/* Secondary Metrics */}
        <div className="secondary-metrics">
          <div className="utilization-card">
            <h4>Capital Utilization</h4>
            <div className="utilization-bar">
              <div 
                className="utilization-fill"
                style={{ width: `${utilizationRate}%` }}
              />
            </div>
            <div className="utilization-text">
              {utilizationRate.toFixed(1)}% of available capital deployed
            </div>
          </div>

          <div className="risk-distribution-card">
            <h4>Portfolio Risk Profile</h4>
            <div className="risk-bars">
              <div className="risk-bar">
                <span className="risk-label">Low Risk</span>
                <div className="risk-bar-container">
                  <div 
                    className="risk-bar-fill low"
                    style={{ width: `${(portfolioMetrics.riskDistribution.low / portfolioMetrics.projectCount) * 100 || 0}%` }}
                  />
                </div>
                <span className="risk-count">{portfolioMetrics.riskDistribution.low}</span>
              </div>
              <div className="risk-bar">
                <span className="risk-label">Medium Risk</span>
                <div className="risk-bar-container">
                  <div 
                    className="risk-bar-fill medium"
                    style={{ width: `${(portfolioMetrics.riskDistribution.medium / portfolioMetrics.projectCount) * 100 || 0}%` }}
                  />
                </div>
                <span className="risk-count">{portfolioMetrics.riskDistribution.medium}</span>
              </div>
              <div className="risk-bar">
                <span className="risk-label">High Risk</span>
                <div className="risk-bar-container">
                  <div 
                    className="risk-bar-fill high"
                    style={{ width: `${(portfolioMetrics.riskDistribution.high / portfolioMetrics.projectCount) * 100 || 0}%` }}
                  />
                </div>
                <span className="risk-count">{portfolioMetrics.riskDistribution.high}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deployment Timeline */}
      <div className="deployment-timeline">
        <h3>Capital Deployment Schedule</h3>
        <div className="timeline-chart">
          <div className="timeline-header">
            <span>Quarterly Deployment at Current Risk Level</span>
            <span className="timeline-total">{formatCurrency(portfolioMetrics.totalCapital)} Total</span>
          </div>
          <div className="timeline-bars">
            {portfolioMetrics.quarterlyDeployment.slice(0, 8).map((quarter, index) => (
              <div key={quarter.quarter} className="timeline-bar">
                <div 
                  className="timeline-fill"
                  style={{ 
                    height: `${(quarter.amount / Math.max(...portfolioMetrics.quarterlyDeployment.map(q => q.amount))) * 100}%`,
                    animationDelay: `${index * 100}ms`
                  }}
                />
                <div className="timeline-quarter">{quarter.quarter}</div>
                <div className="timeline-amount">{formatCurrency(quarter.amount)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Project Analysis */}
      <div className="project-analysis">
        <div className="analysis-header">
          <h3>Project Portfolio Analysis</h3>
          <button 
            className="toggle-details-btn"
            onClick={() => setShowProjectDetails(!showProjectDetails)}
          >
            {showProjectDetails ? 'Hide Details' : 'Show Project Details'}
          </button>
        </div>

        <div className="analysis-grid">
          {/* Qualifying Projects */}
          <div className="projects-section qualifying">
            <div className="section-header">
              <h4>✅ Qualifying Projects ({portfolioMetrics.projectCount})</h4>
              <span className="section-value">{formatCurrency(portfolioMetrics.totalCapital)}</span>
            </div>
            
            {showProjectDetails && (
              <div className="project-list">
                {qualifyingProjects.slice(0, 10).map(project => (
                  <div key={project.id} className="project-item qualifying">
                    <div className="project-header">
                      <span className="project-name">{project.name}</span>
                      <span className="project-investment">{formatCurrency(project.capex)}</span>
                    </div>
                    <div className="project-details">
                      <span className="project-irr">IRR: {project.irr.toFixed(1)}%</span>
                      <span 
                        className="project-risk"
                        style={{ color: getRiskColor(project.riskScore) }}
                      >
                        Risk: {project.riskScore} ({getRiskLevel(project.riskScore)})
                      </span>
                      <span className="project-grade">Grade {project.investmentGrade}</span>
                    </div>
                  </div>
                ))}
                {qualifyingProjects.length > 10 && (
                  <div className="project-item more">
                    +{qualifyingProjects.length - 10} more projects...
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Excluded Projects */}
          <div className="projects-section excluded">
            <div className="section-header">
              <h4>❌ Excluded Projects ({excludedProjects.length})</h4>
              <span className="section-value">{formatCurrency(excludedProjects.reduce((sum, p) => sum + p.capex, 0))}</span>
            </div>
            
            {showProjectDetails && (
              <div className="project-list">
                {excludedProjects.slice(0, 5).map(project => (
                  <div key={project.id} className="project-item excluded">
                    <div className="project-header">
                      <span className="project-name">{project.name}</span>
                      <span className="project-investment">{formatCurrency(project.capex)}</span>
                    </div>
                    <div className="project-details">
                      <span className="project-irr">IRR: {project.irr.toFixed(1)}%</span>
                      <span 
                        className="project-risk"
                        style={{ color: getRiskColor(project.riskScore) }}
                      >
                        Risk: {project.riskScore} ({getRiskLevel(project.riskScore)})
                      </span>
                      <span className="exclusion-reason">
                        Exceeds {riskThreshold}% risk threshold
                      </span>
                    </div>
                  </div>
                ))}
                {excludedProjects.length > 5 && (
                  <div className="project-item more">
                    +{excludedProjects.length - 5} more excluded...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scenario Comparison */}
      <div className="scenario-comparison">
        <h3>Risk Threshold Impact Comparison</h3>
        <div className="comparison-grid">
          {[40, 50, 60, 70, 80].map(threshold => {
            const scenarioProjects = sharedData.validatedProjects.filter(p => p.riskScore <= threshold);
            const scenarioCapital = scenarioProjects.reduce((sum, p) => sum + p.capex, 0);
            const scenarioIRR = scenarioProjects.length > 0 
              ? scenarioProjects.reduce((sum, p) => sum + (p.irr * p.capex), 0) / scenarioCapital 
              : 0;
            const isCurrentThreshold = threshold === riskThreshold;
            
            return (
              <div 
                key={threshold}
                className={`scenario-card ${isCurrentThreshold ? 'current' : ''}`}
                onClick={() => setRiskThreshold(threshold)}
              >
                <div className="scenario-threshold">{threshold}% Risk</div>
                <div className="scenario-projects">{scenarioProjects.length} projects</div>
                <div className="scenario-capital">{formatCurrency(scenarioCapital)}</div>
                <div className="scenario-irr">{scenarioIRR.toFixed(1)}% IRR</div>
                {isCurrentThreshold && <div className="current-indicator">Current</div>}
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .tab7-whatif-analysis {
          padding: 1.5rem;
          background: #0a0e27;
          color: #e2e8f0;
          min-height: 100vh;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        /* Risk Control Header */
        .risk-control-header {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border: 1px solid #334155;
          border-radius: 16px;
          padding: 1.75rem 2rem;
          margin-bottom: 1.5rem;
        }

        .control-title h2 {
          font-size: 1.625rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 0.375rem 0;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          line-height: 1.2;
        }

        .control-title p {
          color: #94a3b8;
          margin: 0 0 1.75rem 0;
          font-size: 0.9375rem;
          line-height: 1.4;
        }

        .slider-labels {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.875rem;
          color: #94a3b8;
          font-size: 0.8125rem;
          font-weight: 500;
        }

        .slider-wrapper {
          position: relative;
          margin-bottom: 1.25rem;
        }

        .risk-threshold-slider {
          width: 100%;
          height: 8px;
          background: transparent;
          outline: none;
          opacity: 0;
          position: relative;
          z-index: 2;
          cursor: pointer;
        }

        .slider-track {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 8px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 4px;
          transform: translateY(-50%);
        }

        .slider-fill {
          height: 100%;
          background: linear-gradient(135deg, #10b981 0%, #3b82f6 50%, #ef4444 100%);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .threshold-display {
          display: flex;
          align-items: center;
          gap: 1.75rem;
        }

        .threshold-value {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 120px;
        }

        .threshold-number {
          font-size: 2.25rem;
          font-weight: 700;
          color: #3b82f6;
          line-height: 1;
          margin-bottom: 0.25rem;
        }

        .threshold-label {
          color: #94a3b8;
          font-size: 0.8125rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 500;
        }

        .threshold-description {
          color: #e2e8f0;
          font-size: 0.9375rem;
          font-weight: 500;
          line-height: 1.4;
        }

        /* Impact Dashboard */
        .impact-dashboard {
          margin-bottom: 1.5rem;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
          margin-bottom: 1.5rem;
        }

        .metric-card {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border: 1px solid #334155;
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.875rem;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .metric-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }

        .metric-card.primary {
          border-left: 3px solid #3b82f6;
        }

        .metric-icon {
          font-size: 2rem;
          opacity: 0.8;
          flex-shrink: 0;
        }

        .metric-content {
          flex: 1;
          min-width: 0;
        }

        .metric-value {
          display: flex;
          align-items: baseline;
          gap: 0.375rem;
          margin-bottom: 0.375rem;
        }

        .metric-value span:first-child {
          font-size: 1.75rem;
          font-weight: 700;
          color: #ffffff;
          transition: transform 0.3s ease;
          line-height: 1;
        }

        .metric-value .animating {
          transform: scale(1.05);
          color: #3b82f6;
        }

        .metric-unit {
          font-size: 0.875rem;
          color: #94a3b8;
          font-weight: 500;
        }

        .metric-label {
          color: #94a3b8;
          font-size: 0.8125rem;
          font-weight: 600;
          margin-bottom: 0.1875rem;
          line-height: 1.3;
        }

        .metric-detail {
          color: #64748b;
          font-size: 0.6875rem;
          line-height: 1.3;
        }

        /* Secondary Metrics */
        .secondary-metrics {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }

        .utilization-card,
        .risk-distribution-card {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border: 1px solid #334155;
          border-radius: 12px;
          padding: 1.25rem;
        }

        .utilization-card h4,
        .risk-distribution-card h4 {
          color: #ffffff;
          margin: 0 0 0.875rem 0;
          font-size: 1rem;
          font-weight: 600;
          line-height: 1.3;
        }

        .utilization-bar {
          height: 10px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 5px;
          overflow: hidden;
          margin-bottom: 0.625rem;
        }

        .utilization-fill {
          height: 100%;
          background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
          border-radius: 5px;
          transition: width 0.5s ease;
        }

        .utilization-text {
          color: #94a3b8;
          font-size: 0.8125rem;
          line-height: 1.3;
        }

        .risk-bars {
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
        }

        .risk-bar {
          display: flex;
          align-items: center;
          gap: 0.875rem;
        }

        .risk-label {
          color: #e2e8f0;
          font-size: 0.8125rem;
          min-width: 75px;
          font-weight: 500;
        }

        .risk-bar-container {
          flex: 1;
          height: 6px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 3px;
          overflow: hidden;
        }

        .risk-bar-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.5s ease;
        }

        .risk-bar-fill.low { background: #10b981; }
        .risk-bar-fill.medium { background: #f59e0b; }
        .risk-bar-fill.high { background: #ef4444; }

        .risk-count {
          color: #94a3b8;
          font-size: 0.8125rem;
          min-width: 25px;
          text-align: right;
          font-weight: 500;
        }

        /* Deployment Timeline */
        .deployment-timeline {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border: 1px solid #334155;
          border-radius: 12px;
          padding: 1.25rem 1.5rem 1rem 1.5rem;
          margin-bottom: 1.5rem;
        }

        .deployment-timeline h3 {
          color: #ffffff;
          margin: 0 0 0.625rem 0;
          font-size: 1.125rem;
          font-weight: 600;
          line-height: 1.3;
        }

        .timeline-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .timeline-header span:first-child {
          color: #94a3b8;
          font-size: 0.8125rem;
          font-weight: 500;
        }

        .timeline-total {
          color: #3b82f6;
          font-size: 1rem;
          font-weight: 700;
        }

        .timeline-bars {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          height: 80px;
          overflow-x: auto;
          padding: 0.25rem 0 0.5rem 0;
          width: 100%;
        }

        .timeline-bar {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          max-width: 120px;
          min-width: 90px;
        }

        .timeline-fill {
          width: 32px;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          border-radius: 3px 3px 0 0;
          margin-bottom: 0.375rem;
          animation: growUp 0.6s ease-out;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }

        .timeline-quarter {
          color: #94a3b8;
          font-size: 0.6875rem;
          margin-bottom: 0.125rem;
          font-weight: 500;
          text-align: center;
        }

        .timeline-amount {
          color: #e2e8f0;
          font-size: 0.625rem;
          font-weight: 600;
          text-align: center;
          line-height: 1.2;
        }

        @keyframes growUp {
          from { height: 0; }
          to { height: 100%; }
        }

        /* Project Analysis */
        .project-analysis {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border: 1px solid #334155;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .analysis-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.125rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .analysis-header h3 {
          color: #ffffff;
          margin: 0;
          font-size: 1.125rem;
          font-weight: 600;
          line-height: 1.3;
        }

        .toggle-details-btn {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #e2e8f0;
          padding: 0.4375rem 0.875rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.8125rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .toggle-details-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-1px);
        }

        .analysis-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }

        .projects-section {
          background: rgba(255, 255, 255, 0.025);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 1.125rem;
        }

        .projects-section.qualifying {
          border-left: 3px solid #10b981;
        }

        .projects-section.excluded {
          border-left: 3px solid #ef4444;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.875rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .section-header h4 {
          color: #ffffff;
          margin: 0;
          font-size: 0.9375rem;
          font-weight: 600;
          line-height: 1.3;
        }

        .section-value {
          color: #3b82f6;
          font-size: 0.8125rem;
          font-weight: 700;
        }

        .project-list {
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
          max-height: 280px;
          overflow-y: auto;
          padding-right: 0.25rem;
        }

        .project-list::-webkit-scrollbar {
          width: 4px;
        }

        .project-list::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 2px;
        }

        .project-list::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
        }

        .project-item {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          padding: 0.875rem;
          transition: background 0.2s ease;
        }

        .project-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .project-item.qualifying {
          border-left: 2px solid #10b981;
        }

        .project-item.excluded {
          border-left: 2px solid #ef4444;
          opacity: 0.75;
        }

        .project-item.more {
          text-align: center;
          color: #94a3b8;
          font-style: italic;
          border: 1px dashed rgba(255, 255, 255, 0.15);
          background: rgba(255, 255, 255, 0.015);
        }

        .project-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.375rem;
        }

        .project-name {
          color: #e2e8f0;
          font-weight: 500;
          flex: 1;
          font-size: 0.8125rem;
          line-height: 1.3;
        }

        .project-investment {
          color: #3b82f6;
          font-weight: 600;
          font-size: 0.8125rem;
        }

        .project-details {
          display: flex;
          gap: 0.875rem;
          font-size: 0.6875rem;
          line-height: 1.3;
        }

        .project-details span {
          color: #94a3b8;
        }

        .exclusion-reason {
          color: #ef4444 !important;
          font-weight: 500;
        }

        /* Scenario Comparison */
        .scenario-comparison {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border: 1px solid #334155;
          border-radius: 12px;
          padding: 1.5rem;
        }

        .scenario-comparison h3 {
          color: #ffffff;
          margin: 0 0 1.125rem 0;
          font-size: 1.125rem;
          font-weight: 600;
          line-height: 1.3;
        }

        .comparison-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0.875rem;
        }

        .scenario-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 1.125rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .scenario-card:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .scenario-card.current {
          border: 2px solid #3b82f6;
          background: rgba(59, 130, 246, 0.08);
        }

        .scenario-threshold {
          color: #3b82f6;
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 0.375rem;
          line-height: 1.2;
        }

        .scenario-projects {
          color: #e2e8f0;
          font-size: 0.8125rem;
          margin-bottom: 0.1875rem;
          font-weight: 500;
        }

        .scenario-capital {
          color: #10b981;
          font-size: 0.8125rem;
          font-weight: 600;
          margin-bottom: 0.1875rem;
        }

        .scenario-irr {
          color: #94a3b8;
          font-size: 0.6875rem;
          font-weight: 500;
        }

        .current-indicator {
          position: absolute;
          top: -6px;
          right: -6px;
          background: #3b82f6;
          color: white;
          padding: 0.1875rem 0.4375rem;
          border-radius: 3px;
          font-size: 0.5625rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .dashboard-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }
          
          .comparison-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          
          .tab7-whatif-analysis {
            padding: 1.25rem;
          }
        }

        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
          
          .analysis-grid {
            grid-template-columns: 1fr;
          }
          
          .secondary-metrics {
            grid-template-columns: 1fr;
          }
          
          .comparison-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .tab7-whatif-analysis {
            padding: 1rem;
          }
          
          .threshold-display {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};