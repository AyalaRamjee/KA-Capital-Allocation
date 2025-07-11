// AppHeader.tsx - Application header with logo and controls
'use client'
import React, { useState } from 'react';

interface HeaderProps {
  onThemeChange: (theme: 'dark' | 'light') => void;
  onFullscreenToggle: () => void;
  currentTheme: 'dark' | 'light';
  isFullscreen: boolean;
}

export const AppHeader: React.FC<HeaderProps> = ({ 
  onThemeChange, 
  onFullscreenToggle, 
  currentTheme, 
  isFullscreen 
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleExport = () => {
    // Export functionality
    console.log('Export functionality to be implemented');
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="company-logo">
          <img 
            src={currentTheme === 'dark' ? '/TADA_TM-2023_Color-White-Logo.svg' : '/TADA_TM-2023_Color-Logo (1).svg'}
            alt="Company Logo" 
            className="logo-image"
          />
        </div>
        <div className="app-title">
          <h1>Capital Allocation System</h1>
          <span className="app-subtitle">Strategic Investment Portfolio Management</span>
        </div>
      </div>

      <div className="header-right">
        <div className="header-controls">
          <button 
            className="control-btn"
            onClick={() => onThemeChange(currentTheme === 'dark' ? 'light' : 'dark')}
            title="Toggle Theme"
          >
            {currentTheme === 'dark' ? '🌞' : '🌙'}
          </button>
          
          <button 
            className="control-btn"
            onClick={onFullscreenToggle}
            title="Toggle Fullscreen"
          >
            {isFullscreen ? '🪟' : '⛶'}
          </button>
          
          <button 
            className="control-btn"
            onClick={handleExport}
            title="Export Data"
          >
            📤
          </button>
          
          <div className="user-menu">
            <button 
              className="user-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
              title="User Menu"
            >
              👤
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