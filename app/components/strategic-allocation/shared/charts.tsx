'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from 'recharts'
import { Badge } from '../../ui/badge'
import { Priority, formatIndianCurrency } from '../../../lib/data-models'
import { TrendingUp, DollarSign } from 'lucide-react'

// This data should ideally live in a shared constants file or be fetched.
// Duplicating it here to decouple the charts from the 'investment-priorities' tab.
export const EXECUTIVE_TEAM = [
  { id: 'exec-1', name: 'Executive Director', title: 'Chief Executive Officer', initials: 'ED', color: '#22c55e' },
  { id: 'exec-2', name: 'VP Operations', title: 'Vice President', initials: 'VP', color: '#3b82f6' },
  { id: 'exec-3', name: 'Chief Strategy Officer', title: 'CSO', initials: 'CS', color: '#f59e0b' },
  { id: 'exec-4', name: 'Portfolio Manager', title: 'Senior Director', initials: 'PM', color: '#8b5cf6' }
]

function ExecutiveAvatar({ executive, size = 'md' }: { 
  executive: typeof EXECUTIVE_TEAM[0]
  size?: 'sm' | 'md' | 'lg' 
}) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  }

  return (
    <div className="relative group">
      <div 
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold border-2 border-slate-600 hover:border-blue-400 transition-all cursor-pointer`}
        style={{ backgroundImage: `linear-gradient(135deg, ${executive.color}, ${executive.color}90)` }}
        title={`${executive.name} - ${executive.title}`}
      >
        {executive.initials}
      </div>
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-slate-800 text-white text-xs rounded-lg border border-slate-600 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
        {executive.name}<br />
        <span className="text-slate-400">{executive.title}</span>
      </div>
    </div>
  )
}

export function WeightDistributionChart({ priorities }: { priorities: Priority[] }) {
    const totalWeight = priorities.reduce((sum, p) => sum + p.weight, 0);
    const donutChartData = priorities.map(priority => ({
        name: priority.code,
        fullName: priority.name,
        value: priority.weight,
        color: priority.color,
    }));

    return (
        <div className="chart-container">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <span>Weight Distribution</span>
              </h3>
              <Badge variant="secondary" className="text-xs">
                {priorities.length} priorities
              </Badge>
            </div>
            
            <div className="h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donutChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                    {donutChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '12px' }}
                    formatter={(value: number, name: string, props: any) => [`${value}%`, props.payload.fullName]}
                    labelFormatter={(label) => `Priority: ${label}`}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white font-mono">{totalWeight}%</div>
                  <div className="text-xs text-slate-400 uppercase tracking-wide">Total Weight</div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 space-y-3">
              {priorities.map((priority) => {
                const executive = EXECUTIVE_TEAM.find(exec => priority.sponsor?.includes(exec.name))
                return (
                  <div key={priority.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/30 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded-full border border-slate-600" style={{ backgroundColor: priority.color }} />
                      <div>
                        <div className="text-sm font-medium text-white">{priority.code}</div>
                        <div className="text-xs text-slate-400">{priority.name}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {executive && <ExecutiveAvatar executive={executive} size="sm" />}
                      <span className="text-sm font-mono text-blue-400">{priority.weight}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
        </div>
    );
}

export function BudgetAllocationChart({ priorities }: { priorities: Priority[] }) {
    const totalBudgetMax = priorities.reduce((sum, p) => sum + p.budgetMax, 0);
    const totalBudgetMin = priorities.reduce((sum, p) => sum + p.budgetMin, 0);
    const budgetChartData = priorities.map(priority => ({
        name: priority.code,
        min: priority.budgetMin / 10000, // Convert to K Crores
        max: priority.budgetMax / 10000,
    }));

    return (
        <div className="chart-container">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                <span>Budget Allocation</span>
              </h3>
              <Badge variant="secondary" className="text-xs">
                ₹{(totalBudgetMax / 10000).toFixed(0)}K Cr
              </Badge>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={budgetChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}K`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '12px' }}
                    formatter={(value: number, name: string) => [`₹${value.toFixed(1)}K Cr`, name === 'min' ? 'Min Budget' : 'Max Budget']}
                  />
                  <Bar dataKey="min" fill="#64748b" name="Min Budget" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="max" fill="#3b82f6" name="Max Budget" radius={[4, 4, 0, 0]} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div className="text-center p-3 bg-slate-800/30 rounded-lg">
                <div className="text-slate-400 text-xs">Total Min</div>
                <div className="text-white font-mono font-bold">₹{(totalBudgetMin / 10000).toFixed(0)}K Cr</div>
              </div>
              <div className="text-center p-3 bg-slate-800/30 rounded-lg">
                <div className="text-slate-400 text-xs">Total Max</div>
                <div className="text-white font-mono font-bold">₹{(totalBudgetMax / 10000).toFixed(0)}K Cr</div>
              </div>
              <div className="text-center p-3 bg-slate-800/30 rounded-lg">
                <div className="text-slate-400 text-xs">Efficiency</div>
                <div className="text-green-400 font-mono font-bold">
                  {totalBudgetMax > 0 ? ((totalBudgetMax - totalBudgetMin) / totalBudgetMax * 100).toFixed(0) : 0}%
                </div>
              </div>
            </div>
        </div>
    );
}

export function ExecutiveAlignmentChart({ priorities }: { priorities: Priority[] }) {
    return (
        <div className="card-primary">
            <h3 className="text-lg font-bold text-white mb-6">Executive Alignment</h3>
            <div className="space-y-4">
              {EXECUTIVE_TEAM.map(exec => {
                const priorityCount = priorities.filter(p => p.sponsor?.includes(exec.name)).length;
                const execWeight = priorities.filter(p => p.sponsor?.includes(exec.name)).reduce((sum, p) => sum + p.weight, 0);
                const execBudget = priorities.filter(p => p.sponsor?.includes(exec.name)).reduce((sum, p) => sum + p.budgetMax, 0);
                
                return (
                  <div key={exec.id} className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex items-center space-x-3 mb-3">
                      <ExecutiveAvatar executive={exec} size="md" />
                      <div className="flex-1">
                        <div className="text-sm font-bold text-white">{exec.name}</div>
                        <div className="text-xs text-slate-400">{exec.title}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-white font-mono">{execWeight}%</div>
                        <div className="text-xs text-slate-400">Weight</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="text-slate-400">Priorities</div>
                        <div className="text-white font-medium">{priorityCount} active</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Budget</div>
                        <div className="text-white font-medium font-mono">
                          {execBudget > 0 ? formatIndianCurrency(execBudget) : 'None'}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
        </div>
    );
}
