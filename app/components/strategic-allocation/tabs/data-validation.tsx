'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, BarChart3, Filter, Edit, Users, Clock } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Progress } from '../../../components/ui/progress'
import { useAllocationData } from '../../../hooks/use-allocation-data'
import { ValidationIssue } from '../../../lib/data-models'

interface MetricCardProps {
  title: string
  value: string | number
  icon: React.ElementType
  color?: string
  subtitle?: string
}

function MetricCard({ title, value, icon: Icon, color = 'blue', subtitle }: MetricCardProps) {
  const colorClasses = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    amber: 'text-amber-400',
    red: 'text-red-400'
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-white font-mono">{value}</p>
            {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
          </div>
          <div className={`w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center ${colorClasses[color as keyof typeof colorClasses]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ValidationCategory({ 
  title, 
  checks 
}: { 
  title: string
  checks: { label: string; passed: boolean; count?: string; issues?: string[] }[]
}) {
  const passedCount = checks.filter(c => c.passed).length
  const percentage = (passedCount / checks.length) * 100

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-white">{title}</h4>
        <div className="flex items-center space-x-2">
          <Progress value={percentage} className="w-20 h-2" />
          <span className="text-xs text-slate-400">{percentage.toFixed(0)}%</span>
        </div>
      </div>
      <div className="space-y-2">
        {checks.map((check, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              {check.passed ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400" />
              )}
              <span className={check.passed ? 'text-slate-300' : 'text-slate-400'}>
                {check.label}
              </span>
            </div>
            {check.count && (
              <span className="text-xs text-slate-500">{check.count}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function IssueCard({ 
  issue, 
  onResolve, 
  onDismiss 
}: { 
  issue: ValidationIssue
  onResolve: (id: string) => void
  onDismiss: (id: string) => void
}) {
  return (
    <div className={`p-4 rounded-lg border ${
      issue.severity === 'error' 
        ? 'bg-red-900/20 border-red-800' 
        : 'bg-amber-900/20 border-amber-800'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {issue.severity === 'error' ? (
            <XCircle className="w-5 h-5 text-red-400 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
          )}
          <div>
            <div className="text-sm text-white font-medium">{issue.title}</div>
            <div className="text-xs text-slate-400 mt-1">{issue.description}</div>
            {issue.affectedItems && issue.affectedItems.length > 0 && (
              <div className="text-xs text-slate-500 mt-2">
                Affects: {issue.affectedItems.slice(0, 3).join(', ')}
                {issue.affectedItems.length > 3 && ` +${issue.affectedItems.length - 3} more`}
              </div>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onResolve(issue.id)}
            className="text-xs"
          >
            Resolve
          </Button>
          {issue.severity === 'warning' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDismiss(issue.id)}
              className="text-xs"
            >
              Dismiss
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function ApprovalCard({ 
  title, 
  approver, 
  status, 
  date, 
  comments, 
  dependencies, 
  requiredFor 
}: {
  title: string
  approver: string
  status: 'pending' | 'approved' | 'rejected' | 'waiting'
  date?: Date
  comments?: string
  dependencies?: string[]
  requiredFor?: string[]
}) {
  const statusConfig = {
    pending: { color: 'amber', icon: Clock, text: 'Pending' },
    approved: { color: 'green', icon: CheckCircle, text: 'Approved' },
    rejected: { color: 'red', icon: XCircle, text: 'Rejected' },
    waiting: { color: 'blue', icon: Clock, text: 'Waiting' }
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="text-sm font-medium text-white">{title}</h4>
            <p className="text-xs text-slate-400">{approver}</p>
          </div>
          <Badge 
            className={`${
              config.color === 'green' ? 'bg-green-500' :
              config.color === 'red' ? 'bg-red-500' :
              config.color === 'amber' ? 'bg-amber-500' :
              'bg-blue-500'
            } text-white`}
          >
            <Icon className="w-3 h-3 mr-1" />
            {config.text}
          </Badge>
        </div>
        
        {date && (
          <p className="text-xs text-slate-500 mb-2">
            {date.toLocaleDateString()}
          </p>
        )}
        
        {comments && (
          <p className="text-xs text-slate-300 mb-2">{comments}</p>
        )}
        
        {dependencies && dependencies.length > 0 && (
          <div className="text-xs text-slate-500">
            <span>Depends on: {dependencies.join(', ')}</span>
          </div>
        )}
        
        {requiredFor && requiredFor.length > 0 && (
          <div className="text-xs text-slate-500">
            <span>Required for: {requiredFor.join(', ')}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function DataValidation() {
  const { state, validateData, updateState } = useAllocationData()
  const [severityFilter, setSeverityFilter] = useState<'all' | 'error' | 'warning'>('all')
  
  useEffect(() => {
    if (state) {
      validateData()
    }
  }, [validateData, state])

  if (!state) {
    return <div className="p-6 text-center">Loading...</div>
  }

  const { priorities, projects, validationIssues } = state

  const handleRefreshValidation = () => {
    validateData()
  }

  const handleApproveAll = () => {
    const hasErrors = validationIssues.some(issue => issue.severity === 'error')
    if (!hasErrors) {
      // Simulate approval process
      console.log('All validations approved')
    }
  }

  const handleResolveIssue = (id: string) => {
    updateState(prevState => ({
      ...prevState,
      validationIssues: prevState.validationIssues.filter(issue => issue.id !== id)
    }))
  }

  const handleDismissIssue = (id: string) => {
    updateState(prevState => ({
      ...prevState,
      validationIssues: prevState.validationIssues.filter(issue => issue.id !== id)
    }))
  }

  const filteredIssues = validationIssues.filter(issue => 
    severityFilter === 'all' || issue.severity === severityFilter
  )

  const dataQualityScore = Math.max(0, 100 - validationIssues.filter(i => i.severity === 'error').length * 20)
  const criticalIssues = validationIssues.filter(i => i.severity === 'error').length
  const warnings = validationIssues.filter(i => i.severity === 'warning').length
  const approvedItems = 25 // Simulated
  const totalItems = 30 // Simulated

  // Generate validation checks based on actual data
  const totalWeight = priorities.reduce((sum, p) => sum + p.weight, 0)
  const projectsWithoutFinancials = projects.filter(p => !p.npv || !p.irr || p.cashFlows.length === 0)
  const highIRRProjects = projects.filter(p => p.irr > 100)
  const projectsWithoutBusinessCases = projects.filter(p => p.status === 'ready' || p.status === 'approved')
  const projectsWithoutRisks = projects.filter(p => !p.riskLevel)

  const completenessChecks = [
    {
      title: 'Project Information',
      checks: [
        { label: 'All projects have financial projections', passed: projectsWithoutFinancials.length === 0, count: `${projects.length - projectsWithoutFinancials.length}/${projects.length}` },
        { label: 'Business cases completed', passed: projectsWithoutBusinessCases.length === 0, count: `${projects.length - projectsWithoutBusinessCases.length}/${projects.length}` },
        { label: 'Risk assessments done', passed: projectsWithoutRisks.length === 0, count: `${projects.length - projectsWithoutRisks.length}/${projects.length}` },
        { label: 'Sponsors assigned', passed: projects.every(p => p.sponsor) }
      ]
    },
    {
      title: 'Priority Configuration',
      checks: [
        { label: 'Priority weights sum to 100%', passed: Math.abs(totalWeight - 100) < 0.1 },
        { label: 'All priorities have thresholds', passed: priorities.every(p => p.minThreshold >= 0) },
        { label: 'Budget ranges defined', passed: priorities.every(p => p.budgetMin >= 0 && p.budgetMax > 0), count: `${priorities.filter(p => p.budgetMin >= 0 && p.budgetMax > 0).length}/${priorities.length}` }
      ]
    }
  ]

  const consistencyChecks = [
    {
      title: 'Financial Consistency',
      checks: [
        { label: 'NPV calculations verified', passed: projects.every(p => p.npv !== undefined) },
        { label: 'IRR within reasonable range', passed: highIRRProjects.length === 0, issues: highIRRProjects.map(p => `${p.projectId}: IRR ${p.irr.toFixed(1)}%`) },
        { label: 'Cash flows balance', passed: projects.every(p => p.cashFlows.length > 0) }
      ]
    },
    {
      title: 'Timeline Feasibility',
      checks: [
        { label: 'Phase sequences logical', passed: true },
        { label: 'Resource availability matches plan', passed: false, count: '32/45' },
        { label: 'Dependencies achievable', passed: true }
      ]
    }
  ]

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">5. Data Validation</h2>
          <p className="text-slate-400">Ensure data completeness and accuracy before decision-making</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleRefreshValidation}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Re-validate
          </Button>
          <Button 
            onClick={handleApproveAll}
            disabled={criticalIssues > 0}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Approve All
          </Button>
        </div>
      </div>

      {/* Validation Summary */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="Data Quality Score"
          value={`${dataQualityScore}%`}
          icon={BarChart3}
          color={dataQualityScore >= 90 ? 'green' : dataQualityScore >= 70 ? 'amber' : 'red'}
        />
        <MetricCard
          title="Critical Issues"
          value={criticalIssues}
          icon={XCircle}
          color="red"
        />
        <MetricCard
          title="Warnings"
          value={warnings}
          icon={AlertTriangle}
          color="amber"
        />
        <MetricCard
          title="Approved Items"
          value={`${approvedItems}/${totalItems}`}
          icon={CheckCircle}
          color="green"
        />
      </div>

      {/* Validation Categories */}
      <div className="grid grid-cols-2 gap-6">
        {/* Completeness Checks */}
        <Card>
          <CardHeader>
            <CardTitle>Completeness Review</CardTitle>
            <CardDescription>Missing or incomplete data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {completenessChecks.map((category, index) => (
                <ValidationCategory
                  key={index}
                  title={category.title}
                  checks={category.checks}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Consistency Checks */}
        <Card>
          <CardHeader>
            <CardTitle>Consistency Checks</CardTitle>
            <CardDescription>Logic and calculation verification</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {consistencyChecks.map((category, index) => (
                <ValidationCategory
                  key={index}
                  title={category.title}
                  checks={category.checks}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Issues List */}
      <Card>
        <CardHeader>
          <CardTitle>Validation Issues</CardTitle>
          <div className="flex space-x-2">
            <Badge
              variant={severityFilter === 'all' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSeverityFilter('all')}
            >
              All ({validationIssues.length})
            </Badge>
            <Badge
              variant={severityFilter === 'error' ? 'destructive' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSeverityFilter('error')}
            >
              Errors ({validationIssues.filter(i => i.severity === 'error').length})
            </Badge>
            <Badge
              variant={severityFilter === 'warning' ? 'default' : 'outline'}
              className="cursor-pointer bg-amber-600"
              onClick={() => setSeverityFilter('warning')}
            >
              Warnings ({validationIssues.filter(i => i.severity === 'warning').length})
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredIssues.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                <p>No {severityFilter === 'all' ? '' : severityFilter} issues found</p>
              </div>
            ) : (
              filteredIssues.map(issue => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  onResolve={handleResolveIssue}
                  onDismiss={handleDismissIssue}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Approval Workflow */}
      <Card>
        <CardHeader>
          <CardTitle>Approval Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <ApprovalCard
              title="Finance Validation"
              approver="Jane Smith, CFO"
              status="approved"
              date={new Date()}
              comments="All financial projections reviewed and verified"
            />
            <ApprovalCard
              title="Strategy Alignment"
              approver="John Doe, CSO"
              status="pending"
              requiredFor={['All priority scores must be complete']}
            />
            <ApprovalCard
              title="Risk Review"
              approver="Mike Johnson, CRO"
              status="rejected"
              comments="High risk projects need additional mitigation plans"
            />
            <ApprovalCard
              title="Executive Sign-off"
              approver="Sarah Williams, CEO"
              status="waiting"
              dependencies={['Finance', 'Strategy', 'Risk']}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}