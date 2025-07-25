// components/adani-assistant/AdaniAssistantModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Minimize2, Maximize2, Sparkles, Plus } from 'lucide-react';
import AdaniAssistantChatbot from './AdaniAssistantChatbot';
import './AdaniChatbot.css';

interface AdaniAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataGenerated: (data: any) => void;
  onLaunchApp?: () => void; // New prop for launching the main app
  className?: string;
}

const AdaniAssistantModal: React.FC<AdaniAssistantModalProps> = ({
  isOpen,
  onClose,
  onDataGenerated,
  onLaunchApp,
  className = ''
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleDataGenerated = (data: any) => {
    onDataGenerated(data);
    // Keep modal open after data generation for continued interaction
  };

  const handleLaunchApp = () => {
    if (onLaunchApp) {
      onLaunchApp();
      // Close the modal after launching the app
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`adani-modal-overlay ${isOpen ? 'open' : ''} ${className}`}>
      <div 
        className={`adani-modal-container ${isMinimized ? 'minimized' : ''} ${isMaximized ? 'maximized' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="adani-modal-header">
          <div className="adani-modal-title">
            <Sparkles className="sparkle-icon" size={24} />
            <h2>TADA HUEI</h2>
            <span className="adani-badge">AI Powered</span>
          </div>
          
          <div className="adani-modal-controls">
            <button
              className="adani-control-btn"
              onClick={() => {
                // Clear localStorage and reset chat state
                localStorage.removeItem('adani-chatbot-state');
                window.location.reload();
              }}
              title="Start New Chat"
            >
              <Plus size={16} />
            </button>
            
            <button
              className="adani-control-btn"
              onClick={() => setIsMinimized(!isMinimized)}
              title={isMinimized ? "Restore" : "Minimize"}
            >
              <Minimize2 size={16} />
            </button>
            
            <button
              className="adani-control-btn"
              onClick={() => setIsMaximized(!isMaximized)}
              title={isMaximized ? "Restore" : "Maximize"}
            >
              <Maximize2 size={16} />
            </button>
            
            <button
              className="adani-close-btn"
              onClick={onClose}
              title="Close Assistant"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <div className="adani-modal-body">
            <AdaniAssistantChatbot 
              onDataGenerated={handleDataGenerated} 
              onLaunchApp={handleLaunchApp}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdaniAssistantModal;