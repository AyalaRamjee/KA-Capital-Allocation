# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Strategic Capital Allocation System (SCAS) built with Next.js 15, React 19, and TypeScript. It's a financial planning application that helps organizations manage investment priorities, evaluate projects, and optimize capital allocation through various analytical tools.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

## Architecture

### Core Structure
- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19 with TypeScript
- **Styling**: Tailwind CSS v4 with CSS variables
- **Components**: shadcn/ui components (customized)
- **State Management**: React hooks with localStorage persistence

### Key Directories
- `app/` - Next.js app directory structure
  - `components/strategic-allocation/` - Main SCAS application components
    - `scas-app.tsx` - Root application component
    - `shared/` - Shared components (Header, MetricsBar, TabNavigation)
    - `tabs/` - Feature tabs (each with standard and enhanced versions)
  - `components/ui/` - Reusable UI components from shadcn/ui
  - `hooks/` - Custom React hooks
    - `use-allocation-data.ts` - Central data management hook
  - `lib/` - Core business logic
    - `data-models.ts` - TypeScript interfaces and types
    - `calculations.ts` - Financial calculations (NPV, IRR, MIRR, etc.)
    - `storage-utils.ts` - LocalStorage persistence layer

### Data Flow
1. **Central Hook**: `useAllocationData` manages all application state
2. **Auto-save**: State changes are automatically persisted to localStorage
3. **Calculations**: Financial metrics are computed on-demand using pure functions
4. **Tab Navigation**: Each tab is a separate component with its own enhanced version

### Key Features by Tab
- **Investment Priorities**: Define and weight strategic priorities
- **Opportunities Pipeline**: Track and evaluate project opportunities
- **Business Case Builder**: Create detailed business cases with financial analysis
- **Scoring & Allocation**: Score projects against priorities and optimize allocation
- **Data Validation**: Validate data integrity and completeness
- **Portfolio Analytics**: Analyze portfolio performance and metrics
- **Scenario Modeling**: Model different allocation scenarios

### Component Patterns
- All components use 'use client' directive
- Enhanced components provide additional features over base versions
- Consistent dark theme using Tailwind's slate color palette
- Components follow shadcn/ui patterns with CVA for variants

### Type Safety
- Strict TypeScript configuration
- Comprehensive interfaces in `data-models.ts`
- Type-safe calculations and state management

### Important Considerations
- No test framework currently configured
- No explicit error boundaries implemented
- Uses localStorage for persistence (no backend API)
- Financial calculations handle edge cases (division by zero, extreme values)
- Auto-save implemented with debouncing to prevent excessive writes