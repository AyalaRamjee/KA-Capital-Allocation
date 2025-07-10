'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, FileCheck, Users, Calendar, DollarSign, TrendingUp, AlertCircle, Clock, UserCheck, MessageSquare, Download, Filter } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Progress } from '../../../components/ui/progress'
import { Textarea } from '../../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { useAllocationData } from '../../../hooks/use-allocation-data'
import { ValidationIssue, ApprovalStatus } from '../../../lib/data-models'
import { cn } from '../../../lib/utils'

interface ValidationRule {
  id: string
  name: string
  category: 'completeness' | 'consistency' | 'accuracy' | 'compliance'
  severity: 'error' | 'warning'
  description: string
  check: (state: any) => ValidationIssue[]
}

const validationRules: ValidationRule[] = [
  {
    id: 'priority-weights',
    name: 'Priority Weights Sum to 100%',
    category: 'consistency',
    severity: 'error',
    description: 'All investment priority weights must sum exactly to 100%',
    check: (state) => {
      const total = state.priorities.reduce((sum: number, p: any) => sum + p.weight, 0)
      if (Math.abs(total - 100) > 0.1) {
        return [{
          id: 'priority-weights-error',
          severity: 'error' as const,
          title: 'Priority weights must sum to 100%',
          description: `Current total: ${total.toFixed(1)}%. Adjust weights to equal 100%.`,
          affectedItems: ['priorities'],
          category: 'consistency' as const,
          resolved: false
        }]
      }
      return []
    }
  },
  {
    id: 'missing-financials',
    name: 'Complete Financial Data',
    category: 'completeness',
    severity: 'error',
    description: 'All projects must have complete financial projections',
    check: (state) => {
      const issues: ValidationIssue[] = []
      state.projects.forEach((project: any) => {
        if (!project.npv || !project.irr || project.cashFlows.length === 0) {
          issues.push({
            id: `missing-financials-${project.id}`,
            severity: 'error' as const,
            title: 'Missing financial data',
            description: `Project ${project.projectId} lacks NPV, IRR, or cash flow projections`,
            affectedItems: [project.projectId],
            category: 'completeness' as const,
            resolved: false
          })
        }
      })
      return issues
    }
  },
  {
    id: 'unrealistic-irr',
    name: 'Realistic IRR Values',
    category: 'accuracy',
    severity: 'warning',
    description: 'IRR values should be within reasonable ranges (0-100%)',
    check: (state) => {
      const issues: ValidationIssue[] = []
      state.projects.forEach((project: any) => {
        if (project.irr > 100 || project.irr < 0) {
          issues.push({
            id: `unrealistic-irr-${project.id}`,
            severity: 'warning' as const,
            title: 'Unrealistic IRR value',
            description: `Project ${project.projectId} has IRR of ${project.irr.toFixed(1)}% - please review`,
            affectedItems: [project.projectId],
            category: 'accuracy' as const,
            resolved: false
          })
        }
      })
      return issues
    }
  },
  {
    id: 'negative-npv',
    name: 'Negative NPV Projects',
    category: 'accuracy',
    severity: 'warning',
    description: 'Projects with negative NPV may not create value',
    check: (state) => {
      const issues: ValidationIssue[] = []
      state.projects.forEach((project: any) => {
        if (project.npv < 0) {
          issues.push({
            id: `negative-npv-${project.id}`,
            severity: 'warning' as const,
            title: 'Negative NPV project',
            description: `Project ${project.projectId} has negative NPV of $${(project.npv / 1000000).toFixed(1)}M`,
            affectedItems: [project.projectId],
            category: 'accuracy' as const,
            resolved: false
          })
        }
      })
      return issues
    }
  },
  {
    id: 'budget-exceeded',
    name: 'Budget Constraints',
    category: 'consistency',
    severity: 'error',
    description: 'Total project investments cannot exceed available budget',
    check: (state) => {
      const totalInvestment = state.projects.reduce((sum: number, p: any) => sum + p.initialCapex, 0)
      if (totalInvestment > state.availableBudget) {
        return [{
          id: 'budget-exceeded-error',
          severity: 'error' as const,
          title: 'Budget constraint violated',
          description: `Total investments ($${(totalInvestment / 1000000).toFixed(1)}M) exceed available budget ($${(state.availableBudget / 1000000).toFixed(1)}M)`,
          affectedItems: ['budget'],
          category: 'consistency' as const,
          resolved: false
        }]
      }
      return []
    }
  },
  {
    id: 'missing-sponsors',
    name: 'Executive Sponsors',
    category: 'completeness',
    severity: 'warning',
    description: 'All projects should have assigned executive sponsors',
    check: (state) => {
      const issues: ValidationIssue[] = []
      state.projects.forEach((project: any) => {
        if (!project.sponsor || project.sponsor.trim() === '') {
          issues.push({
            id: `missing-sponsor-${project.id}`,
            severity: 'warning' as const,
            title: 'Missing executive sponsor',
            description: `Project ${project.projectId} needs an assigned executive sponsor`,
            affectedItems: [project.projectId],
            category: 'completeness' as const,
            resolved: false
          })
        }
      })
      return issues
    }
  },
  {
    id: 'priority-alignment',
    name: 'Priority Alignment',
    category: 'completeness',
    severity: 'warning',
    description: 'Projects should be aligned to at least one strategic priority',
    check: (state) => {
      const issues: ValidationIssue[] = []
      state.projects.forEach((project: any) => {
        if (!project.priorityAlignment || project.priorityAlignment.length === 0) {
          issues.push({
            id: `no-priority-alignment-${project.id}`,
            severity: 'warning' as const,
            title: 'No priority alignment',
            description: `Project ${project.projectId} is not aligned to any strategic priorities`,
            affectedItems: [project.projectId],
            category: 'completeness' as const,
            resolved: false
          })
        }
      })
      return issues
    }
  }
]

function ValidationDashboard({ issues }: { issues: ValidationIssue[] }) {
  const criticalIssues = issues.filter(i => i.severity === 'error').length
  const warnings = issues.filter(i => i.severity === 'warning').length
  const resolvedIssues = issues.filter(i => i.resolved).length
  
  const dataQualityScore = Math.max(0, 100 - (criticalIssues * 20) - (warnings * 5))

  const categoryStats = {
    completeness: issues.filter(i => i.category === 'completeness').length,
    consistency: issues.filter(i => i.category === 'consistency').length,
    accuracy: issues.filter(i => i.category === 'accuracy').length,
    compliance: issues.filter(i => i.category === 'compliance').length
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Data Quality Score</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="relative">
              <div className={cn(
                "text-6xl font-bold",
                dataQualityScore >= 90 ? "text-green-400" :
                dataQualityScore >= 70 ? "text-amber-400" : "text-red-400"
              )}>
                {dataQualityScore}
              </div>
              <div className="text-slate-400">/ 100</div>
            </div>
            <Progress 
              value={dataQualityScore} 
              className="h-3"
            />
            <div className="text-sm text-slate-400">
              {dataQualityScore >= 90 ? "Excellent" :
               dataQualityScore >= 70 ? "Good" :
               dataQualityScore >= 50 ? "Fair" : "Poor"} data quality
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issue Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>Validation Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-400">{criticalIssues}</div>
                <div className="text-sm text-slate-400">Critical Issues</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-400">{warnings}</div>
                <div className="text-sm text-slate-400">Warnings</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">{resolvedIssues}</div>
                <div className="text-sm text-slate-400">Resolved</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-white">By Category</div>
              {Object.entries(categoryStats).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm text-slate-300 capitalize">{category}</span>
                  <Badge variant={count > 0 ? "destructive" : "secondary"}>
                    {count}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function IssueCard({ 
  issue, 
  onResolve, 
  onAddComment 
}: { 
  issue: ValidationIssue
  onResolve: (id: string, comment: string) => void
  onAddComment: (id: string, comment: string) => void
}) {
  const [comment, setComment] = useState('')
  const [showResolve, setShowResolve] = useState(false)

  const getIcon = () => {
    if (issue.resolved) return <CheckCircle className="w-5 h-5 text-green-400" />
    if (issue.severity === 'error') return <XCircle className="w-5 h-5 text-red-400" />
    return <AlertTriangle className="w-5 h-5 text-amber-400" />
  }

  const getBorderColor = () => {
    if (issue.resolved) return 'border-green-500/30'
    if (issue.severity === 'error') return 'border-red-500/30'
    return 'border-amber-500/30'
  }

  const getBgColor = () => {
    if (issue.resolved) return 'bg-green-900/10'
    if (issue.severity === 'error') return 'bg-red-900/10'
    return 'bg-amber-900/10'
  }

  return (
    <Card className={cn("border", getBorderColor(), getBgColor())}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            {getIcon()}
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h4 className="font-medium text-white">{issue.title}</h4>
                <Badge className={cn(
                  "text-xs",
                  issue.severity === 'error' ? "bg-red-500" : "bg-amber-500"
                )}>
                  {issue.severity}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {issue.category}
                </Badge>
              </div>
              <p className="text-sm text-slate-300 mb-3">{issue.description}</p>
              
              {issue.affectedItems.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs text-slate-400 mb-1">Affected Items:</div>
                  <div className="flex flex-wrap gap-1">
                    {issue.affectedItems.map(item => (
                      <Badge key={item} variant="outline" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {showResolve && (
                <div className="space-y-2">
                  <Textarea
                    placeholder="Add resolution comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="bg-slate-700 border-slate-600"
                    rows={2}
                  />
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      onClick={() => {
                        onResolve(issue.id, comment)
                        setShowResolve(false)
                        setComment('')
                      }}
                      disabled={!comment.trim()}
                    >
                      Mark Resolved
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setShowResolve(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-2">
            {!issue.resolved && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowResolve(!showResolve)}
              >
                <CheckCircle className="w-4 h-4" />
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const comment = prompt('Add comment:')
                if (comment) onAddComment(issue.id, comment)
              }}
            >
              <MessageSquare className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ApprovalWorkflow({ approvals, onUpdateApproval }: {
  approvals: ApprovalStatus[]
  onUpdateApproval: (id: string, status: ApprovalStatus['status'], comments?: string) => void
}) {
  const getStatusIcon = (status: ApprovalStatus['status']) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'rejected': return <XCircle className="w-5 h-5 text-red-400" />
      case 'waiting': return <Clock className="w-5 h-5 text-amber-400" />
      default: return <UserCheck className="w-5 h-5 text-blue-400" />
    }
  }

  const getStatusColor = (status: ApprovalStatus['status']) => {
    switch (status) {
      case 'approved': return 'text-green-400'
      case 'rejected': return 'text-red-400'
      case 'waiting': return 'text-amber-400'
      default: return 'text-blue-400'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="w-5 h-5" />
          <span>Approval Workflow</span>
        </CardTitle>
        <CardDescription>Track executive approvals for portfolio decisions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {approvals.map((approval, index) => (
            <div key={approval.id} className="flex items-center space-x-4 p-4 bg-slate-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                {getStatusIcon(approval.status)}
              </div>
              
              <div className="flex-1">
                <div className="font-medium text-white">{approval.title}</div>
                <div className="text-sm text-slate-400">Approver: {approval.approver}</div>
                {approval.comments && (
                  <div className="text-sm text-slate-300 mt-1">"{approval.comments}"</div>
                )}
              </div>

              <div className="text-right">
                <div className={cn("font-medium", getStatusColor(approval.status))}>
                  {approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}
                </div>
                {approval.date && (
                  <div className="text-xs text-slate-400">
                    {approval.date.toLocaleDateString()}
                  </div>
                )}
              </div>

              {approval.status === 'pending' && (
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      const comments = prompt('Approval comments (optional):')
                      onUpdateApproval(approval.id, 'approved', comments || undefined)
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      const comments = prompt('Rejection reason:')
                      if (comments) onUpdateApproval(approval.id, 'rejected', comments)
                    }}
                  >
                    Reject
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function DataValidationEnhanced() {
  const { state, updateState } = useAllocationData()
  const [issues, setIssues] = useState<ValidationIssue[]>([])
  const [isValidating, setIsValidating] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterSeverity, setFilterSeverity] = useState<string>('all')
  const [approvals, setApprovals] = useState<ApprovalStatus[]>([
    {
      id: 'financial-review',
      title: 'Financial Data Review',
      approver: 'Sarah Chen, CFO',
      status: 'pending',
      dependencies: [],
      requiredFor: ['portfolio-approval']
    },
    {
      id: 'risk-assessment',
      title: 'Risk Assessment Approval',
      approver: 'Michael Rodriguez, CRO',
      status: 'pending',
      dependencies: [],
      requiredFor: ['portfolio-approval']
    },
    {
      id: 'strategy-alignment',
      title: 'Strategic Alignment Review',
      approver: 'David Kim, CSO',
      status: 'waiting',
      dependencies: ['financial-review'],
      requiredFor: ['portfolio-approval']
    },
    {
      id: 'portfolio-approval',
      title: 'Final Portfolio Approval',
      approver: 'Jennifer Walsh, CEO',
      status: 'waiting',
      dependencies: ['financial-review', 'risk-assessment', 'strategy-alignment'],
      requiredFor: []
    }
  ])

  if (!state) {
    return <div className="p-6 text-center">Loading...</div>
  }

  const runValidation = async () => {
    setIsValidating(true)
    
    // Simulate validation delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const allIssues: ValidationIssue[] = []
    
    validationRules.forEach(rule => {
      const ruleIssues = rule.check(state)
      allIssues.push(...ruleIssues)
    })
    
    setIssues(allIssues)
    setIsValidating(false)
  }

  const handleResolveIssue = (issueId: string, comment: string) => {
    setIssues(prev => prev.map(issue => 
      issue.id === issueId 
        ? { ...issue, resolved: true, comments: comment }
        : issue
    ))
  }

  const handleAddComment = (issueId: string, comment: string) => {
    setIssues(prev => prev.map(issue => 
      issue.id === issueId 
        ? { ...issue, comments: (issue.comments || '') + '\n' + comment }
        : issue
    ))
  }

  const handleUpdateApproval = (approvalId: string, status: ApprovalStatus['status'], comments?: string) => {
    setApprovals(prev => prev.map(approval =>
      approval.id === approvalId
        ? { 
            ...approval, 
            status, 
            comments, 
            date: new Date() 
          }
        : approval
    ))
  }

  const filteredIssues = issues.filter(issue => {
    const categoryMatch = filterCategory === 'all' || issue.category === filterCategory
    const severityMatch = filterSeverity === 'all' || issue.severity === filterSeverity
    return categoryMatch && severityMatch
  })

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">5. Data Validation</h2>
          <p className="text-slate-400">Validate data quality and manage approval workflows</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={runValidation} 
            disabled={isValidating}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {isValidating ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <FileCheck className="w-4 h-4 mr-2" />
            )}
            {isValidating ? 'Validating...' : 'Run Validation'}
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Validation Dashboard */}
      <ValidationDashboard issues={issues} />

      {/* Validation Progress */}
      {isValidating && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
              <div className="flex-1">
                <div className="text-white font-medium">Running validation checks...</div>
                <div className="text-slate-400 text-sm">Analyzing {validationRules.length} validation rules</div>
              </div>
              <Progress value={85} className="w-32" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Issues List */}
      {issues.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Validation Issues ({filteredIssues.length})</span>
                </CardTitle>
                <CardDescription>Review and resolve data quality issues</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-40 bg-slate-700 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="completeness">Completeness</SelectItem>
                    <SelectItem value="consistency">Consistency</SelectItem>
                    <SelectItem value="accuracy">Accuracy</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                  <SelectTrigger className="w-32 bg-slate-700 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="all">All Severity</SelectItem>
                    <SelectItem value="error">Errors</SelectItem>
                    <SelectItem value="warning">Warnings</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredIssues.map(issue => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  onResolve={handleResolveIssue}
                  onAddComment={handleAddComment}
                />
              ))}
              {filteredIssues.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-400" />
                  <p>No issues found with current filters</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approval Workflow */}
      <ApprovalWorkflow
        approvals={approvals}
        onUpdateApproval={handleUpdateApproval}
      />
    </div>
  )
}