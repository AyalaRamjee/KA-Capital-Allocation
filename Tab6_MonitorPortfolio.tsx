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
  const [selectedQuadrant, setSelectedQuadrant] = useState<'velocity' | 'returns' | 'risk' | 'strategic' | null>(null);
  const [deploymentAnimation, setDeploymentAnimation] = useState(true);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'dashboard' | 'geographic' | 'timeline'>('dashboard');

  // Filter active projects (Grade A and B)
  const activeProjects = sharedData.validatedProjects.filter(
    p => p.investmentGrade === 'A' || p.investmentGrade === 'B'
  );

  // Calculate key metrics
  const totalDeployedCapital = activeProjects.reduce((sum, p) => sum + p.capex, 0);
  const targetMonthly = 1500000000; // $1.5B per month
  const targetTotal = 90000000000; // $90B total
  const currentMonthlyRate = totalDeployedCapital / 12; // Assuming 12 months
  const deploymentVelocity = (currentMonthlyRate / targetMonthly) * 100;
  
  // Portfolio IRR (weighted average)
  const portfolioIRR = activeProjects.length > 0 
    ? activeProjects.reduce((sum, p) => sum + (p.irr * p.capex), 0) / totalDeployedCapital
    : 0;

  // Calculate actual vs expected returns
  const expectedReturns = activeProjects.reduce((sum, p) => sum + (p.npv), 0);
  const actualReturns = expectedReturns * (0.85 + Math.random() * 0.3); // Simulate actual performance
  const returnsVariance = ((actualReturns - expectedReturns) / expectedReturns) * 100;

  // Risk exposure calculation
  const riskDistribution = {
    low: activeProjects.filter(p => p.riskScore <= 30),
    medium: activeProjects.filter(p => p.riskScore > 30 && p.riskScore <= 60),
    high: activeProjects.filter(p => p.riskScore > 60)
  };
  
  const portfolioRiskScore = activeProjects.length > 0
    ? activeProjects.reduce((sum, p) => sum + (p.riskScore * p.capex), 0) / totalDeployedCapital
    : 0;

  // Strategic alignment score
  const strategicScore = activeProjects.length > 0
    ? activeProjects.reduce((sum, p) => sum + p.compositeScore, 0) / activeProjects.length
    : 0;

  // Days ahead/behind schedule
  const daysVariance = Math.floor((totalDeployedCapital / targetTotal) * 1825 - 365); // 5 years = 1825 days

  // Top/Bottom performers
  const sortedByPerformance = [...activeProjects].sort((a, b) => {
    const aPerf = (a.irr - 15) * (100 - a.riskScore) / 100;
    const bPerf = (b.irr - 15) * (100 - b.riskScore) / 100;
    return bPerf - aPerf;
  });
  
  const topPerformers = sortedByPerformance.slice(0, 5);
  const bottomPerformers = sortedByPerformance.slice(-5).reverse();

  // Geographic data with actual Indian states
  const geographicData = [
    { 
      state: 'Gujarat', 
      projects: activeProjects.filter(p => p.businessUnit.includes('Gujarat')).length || 12,
      investment: 22000000000,
      avgROI: 18.5,
      coordinates: { x: 72.1, y: 22.2 },
      mapX: 250,
      mapY: 280
    },
    { 
      state: 'Maharashtra', 
      projects: activeProjects.filter(p => p.businessUnit.includes('Maharashtra')).length || 10,
      investment: 18000000000,
      avgROI: 16.2,
      coordinates: { x: 75.7, y: 19.7 },
      mapX: 280,
      mapY: 320
    },
    { 
      state: 'Rajasthan', 
      projects: activeProjects.filter(p => p.businessUnit.includes('Rajasthan')).length || 8,
      investment: 14000000000,
      avgROI: 19.8,
      coordinates: { x: 74.2, y: 27.0 },
      mapX: 220,
      mapY: 240
    },
    { 
      state: 'Odisha', 
      projects: activeProjects.filter(p => p.businessUnit.includes('Odisha')).length || 6,
      investment: 9000000000,
      avgROI: 15.5,
      coordinates: { x: 85.8, y: 20.9 },
      mapX: 420,
      mapY: 300
    },
    { 
      state: 'Tamil Nadu', 
      projects: activeProjects.filter(p => p.businessUnit.includes('Tamil')).length || 5,
      investment: 7000000000,
      avgROI: 17.2,
      coordinates: { x: 78.6, y: 10.8 },
      mapX: 340,
      mapY: 420
    },
    { 
      state: 'Karnataka', 
      projects: activeProjects.filter(p => p.businessUnit.includes('Karnataka')).length || 4,
      investment: 5000000000,
      avgROI: 20.1,
      coordinates: { x: 75.7, y: 15.3 },
      mapX: 290,
      mapY: 380
    }
  ];

  // Deployment flow animation
  useEffect(() => {
    const interval = setInterval(() => {
      setDeploymentAnimation(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Quadrant data
  const quadrantData = {
    velocity: {
      title: 'Deployment Velocity',
      icon: '🚀',
      metric: `${formatCurrency(currentMonthlyRate)}/mo`,
      trend: deploymentVelocity >= 100 ? 'positive' : 'negative',
      trendValue: `${deploymentVelocity >= 100 ? '+' : ''}${(deploymentVelocity - 100).toFixed(1)}%`,
      subtitle: `Target: ${formatCurrency(targetMonthly)}/mo`,
      color: '#3b82f6'
    },
    returns: {
      title: 'Returns Performance',
      icon: '📈',
      metric: `${portfolioIRR.toFixed(1)}%`,
      trend: returnsVariance >= 0 ? 'positive' : 'negative',
      trendValue: `${returnsVariance >= 0 ? '+' : ''}${returnsVariance.toFixed(1)}%`,
      subtitle: `NPV: ${formatCurrency(actualReturns)}`,
      color: '#10b981'
    },
    risk: {
      title: 'Risk Exposure',
      icon: '⚡',
      metric: portfolioRiskScore.toFixed(0),
      trend: portfolioRiskScore <= 50 ? 'positive' : 'negative',
      trendValue: `${riskDistribution.high.length} high-risk`,
      subtitle: `${riskDistribution.low.length}L / ${riskDistribution.medium.length}M / ${riskDistribution.high.length}H`,
      color: '#f59e0b'
    },
    strategic: {
      title: 'Strategic Alignment',
      icon: '🎯',
      metric: `${strategicScore.toFixed(0)}%`,
      trend: strategicScore >= 70 ? 'positive' : 'negative',
      trendValue: daysVariance >= 0 ? `${daysVariance} days ahead` : `${Math.abs(daysVariance)} days behind`,
      subtitle: 'Portfolio alignment score',
      color: '#8b5cf6'
    }
  };

  const containerStyle = {
    padding: '2rem',
    background: '#0a0e27',
    minHeight: '100vh',
    color: '#e2e8f0'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem'
  };

  const titleStyle = {
    fontSize: '2rem',
    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: 700
  };

  const viewControlsStyle = {
    display: 'flex',
    gap: '1rem'
  };

  const viewBtnStyle = (isActive: boolean) => ({
    background: isActive ? '#3b82f6' : 'rgba(255, 255, 255, 0.1)',
    border: isActive ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.2)',
    color: isActive ? 'white' : '#94a3b8',
    padding: '0.75rem 1.5rem',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: 600,
    transition: 'all 0.3s ease'
  });

  const quadrantStyle = (color: string, isSelected: boolean) => ({
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    border: `2px solid ${isSelected ? color : '#334155'}`,
    borderRadius: '20px',
    padding: '2rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
    boxShadow: isSelected ? `0 0 30px ${color}40` : 'none'
  });

  return (
    <div className="tab6-portfolio-command" style={containerStyle}>
      {/* View Mode Selector */}
      <div className="command-header" style={headerStyle}>
        <h1 style={titleStyle}>Portfolio Command Center</h1>
        <div className="view-controls" style={viewControlsStyle}>
          <button 
            className="view-btn"
            style={viewBtnStyle(viewMode === 'dashboard')}
            onClick={() => setViewMode('dashboard')}
          >
            <span style={{ fontSize: '1.25rem' }}>📊</span>
            CEO Dashboard
          </button>
          <button 
            className="view-btn"
            style={viewBtnStyle(viewMode === 'geographic')}
            onClick={() => setViewMode('geographic')}
          >
            <span style={{ fontSize: '1.25rem' }}>🗺️</span>
            Geographic View
          </button>
          <button 
            className="view-btn"
            style={viewBtnStyle(viewMode === 'timeline')}
            onClick={() => setViewMode('timeline')}
          >
            <span style={{ fontSize: '1.25rem' }}>📅</span>
            Timeline View
          </button>
        </div>
      </div>

      {viewMode === 'dashboard' && (
        <>
          {/* CEO Dashboard - 4 Quadrants */}
          <div className="ceo-dashboard" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {Object.entries(quadrantData).map(([key, data]) => (
              <div 
                key={key}
                className="quadrant"
                onClick={() => setSelectedQuadrant(selectedQuadrant === key ? null : key as any)}
                style={quadrantStyle(data.color, selectedQuadrant === key)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '2rem' }}>{data.icon}</span>
                  <h3 style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {data.title}
                  </h3>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 700, color: data.color }}>
                    {data.metric}
                  </span>
                  <span style={{ fontSize: '1rem', fontWeight: 600, color: data.trend === 'positive' ? '#10b981' : '#ef4444' }}>
                    {data.trend === 'positive' ? '↑' : '↓'} {data.trendValue}
                  </span>
                </div>
                
                <div style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  {data.subtitle}
                </div>
                
                {/* Mini visualization for each quadrant */}
                <div style={{ height: '60px', marginTop: '1rem' }}>
                  {key === 'velocity' && (
                    <svg width="100%" height="60" viewBox="0 0 200 60">
                      <rect x="0" y="20" width="200" height="20" rx="10" fill="#1e293b" />
                      <rect 
                        x="0" 
                        y="20" 
                        width={`${Math.min(deploymentVelocity, 100) * 2}`} 
                        height="20" 
                        rx="10" 
                        fill={data.color}
                      />
                      <line x1="100" y1="10" x2="100" y2="50" stroke="#fff" strokeWidth="2" strokeDasharray="2,2" />
                      <text x="100" y="8" textAnchor="middle" fill="#94a3b8" fontSize="10">Target</text>
                    </svg>
                  )}
                  
                  {key === 'returns' && (
                    <svg width="100%" height="60" viewBox="0 0 200 60">
                      <polyline
                        points="10,50 40,40 70,35 100,25 130,20 160,15 190,10"
                        fill="none"
                        stroke={data.color}
                        strokeWidth="3"
                      />
                      {[10, 40, 70, 100, 130, 160, 190].map((x, i) => (
                        <circle key={i} cx={x} cy={50 - i * 6.67} r="3" fill={data.color} />
                      ))}
                    </svg>
                  )}
                  
                  {key === 'risk' && (
                    <div style={{ display: 'flex', gap: '0.5rem', height: '100%', alignItems: 'flex-end' }}>
                      <div style={{ 
                        flex: 1, 
                        background: '#10b981', 
                        height: `${(riskDistribution.low.length / activeProjects.length) * 100}%`,
                        borderRadius: '4px 4px 0 0',
                        position: 'relative',
                        minHeight: '10px'
                      }}>
                        <span style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.75rem', color: '#94a3b8' }}>L</span>
                      </div>
                      <div style={{ 
                        flex: 1, 
                        background: '#f59e0b', 
                        height: `${(riskDistribution.medium.length / activeProjects.length) * 100}%`,
                        borderRadius: '4px 4px 0 0',
                        position: 'relative',
                        minHeight: '10px'
                      }}>
                        <span style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.75rem', color: '#94a3b8' }}>M</span>
                      </div>
                      <div style={{ 
                        flex: 1, 
                        background: '#ef4444', 
                        height: `${(riskDistribution.high.length / activeProjects.length) * 100}%`,
                        borderRadius: '4px 4px 0 0',
                        position: 'relative',
                        minHeight: '10px'
                      }}>
                        <span style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.75rem', color: '#94a3b8' }}>H</span>
                      </div>
                    </div>
                  )}
                  
                  {key === 'strategic' && (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <svg width="100" height="60" viewBox="0 0 100 60">
                        <circle cx="50" cy="30" r="25" fill="none" stroke="#1e293b" strokeWidth="6" />
                        <circle 
                          cx="50" 
                          cy="30" 
                          r="25" 
                          fill="none" 
                          stroke={data.color} 
                          strokeWidth="6"
                          strokeDasharray={`${(strategicScore / 100) * 157} 157`}
                          strokeLinecap="round"
                          transform="rotate(-90 50 30)"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Live Deployment Tracker */}
          <div className="deployment-tracker" style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '2rem',
            border: '1px solid #334155'
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', color: '#ffffff' }}>Live Capital Deployment Flow</h2>
            <div className="deployment-visualization">
              <div className="flow-container" style={{
                display: 'grid',
                gridTemplateColumns: '200px 300px 200px 150px',
                gap: '2rem',
                alignItems: 'center',
                position: 'relative',
                marginBottom: '2rem'
              }}>
                {/* Treasury */}
                <div className="flow-node treasury" style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  border: '2px solid #3b82f6',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  textAlign: 'center',
                  position: 'relative',
                  zIndex: 2
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏦</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Treasury</div>
                  <div style={{ color: '#ffffff', fontSize: '1.125rem', fontWeight: 700 }}>{formatCurrency(targetTotal)}</div>
                </div>
                
                {/* Flow lines */}
                <div className="flow-lines" style={{
                  position: 'absolute',
                  left: '200px',
                  width: '300px',
                  height: '100%',
                  zIndex: 1
                }}>
                  {sharedData.adaniSectors.slice(0, 4).map((sector, index) => (
                    <div 
                      key={sector.id} 
                      style={{
                        position: 'absolute',
                        top: `${25 + index * 20}%`,
                        width: '100%',
                        height: '2px',
                        background: 'rgba(59, 130, 246, 0.2)',
                        overflow: 'hidden'
                      }}
                    >
                      {deploymentAnimation && (
                        <div style={{
                          position: 'absolute',
                          left: '-20px',
                          top: '-4px',
                          width: '20px',
                          height: '10px',
                          background: '#3b82f6',
                          borderRadius: '5px',
                          boxShadow: '0 0 10px #3b82f6',
                          animation: `flowAnimation 3s linear infinite`,
                          animationDelay: `${index * 0.2}s`
                        }} />
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Sectors */}
                <div className="flow-sectors" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {sharedData.adaniSectors.slice(0, 4).map((sector, index) => {
                    const sectorProjects = activeProjects.filter(p => 
                      p.businessUnit.toLowerCase().includes(sector.name.toLowerCase())
                    );
                    const sectorCapital = sectorProjects.reduce((sum, p) => sum + p.capex, 0);
                    
                    return (
                      <div key={sector.id} className="flow-node sector" style={{
                        background: 'rgba(139, 92, 246, 0.1)',
                        border: '2px solid rgba(139, 92, 246, 0.3)',
                        borderRadius: '16px',
                        padding: '1rem',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{sector.icon}</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.25rem' }}>{sector.name}</div>
                        <div style={{ color: '#ffffff', fontSize: '0.875rem', fontWeight: 700 }}>{formatCurrency(sectorCapital)}</div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Projects indicator */}
                <div className="flow-projects">
                  <div className="projects-bubble" style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    borderRadius: '50%',
                    width: '120px',
                    height: '120px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)'
                  }}>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'white' }}>{activeProjects.length}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.9)' }}>Active Projects</div>
                  </div>
                </div>
              </div>
              
              <div className="deployment-stats" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <div className="stat-card" style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '1rem 2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <div style={{ fontSize: '2rem' }}>⏱️</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Deployment Speed</div>
                    <div style={{ color: '#ffffff', fontSize: '1.25rem', fontWeight: 700 }}>{formatCurrency(currentMonthlyRate * 7 / 30)}/week</div>
                  </div>
                </div>
                <div className="stat-card" style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '1rem 2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <div style={{ fontSize: '2rem' }}>📊</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Utilization Rate</div>
                    <div style={{ color: '#ffffff', fontSize: '1.25rem', fontWeight: 700 }}>{((totalDeployedCapital / targetTotal) * 100).toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Winner/Loser Analysis */}
          <div className="performance-analysis" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '2rem',
            marginBottom: '2rem'
          }}>
            <div className="winners-section" style={{
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              borderRadius: '20px',
              padding: '2rem',
              border: '1px solid #334155'
            }}>
              <h3 style={{ color: '#10b981', marginBottom: '1.5rem', fontSize: '1.25rem' }}>🏆 Top Performers</h3>
              <div className="performer-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {topPerformers.map((project, index) => (
                  <div key={project.id} className="performer-card winner" style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderLeft: '4px solid #10b981',
                    borderRadius: '12px',
                    padding: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.875rem'
                    }}>#{index + 1}</div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ color: '#ffffff', fontSize: '0.875rem', marginBottom: '0.25rem' }}>{project.name}</h4>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>IRR: {project.irr.toFixed(1)}%</span>
                        <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Risk: {project.riskScore}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 700, color: '#10b981' }}>
                      <span style={{ fontSize: '1.25rem' }}>↑</span>
                      <span>+{((project.irr - 15) / 15 * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="losers-section" style={{
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              borderRadius: '20px',
              padding: '2rem',
              border: '1px solid #334155'
            }}>
              <h3 style={{ color: '#ef4444', marginBottom: '1.5rem', fontSize: '1.25rem' }}>📉 Bottom Performers</h3>
              <div className="performer-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {bottomPerformers.map((project, index) => (
                  <div key={project.id} className="performer-card loser" style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderLeft: '4px solid #ef4444',
                    borderRadius: '12px',
                    padding: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.875rem'
                    }}>#{topPerformers.length + index + 1}</div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ color: '#ffffff', fontSize: '0.875rem', marginBottom: '0.25rem' }}>{project.name}</h4>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>IRR: {project.irr.toFixed(1)}%</span>
                        <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Risk: {project.riskScore}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 700, color: '#ef4444' }}>
                      <span style={{ fontSize: '1.25rem' }}>↓</span>
                      <span>{((project.irr - 15) / 15 * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {viewMode === 'geographic' && (
        <div className="geographic-command" style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '20px',
          padding: '2rem',
          border: '1px solid #334155'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', color: '#ffffff' }}>Geographic Investment Command Map</h2>
          
          {/* 3D-style India Map */}
          <div className="map-container" style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
            <svg width="800" height="600" viewBox="0 0 800 600" className="india-map" style={{
              filter: 'drop-shadow(0 10px 30px rgba(0, 0, 0, 0.5))'
            }}>
              {/* Gradient definitions */}
              <defs>
                <radialGradient id="investmentGradient">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
                </radialGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {/* Simplified India outline with 3D effect */}
              <g className="map-base">
                {/* Shadow */}
                <path
                  d="M200 100 L500 80 L600 150 L580 250 L600 350 L500 450 L400 500 L250 480 L150 400 L100 300 L80 200 L100 150 Z"
                  fill="#0a0e27"
                  opacity="0.5"
                  transform="translate(10, 10)"
                />
                
                {/* Main map */}
                <path
                  d="M200 100 L500 80 L600 150 L580 250 L600 350 L500 450 L400 500 L250 480 L150 400 L100 300 L80 200 L100 150 Z"
                  fill="#1e293b"
                  stroke="#334155"
                  strokeWidth="2"
                />
                
                {/* 3D edge highlight */}
                <path
                  d="M200 100 L500 80 L600 150"
                  fill="none"
                  stroke="#475569"
                  strokeWidth="3"
                />
              </g>
              
              {/* Investment bubbles */}
              {geographicData.map((location, index) => {
                const bubbleRadius = Math.sqrt(location.investment / 500000000) * 2;
                const isSelected = selectedState === location.state;
                
                return (
                  <g 
                    key={location.state}
                    className="investment-bubble"
                    onClick={() => setSelectedState(isSelected ? null : location.state)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Bubble shadow */}
                    <ellipse
                      cx={location.mapX + 5}
                      cy={location.mapY + 5}
                      rx={bubbleRadius}
                      ry={bubbleRadius * 0.3}
                      fill="#000"
                      opacity="0.3"
                    />
                    
                    {/* Pulse animation */}
                    {isSelected && (
                      <circle
                        cx={location.mapX}
                        cy={location.mapY}
                        r={bubbleRadius}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="2"
                        opacity="0.5"
                        style={{ animation: 'pulse 2s infinite' }}
                      />
                    )}
                    
                    {/* Main bubble */}
                    <circle
                      cx={location.mapX}
                      cy={location.mapY}
                      r={bubbleRadius}
                      fill="url(#investmentGradient)"
                      stroke="#3b82f6"
                      strokeWidth="3"
                      filter="url(#glow)"
                      style={{ transition: 'transform 0.3s ease' }}
                    />
                    
                    {/* State label */}
                    <text
                      x={location.mapX}
                      y={location.mapY - bubbleRadius - 10}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="14"
                      fontWeight="600"
                    >
                      {location.state}
                    </text>
                    
                    {/* Investment amount */}
                    <text
                      x={location.mapX}
                      y={location.mapY + 5}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="12"
                      fontWeight="700"
                    >
                      ${(location.investment / 1000000000).toFixed(1)}B
                    </text>
                    
                    {/* Project count */}
                    <text
                      x={location.mapX}
                      y={location.mapY + 20}
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="10"
                    >
                      {location.projects} projects
                    </text>
                  </g>
                );
              })}
              
              {/* Connection lines between states */}
              <g className="connections" opacity="0.3">
                <line x1={250} y1={280} x2={280} y2={320} stroke="#3b82f6" strokeWidth="1" strokeDasharray="2,2" />
                <line x1={280} y1={320} x2={340} y2={420} stroke="#3b82f6" strokeWidth="1" strokeDasharray="2,2" />
                <line x1={250} y1={280} x2={420} y2={300} stroke="#3b82f6" strokeWidth="1" strokeDasharray="2,2" />
              </g>
            </svg>
            
            {/* State details panel */}
            {selectedState && (
              <div className="state-details" style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '2rem',
                minWidth: '300px'
              }}>
                <h3 style={{ color: '#ffffff', fontSize: '1.5rem', marginBottom: '1.5rem' }}>{selectedState}</h3>
                <div className="detail-grid" style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div className="detail-item" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.75rem 0',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Total Investment</span>
                    <span style={{ color: '#ffffff', fontWeight: 700 }}>
                      {formatCurrency(geographicData.find(g => g.state === selectedState)?.investment || 0)}
                    </span>
                  </div>
                  <div className="detail-item" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.75rem 0',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Active Projects</span>
                    <span style={{ color: '#ffffff', fontWeight: 700 }}>
                      {geographicData.find(g => g.state === selectedState)?.projects || 0}
                    </span>
                  </div>
                  <div className="detail-item" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.75rem 0',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Average ROI</span>
                    <span style={{ color: '#ffffff', fontWeight: 700 }}>
                      {geographicData.find(g => g.state === selectedState)?.avgROI || 0}%
                    </span>
                  </div>
                  <div className="detail-item" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.75rem 0',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Risk Profile</span>
                    <span style={{ color: '#ffffff', fontWeight: 700 }}>Balanced</span>
                  </div>
                </div>
                <button className="btn btn-primary" style={{
                  width: '100%',
                  background: '#3b82f6',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontWeight: 600
                }}>View All Projects →</button>
              </div>
            )}
          </div>
          
          {/* Geographic summary cards */}
          <div className="geo-summary-cards" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1rem'
          }}>
            <div className="geo-card" style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '1.5rem',
              textAlign: 'center'
            }}>
              <h4 style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Highest Investment
              </h4>
              <div className="geo-stat" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ color: '#ffffff', fontSize: '1.125rem', fontWeight: 700 }}>Gujarat</span>
                <span style={{ color: '#3b82f6', fontSize: '1.5rem', fontWeight: 700 }}>{formatCurrency(22000000000)}</span>
              </div>
            </div>
            <div className="geo-card" style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '1.5rem',
              textAlign: 'center'
            }}>
              <h4 style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Best ROI
              </h4>
              <div className="geo-stat" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ color: '#ffffff', fontSize: '1.125rem', fontWeight: 700 }}>Karnataka</span>
                <span style={{ color: '#3b82f6', fontSize: '1.5rem', fontWeight: 700 }}>20.1%</span>
              </div>
            </div>
            <div className="geo-card" style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '1.5rem',
              textAlign: 'center'
            }}>
              <h4 style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Most Projects
              </h4>
              <div className="geo-stat" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ color: '#ffffff', fontSize: '1.125rem', fontWeight: 700 }}>Gujarat</span>
                <span style={{ color: '#3b82f6', fontSize: '1.5rem', fontWeight: 700 }}>12 projects</span>
              </div>
            </div>
            <div className="geo-card" style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '1.5rem',
              textAlign: 'center'
            }}>
              <h4 style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Geographic Diversity
              </h4>
              <div className="geo-stat" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ color: '#ffffff', fontSize: '1.125rem', fontWeight: 700 }}>6 States</span>
                <span style={{ color: '#3b82f6', fontSize: '1.5rem', fontWeight: 700 }}>Well Distributed</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'timeline' && (
        <div className="timeline-view">
          <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', color: '#ffffff' }}>Investment Timeline & Milestones</h2>
          <div className="timeline-content">
            {/* Implementation for timeline view would go here */}
            <p style={{ color: '#94a3b8' }}>Timeline visualization coming soon...</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes flowAnimation {
          to {
            left: 100%;
          }
        }
        
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.5);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 0.5;
          }
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};