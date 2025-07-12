"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Building2, Users, Plus, Activity, DollarSign, Package
} from "lucide-react";

interface Workspace {
  id: string;
  name: string;
  description: string;
  type: 'procurement' | 'cost-reduction' | 'supplier-consolidation' | 'custom';
  createdDate: string;
  owner: string;
  statistics: {
    totalParts: number;
    totalSuppliers: number;
    totalSpend: number;
    totalCategories: number;
  };
}

interface ManageWorkspaceTabProps {
  userEmail?: string;
  userName?: string;
}

const MOCK_CURRENT_USER_EMAIL = "john.doe@company.com";

export default function ManageWorkspaceTab({ 
  userEmail = MOCK_CURRENT_USER_EMAIL, 
  userName = "John Doe"
}: ManageWorkspaceTabProps) {
  const { toast } = useToast();
  const [workspaces] = useState<Workspace[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

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

  const handleCreateWorkspace = () => {
    const newWorkspace: Workspace = {
      id: `ws_${Date.now()}`,
      name: 'New Adani Workspace',
      description: 'Created for capital allocation analysis',
      type: 'custom',
      createdDate: new Date().toISOString(),
      owner: userEmail,
      statistics: {
        totalParts: 0,
        totalSuppliers: 0,
        totalSpend: 0,
        totalCategories: 0,
      }
    };
    
    sendToGoogleSheets(newWorkspace, 'created');
    setIsCreateDialogOpen(false);
    
    toast({
      title: "Workspace Created",
      description: "Your new workspace has been created successfully.",
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

  const summaryStats = {
    totalWorkspaces: workspaces.length,
    activeWorkspaces: workspaces.length,
    totalSpend: 0,
    totalParts: 0,
    totalSuppliers: 0,
  };

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
              <Button onClick={handleCreateWorkspace}>
                Create Workspace
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}