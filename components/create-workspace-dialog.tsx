"use client";

interface CreateWorkspaceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  uniqueSupplierCountries: string[];
  onCreateWorkspace: (data: Record<string, unknown>) => void;
}

// Simple placeholder component since we're using popup window instead
export default function CreateWorkspaceDialog({ 
  isOpen, 
  onClose, 
  uniqueSupplierCountries, 
  onCreateWorkspace 
}: CreateWorkspaceDialogProps) {
  // Avoid unused variable warnings
  console.log('Dialog props:', { isOpen, onClose, uniqueSupplierCountries, onCreateWorkspace });
  return null; // We're using popup window for workspace management
}