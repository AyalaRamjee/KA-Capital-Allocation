'use client'

import { Settings, BarChart3, TrendingUp, Shield } from 'lucide-react'
import { Button } from '../../../components/ui/button'

export function Header() {
  return (
    <header className="h-20 header-gradient px-8 flex items-center justify-between relative">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>
      
      {/* Left Section */}
      <div className="flex items-center space-x-6 relative z-10">
        <div className="flex items-center space-x-3">
          {/* Logo */}
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          
          {/* Brand */}
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold gradient-text tracking-tight">SCAS</h1>
            <p className="text-sm text-slate-400 font-medium">Strategic Capital Allocation System</p>
          </div>
        </div>
        
        {/* Status Indicators */}
        <div className="hidden md:flex items-center space-x-4 ml-8">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400 font-medium">Portfolio Active</span>
          </div>
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-400 font-medium">Data Validated</span>
          </div>
        </div>
      </div>
      
      {/* Right Section */}
      <div className="flex items-center space-x-4 relative z-10">
        {/* System Status */}
        <div className="hidden sm:flex items-center space-x-3 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-slate-300 font-medium">System Healthy</span>
          </div>
          <div className="w-px h-4 bg-slate-600"></div>
          <span className="text-sm text-slate-400 font-mono">99.9%</span>
        </div>
        
        {/* Actions */}
        <Button 
          variant="ghost" 
          size="icon"
          className="w-10 h-10 rounded-lg bg-slate-800/50 border border-slate-700 hover:bg-slate-700 hover:border-slate-600 transition-all duration-200"
        >
          <Settings className="w-5 h-5 text-slate-400" />
        </Button>
        
        {/* User Profile */}
        <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-semibold text-sm">JD</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white">John Doe</p>
            <p className="text-xs text-slate-400">Portfolio Manager</p>
          </div>
        </div>
      </div>
    </header>
  )
}