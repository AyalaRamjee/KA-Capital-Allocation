'use client'

import { useState } from 'react'
import { Header } from './shared/header'
import { MetricsBar } from './shared/metrics-bar'
import { TabNavigation } from './shared/tab-navigation'
import { InvestmentPriorities } from './tabs/investment-priorities'
import { OpportunitiesPipeline } from './tabs/opportunities-pipeline'
import { BusinessCaseBuilder } from './tabs/business-case-builder'
import { ScoringAllocation } from './tabs/scoring-allocation'
import { DataValidation } from './tabs/data-validation'
import { PortfolioAnalytics } from './tabs/portfolio-analytics'
import { ScenarioModeling } from './tabs/scenario-modeling'

export function SCASApp() {
  const [currentTab, setCurrentTab] = useState('priorities')

  const renderCurrentTab = () => {
    switch (currentTab) {
      case 'priorities':
        return <InvestmentPriorities />
      case 'opportunities':
        return <OpportunitiesPipeline />
      case 'business-case':
        return <BusinessCaseBuilder />
      case 'scoring':
        return <ScoringAllocation />
      case 'validation':
        return <DataValidation />
      case 'analytics':
        return <PortfolioAnalytics />
      case 'scenarios':
        return <ScenarioModeling />
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