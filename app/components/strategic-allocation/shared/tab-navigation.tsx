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
        flex items-center space-x-2 px-4 py-3 rounded-lg transition-all hover-glow
        ${active ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}
      `}
    >
      <div className={`
        w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
        ${completed ? 'bg-green-500 text-white' : active ? 'bg-white/20 text-white' : 'bg-slate-600 text-slate-400'}
      `}>
        {completed ? '✓' : number}
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
    { id: 'priorities', label: 'Investment Priorities', icon: Target, completed: false },
    { id: 'opportunities', label: 'Opportunities Pipeline', icon: Briefcase, completed: false },
    { id: 'business-case', label: 'Business Case Builder', icon: FileText, completed: false },
    { id: 'scoring', label: 'Scoring & Allocation', icon: Calculator, completed: false },
    { id: 'validation', label: 'Data Validation', icon: CheckCircle, completed: false },
    { id: 'analytics', label: 'Portfolio Analytics', icon: BarChart3, completed: false },
    { id: 'scenarios', label: 'What-If Analysis', icon: Shuffle, completed: false },
  ]

  return (
    <div className="bg-slate-800 border-b border-slate-700">
      <div className="flex space-x-1 p-2">
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
      </div>
    </div>
  )
}