'use client'

import { Target, Briefcase, DollarSign, TrendingUp, Users, AlertCircle } from 'lucide-react'

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
  return (
    <div className="h-20 bg-slate-800 border-b border-slate-700 px-6 flex items-center">
      <div className="flex space-x-8">
        <MetricCard icon={Target} label="Priorities" value="7" />
        <MetricCard icon={Briefcase} label="Projects" value="45" />
        <MetricCard icon={DollarSign} label="Capital" value="$125M" />
        <MetricCard icon={TrendingUp} label="NPV" value="$87M" />
        <MetricCard icon={Users} label="Resources" value="320" />
        <MetricCard icon={AlertCircle} label="Risks" value="12" />
      </div>
    </div>
  )
}