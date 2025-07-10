'use client'

import { Bell, Settings, User, ChevronDown, Building2, Globe, TrendingUp, Shield } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../../components/ui/button'
import Image from 'next/image'

export function Header() {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <header className="layout-header fade-in">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>
      
      {/* Left Section - TADA Branding */}
      <div className="flex items-center space-x-6 relative z-10">
        <div className="flex items-center space-x-4">
          {/* TADA Logo - Prominent */}
          <div className="relative">
            <Image 
              src="/TADA_TM-2023_Color-White-Logo.svg" 
              alt="TADA Logo" 
              width={80} 
              height={32}
              className="object-contain"
              priority
              style={{
                filter: 'drop-shadow(0 0 20px rgba(75, 123, 255, 0.3))'
              }}
            />
          </div>
          
          {/* SCAS Branding */}
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold gradient-text tracking-tight">SCAS</h1>
              <span className="text-xs text-slate-400 font-medium px-2 py-1 bg-slate-700/50 rounded-full border border-slate-600">
                by TADA
              </span>
            </div>
            <p className="text-sm text-slate-400 font-medium">Strategic Capital Allocation System</p>
          </div>
        </div>
        
        {/* Divider */}
        <div className="h-8 w-px bg-slate-600"></div>
        
        {/* Client Context */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-3 py-2 bg-slate-700/50 rounded-lg border border-slate-600">
            <Building2 className="w-4 h-4 text-blue-400" />
            <div>
              <p className="text-white text-sm font-medium">Enterprise</p>
              <p className="text-blue-400 text-xs font-semibold">Global Conglomerate</p>
            </div>
          </div>
          <div className="hidden lg:flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400 font-medium">Portfolio Active</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <Globe className="w-3 h-3" />
              <span>₹85,000 Cr Portfolio</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Section */}
      <div className="flex items-center space-x-4 relative z-10">
        {/* System Status */}
        <div className="hidden sm:flex items-center space-x-3 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full pulse"></div>
            <span className="text-sm text-slate-300 font-medium">Live</span>
          </div>
          <div className="w-px h-4 bg-slate-600"></div>
          <Shield className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-slate-400 font-mono">Secure</span>
        </div>
        
        {/* Actions */}
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon"
            className="btn-ghost p-2 rounded-lg"
          >
            <Settings className="w-5 h-5" />
          </Button>
          
          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotifications(!showNotifications)}
              className="btn-ghost p-2 rounded-lg relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full pulse">
                <span className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
              </span>
            </Button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 glass-card shadow-xl z-50 scale-in">
                <div className="p-4 border-b border-slate-600">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold">Notifications</h3>
                    <span className="status-badge badge-pending text-xs">3 New</span>
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <div className="p-4 border-b border-slate-700 hover:bg-slate-700/30 transition-colors">
                    <p className="text-white text-sm font-medium">Solar Park Phase III requires approval</p>
                    <p className="text-slate-400 text-xs mt-1">2 minutes ago • High Priority</p>
                  </div>
                  <div className="p-4 border-b border-slate-700 hover:bg-slate-700/30 transition-colors">
                    <p className="text-white text-sm font-medium">Budget threshold exceeded for Q3</p>
                    <p className="text-slate-400 text-xs mt-1">1 hour ago • Portfolio Alert</p>
                  </div>
                  <div className="p-4 hover:bg-slate-700/30 transition-colors">
                    <p className="text-white text-sm font-medium">Portfolio metrics updated</p>
                    <p className="text-slate-400 text-xs mt-1">3 hours ago • System Update</p>
                  </div>
                </div>
                <div className="p-3 border-t border-slate-600">
                  <button className="w-full text-center text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors">
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* User Profile */}
        <div className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-slate-700/50 border border-slate-600 hover:bg-slate-700 transition-colors"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center ring-2 ring-blue-400/20">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="text-left hidden md:block">
              <p className="text-white text-sm font-semibold">John Doe</p>
              <p className="text-slate-400 text-xs">Portfolio Manager</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>
          
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 glass-card shadow-xl z-50 scale-in">
              <div className="p-4 border-b border-slate-600">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">John Doe</p>
                    <p className="text-slate-400 text-sm">Portfolio Manager</p>
                  </div>
                </div>
              </div>
              <div className="p-2">
                <button className="w-full text-left p-3 text-slate-300 hover:text-white hover:bg-slate-700/30 rounded-lg transition-colors flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Profile Settings</span>
                </button>
                <button className="w-full text-left p-3 text-slate-300 hover:text-white hover:bg-slate-700/30 rounded-lg transition-colors flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Preferences</span>
                </button>
                <hr className="my-2 border-slate-600" />
                <button className="w-full text-left p-3 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors flex items-center space-x-2">
                  <Globe className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}