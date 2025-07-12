import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { InvestmentPriority, Opportunity } from './types';

export interface ParseResult<T> {
  data: T[];
  errors: string[];
}

export const parseExcelFile = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsBinaryString(file);
  });
};

export const parseCSVFile = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (results) => {
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      },
      header: false,
      skipEmptyLines: true
    });
  });
};

export const parseFile = async (file: File): Promise<any[]> => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  if (extension === 'csv') {
    return parseCSVFile(file);
  } else if (extension === 'xlsx' || extension === 'xls') {
    return parseExcelFile(file);
  } else {
    throw new Error('Unsupported file format');
  }
};

// Tab 1: Investment Priorities Parser
export const parsePrioritiesData = (rawData: any[]): ParseResult<InvestmentPriority> => {
  const errors: string[] = [];
  const priorities: InvestmentPriority[] = [];
  
  if (rawData.length < 2) {
    errors.push('File must contain headers and at least one data row');
    return { data: [], errors };
  }
  
  const headers = rawData[0];
  const dataRows = rawData.slice(1);
  
  const requiredHeaders = [
    'Priority Name',
    'Description',
    'Weight (%)',
    'Time Horizon (years)',
    'Min ROI (%)',
    'Max Payback (years)',
    'Risk Appetite',
    'Strategic Importance'
  ];
  
  // Validate headers
  const headerValidation = validateHeaders(headers, requiredHeaders);
  if (headerValidation.length > 0) {
    errors.push(...headerValidation);
    return { data: [], errors };
  }
  
  dataRows.forEach((row, index) => {
    if (row.length < requiredHeaders.length) {
      errors.push(`Row ${index + 2}: Missing required fields`);
      return;
    }
    
    try {
      const priority: InvestmentPriority = {
        id: `priority-${Date.now()}-${index}`,
        name: String(row[0] || '').trim(),
        description: String(row[1] || '').trim(),
        weight: parseFloat(String(row[2])) || 0,
        timeHorizon: parseInt(String(row[3])) || 0,
        minROI: parseFloat(String(row[4])) || 0,
        maxPayback: parseInt(String(row[5])) || 0,
        riskAppetite: validateRiskAppetite(String(row[6])),
        strategicImportance: Math.min(10, Math.max(1, parseInt(String(row[7])) || 1)),
        icon: '📊',
        capitalAllocation: 0,
        color: generateColor(index)
      };
      
      // Validate priority data
      const validationErrors = validatePriority(priority, index + 2);
      if (validationErrors.length > 0) {
        errors.push(...validationErrors);
      } else {
        priorities.push(priority);
      }
    } catch (error) {
      errors.push(`Row ${index + 2}: Invalid data format`);
    }
  });
  
  // Validate total weight
  const totalWeight = priorities.reduce((sum, p) => sum + p.weight, 0);
  if (Math.abs(totalWeight - 100) > 0.01) {
    errors.push(`Total weight must equal 100%. Current total: ${totalWeight.toFixed(2)}%`);
  }
  
  return { data: priorities, errors };
};

// Tab 2: Opportunities Parser
export const parseOpportunitiesData = (rawData: any[]): ParseResult<Opportunity> => {
  const errors: string[] = [];
  const opportunities: Opportunity[] = [];
  
  if (rawData.length < 2) {
    errors.push('File must contain headers and at least one data row');
    return { data: [], errors };
  }
  
  const headers = rawData[0];
  const dataRows = rawData.slice(1);
  
  const requiredHeaders = [
    'Opportunity Name',
    'Description',
    'Source',
    'Sponsor',
    'Status',
    'Investment Min (USD)',
    'Investment Max (USD)',
    'ROI (%)',
    'Timeline (months)',
    'Strategic Fit Score',
    'Risk Score',
    'Category'
  ];
  
  const headerValidation = validateHeaders(headers, requiredHeaders);
  if (headerValidation.length > 0) {
    errors.push(...headerValidation);
    return { data: [], errors };
  }
  
  dataRows.forEach((row, index) => {
    if (row.length < requiredHeaders.length) {
      errors.push(`Row ${index + 2}: Missing required fields`);
      return;
    }
    
    try {
      const opportunity: Opportunity = {
        id: `opp-${Date.now()}-${index}`,
        name: String(row[0] || '').trim(),
        description: String(row[1] || '').trim(),
        source: String(row[2] || '').trim(),
        sponsor: String(row[3] || '').trim(),
        status: validateOpportunityStatus(String(row[4])),
        investmentRange: {
          min: parseFloat(String(row[5])) || 0,
          max: parseFloat(String(row[6])) || 0
        },
        estimatedStart: new Date().toISOString(),
        duration: parseInt(String(row[8])) || 0,
        strategicFitScore: Math.min(100, Math.max(0, parseInt(String(row[9])) || 0)),
        preliminaryRiskScore: Math.min(100, Math.max(0, parseInt(String(row[10])) || 0)),
        recommendations: `Imported opportunity: ${String(row[11] || '').trim()}`,
        approvedBy: null,
        updatedBy: 'System Import',
        updatedDate: new Date()
      };
      
      const validationErrors = validateOpportunity(opportunity, index + 2);
      if (validationErrors.length > 0) {
        errors.push(...validationErrors);
      } else {
        opportunities.push(opportunity);
      }
    } catch (error) {
      errors.push(`Row ${index + 2}: Invalid data format`);
    }
  });
  
  return { data: opportunities, errors };
};

// Tab 3: Validated Projects Parser
export const parseValidatedProjectsData = (rawData: any[]): ParseResult<any> => {
  const errors: string[] = [];
  const projects: any[] = [];
  
  if (rawData.length < 2) {
    errors.push('File must contain headers and at least one data row');
    return { data: [], errors };
  }
  
  const headers = rawData[0];
  const dataRows = rawData.slice(1);
  
  const requiredHeaders = [
    'Project Name',
    'Investment Amount',
    'Expected IRR (%)',
    'Risk Score',
    'NPV',
    'Payback Period (years)',
    'Strategic Alignment Score'
  ];
  
  const headerValidation = validateHeaders(headers, requiredHeaders);
  if (headerValidation.length > 0) {
    errors.push(...headerValidation);
    return { data: [], errors };
  }
  
  dataRows.forEach((row, index) => {
    if (row.length < requiredHeaders.length) {
      errors.push(`Row ${index + 2}: Missing required fields`);
      return;
    }
    
    try {
      const project = {
        id: `proj-${Date.now()}-${index}`,
        name: String(row[0] || '').trim(),
        investmentAmount: parseFloat(String(row[1])) || 0,
        expectedIRR: parseFloat(String(row[2])) || 0,
        riskScore: Math.min(100, Math.max(0, parseInt(String(row[3])) || 0)),
        npv: parseFloat(String(row[4])) || 0,
        paybackPeriod: parseFloat(String(row[5])) || 0,
        strategicAlignmentScore: Math.min(100, Math.max(0, parseInt(String(row[6])) || 0))
      };
      
      if (!project.name) {
        errors.push(`Row ${index + 2}: Project name is required`);
      } else if (project.investmentAmount <= 0) {
        errors.push(`Row ${index + 2}: Investment amount must be positive`);
      } else {
        projects.push(project);
      }
    } catch (error) {
      errors.push(`Row ${index + 2}: Invalid data format`);
    }
  });
  
  return { data: projects, errors };
};

// Tab 4: Sector Allocations Parser
export const parseSectorAllocationsData = (rawData: any[]): ParseResult<any> => {
  const errors: string[] = [];
  const allocations: any[] = [];
  
  if (rawData.length < 2) {
    errors.push('File must contain headers and at least one data row');
    return { data: [], errors };
  }
  
  const headers = rawData[0];
  const dataRows = rawData.slice(1);
  
  const requiredHeaders = [
    'Sector Name',
    'Allocated Amount (USD)',
    'Target Percentage (%)',
    'Min Projects',
    'Max Projects'
  ];
  
  const headerValidation = validateHeaders(headers, requiredHeaders);
  if (headerValidation.length > 0) {
    errors.push(...headerValidation);
    return { data: [], errors };
  }
  
  dataRows.forEach((row, index) => {
    if (row.length < requiredHeaders.length) {
      errors.push(`Row ${index + 2}: Missing required fields`);
      return;
    }
    
    try {
      const allocation = {
        sectorId: `sector-${Date.now()}-${index}`,
        sectorName: String(row[0] || '').trim(),
        allocatedAmount: parseFloat(String(row[1])) || 0,
        percentage: parseFloat(String(row[2])) || 0,
        minProjects: parseInt(String(row[3])) || 0,
        maxProjects: parseInt(String(row[4])) || 0,
        projectCount: 0
      };
      
      if (!allocation.sectorName) {
        errors.push(`Row ${index + 2}: Sector name is required`);
      } else if (allocation.allocatedAmount < 0) {
        errors.push(`Row ${index + 2}: Allocated amount cannot be negative`);
      } else if (allocation.percentage < 0 || allocation.percentage > 100) {
        errors.push(`Row ${index + 2}: Percentage must be between 0 and 100`);
      } else {
        allocations.push(allocation);
      }
    } catch (error) {
      errors.push(`Row ${index + 2}: Invalid data format`);
    }
  });
  
  return { data: allocations, errors };
};

// Helper functions
const validateHeaders = (actualHeaders: any[], requiredHeaders: string[]): string[] => {
  const errors: string[] = [];
  const normalizedActual = actualHeaders.map(h => String(h).trim());
  
  requiredHeaders.forEach((header, index) => {
    if (!normalizedActual[index] || 
        normalizedActual[index].toLowerCase() !== header.toLowerCase()) {
      errors.push(`Column ${index + 1} should be "${header}"`);
    }
  });
  
  return errors;
};

const validateRiskAppetite = (value: string): 'conservative' | 'moderate' | 'aggressive' => {
  const normalized = value.toLowerCase().trim();
  if (normalized === 'conservative' || normalized === 'moderate' || normalized === 'aggressive') {
    return normalized as any;
  }
  return 'moderate';
};

const validateOpportunityStatus = (value: string): 'new' | 'under_review' | 'approved' | 'rejected' => {
  const normalized = value.toLowerCase().trim().replace(/_/g, ' ');
  const statusMap: Record<string, any> = {
    'new': 'new',
    'under review': 'under_review',
    'approved': 'approved',
    'rejected': 'rejected'
  };
  return statusMap[normalized] || 'new';
};

const validatePriority = (priority: InvestmentPriority, rowNum: number): string[] => {
  const errors: string[] = [];
  
  if (!priority.name) {
    errors.push(`Row ${rowNum}: Priority name is required`);
  }
  if (priority.weight < 0 || priority.weight > 100) {
    errors.push(`Row ${rowNum}: Weight must be between 0 and 100`);
  }
  if (priority.timeHorizon <= 0) {
    errors.push(`Row ${rowNum}: Time horizon must be positive`);
  }
  if (priority.minROI < 0) {
    errors.push(`Row ${rowNum}: Min ROI cannot be negative`);
  }
  if (priority.maxPayback <= 0) {
    errors.push(`Row ${rowNum}: Max payback must be positive`);
  }
  
  return errors;
};

const validateOpportunity = (opportunity: Opportunity, rowNum: number): string[] => {
  const errors: string[] = [];
  
  if (!opportunity.name) {
    errors.push(`Row ${rowNum}: Opportunity name is required`);
  }
  if (opportunity.investmentRange.min < 0) {
    errors.push(`Row ${rowNum}: Investment min cannot be negative`);
  }
  if (opportunity.investmentRange.max < opportunity.investmentRange.min) {
    errors.push(`Row ${rowNum}: Investment max must be greater than or equal to min`);
  }
  if (opportunity.duration <= 0) {
    errors.push(`Row ${rowNum}: Duration must be positive`);
  }
  
  return errors;
};

const generateColor = (index: number): string => {
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#06B6D4', '#84CC16'
  ];
  return colors[index % colors.length];
};