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
  const [viewMode, setViewMode] = useState<'dashboard' | 'geographic' | 'timeline'>('dashboard');
  const [filters, setFilters] = useState({
    priorityId: 'all',
    sector: 'all',
    grade: 'all',
    region: 'all',
  });
  const [animate, setAnimate] = useState(false);

  // --- DYNAMIC FILTERING LOGIC ---
  const baseActiveProjects = sharedData.validatedProjects.filter(
    p => p.investmentGrade === 'A' || p.investmentGrade === 'B'
  );

  const filteredProjects = baseActiveProjects.filter(project => {
    const priority = sharedData.investmentPriorities.find(p => project.name.toLowerCase().includes(p.name.split(' ')[0].toLowerCase()));
    const sector = sharedData.adaniSectors.find(s => project.businessUnit.toLowerCase().includes(s.name.split(' ')[0].toLowerCase()));

    const priorityMatch = filters.priorityId === 'all' || (priority && priority.id === filters.priorityId);
    const sectorMatch = filters.sector === 'all' || (sector && sector.name === filters.sector);
    const gradeMatch = filters.grade === 'all' || project.investmentGrade === filters.grade;
    const regionMatch = filters.region === 'all' || project.geography === filters.region;
    
    return priorityMatch && sectorMatch && gradeMatch && regionMatch;
  });
  
  // --- DYNAMIC METRIC CALCULATIONS ---
  const calculateMetrics = (projects: ValidatedProject[]) => {
    if (projects.length === 0) {
      return { totalCapital: 0, portfolioIRR: 0, portfolioRisk: 0, strategicScore: 0, riskDistribution: { low: [], medium: [], high: [] } };
    }
    const totalCapital = projects.reduce((sum, p) => sum + p.capex, 0);
    const portfolioIRR = totalCapital > 0 ? projects.reduce((sum, p) => sum + (p.irr * p.capex), 0) / totalCapital : 0;
    const portfolioRisk = totalCapital > 0 ? projects.reduce((sum, p) => sum + (p.riskScore * p.capex), 0) / totalCapital : 0;
    const strategicScore = projects.reduce((sum, p) => sum + p.compositeScore, 0) / projects.length;
    const riskDistribution = {
      low: projects.filter(p => p.riskScore <= 30),
      medium: projects.filter(p => p.riskScore > 30 && p.riskScore <= 60),
      high: projects.filter(p => p.riskScore > 60)
    };
    return { totalCapital, portfolioIRR, portfolioRisk, strategicScore, riskDistribution };
  };

  const metrics = calculateMetrics(filteredProjects);

  const targetMonthlyRate = 1500000000;
  const currentMonthlyRate = 925000000;
  const deploymentVelocity = ((currentMonthlyRate - targetMonthlyRate) / targetMonthlyRate) * 100;
  const daysVariance = -140;

  const sortedByPerformance = [...filteredProjects].sort((a, b) => ((b.irr - 15) * (100 - b.riskScore)) - ((a.irr - 15) * (100 - a.riskScore)));
  const topPerformers = sortedByPerformance.slice(0, 4);
  const bottomPerformers = sortedByPerformance.slice(-4).reverse();

  useEffect(() => {
    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 500);
    return () => clearTimeout(timer);
  }, [filters]);

  const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };
  
  const resetFilters = () => {
    setFilters({ priorityId: 'all', sector: 'all', grade: 'all', region: 'all' });
  };
  
  const isFilterActive = filters.priorityId !== 'all' || filters.sector !== 'all' || filters.grade !== 'all' || filters.region !== 'all';

  const Quadrant: React.FC<{icon: string, title: string, children: React.ReactNode}> = ({icon, title, children}) => (
    <div className={animate ? 'metric-pulse' : ''} style={{ background: 'linear-gradient(135deg, #161a33 0%, #0a0e27 100%)', borderRadius: '16px', padding: '1.5rem', border: '1px solid #1c213e' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <span style={{ fontSize: '1.5rem', opacity: 0.8 }}>{icon}</span>
        <h3 style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</h3>
      </div>
      <div>{children}</div>
    </div>
  );

  return (
    <div className="tab6-portfolio-command" style={{ padding: '1.5rem 2rem', background: '#0a0e27', minHeight: '100vh', color: '#e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#FFFFFF' }}>Portfolio Command Center</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
           {/* View buttons... */}
        </div>
      </div>

      {/* --- STRATEGIC FILTER BAR --- */}
      <div className="filter-bar" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #1c213e', borderRadius: '12px', padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <h4 style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>Strategic Filters:</h4>
        <select value={filters.priorityId} onChange={(e) => handleFilterChange('priorityId', e.target.value)} className="filter-select">
          <option value="all">All Priorities</option>
          {sharedData.investmentPriorities.map(p => <option key={p.id} value={p.id}>{p.icon} {p.name}</option>)}
        </select>
        <select value={filters.sector} onChange={(e) => handleFilterChange('sector', e.target.value)} className="filter-select">
          <option value="all">All Sectors</option>
          {sharedData.adaniSectors.map(s => <option key={s.id} value={s.name}>{s.icon} {s.name}</option>)}
        </select>
        <select value={filters.grade} onChange={(e) => handleFilterChange('grade', e.target.value)} className="filter-select">
          <option value="all">All Grades</option>
          <option value="A">Grade A</option><option value="B">Grade B</option><option value="C">Grade C</option>
        </select>
        <select value={filters.region} onChange={(e) => handleFilterChange('region', e.target.value)} className="filter-select">
          <option value="all">All Regions</option>
          <option value="India">India</option><option value="Australia">Australia</option>
        </select>
        <button onClick={resetFilters} className="reset-filter-btn" style={{ marginLeft: 'auto' }} disabled={!isFilterActive}>Reset Filters</button>
      </div>

      {isFilterActive && (
        <div className="filter-summary" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid #3b82f6', borderRadius: '8px', padding: '0.75rem 1.5rem', marginBottom: '1.5rem', color: '#e2e8f0', animation: 'fadeIn 0.5s' }}>
          Showing <strong>{filteredProjects.length}</strong> projects with a total capital of <strong>{formatCurrency(metrics.totalCapital)}</strong>.
        </div>
      )}

      {/* Main Dashboard Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Quadrants (Dynamically Updated) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
          <Quadrant icon="🚀" title="DEPLOYMENT VELOCITY">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 700, color: '#3b82f6' }}>{formatCurrency(currentMonthlyRate)}</span>
              <span style={{ fontSize: '1rem', fontWeight: 600, color: '#ef4444' }}>{deploymentVelocity.toFixed(1)}%</span>
            </div>
            <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.25rem', marginBottom: '1.5rem' }}>Target: {formatCurrency(targetMonthlyRate)}</div>
            <div style={{ position: 'relative', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
              <div style={{ position: 'absolute', height: '100%', width: `${(currentMonthlyRate / targetMonthlyRate) * 100}%`, background: '#3b82f6', borderRadius: '4px' }} />
              <div style={{ position: 'absolute', left: '100%', top: '-4px', bottom: '-4px', width: '2px', background: '#94a3b8' }} />
            </div>
          </Quadrant>

          <Quadrant icon="📈" title="RETURNS PERFORMANCE">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 700, color: '#10b981' }}>{metrics.portfolioIRR.toFixed(1)}%</span>
            </div>
            <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.25rem', marginBottom: '1.5rem' }}>Avg. Portfolio IRR</div>
            <div style={{ height: '8px', position: 'relative' }}> {/* Graph could go here */} </div>
          </Quadrant>
          
          <Quadrant icon="⚡" title="RISK EXPOSURE">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 700, color: '#FFFFFF' }}>{metrics.portfolioRisk.toFixed(0)}</span>
              <span style={{ fontSize: '1rem', fontWeight: 600, color: '#94a3b8' }}>{metrics.riskDistribution.high.length} high-risk</span>
            </div>
            <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.25rem', marginBottom: '1.5rem' }}>
              {metrics.riskDistribution.low.length} Low / {metrics.riskDistribution.medium.length} Med / {metrics.riskDistribution.high.length} High
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', display: 'flex' }}>
                <div title="Low Risk" style={{ height: '100%', width: `${(metrics.riskDistribution.low.length / (filteredProjects.length || 1)) * 100}%`, background: '#10b981', borderRadius: '4px 0 0 4px' }} />
                <div title="Medium Risk" style={{ height: '100%', width: `${(metrics.riskDistribution.medium.length / (filteredProjects.length || 1)) * 100}%`, background: '#f59e0b' }} />
                <div title="High Risk" style={{ height: '100%', width: `${(metrics.riskDistribution.high.length / (filteredProjects.length || 1)) * 100}%`, background: '#ef4444', borderRadius: '0 4px 4px 0' }} />
            </div>
          </Quadrant>

          <Quadrant icon="🎯" title="STRATEGIC ALIGNMENT">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 700, color: '#8b5cf6' }}>{metrics.strategicScore.toFixed(0)}</span>
              <span style={{ fontSize: '1rem', fontWeight: 600, color: '#ef4444' }}>{daysVariance < 0 ? `${Math.abs(daysVariance)} days behind` : ''}</span>
            </div>
            <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.25rem', marginBottom: '1.5rem' }}>Avg. Composite Score</div>
             <div style={{ height: '8px', position: 'relative' }}> {/* Radial Graph could go here */} </div>
          </Quadrant>
        </div>
        
        {/* Performance Lists (Dynamically Updated) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #161a33 0%, #0a0e27 100%)', borderRadius: '16px', padding: '1.5rem', border: '1px solid #1c213e' }}>
            <h3 style={{ color: '#10b981', marginBottom: '1.5rem', fontSize: '1.1rem' }}>🏆 Top Performers</h3>
            <div className={animate ? 'list-fade-in' : ''} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minHeight: '200px' }}>
              {topPerformers.length > 0 ? topPerformers.map((p, i) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
                  <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, marginRight: '1rem', flexShrink: 0 }}>#{i + 1}</div>
                  <div style={{ flex: 1 }}><div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{p.name}</div><div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>IRR: {p.irr.toFixed(1)}%   Risk: {p.riskScore}</div></div>
                </div>
              )) : <div style={{color: '#64748b', textAlign: 'center', padding: '2rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}>No projects match the selected filters.</div>}
            </div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #161a33 0%, #0a0e27 100%)', borderRadius: '16px', padding: '1.5rem', border: '1px solid #1c213e' }}>
            <h3 style={{ color: '#ef4444', marginBottom: '1.5rem', fontSize: '1.1rem' }}>📉 Bottom Performers</h3>
            <div className={animate ? 'list-fade-in' : ''} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minHeight: '200px' }}>
              {bottomPerformers.length > 0 ? bottomPerformers.map((p, i) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', borderLeft: '3px solid #ef4444' }}>
                  <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, marginRight: '1rem', flexShrink: 0 }}>#{filteredProjects.length - i}</div>
                  <div style={{ flex: 1 }}><div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{p.name}</div><div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>IRR: {p.irr.toFixed(1)}%   Risk: {p.riskScore}</div></div>
                </div>
              )) : <div style={{color: '#64748b', textAlign: 'center', padding: '2rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}>No projects match the selected filters.</div>}
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        .filter-select {
          background-color: #1e293b;
          color: #e2e8f0;
          border: 1px solid #334155;
          border-radius: 8px;
          padding: 0.6rem 1rem;
          font-size: 0.875rem;
          cursor: pointer;
          flex-grow: 1;
          -webkit-appearance: none;
          appearance: none;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 0.5rem center;
          background-repeat: no-repeat;
          background-size: 1.5em 1.5em;
        }
        .filter-select:hover {
          border-color: #4f46e5;
        }
        .reset-filter-btn {
          background: transparent;
          border: 1px solid #ef4444;
          color: #ef4444;
          padding: 0.6rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 600;
        }
        .reset-filter-btn:hover:not(:disabled) {
          background: #ef4444;
          color: white;
        }
        .reset-filter-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          border-color: rgba(239, 68, 68, 0.4);
          color: rgba(239, 68, 68, 0.4);
        }
        @keyframes pulse-bg {
          0% { background-color: rgba(59, 130, 246, 0.1); }
          100% { background-color: linear-gradient(135deg, #161a33 0%, #0a0e27 100%); }
        }
        .metric-pulse {
          animation: pulse-bg 0.6s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .list-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};