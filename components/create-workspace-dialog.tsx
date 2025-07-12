"use client";

import React from 'react';

interface CreateWorkspaceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  uniqueSupplierCountries: string[];
  onCreateWorkspace: (data: any) => void;
}

// Simple placeholder component since it's referenced but we're using inline dialog
export default function CreateWorkspaceDialog({ 
  isOpen, 
  onClose, 
  uniqueSupplierCountries, 
  onCreateWorkspace 
}: CreateWorkspaceDialogProps) {
  return null; // We're using inline dialog in ManageWorkspaceTab
}