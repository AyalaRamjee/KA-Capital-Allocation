'use client'

import { Target, Briefcase, DollarSign, TrendingUp, Users, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react'
import { useAllocationData } from '../../../hooks/use-allocation-data'

interface MetricCardProps {
  icon: React.ElementType
  label: string
  value: string
  trend?: { value: number; direction: 'up' | 'down' }
  color?: string
}

function MetricCard({ icon: Icon, label, value, trend, color = 'blue' }: MetricCardProps) {
  const colorClasses = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    amber: 'text-amber-400',
    red: 'text-red-400',
    purple: 'text-purple-400'
  }

  return (
    <div className="metric-card min-w-0 flex-1 p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3 min-w-0">
          <div className={`w-12 h-12 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-center group-hover:border-slate-600 transition-colors`}>
            <Icon className={`w-6 h-6 ${colorClasses[color as keyof typeof colorClasses]}`} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-slate-400 uppercase tracking-wide">{label}</div>
            <div className="text-2xl font-bold text-white font-mono truncate">{value}</div>
            {trend && (
              <div className={`flex items-center mt-1 text-sm ${
                trend.direction === 'up' ? 'text-green-400' : 'text-red-400'
              }`}>
                {trend.direction === 'up' ? (
                  <ArrowUp className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowDown className="w-4 h-4 mr-1" />
                )}
                <span className="font-medium">{Math.abs(trend.value)}%</span>
                <span className="text-slate-500 ml-1">vs last quarter</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function MetricsBar() {
  const { state, computedMetrics } = useAllocationData()
  
  if (!state || !computedMetrics) {
    return (
      <div className="bg-slate-800/50 border-b border-slate-700 px-8 py-6">
        <div className="flex items-center justify-center">
          <div className="loading-shimmer h-8 w-48 rounded-lg"></div>
        </div>
      </div>
    )
  }

  const allocatedCapital = state.portfolioMetrics.totalCapital
  const totalNPV = state.portfolioMetrics.totalNPV
  const riskIssues = state.validationIssues.filter(i => i.severity === 'error').length
  const budgetUtilization = (computedMetrics.totalCapitalRequired / state.availableBudget) * 100

  return (
    <div className="bg-slate-800/50 border-b border-slate-700 px-8 py-6">
      <div className="max-w-full">
        {/* Title Row */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Portfolio Overview</h3>
            <p className="text-sm text-slate-400">Real-time metrics and key performance indicators</p>
          </div>
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-700/50 border border-slate-600">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-slate-300 font-medium">Live</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <MetricCard 
            icon={Target} 
            label="Priorities" 
            value={computedMetrics.totalPriorities.toString()}
            color="purple"
          />
          <MetricCard 
            icon={Briefcase} 
            label="Projects" 
            value={computedMetrics.totalProjects.toString()}
            trend={{ value: 12, direction: 'up' }}
            color="blue"
          />
          <MetricCard 
            icon={DollarSign} 
            label="Capital" 
            value={`$${allocatedCapital.toFixed(0)}M`}
            trend={{ value: 8, direction: 'up' }}
            color="green"
          />
          <MetricCard 
            icon={TrendingUp} 
            label="NPV" 
            value={`$${totalNPV.toFixed(0)}M`}
            trend={{ value: 15, direction: 'up' }}
            color="green"
          />
          <MetricCard 
            icon={Users} 
            label="Allocated" 
            value={`${computedMetrics.allocatedProjects}/${computedMetrics.totalProjects}`}
            color="blue"
          />
          <MetricCard 
            icon={AlertCircle} 
            label="Issues" 
            value={riskIssues.toString()}
            color={riskIssues > 0 ? "red" : "green"}
          />
        </div>

        {/* Budget Utilization Bar */}
        <div className="mt-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-400">Budget Utilization</span>
            <span className="text-sm font-mono text-white">{budgetUtilization.toFixed(1)}%</span>
          </div>
          <div className="progress-container h-3">
            <div 
              className={`progress-bar ${budgetUtilization > 90 ? 'bg-red-500' : budgetUtilization > 75 ? 'bg-amber-500' : 'bg-green-500'}`}
              style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>${(computedMetrics.totalCapitalRequired / 1000000).toFixed(0)}M allocated</span>
            <span>${(state.availableBudget / 1000000).toFixed(0)}M available</span>
          </div>
        </div>
      </div>
    </div>
  )
}