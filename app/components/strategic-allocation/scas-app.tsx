'use client'

import { Header } from './shared/header'
import { MetricsBar } from './shared/metrics-bar'
import { TabNavigation } from './shared/tab-navigation'
import { InvestmentPriorities } from './tabs/investment-priorities'
import { OpportunitiesPipelineEnhanced } from './tabs/opportunities-pipeline-enhanced'
import { BusinessCaseBuilderEnhanced } from './tabs/business-case-builder-enhanced'
import { ScoringAllocationEnhanced } from './tabs/scoring-allocation-enhanced'
import { DataValidationEnhanced } from './tabs/data-validation-enhanced'
import { PortfolioAnalyticsEnhanced } from './tabs/portfolio-analytics-enhanced'
import { ScenarioModelingEnhanced } from './tabs/scenario-modeling-enhanced'
import { useAllocationData } from '../../hooks/use-allocation-data'

export function SCASApp() {
  const { state, setCurrentTab } = useAllocationData()
  
  if (!state) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading SCAS...</p>
        </div>
      </div>
    )
  }

  const currentTab = state.currentTab

  const renderCurrentTab = () => {
    switch (currentTab) {
      case 'priorities':
        return <InvestmentPriorities />
      case 'opportunities':
        return <OpportunitiesPipelineEnhanced />
      case 'business-case':
        return <BusinessCaseBuilderEnhanced />
      case 'scoring':
        return <ScoringAllocationEnhanced />
      case 'validation':
        return <DataValidationEnhanced />
      case 'analytics':
        return <PortfolioAnalyticsEnhanced />
      case 'scenarios':
        return <ScenarioModelingEnhanced />
      default:
        return <InvestmentPriorities />
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Header />
      <MetricsBar />
      <TabNavigation currentTab={currentTab} onTabChange={setCurrentTab} />
      
      <main className="page-transition">
        {renderCurrentTab()}
      </main>
    </div>
  )
}