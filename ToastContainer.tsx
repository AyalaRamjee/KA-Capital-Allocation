import React, { createContext, useContext, useState, useCallback } from 'react';
import ToastNotification, { Toast } from './ToastNotification';

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string, duration?: number) => void;
  error: (title: string, message?: string, duration?: number) => void;
  warning: (title: string, message?: string, duration?: number, action?: { label: string; onClick: () => void }) => void;
  info: (title: string, message?: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
  maxToasts?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ 
  children, 
  maxToasts = 5,
  position = 'top-right'
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toastData: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: Toast = {
      id,
      duration: 5000, // Default 5 seconds
      ...toastData
    };

    setToasts(prev => {
      const updated = [newToast, ...prev];
      // Limit number of toasts
      return updated.slice(0, maxToasts);
    });
  }, [maxToasts]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((title: string, message?: string, duration = 5000) => {
    addToast({ type: 'success', title, message, duration });
  }, [addToast]);

  const error = useCallback((title: string, message?: string, duration = 7000) => {
    addToast({ type: 'error', title, message, duration });
  }, [addToast]);

  const warning = useCallback((title: string, message?: string, duration = 6000, action?: { label: string; onClick: () => void }) => {
    addToast({ type: 'warning', title, message, duration, action });
  }, [addToast]);

  const info = useCallback((title: string, message?: string, duration = 5000) => {
    addToast({ type: 'info', title, message, duration });
  }, [addToast]);

  const getPositionStyles = () => {
    const positions = {
      'top-right': { top: '20px', right: '20px' },
      'top-left': { top: '20px', left: '20px' },
      'bottom-right': { bottom: '20px', right: '20px' },
      'bottom-left': { bottom: '20px', left: '20px' },
      'top-center': { top: '20px', left: '50%', transform: 'translateX(-50%)' },
      'bottom-center': { bottom: '20px', left: '50%', transform: 'translateX(-50%)' }
    };
    return positions[position];
  };

  const contextValue: ToastContextType = {
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      
      {/* Toast Container */}
      {toasts.length > 0 && (
        <div
          style={{
            position: 'fixed',
            ...getPositionStyles(),
            zIndex: 9999,
            pointerEvents: 'none'
          }}
        >
          <div style={{
            display: 'flex',
            flexDirection: position.includes('bottom') ? 'column-reverse' : 'column',
            gap: '8px',
            pointerEvents: 'auto'
          }}>
            {toasts.map(toast => (
              <ToastNotification
                key={toast.id}
                toast={toast}
                onClose={removeToast}
              />
            ))}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export default ToastProvider;