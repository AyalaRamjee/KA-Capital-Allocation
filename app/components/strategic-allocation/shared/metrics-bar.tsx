'use client'

import { Target, Briefcase, DollarSign, TrendingUp, Users, AlertCircle, ArrowUp, ArrowDown, Activity, Shield, Zap } from 'lucide-react'
import { useAllocationData } from '../../../hooks/use-allocation-data'

interface MetricCardProps {
  icon: React.ElementType
  label: string
  value: string
  subtitle?: string
  trend?: { value: number; direction: 'up' | 'down'; label?: string }
  color?: string
  status?: 'success' | 'warning' | 'error' | 'info'
}

function MetricCard({ icon: Icon, label, value, subtitle, trend, color = 'blue', status }: MetricCardProps) {
  const colorClasses = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    amber: 'text-amber-400',
    red: 'text-red-400',
    purple: 'text-purple-400',
    cyan: 'text-cyan-400'
  }

  const iconBgClasses = {
    blue: 'bg-blue-500/10',
    green: 'bg-green-500/10',
    amber: 'bg-amber-500/10',
    red: 'bg-red-500/10',
    purple: 'bg-purple-500/10',
    cyan: 'bg-cyan-500/10'
  }

  return (
    <div style={{ 
      background: 'rgba(30, 32, 40, 0.7)', 
      backdropFilter: 'blur(10px)', 
      border: '1px solid rgba(255, 255, 255, 0.1)', 
      borderRadius: '12px', 
      padding: '20px', 
      minHeight: '120px', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'space-between' 
    }}>
      {/* Icon */}
      <div style={{ marginBottom: '16px' }}>
        <div className={`w-10 h-10 rounded-lg ${iconBgClasses[color as keyof typeof iconBgClasses]} flex items-center justify-center`}>
          <Icon style={{ width: '18px', height: '18px' }} className={colorClasses[color as keyof typeof colorClasses]} />
        </div>
      </div>
      
      {/* Label */}
      <div style={{ 
        fontSize: '11px', 
        textTransform: 'uppercase', 
        letterSpacing: '0.5px', 
        color: '#6b7280', 
        marginBottom: '6px', 
        fontWeight: '500',
        lineHeight: '1.2'
      }}>
        {label}
      </div>
      
      {/* Value */}
      <div style={{ 
        fontSize: '20px', 
        fontWeight: '600', 
        color: '#ffffff', 
        marginBottom: '4px', 
        fontFamily: 'monospace', 
        lineHeight: '1.1' 
      }}>
        {value}
      </div>
      
      {/* Subtitle and Trend */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {subtitle && (
          <div style={{ fontSize: '11px', color: '#9ca3af', lineHeight: '1.2' }}>
            {subtitle}
          </div>
        )}
        {trend && (
          <div style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '2px' }}>
            {trend.direction === 'up' ? (
              <ArrowUp style={{ width: '12px', height: '12px' }} />
            ) : (
              <ArrowDown style={{ width: '12px', height: '12px' }} />
            )}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
    </div>
  )
}

export function MetricsBar() {
  const { state, computedMetrics } = useAllocationData()
  
  if (!state || !computedMetrics) {
    return (
      <div className="layout-metrics">
        <div className="flex items-center justify-center h-full">
          <div className="flex space-x-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="loading-shimmer h-20 w-48 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const allocatedCapital = state.portfolioMetrics.totalCapital / 1000000 // Convert to millions
  const totalNPV = state.portfolioMetrics.totalNPV / 1000000
  const avgIRR = state.portfolioMetrics.avgIRR
  const riskIssues = state.validationIssues.filter(i => i.severity === 'error').length
  const budgetUtilization = (computedMetrics.totalCapitalRequired / state.availableBudget) * 100
  const projectsOnTrack = Math.floor(computedMetrics.totalProjects * 0.68) // 68% on track

  return (
    <div className="layout-metrics">
      <div className="max-w-full">
        {/* Title Row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div>
              <h3 className="text-lg font-bold text-white">Enterprise Portfolio Overview</h3>
              <p className="text-sm text-slate-400 font-medium">Real-time strategic capital allocation metrics</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-700/50 border border-slate-600">
                <div className="w-2 h-2 bg-green-400 rounded-full pulse"></div>
                <span className="text-sm text-slate-300 font-medium">Live Data</span>
              </div>
              <div className="text-xs text-slate-500">Last updated: {new Date().toLocaleTimeString()}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-900/20 border border-blue-500/30">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300 font-medium">Q3 2024</span>
          </div>
        </div>

        {/* Metrics Grid - Only 5 metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <MetricCard 
            icon={Target} 
            label="Priorities" 
            value={computedMetrics.totalPriorities.toString()}
            subtitle="Active"
            color="purple"
          />
          <MetricCard 
            icon={Briefcase} 
            label="Projects" 
            value={computedMetrics.totalProjects.toString()}
            subtitle="In Pipeline"
            color="blue"
          />
          <MetricCard 
            icon={DollarSign} 
            label="Capital" 
            value={`₹${allocatedCapital.toFixed(0)},000 Cr`}
            subtitle={`${budgetUtilization.toFixed(0)}% Allocated`}
            color="green"
          />
          <MetricCard 
            icon={TrendingUp} 
            label="Portfolio" 
            value={`₹${totalNPV.toFixed(0)},000 Cr`}
            subtitle="Total NPV"
            color="cyan"
          />
          <MetricCard 
            icon={Activity} 
            label="Avg IRR" 
            value={`${avgIRR.toFixed(1)}%`}
            subtitle="Returns"
            color="green"
          />
        </div>
      </div>
    </div>
  )
}