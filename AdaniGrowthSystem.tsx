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

  // Calculate summary metrics for nav bar
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
      
      <div className="tab-navigation adani-nav">
        <div className="tab-buttons">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              title={tab.description}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
        
        <div className="nav-info adani-nav-info">
          <div className="nav-metric">
            <span className="metric-label">Total Capital</span>
            <span className="metric-value">{formatCurrency(totalAllocatedCapital)}</span>
          </div>
          <div className="nav-metric">
            <span className="metric-label">Pipeline Value</span>
            <span className="metric-value">{formatCurrency(totalPipelineValue)}</span>
          </div>
          <div className="nav-metric">
            <span className="metric-label">Approved</span>
            <span className="metric-value">{selectedOpportunities} / {appState.opportunities.length}</span>
          </div>
          <div className="nav-metric deployment-speed">
            <span className="metric-label">Target Speed</span>
            <span className="metric-value">6-9 weeks</span>
          </div>
        </div>
      </div>

      <div className="tab-container adani-tab-container">
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