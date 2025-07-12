'use client'
import React, { useState, useEffect } from 'react';

export default function DynamicFooter() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  return (
    <footer style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      borderTop: '1px solid rgba(0, 184, 212, 0.3)',
      padding: '1rem 2rem',
      marginTop: 'auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      color: '#94a3b8',
      fontSize: '0.875rem',
      fontWeight: '500'
    }}>
      <div>
        Copyright TADA Cognitive 2025
      </div>
      <div style={{
        color: '#ffffff',
        fontFamily: 'monospace',
        letterSpacing: '0.5px'
      }}>
        {formatDateTime(currentTime)}
      </div>
    </footer>
  );
}