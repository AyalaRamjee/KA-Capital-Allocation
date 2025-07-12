import React, { useState, useEffect } from 'react';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastNotificationProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const timer = setTimeout(() => setIsVisible(true), 50);
    
    // Auto dismiss
    if (toast.duration && toast.duration > 0) {
      const dismissTimer = setTimeout(() => {
        handleClose();
      }, toast.duration);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(dismissTimer);
      };
    }
    
    return () => clearTimeout(timer);
  }, [toast.duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(toast.id);
    }, 300);
  };

  const getToastStyles = () => {
    const baseStyles = {
      success: {
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        borderColor: '#10b981',
        iconColor: '#ffffff',
        icon: '✓'
      },
      error: {
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        borderColor: '#ef4444',
        iconColor: '#ffffff',
        icon: '✕'
      },
      warning: {
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        borderColor: '#f59e0b',
        iconColor: '#ffffff',
        icon: '⚠'
      },
      info: {
        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        borderColor: '#3b82f6',
        iconColor: '#ffffff',
        icon: 'ℹ'
      }
    };
    
    return baseStyles[toast.type];
  };

  const styles = getToastStyles();

  return (
    <div
      style={{
        position: 'relative',
        background: styles.background,
        border: `1px solid ${styles.borderColor}`,
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '12px',
        minWidth: '320px',
        maxWidth: '480px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)',
        transform: isVisible && !isLeaving ? 'translateX(0) scale(1)' : 'translateX(100%) scale(0.95)',
        opacity: isVisible && !isLeaving ? 1 : 0,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        backdropFilter: 'blur(10px)',
        overflow: 'hidden'
      }}
    >
      {/* Background pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="7" cy="7" r="1"/%3E%3Ccircle cx="27" cy="7" r="1"/%3E%3Ccircle cx="47" cy="7" r="1"/%3E%3Ccircle cx="7" cy="27" r="1"/%3E%3Ccircle cx="27" cy="27" r="1"/%3E%3Ccircle cx="47" cy="27" r="1"/%3E%3Ccircle cx="7" cy="47" r="1"/%3E%3Ccircle cx="27" cy="47" r="1"/%3E%3Ccircle cx="47" cy="47" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        pointerEvents: 'none'
      }} />

      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        gap: '12px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Icon */}
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: 'bold',
          color: styles.iconColor,
          flexShrink: 0,
          animation: toast.type === 'success' ? 'bounce 0.6s ease-out' : 'none'
        }}>
          {styles.icon}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#ffffff',
            marginBottom: toast.message ? '4px' : '0',
            lineHeight: '1.4'
          }}>
            {toast.title}
          </div>
          
          {toast.message && (
            <div style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.9)',
              lineHeight: '1.5',
              wordBreak: 'break-word'
            }}>
              {toast.message}
            </div>
          )}

          {/* Action Button */}
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              style={{
                marginTop: '12px',
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '6px',
                padding: '6px 12px',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {toast.action.label}
            </button>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            color: '#ffffff',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.2s ease',
            backdropFilter: 'blur(10px)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          ×
        </button>
      </div>

      {/* Progress bar for auto-dismiss */}
      {toast.duration && toast.duration > 0 && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '3px',
          background: 'rgba(255, 255, 255, 0.3)',
          borderRadius: '0 0 12px 12px',
          animation: `progressBar ${toast.duration}ms linear forwards`,
          transformOrigin: 'left center'
        }} />
      )}

      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0, 0, 0);
          }
          40%, 43% {
            transform: translate3d(0, -8px, 0);
          }
          70% {
            transform: translate3d(0, -4px, 0);
          }
          90% {
            transform: translate3d(0, -2px, 0);
          }
        }

        @keyframes progressBar {
          from {
            transform: scaleX(1);
          }
          to {
            transform: scaleX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ToastNotification;