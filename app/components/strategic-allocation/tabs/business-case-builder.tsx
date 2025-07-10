'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export function BusinessCaseBuilder() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">3. Business Case Builder</h2>
          <p className="text-slate-400">Detailed implementation plans with phases and resources</p>
        </div>
      </div>

      {/* Placeholder Content */}
      <Card>
        <CardHeader>
          <CardTitle>Business Case Development</CardTitle>
          <CardDescription>Create comprehensive business cases for selected projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-slate-500">
            <p>Business case builder coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}