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
import { useAllocationData } from '../../hooks/use-allocation-data'
import { Card, CardContent } from '../ui/card'
import { WeightDistributionChart, BudgetAllocationChart, ExecutiveAlignmentChart } from './shared/charts'
import { ScrollArea } from '@/components/ui/scroll-area'

const tabComponents: Record<string, React.ElementType> = {
  priorities: InvestmentPriorities,
  opportunities: OpportunitiesPipeline,
  'business-case': BusinessCaseBuilder,
  scoring: ScoringAllocation,
  validation: DataValidation,
  analytics: PortfolioAnalytics,
  scenarios: ScenarioModeling,
}

const tabHasSidebar: Record<string, boolean> = {
  priorities: true,
  opportunities: false,
  'business-case': true,
  scoring: true,
  analytics: true,
}

function Sidebar({ currentTab, state }: { currentTab: string; state: any }) {
    if (!state || !state.investmentPriorities) {
        return <div className="p-4 text-sm text-slate-400">Loading analytics...</div>;
    }

    if (currentTab !== 'priorities') {
        return null; 
    }

    return (
        <ScrollArea className="h-full">
            <div className="flex flex-col gap-6 p-6">
                <WeightDistributionChart priorities={state.investmentPriorities} />
                <BudgetAllocationChart priorities={state.investmentPriorities} />
                <ExecutiveAlignmentChart priorities={state.investmentPriorities} />
            </div>
        </ScrollArea>
    );
}


export function SCASApp() {
  const [currentTab, setCurrentTab] = useState('priorities')
  const { state, isLoading } = useAllocationData()

  const handleTabChange = (tabId: string) => {
    setCurrentTab(tabId)
  }

  const CurrentTabComponent = tabComponents[currentTab]
  const showSidebar = tabHasSidebar[currentTab]

  if (isLoading || !state) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-white font-medium text-lg">Loading Strategic Capital Allocation System...</div>
      </div>
    )
  }

  return (
    <div className="bg-slate-900 text-white min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex flex-col">
        <MetricsBar />
        <TabNavigation currentTab={currentTab} onTabChange={handleTabChange} />
        
        <div className="flex-grow flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Main Content Area */}
          <ScrollArea className="lg:col-span-8 h-full">
              <Card className="bg-transparent border-none rounded-none">
                <CardContent className="p-0">
                  {CurrentTabComponent && <CurrentTabComponent />}
                </CardContent>
              </Card>
          </ScrollArea>

          {/* Sidebar Area */}
          {showSidebar && (
            <div className="hidden lg:block lg:col-span-4 bg-slate-800/30 border-l border-slate-700">
                <Sidebar currentTab={currentTab} state={state} />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
