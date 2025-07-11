'use client'
import React, { useState, useEffect } from 'react';
import { AppHeader } from './AppHeader';
import { Tab1_SetPriorities } from './Tab1_SetPriorities';
import { Tab2_SourceOpportunities } from './Tab2_SourceOpportunities';
import { Tab3_ValidateProjects } from './Tab3_ValidateProjects';
import { Tab4_AllocateBySector } from './Tab4_AllocateBySector';
import { Tab5_EnsureDataQuality } from './Tab5_EnsureDataQuality';
import { Tab6_MonitorPortfolio } from './Tab6_MonitorPortfolio';
import { Tab7_WhatIfAnalysis } from './Tab7_WhatIfAnalysis';
import { AppState, InvestmentPriority, Opportunity, AdaniProject, AdaniSector, AdaniMetrics, ValidatedProject, SectorAllocation, AllocationConstraint, ValidationRule, DataQualityIssue, DataQualityMetrics } from './types';
import { adaniPriorities, allOpportunities, adaniSectors, adaniMetrics, formatCurrency } from './mockDataAdani';
import './styles.css';

export default function AdaniGrowthSystem() {
  // ===== SHARED STATE =====
  const [activeTab, setActiveTab] = useState(1);
  const [currentTheme, setCurrentTheme] = useState<'dark' | 'light'>('dark');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [appState, setAppState] = useState<AppState>({
    // Adani Growth System state
    investmentPriorities: adaniPriorities,
    opportunities: allOpportunities,
    adaniProjects: [],
    validatedProjects: [],
    adaniSectors: adaniSectors,
    adaniMetrics: adaniMetrics,
    
    // Tab 4 - Sector Allocation
    sectorAllocations: [],
    allocationConstraints: [],
    
    // Tab 5 - Data Quality
    validationRules: [],
    dataQualityIssues: [],
    dataQualityMetrics: {
      overallScore: 85,
      totalIssues: 0,
      criticalIssues: 0,
      warningIssues: 0,
      infoIssues: 0,
      resolvedIssues: 0,
      categoryBreakdown: {},
      trendData: []
    },
    
    // Validation and approval
    validationIssues: [],
    approvalStatuses: [],
    auditTrail: [],
    
    // System settings
    settings: {
      discountRate: 12,
      currency: 'USD',
      fiscalYearStart: 4, // April
      totalBudget: 90000000000 // $90B
    }
  });

  // ===== HANDLERS =====
  const handlePrioritiesUpdate = (data: { priorities: InvestmentPriority[] }) => {
    setAppState(prev => ({
      ...prev,
      investmentPriorities: data.priorities
    }));
  };

  const handleOpportunitiesUpdate = (data: { opportunities: Opportunity[] }) => {
    setAppState(prev => ({
      ...prev,
      opportunities: data.opportunities
    }));
  };

  const handleProjectsUpdate = (data: { projects: AdaniProject[] }) => {
    setAppState(prev => ({
      ...prev,
      adaniProjects: data.projects
    }));
  };

  const handleValidatedProjectsUpdate = (data: { validatedProjects: ValidatedProject[] }) => {
    setAppState(prev => ({
      ...prev,
      validatedProjects: data.validatedProjects
    }));
  };

  const handleSectorAllocationUpdate = (data: { 
    sectorAllocations: SectorAllocation[];
    allocationConstraints: AllocationConstraint[];
  }) => {
    setAppState(prev => ({
      ...prev,
      sectorAllocations: data.sectorAllocations,
      allocationConstraints: data.allocationConstraints
    }));
  };

  const handleDataQualityUpdate = (data: { 
    validationRules: ValidationRule[];
    dataQualityIssues: DataQualityIssue[];
    dataQualityMetrics: DataQualityMetrics;
  }) => {
    setAppState(prev => ({
      ...prev,
      validationRules: data.validationRules,
      dataQualityIssues: data.dataQualityIssues,
      dataQualityMetrics: data.dataQualityMetrics
    }));
  };

  const handleSectorsUpdate = (data: { sectors: AdaniSector[] }) => {
    setAppState(prev => ({
      ...prev,
      adaniSectors: data.sectors
    }));
  };

  const handleValidationUpdate = (data: { validationIssues: any[]; approvalStatuses: any[] }) => {
    setAppState(prev => ({
      ...prev,
      validationIssues: data.validationIssues,
      approvalStatuses: data.approvalStatuses
    }));
  };

  const handleThemeChange = (theme: 'dark' | 'light') => {
    setCurrentTheme(theme);
    document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
  };

  const handleFullscreenToggle = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  // ===== PERSISTENCE =====
  useEffect(() => {
    // Clear old data and start fresh
    localStorage.removeItem('strategic-allocation-data');
    localStorage.removeItem('allocation-data');
    localStorage.removeItem('capital-allocation-state');
    
    const savedState = localStorage.getItem('adani-growth-system-state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        // Validate the data structure matches our new format
        if (parsed.investmentPriorities && Array.isArray(parsed.investmentPriorities)) {
          setAppState(prev => ({ ...prev, ...parsed }));
        } else {
          // Clear invalid old data
          localStorage.removeItem('adani-growth-system-state');
        }
      } catch (error) {
        console.error('Error loading saved state:', error);
        localStorage.removeItem('adani-growth-system-state');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('adani-growth-system-state', JSON.stringify(appState));
  }, [appState]);

  // ===== TAB CONFIGURATION =====
  const tabs = [
    { id: 1, label: '1. Set Priorities', icon: '🎯', description: 'Define investment priorities and capital allocation targets' },
    { id: 2, label: '2. Source Opportunities', icon: '🔍', description: 'Manage pipeline of investment opportunities' },
    { id: 3, label: '3. Validate Projects', icon: '✅', description: 'Evaluate and validate project business cases' },
    { id: 4, label: '4. Allocate by Sector', icon: '🏭', description: 'Optimize capital allocation across sectors' },
    { id: 5, label: '5. Ensure Data Quality', icon: '🛡️', description: 'Validate data integrity and completeness' },
    { id: 6, label: '6. Monitor Portfolio', icon: '📊', description: 'Track portfolio performance and metrics' },
    { id: 7, label: '7. What-If Analysis', icon: '🎲', description: 'Scenario modeling and sensitivity analysis' }
  ];

  // Calculate summary metrics
  const selectedOpportunities = appState.opportunities.filter(opp => opp.status === 'approved').length;
  const totalPipelineValue = appState.opportunities.reduce((sum, opp) => sum + opp.investmentRange.max, 0);
  const totalAllocatedCapital = appState.investmentPriorities.reduce((sum, pri) => sum + pri.capitalAllocation, 0);

  // ===== RENDER SECTION =====
  return (
    <div className={`app-container ${currentTheme}-theme adani-growth-system`}>
      <AppHeader 
        onThemeChange={handleThemeChange}
        onFullscreenToggle={handleFullscreenToggle}
        currentTheme={currentTheme}
        isFullscreen={isFullscreen}
        title="Adani Growth System"
        subtitle="Accelerating $90B Capital Deployment"
      />
      
      {/* OPTIMIZED Key Metrics Bar - Compact & Consistent */}
      <div style={{
        background: 'linear-gradient(135deg, #0a0e27 0%, #1e293b 100%)',
        borderBottom: '1px solid rgba(0, 184, 212, 0.3)',
        padding: '1rem 2rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1400px',
          margin: '0 auto',
          gap: '0.75rem'
        }}>
          {/* TOTAL CAPITAL */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(0, 184, 212, 0.2)',
            borderLeft: '3px solid #10b981',
            borderRadius: '10px',
            padding: '0.875rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            flex: '1',
            minWidth: '0'
          }}>
            <div style={{ fontSize: '1.5rem', color: '#10b981', flexShrink: 0 }}>💰</div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.125rem'
            }}>
              <span style={{
                color: '#94a3b8',
                fontSize: '0.6875rem',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                margin: 0,
                lineHeight: 1
              }}>TOTAL CAPITAL</span>
              <span style={{
                color: '#ffffff',
                fontSize: '1.25rem',
                fontWeight: '700',
                lineHeight: 1,
                margin: 0
              }}>{formatCurrency(totalAllocatedCapital)}</span>
            </div>
          </div>

          {/* PIPELINE VALUE */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(0, 184, 212, 0.2)',
            borderLeft: '3px solid #3b82f6',
            borderRadius: '10px',
            padding: '0.875rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            flex: '1',
            minWidth: '0'
          }}>
            <div style={{ fontSize: '1.5rem', color: '#3b82f6', flexShrink: 0 }}>🚀</div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.125rem'
            }}>
              <span style={{
                color: '#94a3b8',
                fontSize: '0.6875rem',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                margin: 0,
                lineHeight: 1
              }}>PIPELINE VALUE</span>
              <span style={{
                color: '#ffffff',
                fontSize: '1.25rem',
                fontWeight: '700',
                lineHeight: 1,
                margin: 0
              }}>{formatCurrency(totalPipelineValue)}</span>
            </div>
          </div>

          {/* ACTIVE PROJECTS */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(0, 184, 212, 0.2)',
            borderLeft: '3px solid #8b5cf6',
            borderRadius: '10px',
            padding: '0.875rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            flex: '1',
            minWidth: '0'
          }}>
            <div style={{ fontSize: '1.5rem', color: '#8b5cf6', flexShrink: 0 }}>📊</div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.125rem'
            }}>
              <span style={{
                color: '#94a3b8',
                fontSize: '0.6875rem',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                margin: 0,
                lineHeight: 1
              }}>ACTIVE PROJECTS</span>
              <span style={{
                color: '#ffffff',
                fontSize: '1.25rem',
                fontWeight: '700',
                lineHeight: 1,
                margin: 0
              }}>{selectedOpportunities}</span>
            </div>
          </div>

          {/* CONVERSION RATE */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(0, 184, 212, 0.2)',
            borderLeft: '3px solid #f59e0b',
            borderRadius: '10px',
            padding: '0.875rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            flex: '1',
            minWidth: '0'
          }}>
            <div style={{ fontSize: '1.5rem', color: '#f59e0b', flexShrink: 0 }}>📈</div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.125rem'
            }}>
              <span style={{
                color: '#94a3b8',
                fontSize: '0.6875rem',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                margin: 0,
                lineHeight: 1
              }}>CONVERSION RATE</span>
              <span style={{
                color: '#ffffff',
                fontSize: '1.25rem',
                fontWeight: '700',
                lineHeight: 1,
                margin: 0
              }}>{((selectedOpportunities / appState.opportunities.length) * 100).toFixed(1)}%</span>
            </div>
          </div>

          {/* PORTFOLIO IRR */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(0, 184, 212, 0.2)',
            borderLeft: '3px solid #06b6d4',
            borderRadius: '10px',
            padding: '0.875rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            flex: '1',
            minWidth: '0'
          }}>
            <div style={{ fontSize: '1.5rem', color: '#06b6d4', flexShrink: 0 }}>💎</div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.125rem'
            }}>
              <span style={{
                color: '#94a3b8',
                fontSize: '0.6875rem',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                margin: 0,
                lineHeight: 1
              }}>PORTFOLIO IRR</span>
              <span style={{
                color: '#ffffff',
                fontSize: '1.25rem',
                fontWeight: '700',
                lineHeight: 1,
                margin: 0
              }}>18.2%</span>
            </div>
          </div>

          {/* TARGET SPEED */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(0, 184, 212, 0.2)',
            borderLeft: '3px solid #ef4444',
            borderRadius: '10px',
            padding: '0.875rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            flex: '1',
            minWidth: '0'
          }}>
            <div style={{ fontSize: '1.5rem', color: '#ef4444', flexShrink: 0 }}>⚡</div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.125rem'
            }}>
              <span style={{
                color: '#94a3b8',
                fontSize: '0.6875rem',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                margin: 0,
                lineHeight: 1
              }}>TARGET SPEED</span>
              <span style={{
                color: '#ffffff',
                fontSize: '1.25rem',
                fontWeight: '700',
                lineHeight: 1,
                margin: 0
              }}>6-9 weeks</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* PROFESSIONAL Tab Navigation */}
      <div style={{
        background: '#1e293b',
        borderBottom: '1px solid #334155',
        padding: '0.75rem 2rem',
        display: 'flex',
        justifyContent: 'center',
        minHeight: '60px'
      }}>
        <div style={{
          display: 'flex',
          gap: '0',
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '0.5rem',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'relative'
        }}>
          {tabs.map((tab, index) => (
            <React.Fragment key={tab.id}>
              <button
                onClick={() => setActiveTab(tab.id)}
                title={tab.description}
                style={{
                  padding: '0.75rem 1.25rem',
                  background: activeTab === tab.id 
                    ? 'linear-gradient(135deg, #0066cc 0%, #00b8d4 100%)' 
                    : 'transparent',
                  border: 'none',
                  color: activeTab === tab.id ? '#ffffff' : '#94a3b8',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  fontSize: '0.8125rem',
                  fontWeight: activeTab === tab.id ? '600' : '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: activeTab === tab.id 
                    ? '0 4px 12px rgba(0, 102, 204, 0.3)' 
                    : 'none',
                  transform: activeTab === tab.id ? 'translateY(-1px)' : 'translateY(0)',
                  minWidth: '140px',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.color = '#94a3b8';
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {/* Active tab glow overlay */}
                {activeTab === tab.id && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%)',
                    pointerEvents: 'none'
                  }} />
                )}
                
                <span style={{
                  fontSize: '1rem',
                  filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))',
                  position: 'relative',
                  zIndex: 1
                }}>
                  {tab.icon}
                </span>
                <span style={{
                  textShadow: activeTab === tab.id ? '0 1px 2px rgba(0, 0, 0, 0.2)' : 'none',
                  position: 'relative',
                  zIndex: 1,
                  fontSize: '0.8125rem',
                  whiteSpace: 'nowrap'
                }}>
                  {tab.label}
                </span>
              </button>
              
              {/* Semi-transparent separator line */}
              {index < tabs.length - 1 && (
                <div style={{
                  width: '1px',
                  height: '32px',
                  background: 'linear-gradient(to bottom, transparent 0%, rgba(255, 255, 255, 0.15) 20%, rgba(255, 255, 255, 0.15) 80%, transparent 100%)',
                  alignSelf: 'center',
                  margin: '0 0.25rem'
                }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="tab-container adani-tab-container" style={{ paddingTop: 0, marginTop: 0 }}>
        {activeTab === 1 && (
          <Tab1_SetPriorities
            sharedData={{
              priorities: appState.investmentPriorities,
              totalCapital: appState.settings.totalBudget,
              sectors: appState.adaniSectors
            }}
            onDataUpdate={handlePrioritiesUpdate}
          />
        )}
        
        {activeTab === 2 && (
          <Tab2_SourceOpportunities
            sharedData={{
              opportunities: appState.opportunities,
              priorities: appState.investmentPriorities,
              sectors: appState.adaniSectors
            }}
            onDataUpdate={handleOpportunitiesUpdate}
          />
        )}
        
        {activeTab === 3 && (
          <Tab3_ValidateProjects
            sharedData={{
              opportunities: appState.opportunities,
              priorities: appState.investmentPriorities,
              validatedProjects: appState.validatedProjects,
              sectors: appState.adaniSectors
            }}
            onDataUpdate={handleValidatedProjectsUpdate}
          />
        )}
        
        {activeTab === 4 && (
          <Tab4_AllocateBySector
            sharedData={{
              validatedProjects: appState.validatedProjects,
              adaniSectors: appState.adaniSectors,
              sectorAllocations: appState.sectorAllocations,
              allocationConstraints: appState.allocationConstraints
            }}
            onDataUpdate={handleSectorAllocationUpdate}
          />
        )}
        
        {activeTab === 5 && (
          <Tab5_EnsureDataQuality
            sharedData={{
              investmentPriorities: appState.investmentPriorities,
              opportunities: appState.opportunities,
              validatedProjects: appState.validatedProjects,
              sectorAllocations: appState.sectorAllocations,
              validationRules: appState.validationRules,
              dataQualityIssues: appState.dataQualityIssues,
              dataQualityMetrics: appState.dataQualityMetrics
            }}
            onDataUpdate={handleDataQualityUpdate}
          />
        )}
        
        {activeTab === 6 && (
          <Tab6_MonitorPortfolio
            sharedData={{
              validatedProjects: appState.validatedProjects,
              investmentPriorities: appState.investmentPriorities,
              adaniSectors: appState.adaniSectors
            }}
            onDataUpdate={() => {}} // Read-only tab
          />
        )}
        
        {activeTab === 7 && (
          <Tab7_WhatIfAnalysis
            sharedData={{
              validatedProjects: appState.validatedProjects,
              investmentPriorities: appState.investmentPriorities,
              adaniSectors: appState.adaniSectors
            }}
            onDataUpdate={() => {}} // Read-only tab
          />
        )}
      </div>
    </div>
  );
}