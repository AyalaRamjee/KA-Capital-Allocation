"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import CreateWorkspaceDialog from './create-workspace-dialog';
import { 
  Building2, Users, Calendar, Settings, Trash2, Edit, Share2, Search, 
  Plus, Grid3X3, List, Activity, Shield, Clock, UserPlus, Mail, 
  MoreVertical, Eye, ChevronRight, Globe, MapPin, Sparkles, 
  FileText, CheckCircle, AlertCircle, Loader2, UserCheck, UserX,
  FolderOpen, Archive, Star, StarOff, Filter, Download, Upload,
  Lock, Unlock, TrendingUp, DollarSign, Package, AlertTriangle,
  History, Key, RefreshCw, Copy, ExternalLink, BarChart3, Info // Added Info here!
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WorkspaceUser {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  addedDate: string;
  lastActive?: string;
  department?: string;
  avatar?: string;
}

interface WorkspaceActivity {
  id: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: string;
  details?: string;
}

interface Workspace {
  id: string;
  name: string;
  description: string;
  type: 'procurement' | 'cost-reduction' | 'supplier-consolidation' | 'custom';
  createdDate: string;
  lastModified: string;
  lastAnalysis?: string;
  owner: string;
  ownerName?: string;
  status: 'active' | 'archived';
  users: WorkspaceUser[];
  settings: {
    isPublic: boolean;
    allowExternalSharing: boolean;
    dataRetentionDays: number;
    requireApproval: boolean;
    autoArchiveDays?: number;
  };
  statistics: {
    totalParts: number;
    totalSuppliers: number;
    totalSpend: number;
    totalCategories: number;
    lastDataImport?: string;
    dataSource?: string;
  };
  tags: string[];
  department?: string;
  businessUnit?: string;
  region?: string;
  companyDomain: string;
  activityLog?: WorkspaceActivity[];
}

interface ManageWorkspaceTabProps {
  userEmail?: string;
  userName?: string;
  companyDomain?: string;
}

const MOCK_CURRENT_USER_EMAIL = "john.doe@company.com";
const MOCK_COMPANY_DOMAIN = "company.com";

// Workspace type configurations
const WORKSPACE_TYPES = {
  procurement: {
    name: 'Annual Procurement Review',
    icon: Package,
    color: 'blue',
    description: 'Year-over-year analysis with supplier scorecards'
  },
  'cost-reduction': {
    name: 'Cost Reduction Initiative',
    icon: TrendingUp,
    color: 'green',
    description: 'Track savings and optimization opportunities'
  },
  'supplier-consolidation': {
    name: 'Supplier Consolidation',
    icon: Users,
    color: 'purple',
    description: 'Identify redundancies and consolidation potential'
  },
  custom: {
    name: 'Custom Workspace',
    icon: Settings,
    color: 'gray',
    description: 'Configure for your specific needs'
  }
};

export default function ManageWorkspaceTab({ 
  userEmail = MOCK_CURRENT_USER_EMAIL, 
  userName = "John Doe",
  companyDomain = MOCK_COMPANY_DOMAIN
}: ManageWorkspaceTabProps) {
  const { toast } = useToast();
  // Store workspaces in memory only - no localStorage
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'archived'>('active');
  const [filterType, setFilterType] = useState<'all' | 'owned' | 'shared'>('all');
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isCloneDialogOpen, setIsCloneDialogOpen] = useState(false);
  
  // Form states
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [shareEmail, setShareEmail] = useState('');
  const [shareRole, setShareRole] = useState<'admin' | 'editor' | 'viewer'>('viewer');
  const [shareDepartment, setShareDepartment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cloneName, setCloneName] = useState('');

  // Extract company domain from user email if not provided
  const userCompanyDomain = useMemo(() => {
    if (companyDomain) return companyDomain;
    const emailDomain = userEmail.split('@')[1];
    return emailDomain || MOCK_COMPANY_DOMAIN;
  }, [userEmail, companyDomain]);

  // Save workspaces to state only (in-memory)
  const saveWorkspaces = (updatedWorkspaces: Workspace[]) => {
    setWorkspaces(updatedWorkspaces);
  };

  // Send workspace data to Google Sheets
  const sendToGoogleSheets = (workspace: Workspace, action: string) => {
    try {
      const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxw88r13q3DvqPeYdmyPZOKwDmvJXEi1m_MNIHy12uvKlOJb_3qbR35ntRjkuh1z5No/exec';
      
      const payload = {
        action: 'workspace_' + action,
        timestamp: new Date().toISOString(),
        workspaceId: workspace.id,
        workspaceName: workspace.name,
        workspaceType: workspace.type,
        description: workspace.description,
        owner: workspace.owner,
        ownerName: workspace.ownerName,
        status: workspace.status,
        department: workspace.department || '',
        businessUnit: workspace.businessUnit || '',
        region: workspace.region || '',
        totalParts: workspace.statistics.totalParts,
        totalSuppliers: workspace.statistics.totalSuppliers,
        totalSpend: workspace.statistics.totalSpend,
        totalCategories: workspace.statistics.totalCategories,
        userCount: workspace.users.length,
        tags: workspace.tags.join(', '),
        companyDomain: workspace.companyDomain,
        userEmail: userEmail,
        userName: userName
      };

      fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      }).then(() => {
        console.log(`Workspace ${action} sent to Google Sheets:`, payload);
      }).catch(error => {
        console.error('Error sending to Google Sheets:', error);
      });
    } catch (error) {
      console.error('Error preparing Google Sheets data:', error);
    }
  };

  // Add activity log entry
  const addActivityLog = (workspace: Workspace, action: string, details?: string): WorkspaceActivity => {
    return {
      id: `activity_${Date.now()}`,
      userId: userEmail,
      userName: userName,
      action,
      timestamp: new Date().toISOString(),
      details
    };
  };

  // Filter workspaces
  const filteredWorkspaces = useMemo(() => {
    return workspaces.filter(ws => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        ws.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ws.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ws.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        ws.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ws.businessUnit?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = filterStatus === 'all' || ws.status === filterStatus;
      
      // Type filter
      let matchesType = true;
      if (filterType === 'owned') {
        matchesType = ws.owner === userEmail;
      } else if (filterType === 'shared') {
        matchesType = ws.owner !== userEmail;
      }
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [workspaces, searchTerm, filterStatus, filterType, userEmail]);

  // Validate email domain against workspace domain
  const validateEmailDomain = (email: string, workspaceDomain: string): boolean => {
    const emailDomain = email.split('@')[1];
    return emailDomain === workspaceDomain;
  };

  // Handlers
  const handleCreateWorkspace = async (workspaceData: any) => {
    const newWorkspace: Workspace = {
      id: `ws_${Date.now()}`,
      name: workspaceData.workspaceName || 'New Workspace',
      description: workspaceData.workspaceDescription || `Created by ${workspaceData.firstName} ${workspaceData.lastName}`,
      type: workspaceData.workspaceType || 'custom',
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      owner: workspaceData.email,
      ownerName: `${workspaceData.firstName} ${workspaceData.lastName}`,
      status: 'active',
      users: [{
        id: 'user_' + Date.now(),
        email: workspaceData.email,
        name: `${workspaceData.firstName} ${workspaceData.lastName}`,
        role: 'owner',
        addedDate: new Date().toISOString(),
        department: workspaceData.department || 'Not specified',
      }],
      settings: {
        isPublic: false,
        allowExternalSharing: false,
        dataRetentionDays: 90,
        requireApproval: true,
        autoArchiveDays: 180,
      },
      statistics: {
        totalParts: 0,
        totalSuppliers: 0,
        totalSpend: 0,
        totalCategories: 0,
      },
      tags: workspaceData.tags || [],
      department: workspaceData.department,
      businessUnit: workspaceData.businessUnit,
      region: workspaceData.region,
      companyDomain: userCompanyDomain,
      activityLog: [addActivityLog({} as Workspace, 'Workspace created')],
    };
    
    // Save to in-memory state
    const updatedWorkspaces = [...workspaces, newWorkspace];
    setWorkspaces(updatedWorkspaces);
    
    // Send to Google Sheets in background (no await to avoid blocking)
    sendToGoogleSheets(newWorkspace, 'created');
    
    // Don't show toast here - let the dialog handle it
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: value >= 1000000 ? 'compact' : 'standard',
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: value >= 1000 ? 'compact' : 'standard',
      maximumFractionDigits: 1,
    }).format(value);
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const active = workspaces.filter(ws => ws.status === 'active');
    const totalSpend = active.reduce((sum, ws) => sum + ws.statistics.totalSpend, 0);
    const totalParts = active.reduce((sum, ws) => sum + ws.statistics.totalParts, 0);
    const totalSuppliers = active.reduce((sum, ws) => sum + ws.statistics.totalSuppliers, 0);
    
    return {
      totalWorkspaces: workspaces.length,
      activeWorkspaces: active.length,
      totalSpend,
      totalParts,
      totalSuppliers,
    };
  }, [workspaces]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold flex items-center">
                <Building2 className="mr-3 h-7 w-7 text-primary" />
                Manage Workspace
              </CardTitle>
              <CardDescription className="text-base">
                Create and manage procurement analysis workspaces for your organization
              </CardDescription>
            </div>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              size="lg"
              className="shadow-sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Workspace
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="border-0 shadow-none bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Workspaces</p>
                    <p className="text-2xl font-bold">{summaryStats.totalWorkspaces}</p>
                  </div>
                  <Building2 className="h-8 w-8 text-muted-foreground/50" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-none bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active</p>
                    <p className="text-2xl font-bold text-green-600">{summaryStats.activeWorkspaces}</p>
                  </div>
                  <Activity className="h-8 w-8 text-green-600/50" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-none bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Spend</p>
                    <p className="text-2xl font-bold">{formatCurrency(summaryStats.totalSpend)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-muted-foreground/50" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-none bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Parts</p>
                    <p className="text-2xl font-bold">{formatNumber(summaryStats.totalParts)}</p>
                  </div>
                  <Package className="h-8 w-8 text-muted-foreground/50" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-none bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Suppliers</p>
                    <p className="text-2xl font-bold">{formatNumber(summaryStats.totalSuppliers)}</p>
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground/50" />
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {filteredWorkspaces.length === 0 && (
        <Card className="p-12 text-center border-dashed">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No workspaces found</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Create your first workspace to get started with portfolio analysis
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Workspace
          </Button>
        </Card>
      )}

      {/* Create Workspace Dialog */}
      {isCreateDialogOpen && (
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Workspace</DialogTitle>
              <DialogDescription>
                Set up a new workspace for managing your investment portfolio.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="workspace-name">Workspace Name</Label>
                <Input
                  id="workspace-name"
                  placeholder="Enter workspace name"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workspace-description">Description</Label>
                <Textarea
                  id="workspace-description"
                  placeholder="Describe the purpose of this workspace"
                  rows={3}
                  className="resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workspace-type">Workspace Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select workspace type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom Workspace</SelectItem>
                    <SelectItem value="procurement">Annual Procurement Review</SelectItem>
                    <SelectItem value="cost-reduction">Cost Reduction Initiative</SelectItem>
                    <SelectItem value="supplier-consolidation">Supplier Consolidation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                // Create a basic workspace
                const newWorkspace = {
                  workspaceName: 'New Adani Workspace',
                  workspaceDescription: 'Created for capital allocation analysis',
                  workspaceType: 'custom',
                  firstName: 'Admin',
                  lastName: 'User',
                  email: userEmail,
                  department: 'Portfolio Management',
                  tags: ['adani', 'capital-allocation']
                };
                handleCreateWorkspace(newWorkspace);
                setIsCreateDialogOpen(false);
                toast({
                  title: "Workspace Created",
                  description: "Your new workspace has been created successfully.",
                });
              }}>
                Create Workspace
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}