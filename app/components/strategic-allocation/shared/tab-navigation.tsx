'use client'

import { Target, Briefcase, FileText, Calculator, CheckCircle, BarChart3, Shuffle } from 'lucide-react'

interface TabInfo {
  id: string
  label: string
  icon: React.ElementType
  completed: boolean
}

interface TabButtonProps {
  number: number
  icon: React.ElementType
  label: string
  active: boolean
  completed: boolean
  onClick: () => void
}

function TabButton({ number, icon: Icon, label, active, completed, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex-shrink-0 flex items-center space-x-2 px-3 py-2.5 rounded-md transition-all duration-200 ease-in-out
        ${active ? 'bg-blue-600/90 text-white shadow-lg' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/80'}
        whitespace-nowrap
      `}
    >
      <div className={`
        w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold border
        ${completed ? 'bg-green-500 border-green-400 text-white' : active ? 'bg-white/25 border-white/30 text-white' : 'bg-slate-600 border-slate-500 text-slate-300'}
      `}>
        {completed ? '✓' : ''}
      </div>
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  )
}

interface TabNavigationProps {
  currentTab: string
  onTabChange: (tabId: string) => void
}

export function TabNavigation({ currentTab, onTabChange }: TabNavigationProps) {
  const tabs: TabInfo[] = [
    { id: 'priorities', label: 'Add Priorities', icon: Target, completed: false },
    { id: 'pipeline', label: 'Manage Projects', icon: Briefcase, completed: false },
    { id: 'business-case', label: 'Build Cases', icon: FileText, completed: false },
    { id: 'scoring', label: 'Score & Allocate', icon: Calculator, completed: false },
    { id: 'validation', label: 'Validate Data', icon: CheckCircle, completed: false },
    { id: 'analytics', label: 'Review Portfolio', icon: BarChart3, completed: false },
    { id: 'scenarios', label: 'What-If Analysis', icon: Shuffle, completed: false },
  ]

  return (
    <div className="bg-slate-800/50 border-b border-slate-700 w-full backdrop-blur-sm">
      <nav className="flex items-center space-x-2 p-2 overflow-x-auto">
        {tabs.map((tab, index) => (
          <TabButton
            key={tab.id}
            number={index + 1}
            icon={tab.icon}
            label={tab.label}
            active={currentTab === tab.id}
            completed={tab.completed}
            onClick={() => onTabChange(tab.id)}
          />
        ))}
      </nav>
    </div>
  )
}
