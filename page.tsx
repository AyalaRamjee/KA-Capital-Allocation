// page.tsx - Main Capital Allocation System combining all tabs
'use client'
import React, { useState, useEffect } from 'react';
import { AppHeader } from './AppHeader';
import { BusinessDomainsTab } from './Tab1_BusinessDomains';
import { ProjectRepositoryTab } from './Tab2_ProjectRepository';
import { PortfolioBuilderTab } from './Tab3_PortfolioBuilder';
import { BudgetAllocationTab } from './Tab4_BudgetAllocation';
import { DataValidationTab } from './Tab5_DataValidation';
import { BusinessDomain, Project, AppState } from './types';
import { defaultBusinessDomains, defaultProjects, defaultSettings, defaultQuarterlyLimits, defaultRiskReturnProfiles, defaultIndustryMetrics } from './mockData';
import './styles.css';

export default function CapitalAllocationSystem() {
  // ===== SHARED STATE =====
  const [activeTab, setActiveTab] = useState(1);
  const [currentTheme, setCurrentTheme] = useState<'dark' | 'light'>('dark');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [appState, setAppState] = useState<AppState>({
    businessDomains: defaultBusinessDomains,
    projects: defaultProjects,
    validationIssues: [],
    approvalStatuses: [],
    portfolioMetrics: {
      totalCapital: 0,
      totalCapex: 0,
      totalNPV: 0,
      avgIRR: 0,
      portfolioIRR: 0,
      avgPayback: 0,
      riskScore: 0,
      avgRisk: 0,
      selectedProjects: 0,
      projectCount: 0
    },
    totalBudget: defaultSettings.totalBudget,
    quarterlyLimits: defaultQuarterlyLimits,
    riskReturnProfiles: defaultRiskReturnProfiles,
    industryMetrics: defaultIndustryMetrics,
    allocationPatterns: [],
    validationRules: [],
    settings: defaultSettings
  });

  // ===== HANDLERS =====
  const handleDomainsUpdate = (data: { domains: BusinessDomain[]; totalBudget: number }) => {
    setAppState(prev => ({
      ...prev,
      businessDomains: data.domains,
      totalBudget: data.totalBudget
    }));
  };

  const handleProjectsUpdate = (data: { projects: Project[] }) => {
    setAppState(prev => ({
      ...prev,
      projects: data.projects
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
    
    const savedState = localStorage.getItem('capital-allocation-state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        // Validate the data structure matches our new format
        if (parsed.businessDomains && Array.isArray(parsed.businessDomains)) {
          setAppState(prev => ({ ...prev, ...parsed }));
        } else {
          // Clear invalid old data
          localStorage.removeItem('capital-allocation-state');
        }
      } catch (error) {
        console.error('Error loading saved state:', error);
        localStorage.removeItem('capital-allocation-state');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('capital-allocation-state', JSON.stringify(appState));
  }, [appState]);

  // ===== TAB CONFIGURATION =====
  const tabs = [
    { id: 1, label: '1. Configure Business Domains', icon: '🏢' },
    { id: 2, label: '2. Explore Project Repository', icon: '📁' },
    { id: 3, label: '3. Build Portfolio Selection', icon: '🏗️' },
    { id: 4, label: '4. Allocate Budget Timeline', icon: '💰' },
    { id: 5, label: '5. Validate Data Quality', icon: '✅' },
    { id: 6, label: '6. Analyze Performance', icon: '📊' },
    { id: 7, label: '7. Plan Scenarios', icon: '🎯' }
  ];

  // ===== RENDER SECTION =====
  return (
    <div className={`app-container ${currentTheme}-theme`}>
      <AppHeader 
        onThemeChange={handleThemeChange}
        onFullscreenToggle={handleFullscreenToggle}
        currentTheme={currentTheme}
        isFullscreen={isFullscreen}
      />
      
      <div className="tab-navigation">
        <div className="tab-buttons">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
        
        <div className="nav-info">
          <span className="budget-info">
            Total Budget: ${(appState.totalBudget / 1000000000).toFixed(1)}B
          </span>
          <span className="projects-info">
            {appState.projects.filter(p => p.status === 'selected').length} / {appState.projects.length} Projects Selected
          </span>
        </div>
      </div>

      <div className="tab-container">
        {activeTab === 1 && (
          <BusinessDomainsTab
            sharedData={{
              domains: appState.businessDomains,
              totalBudget: appState.totalBudget
            }}
            onDataUpdate={handleDomainsUpdate}
          />
        )}
        
        {activeTab === 2 && (
          <ProjectRepositoryTab
            sharedData={{
              domains: appState.businessDomains,
              projects: appState.projects
            }}
            onDataUpdate={handleProjectsUpdate}
          />
        )}
        
        {activeTab === 3 && (
          <PortfolioBuilderTab
            sharedData={{
              domains: appState.businessDomains,
              projects: appState.projects
            }}
            onDataUpdate={handleProjectsUpdate}
          />
        )}
        
        {activeTab === 4 && (
          <BudgetAllocationTab
            sharedData={{
              domains: appState.businessDomains,
              projects: appState.projects
            }}
            onDataUpdate={handleProjectsUpdate}
          />
        )}
        
        {activeTab === 5 && (
          <DataValidationTab
            sharedData={{
              domains: appState.businessDomains,
              projects: appState.projects,
              validationIssues: appState.validationIssues,
              approvalStatuses: appState.approvalStatuses
            }}
            onDataUpdate={handleValidationUpdate}
          />
        )}
        
        {activeTab === 6 && (
          <div className="tab-placeholder">
            <div className="placeholder-content">
              <h1>📊 6. Analyze Performance</h1>
              <p>Real-time portfolio analytics and insights</p>
              <div className="placeholder-features">
                <h3>Coming Soon:</h3>
                <ul>
                  <li>Portfolio performance metrics</li>
                  <li>Risk-return analysis</li>
                  <li>Domain allocation charts</li>
                  <li>ROI tracking and forecasting</li>
                  <li>Executive summary reports</li>
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 7 && (
          <div className="tab-placeholder">
            <div className="placeholder-content">
              <h1>🎯 7. Plan Scenarios</h1>
              <p>Monte Carlo simulation and stress testing</p>
              <div className="placeholder-features">
                <h3>Coming Soon:</h3>
                <ul>
                  <li>Monte Carlo simulations</li>
                  <li>Stress testing scenarios</li>
                  <li>Market condition modeling</li>
                  <li>Portfolio sensitivity analysis</li>
                  <li>Risk scenario planning</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}