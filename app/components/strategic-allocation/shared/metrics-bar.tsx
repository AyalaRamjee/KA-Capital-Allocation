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
      <div className="bg-slate-800/70 backdrop-blur-sm border border-slate-700 rounded-xl p-4 flex flex-col justify-between h-full min-h-[120px]">
        <div className="flex items-center justify-between mb-2">
          <div className={`w-9 h-9 rounded-lg ${iconBgClasses[color]} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${colorClasses[color]}`} />
          </div>
        </div>
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">{label}</p>
          <div className="flex items-baseline space-x-2">
            <h4 className="text-xl font-bold text-white">{value}</h4>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
          {trend && (
            <div className={`flex items-center text-xs mt-1 ${trend.direction === 'up' ? 'text-green-400' : 'text-red-400'}`}>
              {trend.direction === 'up' ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
              <span>{Math.abs(trend.value)}% {trend.label}</span>
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
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-slate-800/70 rounded-xl p-4 h-[120px] animate-pulse"></div>
            ))}
          </div>
        </div>
      )
    }
  
    const allocatedCapital = state.portfolioMetrics.totalCapital / 10000000; // In Cr
    const totalNPV = state.portfolioMetrics.totalNPV / 10000000; // In Cr
    const budgetUtilization = (computedMetrics.totalCapitalRequired / state.availableBudget) * 100
  
    return (
      <div className="p-4 sm:p-6 bg-slate-900/50">
        <div className="flex items-center justify-between mb-4 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-white">Enterprise Portfolio Overview</h2>
            <p className="text-sm text-slate-400">Real-time strategic capital allocation metrics</p>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-400">
             <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-300 font-medium">Live</span>
              </div>
            <span>Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <div className="px-3 py-1.5 rounded-full bg-blue-900/30 border border-blue-500/40 text-blue-300">Q3 2024</div>
          </div>
        </div>
  
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
            subtitle="Pipeline"
            color="blue"
          />
          <MetricCard 
            icon={DollarSign} 
            label="Capital" 
            value={`₹${allocatedCapital.toFixed(2)} Cr`}
            subtitle={`${budgetUtilization.toFixed(0)}% Used`}
            color="green"
          />
          <MetricCard 
            icon={TrendingUp} 
            label="Portfolio NPV" 
            value={`₹${totalNPV.toFixed(2)} Cr`}
            subtitle="Net Present Value"
            color="cyan"
          />
          <MetricCard 
            icon={Activity} 
            label="Avg. IRR" 
            value={`${state.portfolioMetrics.avgIRR.toFixed(1)}%`}
            subtitle="Returns"
            color="amber"
          />
        </div>
      </div>
    )
  }
  