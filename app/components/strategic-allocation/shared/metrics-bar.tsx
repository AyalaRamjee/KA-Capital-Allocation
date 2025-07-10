'use client'

import { Target, Briefcase, DollarSign, TrendingUp, Users, AlertCircle } from 'lucide-react'
import { useAllocationData } from '@/hooks/use-allocation-data'

interface MetricCardProps {
  icon: React.ElementType
  label: string
  value: string
}

function MetricCard({ icon: Icon, label, value }: MetricCardProps) {
  return (
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
        <Icon className="w-5 h-5 text-blue-400" />
      </div>
      <div>
        <div className="text-xs text-slate-400">{label}</div>
        <div className="text-lg font-bold text-white font-mono">{value}</div>
      </div>
    </div>
  )
}

export function MetricsBar() {
  const { state, computedMetrics } = useAllocationData()
  
  if (!state || !computedMetrics) {
    return (
      <div className="h-20 bg-slate-800 border-b border-slate-700 px-6 flex items-center">
        <div className="text-slate-400">Loading metrics...</div>
      </div>
    )
  }

  const allocatedCapital = state.portfolioMetrics.totalCapital
  const totalNPV = state.portfolioMetrics.totalNPV
  const riskIssues = state.validationIssues.filter(i => i.severity === 'error').length

  return (
    <div className="h-20 bg-slate-800 border-b border-slate-700 px-6 flex items-center">
      <div className="flex space-x-8">
        <MetricCard 
          icon={Target} 
          label="Priorities" 
          value={computedMetrics.totalPriorities.toString()} 
        />
        <MetricCard 
          icon={Briefcase} 
          label="Projects" 
          value={computedMetrics.totalProjects.toString()} 
        />
        <MetricCard 
          icon={DollarSign} 
          label="Capital" 
          value={`$${allocatedCapital.toFixed(0)}M`} 
        />
        <MetricCard 
          icon={TrendingUp} 
          label="NPV" 
          value={`$${totalNPV.toFixed(0)}M`} 
        />
        <MetricCard 
          icon={Users} 
          label="Allocated" 
          value={computedMetrics.allocatedProjects.toString()} 
        />
        <MetricCard 
          icon={AlertCircle} 
          label="Issues" 
          value={riskIssues.toString()} 
        />
      </div>
    </div>
  )
}