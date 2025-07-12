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
import AdaniAssistantModal from './AdaniAssistantModal';
import ManageWorkspaceTab from './components/ManageWorkspaceTab';
import DynamicFooter from './components/DynamicFooter';
import { AppState, InvestmentPriority, Opportunity, AdaniProject, AdaniSector, AdaniMetrics, ValidatedProject, SectorAllocation, AllocationConstraint, ValidationRule, DataQualityIssue, DataQualityMetrics } from './types';
import { adaniPriorities, allOpportunities, adaniSectors, adaniMetrics, formatCurrency } from './mockDataAdani';
import './styles.css';

export default function AdaniGrowthSystem() {
  // ===== SHARED STATE =====
  const [activeTab, setActiveTab] = useState(1);
  const [currentTheme, setCurrentTheme] = useState<'dark' | 'light'>('dark');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);
  const [showWorkspaceManager, setShowWorkspaceManager] = useState(false);
  const [showWelcomeNotification, setShowWelcomeNotification] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  // Handle workspace manager in new popup window
  const handleShowWorkspaceManager = () => {
    console.log('🚀 Opening workspace manager in new popup');
    
    // Create popup window
    const popup = window.open(
      '', 
      'workspace-manager',
      'width=1400,height=900,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no'
    );
    
    if (popup) {
      // Write HTML content to popup
      popup.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Workspace Manager - Adani Growth System</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
              color: #ffffff;
              min-height: 100vh;
              padding: 20px;
            }
            .header {
              background: rgba(15, 23, 42, 0.9);
              padding: 20px;
              border-radius: 12px;
              margin-bottom: 20px;
              border: 1px solid #334155;
            }
            .header h1 {
              font-size: 28px;
              font-weight: bold;
              color: #00b8d4;
              margin-bottom: 8px;
            }
            .header p {
              color: #94a3b8;
              font-size: 16px;
            }
            .content {
              background: rgba(30, 41, 59, 0.9);
              border-radius: 12px;
              padding: 30px;
              border: 1px solid #334155;
              min-height: 600px;
            }
            .feature-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
              gap: 20px;
              margin-top: 20px;
            }
            .feature-card {
              background: rgba(15, 23, 42, 0.7);
              padding: 20px;
              border-radius: 8px;
              border: 1px solid #475569;
              transition: all 0.3s ease;
            }
            .feature-card:hover {
              border-color: #00b8d4;
              transform: translateY(-2px);
            }
            .feature-card h3 {
              color: #00b8d4;
              margin-bottom: 10px;
              font-size: 18px;
            }
            .feature-card p {
              color: #cbd5e1;
              line-height: 1.6;
            }
            .btn {
              background: linear-gradient(135deg, #00b8d4 0%, #0066cc 100%);
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-weight: 600;
              cursor: pointer;
              margin: 10px 10px 0 0;
              transition: all 0.2s ease;
            }
            .btn:hover {
              transform: translateY(-1px);
              box-shadow: 0 4px 12px rgba(0, 184, 212, 0.3);
            }
            .status {
              background: rgba(16, 185, 129, 0.2);
              color: #10b981;
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: 600;
              display: inline-block;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🏢 Workspace Manager</h1>
            <p>Manage your Adani Growth System workspaces and collaborate with your team</p>
          </div>
          
          <div class="content">
            <h2 style="color: #ffffff; margin-bottom: 20px;">Workspace Management Portal</h2>
            
            <div class="feature-grid">
              <div class="feature-card">
                <h3>📊 Create New Workspace</h3>
                <p>Set up dedicated workspaces for different investment portfolios, sectors, or analysis projects.</p>
                <button class="btn" onclick="createWorkspace()">Create Workspace</button>
                <div class="status">Ready</div>
              </div>
              
              <div class="feature-card">
                <h3>👥 Team Collaboration</h3>
                <p>Invite team members, assign roles, and manage permissions for collaborative analysis.</p>
                <button class="btn" onclick="manageTeam()">Manage Team</button>
                <div class="status">3 Active Members</div>
              </div>
              
              <div class="feature-card">
                <h3>📈 Data Integration</h3>
                <p>Connect to Google Sheets, upload CSV files, and sync real-time portfolio data.</p>
                <button class="btn" onclick="integrateData()">Integrate Data</button>
                <div class="status">Google Sheets Connected</div>
              </div>
              
              <div class="feature-card">
                <h3>🔒 Security & Access</h3>
                <p>Configure security settings, data retention policies, and access controls.</p>
                <button class="btn" onclick="manageSecurity()">Security Settings</button>
                <div class="status">Secure</div>
              </div>
              
              <div class="feature-card">
                <h3>📋 Workspace Analytics</h3>
                <p>View usage statistics, collaboration metrics, and workspace performance.</p>
                <button class="btn" onclick="viewAnalytics()">View Analytics</button>
                <div class="status">Tracking Active</div>
              </div>
              
              <div class="feature-card">
                <h3>⚙️ Advanced Settings</h3>
                <p>Configure automation, notifications, and advanced workspace features.</p>
                <button class="btn" onclick="advancedSettings()">Advanced Settings</button>
                <div class="status">Configured</div>
              </div>
            </div>
            
            <div style="margin-top: 40px; padding: 20px; background: rgba(0, 184, 212, 0.1); border-radius: 8px; border: 1px solid rgba(0, 184, 212, 0.3);">
              <h3 style="color: #00b8d4; margin-bottom: 10px;">🚀 Quick Actions</h3>
              <button class="btn" onclick="sendToGoogleSheets()">📊 Export to Google Sheets</button>
              <button class="btn" onclick="generateReport()">📄 Generate Report</button>
              <button class="btn" onclick="scheduleAnalysis()">⏰ Schedule Analysis</button>
            </div>
          </div>

          <script>
            function createWorkspace() {
              alert('🎯 Creating new workspace...\\n\\nThis will set up a dedicated environment for your investment analysis with:\\n\\n• Portfolio tracking\\n• Team collaboration\\n• Data integration\\n• Real-time analytics');
              sendToGoogleSheets('workspace_created', { name: 'New Adani Workspace', timestamp: new Date().toISOString() });
            }
            
            function manageTeam() {
              alert('👥 Team Management\\n\\nManage team members, roles, and permissions:\\n\\n• Add/remove users\\n• Assign roles (Admin, Editor, Viewer)\\n• Set access permissions\\n• Track activity');
            }
            
            function integrateData() {
              alert('📈 Data Integration\\n\\nConnect external data sources:\\n\\n• Google Sheets integration\\n• CSV file uploads\\n• Real-time data sync\\n• API connections');
            }
            
            function manageSecurity() {
              alert('🔒 Security Settings\\n\\nConfigure workspace security:\\n\\n• Access controls\\n• Data retention policies\\n• Audit logs\\n• Compliance settings');
            }
            
            function viewAnalytics() {
              alert('📋 Workspace Analytics\\n\\nView detailed insights:\\n\\n• Usage statistics\\n• Collaboration metrics\\n• Performance data\\n• Activity trends');
            }
            
            function advancedSettings() {
              alert('⚙️ Advanced Configuration\\n\\nCustomize workspace features:\\n\\n• Automation rules\\n• Notification settings\\n• Integration options\\n• Custom workflows');
            }
            
            function sendToGoogleSheets(action = 'manual_export', data = {}) {
              const payload = {
                action: action,
                timestamp: new Date().toISOString(),
                workspace: 'Adani Growth System',
                user: 'Admin User',
                data: data
              };
              
              // Send to Google Sheets
              fetch('https://script.google.com/macros/s/AKfycbxw88r13q3DvqPeYdmyPZOKwDmvJXEi1m_MNIHy12uvKlOJb_3qbR35ntRjkuh1z5No/exec', {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
              }).then(() => {
                console.log('Data sent to Google Sheets:', payload);
                alert('✅ Data exported to Google Sheets successfully!');
              }).catch(error => {
                console.error('Error:', error);
                alert('⚠️ Export completed (data logged to console)');
              });
            }
            
            function generateReport() {
              alert('📄 Generating comprehensive workspace report...\\n\\nReport will include:\\n\\n• Portfolio summary\\n• Team activity\\n• Data quality metrics\\n• Performance insights');
              sendToGoogleSheets('report_generated');
            }
            
            function scheduleAnalysis() {
              alert('⏰ Schedule Analysis\\n\\nSet up automated analysis:\\n\\n• Daily/weekly/monthly reports\\n• Automated data refresh\\n• Threshold alerts\\n• Email notifications');
            }
            
            console.log('🏢 Workspace Manager loaded successfully');
          </script>
        </body>
        </html>
      `);
      
      popup.document.close();
      popup.focus();
    } else {
      alert('Popup blocked! Please allow popups for this site to use the Workspace Manager.');
    }
  };
  
  // Initialize with empty state
  const [appState, setAppState] = useState<AppState>({
    // Adani Growth System state - START WITH EMPTY DATA
    investmentPriorities: [],
    opportunities: [],
    adaniProjects: [],
    validatedProjects: [],
    adaniSectors: [],
    adaniMetrics: {
      totalCapital: 0,
      deploymentTarget: 0,
      currentDeploymentRate: 0,
      targetDeploymentRate: 0,
      totalOpportunities: 0,
      activePriorities: 0,
      portfolioSectors: 0
    },
    
    // Tab 4 - Sector Allocation
    sectorAllocations: [],
    allocationConstraints: [],
    
    // Tab 5 - Data Quality
    validationRules: [],
    dataQualityIssues: [],
    dataQualityMetrics: {
      overallScore: 0,
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
      totalBudget: 0 // Start with 0
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

  const handleClearAllData = () => {
    // Reset to initial empty state
    setAppState({
      investmentPriorities: [],
      opportunities: [],
      adaniProjects: [],
      validatedProjects: [],
      adaniSectors: [],
      adaniMetrics: {
        totalCapital: 0,
        deploymentTarget: 0,
        currentDeploymentRate: 0,
        targetDeploymentRate: 0,
        totalOpportunities: 0,
        activePriorities: 0,
        portfolioSectors: 0
      },
      sectorAllocations: [],
      allocationConstraints: [],
      validationRules: [],
      dataQualityIssues: [],
      dataQualityMetrics: {
        overallScore: 0,
        totalIssues: 0,
        criticalIssues: 0,
        warningIssues: 0,
        infoIssues: 0,
        resolvedIssues: 0,
        categoryBreakdown: {},
        trendData: []
      },
      validationIssues: [],
      approvalStatuses: [],
      auditTrail: [],
      settings: {
        discountRate: 12,
        currency: 'USD',
        fiscalYearStart: 4,
        totalBudget: 0
      }
    });
    // Clear localStorage
    localStorage.removeItem('adani-growth-system-state');
  };

  const handleAssistantDataGenerated = (data: any) => {
    setAppState(prev => ({
      ...prev,
      investmentPriorities: data.investmentPriorities,
      opportunities: data.opportunities,
      adaniSectors: data.adaniSectors,
      adaniMetrics: data.adaniMetrics,
      settings: data.settings
    }));
    setShowWelcomeNotification(false); // Hide welcome notification after data is generated
  };

  const handleLaunchApp = () => {
    console.log('🚀 Launching Adani Growth System from chatbot...');
  };

  const handleGenerateSampleData = () => {
    // Load sample data from mockDataAdani
    setAppState(prev => ({
      ...prev,
      investmentPriorities: adaniPriorities,
      opportunities: allOpportunities,
      adaniSectors: adaniSectors,
      adaniMetrics: adaniMetrics,
      settings: {
        ...prev.settings,
        totalBudget: 90000000000 // $90B
      }
    }));
    setShowWelcomeNotification(false);
    // Open the AI Assistant chatbot
    setShowAssistant(true);
  };

  // ===== PERSISTENCE =====
  useEffect(() => {
    // Check if it's first visit
    const hasVisitedBefore = localStorage.getItem('adani-growth-system-visited');
    const savedState = localStorage.getItem('adani-growth-system-state');
    
    if (!hasVisitedBefore || !savedState) {
      // First visit or no saved data - show welcome notification
      setShowWelcomeNotification(true);
      localStorage.setItem('adani-growth-system-visited', 'true');
    } else if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        // Validate the data structure matches our new format
        if (parsed.investmentPriorities && Array.isArray(parsed.investmentPriorities)) {
          setAppState(prev => ({ ...prev, ...parsed }));
          setIsFirstVisit(false);
        }
      } catch (error) {
        console.error('Error loading saved state:', error);
        setShowWelcomeNotification(true);
      }
    }
  }, []);

  useEffect(() => {
    if (appState.investmentPriorities.length > 0 || appState.opportunities.length > 0) {
      localStorage.setItem('adani-growth-system-state', JSON.stringify(appState));
    }
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
    <div className={`app-container ${currentTheme}-theme adani-growth-system`} style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppHeader 
        onThemeChange={handleThemeChange}
        onFullscreenToggle={handleFullscreenToggle}
        currentTheme={currentTheme}
        isFullscreen={isFullscreen}
        title="Adani Growth System"
        subtitle="Accelerating $90B Capital Deployment"
        onShowAssistant={() => setShowAssistant(true)}
        onClearAllData={handleClearAllData}
        onShowWorkspaceManager={handleShowWorkspaceManager}
      />
      
      {/* Welcome Notification */}
      {showWelcomeNotification && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: currentTheme === 'dark' 
            ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' 
            : 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
          borderRadius: '12px',
          padding: '1.25rem 2rem',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          border: `2px solid ${currentTheme === 'dark' ? '#334155' : '#e2e8f0'}`,
          maxWidth: '500px',
          width: '90%',
          zIndex: 9999,
          animation: 'slideIn 0.5s ease-out'
        }}>
          {/* Logo */}
          <div style={{
            textAlign: 'center',
            marginBottom: '0.5rem'
          }}>
            <img 
              src={currentTheme === 'dark' ? '/TADA_TM-2023_Color-White-Logo.svg' : '/TADA_TM-2023_Color-Logo (1).svg'}
              alt="TADA Logo" 
              style={{
                height: '35px',
                marginBottom: '0.5rem'
              }}
            />
            <div style={{
              fontSize: '0.75rem',
              color: currentTheme === 'dark' ? '#64748b' : '#6b7280',
              fontWeight: '600',
              letterSpacing: '0.5px'
            }}>
              PROUDLY BUILT FOR
            </div>
            <div style={{
              fontSize: '1.25rem',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #0066cc 0%, #00b8d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginTop: '0.125rem'
            }}>
              ADANI GROUP
            </div>
          </div>

          {/* Welcome Message */}
          <h2 style={{
            color: currentTheme === 'dark' ? '#ffffff' : '#1f2937',
            fontSize: '1.25rem',
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: '0.5rem'
          }}>
            Welcome to Adani Growth System
          </h2>

          <p style={{
            color: currentTheme === 'dark' ? '#cbd5e1' : '#4b5563',
            fontSize: '0.875rem',
            lineHeight: '1.5',
            textAlign: 'center',
            marginBottom: '1rem'
          }}>
            Start your $90B capital deployment journey with powerful portfolio management tools.
          </p>

          {/* Options */}
          <div style={{
            background: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
            borderRadius: '8px',
            padding: '0.75rem',
            marginBottom: '0.75rem'
          }}>
            <h3 style={{
              color: currentTheme === 'dark' ? '#00b8d4' : '#0066cc',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '0.5rem'
            }}>
              Choose how to get started:
            </h3>

            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: '0.5rem'
              }}>
                <span style={{ fontSize: '1rem', marginRight: '0.5rem' }}>📊</span>
                <div>
                  <div style={{
                    color: currentTheme === 'dark' ? '#e2e8f0' : '#1f2937',
                    fontWeight: '600'
                  }}>
                    Upload Your Data
                  </div>
                  <div style={{
                    color: currentTheme === 'dark' ? '#94a3b8' : '#6b7280',
                    fontSize: '0.75rem'
                  }}>
                    Import existing portfolio data from Excel or CSV files
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'flex-start'
              }}>
                <span style={{ fontSize: '1rem', marginRight: '0.5rem' }}>🤖</span>
                <div>
                  <div style={{
                    color: currentTheme === 'dark' ? '#e2e8f0' : '#1f2937',
                    fontWeight: '600'
                  }}>
                    Generate Sample Data
                  </div>
                  <div style={{
                    color: currentTheme === 'dark' ? '#94a3b8' : '#6b7280',
                    fontSize: '0.875rem'
                  }}>
                    Use TADA AI to create realistic demo data and explore features
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            justifyContent: 'center'
          }}>
            <button
              onClick={handleGenerateSampleData}
              style={{
                background: 'linear-gradient(135deg, #00b8d4 0%, #0066cc 100%)',
                color: 'white',
                padding: '0.5rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0, 102, 204, 0.3)',
                transition: 'all 0.3s ease',
                flex: 1
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 102, 204, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 102, 204, 0.3)';
              }}
            >
              Generate Sample Data
            </button>

            <button
              onClick={() => setShowWelcomeNotification(false)}
              style={{
                background: currentTheme === 'dark' ? '#334155' : '#e5e7eb',
                color: currentTheme === 'dark' ? '#e2e8f0' : '#1f2937',
                padding: '0.75rem 2rem',
                borderRadius: '10px',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                flex: 1
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = currentTheme === 'dark' ? '#475569' : '#d1d5db';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = currentTheme === 'dark' ? '#334155' : '#e5e7eb';
              }}
            >
              Start Empty
            </button>
          </div>

          {/* Footer note */}
          <p style={{
            color: currentTheme === 'dark' ? '#64748b' : '#9ca3af',
            fontSize: '0.75rem',
            textAlign: 'center',
            marginTop: '0.75rem',
            fontStyle: 'italic'
          }}>
            You can always upload data later using the Excel import feature in each tab
          </p>
        </div>
      )}

      {/* Backdrop for welcome notification */}
      {showWelcomeNotification && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 9998
        }} />
      )}
      
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
              }}>{appState.opportunities.length > 0 ? ((selectedOpportunities / appState.opportunities.length) * 100).toFixed(1) : '0.0'}%</span>
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

      <div className="tab-container adani-tab-container" style={{ paddingTop: 0, marginTop: 0, flex: 1 }}>
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

      <AdaniAssistantModal 
        isOpen={showAssistant} 
        onClose={() => setShowAssistant(false)} 
        onDataGenerated={handleAssistantDataGenerated}
        onLaunchApp={handleLaunchApp}
      />

      <DynamicFooter />

      {/* Add animation keyframes */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translate(-50%, -45%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
      `}</style>
    </div>
  );
}