'use client'

import { Calculator, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export function ScoringAllocation() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">4. Scoring & Allocation</h2>
          <p className="text-slate-400">Apply priorities to score projects and optimize portfolio</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Calculator className="w-4 h-4 mr-2" />
            Recalculate
          </Button>
          <Button>
            <Zap className="w-4 h-4 mr-2" />
            Optimize Portfolio
          </Button>
        </div>
      </div>

      {/* Placeholder Content */}
      <Card>
        <CardHeader>
          <CardTitle>Project Scoring Matrix</CardTitle>
          <CardDescription>Score projects against strategic priorities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-slate-500">
            <p>Scoring matrix coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}