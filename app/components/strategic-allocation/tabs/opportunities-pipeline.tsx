'use client'

import { Upload, Plus, Kanban, Table, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export function OpportunitiesPipeline() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">2. Opportunities Pipeline</h2>
          <p className="text-slate-400">Comprehensive catalog of potential projects and investments</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Project
          </Button>
        </div>
      </div>

      {/* Pipeline View Toggle */}
      <div className="flex space-x-2">
        <Button variant="default">
          <Kanban className="w-4 h-4 mr-2" />
          Pipeline
        </Button>
        <Button variant="outline">
          <Table className="w-4 h-4 mr-2" />
          Table
        </Button>
        <Button variant="outline">
          <Circle className="w-4 h-4 mr-2" />
          Bubble Chart
        </Button>
      </div>

      {/* Placeholder Content */}
      <div className="grid grid-cols-5 gap-4">
        {['Ideation', 'Evaluation', 'Ready', 'Approved', 'Rejected'].map((status) => (
          <Card key={status}>
            <CardHeader>
              <CardTitle className="text-lg">{status}</CardTitle>
              <CardDescription>0 projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-slate-500">
                <p>No projects in {status.toLowerCase()} stage</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}