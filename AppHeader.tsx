// AppHeader.tsx - Application header with logo and controls
'use client'
import React, { useState } from 'react';
import { Sparkles, ChevronDown, Upload, Download, FileUp, FileDown, StickyNote, Settings, Bot, Calendar, Trash2, Sun, Moon, Maximize, User, FileText, RefreshCw, HelpCircle } from 'lucide-react';
import { useToast } from './ToastContainer';

interface HeaderProps {
  onThemeChange: (theme: 'dark' | 'light') => void;
  onFullscreenToggle: () => void;
  currentTheme: 'dark' | 'light';
  isFullscreen: boolean;
  title?: string;
  subtitle?: string;
  onShowAssistant?: () => void;
  onClearAllData?: () => void;
  onShowWorkspaceManager?: () => void;
  onStartTutorial?: () => void;
}

export const AppHeader: React.FC<HeaderProps> = ({ 
  onThemeChange, 
  onFullscreenToggle, 
  currentTheme, 
  isFullscreen,
  title = "Capital Allocation System",
  subtitle = "Strategic Investment Portfolio Management",
  onShowAssistant,
  onClearAllData,
  onShowWorkspaceManager,
  onStartTutorial
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showTadaMenu, setShowTadaMenu] = useState(false);
  const [showTutorialModal, setShowTutorialModal] = useState(false);
  const toast = useToast();

  const handleExport = () => {
    // Export functionality
    console.log('Export functionality to be implemented');
  };

  const handleTadaAction = (action: string) => {
    console.log(`🔧 TADA action: ${action}`);
    setShowTadaMenu(false);
    
    // Handle specific actions
    if (action === 'manage-workspace' && onShowWorkspaceManager) {
      console.log('🚀 Triggering workspace manager');
      onShowWorkspaceManager();
    }
    // Other functionality to be implemented later
  };

  const handleClearAllData = () => {
    toast.warning(
      'Clear All Data?',
      'This action will permanently delete all data and cannot be undone.',
      0, // No auto-dismiss
      {
        label: 'Clear Data',
        onClick: () => {
          if (onClearAllData) {
            onClearAllData();
          }
          toast.success('Data Cleared', 'All application data has been cleared successfully.');
        }
      }
    );
  };

  const handleClearCacheAndCookies = () => {
    toast.warning(
      'Clear Cache & Cookies?',
      'This will clear all cached data and cookies. You may need to sign in again.',
      0, // No auto-dismiss
      {
        label: 'Clear Cache',
        onClick: () => {
          // Clear localStorage
          localStorage.clear();
          
          // Clear sessionStorage
          sessionStorage.clear();
      
      // Clear cookies (limited to same domain)
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      // Clear cache using Cache API if available
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => {
            caches.delete(name);
          });
        });
      }
          
          toast.success('Cache Cleared', 'Cache and cookies cleared successfully. Page will refresh now.');
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      }
    );
  };

  const handleStartTutorial = () => {
    if (onStartTutorial) {
      onStartTutorial();
    } else {
      setShowTutorialModal(true);
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
    <>
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
            {/* TADA AI Assistant Button */}
            {onShowAssistant && (
              <button 
                className="ai-assistant-btn tada-ai-btn"
                onClick={onShowAssistant}
                title="Launch TADA AI Assistant"
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: '2px solid transparent',
                  cursor: 'pointer',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginRight: '4px',
                  boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(139, 92, 246, 0.3)';
                }}
              >
                {/* Animated border effect */}
                <div className="tada-ai-border" style={{
                  position: 'absolute',
                  top: '-2px',
                  left: '-2px',
                  right: '-2px',
                  bottom: '-2px',
                  background: 'linear-gradient(45deg, #8b5cf6, #6366f1, #8b5cf6, #6366f1)',
                  backgroundSize: '300% 300%',
                  borderRadius: '8px',
                  opacity: 0.8,
                  zIndex: -2
                }} />
                
                {/* Background TADA logo watermark */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  opacity: 0.1,
                  fontSize: '40px',
                  fontWeight: 'bold',
                  letterSpacing: '-2px',
                  zIndex: -1,
                  animation: 'pulse 2s ease-in-out infinite'
                }}>
                  TADA
                </div>
                
                {/* Floating particles effect */}
                <div className="particles-container" style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  overflow: 'hidden',
                  zIndex: -1
                }}>
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      style={{
                        position: 'absolute',
                        width: '4px',
                        height: '4px',
                        background: 'rgba(255, 255, 255, 0.6)',
                        borderRadius: '50%',
                        bottom: '-4px',
                        left: `${20 + i * 30}%`,
                        animation: `float ${2 + i * 0.5}s ease-in-out infinite`,
                        animationDelay: `${i * 0.3}s`
                      }}
                    />
                  ))}
                </div>
                
                {/* T Symbol with glow */}
                <div style={{
                  width: '22px',
                  height: '22px',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%)',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  boxShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
                  animation: 'tGlow 2s ease-in-out infinite alternate',
                  position: 'relative',
                  zIndex: 1
                }}>
                  T
                </div>
                
                <span style={{ position: 'relative', zIndex: 1 }}>TADA AI</span>
                
                {/* Shimmer effect */}
                <div className="shimmer" style={{
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                  animation: 'shimmer 3s ease-in-out infinite'
                }} />
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
                  marginRight: '0.5rem',
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

            {/* Clear Cache & Cookies Button */}
            <button 
              className="control-btn"
              onClick={handleClearCacheAndCookies}
              title="Clear Cache & Cookies"
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
                                  marginRight: '4px',
                transition: 'all 0.2s ease',
                width: '36px',
                height: '36px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#3b82f6';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = currentTheme === 'dark' ? '#334155' : '#f1f5f9';
                e.currentTarget.style.color = currentTheme === 'dark' ? '#e2e8f0' : '#475569';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <RefreshCw size={16} />
            </button>

            {/* Tutorial/Help Button */}
            <button 
              className="control-btn"
              onClick={handleStartTutorial}
              title="Start Tutorial"
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
                e.currentTarget.style.background = '#10b981';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = currentTheme === 'dark' ? '#334155' : '#f1f5f9';
                e.currentTarget.style.color = currentTheme === 'dark' ? '#e2e8f0' : '#475569';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <HelpCircle size={16} />
            </button>

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
                marginRight: '0.125rem',
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

      {/* Tutorial Modal */}
      {showTutorialModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: currentTheme === 'dark' ? '#1e293b' : '#ffffff',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowTutorialModal(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'transparent',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: currentTheme === 'dark' ? '#e2e8f0' : '#1f2937'
              }}
            >
              ×
            </button>
            
            <h2 style={{
              color: currentTheme === 'dark' ? '#ffffff' : '#1f2937',
              marginBottom: '1.5rem'
            }}>
              Welcome to Adani Growth System
            </h2>
            
            <div style={{ color: currentTheme === 'dark' ? '#e2e8f0' : '#4b5563' }}>
              <h3 style={{ color: currentTheme === 'dark' ? '#00b8d4' : '#0066cc', marginBottom: '1rem' }}>
                Getting Started
              </h3>
              
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ marginBottom: '0.5rem' }}>Step 1: Set Investment Priorities</h4>
                <p style={{ marginBottom: '1rem' }}>
                  Navigate to Tab 1 to define your investment priorities. Adjust the weight sliders to allocate capital across different sectors. The total must equal 100%.
                </p>
                
                <h4 style={{ marginBottom: '0.5rem' }}>Step 2: Source Opportunities</h4>
                <p style={{ marginBottom: '1rem' }}>
                  In Tab 2, browse and evaluate investment opportunities. Filter by status, risk level, and strategic fit score to find the best matches.
                </p>
                
                <h4 style={{ marginBottom: '0.5rem' }}>Step 3: Validate Projects</h4>
                <p style={{ marginBottom: '1rem' }}>
                  Tab 3 allows you to validate selected opportunities, converting them into investment-ready projects with comprehensive scoring.
                </p>
                
                <h4 style={{ marginBottom: '0.5rem' }}>Step 4: Allocate by Sector</h4>
                <p style={{ marginBottom: '1rem' }}>
                  Use Tab 4 to optimize capital allocation across different sectors based on your priorities and constraints.
                </p>
                
                <h4 style={{ marginBottom: '0.5rem' }}>Step 5: Monitor & Analyze</h4>
                <p>
                  Tabs 5-7 provide data quality checks, portfolio monitoring, and what-if analysis capabilities.
                </p>
              </div>
              
              <h3 style={{ color: currentTheme === 'dark' ? '#00b8d4' : '#0066cc', marginBottom: '1rem' }}>
                Key Features
              </h3>
              
              <ul style={{ paddingLeft: '1.5rem', marginBottom: '2rem' }}>
                <li>AI Assistant: Get intelligent recommendations for your portfolio</li>
                <li>Excel/CSV Import: Bulk upload data (coming soon)</li>
                <li>Real-time Analytics: Monitor portfolio performance</li>
                <li>What-If Analysis: Test different scenarios</li>
              </ul>
              
              <button
                onClick={() => setShowTutorialModal(false)}
                style={{
                  background: 'linear-gradient(135deg, #00b8d4 0%, #0066cc 100%)',
                  color: 'white',
                  padding: '0.75rem 2rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                  width: '100%',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Start Using Adani Growth System
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add CSS animations */}
      <style>{`
        @keyframes borderGlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes pulse {
          0% { opacity: 0.1; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.15; transform: translate(-50%, -50%) scale(1.05); }
          100% { opacity: 0.1; transform: translate(-50%, -50%) scale(1); }
        }
        
        @keyframes float {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          20% { opacity: 0.6; }
          80% { opacity: 0.6; }
          100% { transform: translateY(-30px) translateX(10px); opacity: 0; }
        }
        
        @keyframes tGlow {
          0% { box-shadow: 0 0 10px rgba(255, 255, 255, 0.3); }
          100% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.5), 0 0 30px rgba(139, 92, 246, 0.3); }
        }
        
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 200%; }
        }
        
        .tada-ai-btn .tada-ai-border {
          animation: borderGlow 3s ease-in-out infinite;
        }
        
        .tada-ai-btn:hover .particles-container div {
          animation-duration: 1.5s !important;
        }
        
        .tada-ai-btn:hover .shimmer {
          animation-duration: 1.5s !important;
        }
      `}</style>
    </>
  );
};