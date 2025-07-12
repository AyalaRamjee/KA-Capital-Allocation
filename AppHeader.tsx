// AppHeader.tsx - Application header with logo and controls
'use client'
import React, { useState } from 'react';
import { Sparkles, ChevronDown, Upload, Download, FileUp, FileDown, StickyNote, Settings, Bot, Calendar, Trash2, Sun, Moon, Maximize, User, FileText } from 'lucide-react';

interface HeaderProps {
  onThemeChange: (theme: 'dark' | 'light') => void;
  onFullscreenToggle: () => void;
  currentTheme: 'dark' | 'light';
  isFullscreen: boolean;
  title?: string;
  subtitle?: string;
  onShowAssistant?: () => void;
  onClearAllData?: () => void;
}

export const AppHeader: React.FC<HeaderProps> = ({ 
  onThemeChange, 
  onFullscreenToggle, 
  currentTheme, 
  isFullscreen,
  title = "Capital Allocation System",
  subtitle = "Strategic Investment Portfolio Management",
  onShowAssistant,
  onClearAllData
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showTadaMenu, setShowTadaMenu] = useState(false);

  const handleExport = () => {
    // Export functionality
    console.log('Export functionality to be implemented');
  };

  const handleTadaAction = (action: string) => {
    console.log(`TADA action: ${action}`);
    setShowTadaMenu(false);
    // Functionality to be implemented later
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      if (onClearAllData) {
        onClearAllData();
      }
    }
  };

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu') && !target.closest('.tada-menu')) {
        setShowUserMenu(false);
        setShowTadaMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="company-logo">
          <img 
            src={title.includes('Adani') ? '/Adani_2012_logo.png' : (currentTheme === 'dark' ? '/TADA_TM-2023_Color-White-Logo.svg' : '/TADA_TM-2023_Color-Logo (1).svg')}
            alt="Company Logo" 
            className="logo-image"
          />
        </div>
        <div className="app-title">
          <h1>{title}</h1>
          <span className="app-subtitle">{subtitle}</span>
        </div>
      </div>

      <div className="header-right">
        <div className="header-controls">
          {/* AI Assistant Button */}
          {onShowAssistant && (
            <button 
              className="ai-assistant-btn"
              onClick={onShowAssistant}
              title="Launch AI Assistant"
              style={{
                background: 'linear-gradient(135deg, #00b8d4 0%, #0066cc 100%)',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginRight: '0.25rem',
                boxShadow: '0 2px 8px rgba(0, 184, 212, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 184, 212, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 184, 212, 0.3)';
              }}
            >
              <Sparkles size={18} />
              AI Assistant
            </button>
          )}

          {/* TADA Dropdown */}
          <div className="tada-menu" style={{ position: 'relative' }}>
            <button 
              className="tada-btn"
              onClick={() => setShowTadaMenu(!showTadaMenu)}
              title="TADA Menu"
              style={{
                background: '#6366f1',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginRight: '0.25rem',
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(99, 102, 241, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(99, 102, 241, 0.3)';
              }}
            >
              TADA
              <ChevronDown size={16} style={{
                transform: showTadaMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }} />
            </button>
            
            {showTadaMenu && (
              <div className="tada-dropdown" style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '0.5rem',
                background: currentTheme === 'dark' ? '#1e293b' : '#ffffff',
                border: `1px solid ${currentTheme === 'dark' ? '#334155' : '#e5e7eb'}`,
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                minWidth: '200px',
                zIndex: 1000,
                overflow: 'hidden'
              }}>
                <button 
                  className="tada-dropdown-item"
                  onClick={() => handleTadaAction('upload')}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: 'none',
                    background: 'transparent',
                    color: currentTheme === 'dark' ? '#e2e8f0' : '#1f2937',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'background 0.2s ease',
                    fontSize: '0.875rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = currentTheme === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <Upload size={16} />
                  Upload to TADA
                </button>
                
                <button 
                  className="tada-dropdown-item"
                  onClick={() => handleTadaAction('download')}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: 'none',
                    background: 'transparent',
                    color: currentTheme === 'dark' ? '#e2e8f0' : '#1f2937',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'background 0.2s ease',
                    fontSize: '0.875rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = currentTheme === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <Download size={16} />
                  Download from TADA
                </button>
                
                <button 
                  className="tada-dropdown-item"
                  onClick={() => handleTadaAction('files-upload')}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: 'none',
                    background: 'transparent',
                    color: currentTheme === 'dark' ? '#e2e8f0' : '#1f2937',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'background 0.2s ease',
                    fontSize: '0.875rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = currentTheme === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <FileUp size={16} />
                  Files Upload
                </button>
                
                <button 
                  className="tada-dropdown-item"
                  onClick={() => handleTadaAction('files-download')}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: 'none',
                    background: 'transparent',
                    color: currentTheme === 'dark' ? '#e2e8f0' : '#1f2937',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'background 0.2s ease',
                    fontSize: '0.875rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = currentTheme === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <FileDown size={16} />
                  Files Download
                </button>
                
                <div style={{
                  height: '1px',
                  background: currentTheme === 'dark' ? '#334155' : '#e5e7eb',
                  margin: '0.25rem 0'
                }} />
                
                <button 
                  className="tada-dropdown-item"
                  onClick={() => handleTadaAction('release-notes')}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: 'none',
                    background: 'transparent',
                    color: currentTheme === 'dark' ? '#e2e8f0' : '#1f2937',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'background 0.2s ease',
                    fontSize: '0.875rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = currentTheme === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <StickyNote size={16} />
                  Release Notes
                </button>
                
                <button 
                  className="tada-dropdown-item"
                  onClick={() => handleTadaAction('manage-workspace')}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: 'none',
                    background: 'transparent',
                    color: currentTheme === 'dark' ? '#e2e8f0' : '#1f2937',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'background 0.2s ease',
                    fontSize: '0.875rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = currentTheme === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <Settings size={16} />
                  Manage Workspace
                </button>
                
                <button 
                  className="tada-dropdown-item"
                  onClick={() => {
                    handleTadaAction('ai-assistant');
                    if (onShowAssistant) onShowAssistant();
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: 'none',
                    background: 'transparent',
                    color: currentTheme === 'dark' ? '#e2e8f0' : '#1f2937',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'background 0.2s ease',
                    fontSize: '0.875rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = currentTheme === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <Bot size={16} />
                  AI Assistant
                </button>
                
                <div style={{
                  height: '1px',
                  background: currentTheme === 'dark' ? '#334155' : '#e5e7eb',
                  margin: '0.25rem 0'
                }} />
                
                <button 
                  className="tada-dropdown-item"
                  onClick={() => handleTadaAction('request-demo')}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: 'none',
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'all 0.2s ease',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <Calendar size={16} />
                  Request a Demo
                </button>
              </div>
            )}
          </div>

          {/* Clear All Data Button */}
          {onClearAllData && (
            <button 
              className="control-btn"
              onClick={handleClearAllData}
              title="Clear All Data"
              style={{
                background: currentTheme === 'dark' ? '#334155' : '#f1f5f9',
                color: currentTheme === 'dark' ? '#e2e8f0' : '#475569',
                padding: '0.5rem',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '0.25rem',
                transition: 'all 0.2s ease',
                width: '36px',
                height: '36px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#ef4444';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = currentTheme === 'dark' ? '#334155' : '#f1f5f9';
                e.currentTarget.style.color = currentTheme === 'dark' ? '#e2e8f0' : '#475569';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Trash2 size={16} />
            </button>
          )}

          <button 
            className="control-btn"
            onClick={() => onThemeChange(currentTheme === 'dark' ? 'light' : 'dark')}
            title="Toggle Theme"
            style={{
              background: currentTheme === 'dark' ? '#334155' : '#f1f5f9',
              color: currentTheme === 'dark' ? '#e2e8f0' : '#475569',
              padding: '0.5rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '0.5rem',
              transition: 'all 0.2s ease',
              width: '36px',
              height: '36px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = currentTheme === 'dark' ? '#475569' : '#e2e8f0';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = currentTheme === 'dark' ? '#334155' : '#f1f5f9';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {currentTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          
          <button 
            className="control-btn"
            onClick={onFullscreenToggle}
            title="Toggle Fullscreen"
            style={{
              background: currentTheme === 'dark' ? '#334155' : '#f1f5f9',
              color: currentTheme === 'dark' ? '#e2e8f0' : '#475569',
              padding: '0.5rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '0.5rem',
              transition: 'all 0.2s ease',
              width: '36px',
              height: '36px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = currentTheme === 'dark' ? '#475569' : '#e2e8f0';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = currentTheme === 'dark' ? '#334155' : '#f1f5f9';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Maximize size={16} />
          </button>
          
          <button 
            className="control-btn"
            onClick={handleExport}
            title="Export Data"
            style={{
              background: currentTheme === 'dark' ? '#334155' : '#f1f5f9',
              color: currentTheme === 'dark' ? '#e2e8f0' : '#475569',
              padding: '0.5rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '0.5rem',
              transition: 'all 0.2s ease',
              width: '36px',
              height: '36px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = currentTheme === 'dark' ? '#475569' : '#e2e8f0';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = currentTheme === 'dark' ? '#334155' : '#f1f5f9';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <FileText size={16} />
          </button>
          
          <div className="user-menu">
            <button 
              className="control-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
              title="User Menu"
              style={{
                background: currentTheme === 'dark' ? '#334155' : '#f1f5f9',
                color: currentTheme === 'dark' ? '#e2e8f0' : '#475569',
                padding: '0.5rem',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                width: '36px',
                height: '36px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = currentTheme === 'dark' ? '#475569' : '#e2e8f0';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = currentTheme === 'dark' ? '#334155' : '#f1f5f9';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <User size={16} />
            </button>
            
            {showUserMenu && (
              <div className="user-dropdown">
                <div className="user-info">
                  <div className="user-name">Admin User</div>
                  <div className="user-role">Portfolio Manager</div>
                </div>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item">Settings</button>
                <button className="dropdown-item">Help</button>
                <button className="dropdown-item">Sign Out</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};