# Excel/CSV Upload Templates

This folder contains sample templates for uploading data to each tab of the Adani Growth System.

## Files Included

### CSV Templates (Individual Files)
- `Tab1_Priorities_Template.csv` - Investment Priorities data
- `Tab2_Opportunities_Template.csv` - Source Opportunities data  
- `Tab3_ValidatedProjects_Template.csv` - Validated Projects data
- `Tab4_SectorAllocations_Template.csv` - Sector Allocations data

## Usage Instructions

### Tab 1: Investment Priorities
**Required Columns:**
- Priority Name
- Description
- Weight (%) - Must total 100% across all priorities
- Time Horizon (years)
- Min ROI (%)
- Max Payback (years)
- Risk Appetite (conservative/moderate/aggressive)
- Strategic Importance (1-10)

### Tab 2: Source Opportunities
**Required Columns:**
- Opportunity Name
- Description
- Source
- Sponsor
- Status (new/under_review/approved/rejected)
- Investment Min (USD)
- Investment Max (USD)
- ROI (%)
- Timeline (months)
- Strategic Fit Score (0-100)
- Risk Score (0-100)
- Category

### Tab 3: Validated Projects
**Required Columns:**
- Project Name
- Investment Amount (USD)
- Expected IRR (%)
- Risk Score (0-100)
- NPV (USD)
- Payback Period (years)
- Strategic Alignment Score (0-100)

### Tab 4: Sector Allocations
**Required Columns:**
- Sector Name
- Allocated Amount (USD)
- Target Percentage (%)
- Min Projects
- Max Projects

## Data Validation Rules

### Tab 1 (Priorities)
- Weights must total exactly 100%
- Strategic Importance must be 1-10
- Risk Appetite must be one of: conservative, moderate, aggressive

### Tab 2 (Opportunities)
- Investment Max must be >= Investment Min
- Strategic Fit Score and Risk Score must be 0-100
- Status must be one of: new, under_review, approved, rejected

### Tab 3 (Projects)
- Investment Amount must be positive
- Risk Score and Strategic Alignment Score must be 0-100
- Payback Period must be positive

### Tab 4 (Allocations)
- Allocated Amount cannot be negative
- Target Percentage must be 0-100
- Min Projects cannot exceed Max Projects

## Tips for Successful Upload

1. **Use the exact column headers** as shown in the templates
2. **Check data types** - numbers should not contain commas or currency symbols
3. **Validate totals** - especially for Tab 1 where weights must sum to 100%
4. **Use consistent naming** - sector names in Tab 4 should match existing sectors
5. **Remove empty rows** at the end of your data

## Error Handling

If upload fails, the system will show specific error messages for:
- Missing required columns
- Invalid data types
- Constraint violations (e.g., weights not totaling 100%)
- Out-of-range values

## Excel File Format

Both .xlsx and .xls formats are supported. The system will read the first sheet of Excel files.

## CSV File Format

Use standard CSV format with comma separators. UTF-8 encoding is recommended for special characters.