'use client'

import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Header() {
  return (
    <header className="h-16 bg-slate-900 border-b border-slate-700 px-6 flex items-center justify-between">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">SC</span>
          </div>
          <h1 className="text-xl font-bold text-white">SCAS</h1>
          <span className="text-sm text-slate-400">Strategic Capital Allocation System</span>
        </div>
      </div>
      
      {/* Right Section */}
      <div className="flex items-center space-x-4">
        <Button className="px-4 py-2 bg-purple-600 text-white hover:bg-purple-700">
          SCAS
        </Button>
        <Button variant="ghost" size="icon">
          <Settings className="w-5 h-5 text-slate-400" />
        </Button>
        <span className="text-sm text-slate-400">100%</span>
      </div>
    </header>
  )
}