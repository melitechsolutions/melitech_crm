# Melitech CRM - Seed Data and Setup Guide

## Quick Start Commands

### 1. Install Dependencies

```shell
cd melitech_crm
pnpm install
```

### 2. Set Up Environment Variables

Create a `.env` file with your database credentials:

```shell
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Push Database Schema

```shell
pnpm db:push
```

### 4. Seed the Database with Sample Data

```shell
# Using npm script
pnpm seed

# Or directly with tsx
npx tsx scripts/seed.ts
```

### 5. Start the Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

---

## PowerShell / Windows Terminal Commands

```shell
# Navigate to project directory
cd melitech_crm

# Install dependencies
pnpm install

# Push database schema
pnpm db:push

# Seed the database
pnpm seed

# Start development server
pnpm dev
```

---

## What the Seed Script Creates

The seed script (`scripts/seed.ts` ) populates your database with:

### Settings (18 records)

- Company information (name, email, phone, address)

- Bank details (bank name, account number, branch)

- Document numbering prefixes (invoice, estimate, receipt)

### Departments (5 records)

- Engineering

- Sales

- Finance

- Human Resources

- Operations

### Clients (5 records)

- Safaricom PLC

- Kenya Power & Lighting

- Equity Bank Kenya

- Nation Media Group

- Twiga Foods Ltd

### Products (5 records)

- Dell Laptop - Latitude 5520

- HP LaserJet Pro MFP

- Cisco Router - RV340

- Microsoft 365 Business - Annual

- UPS - APC 1500VA

### Services (5 records)

- Network Installation

- IT Support - Monthly

- Software Development

- Data Recovery

- Training - IT Basics

### Employees (5 records)

- James Kariuki (Senior Software Engineer)

- Sarah Njeri (Sales Manager)

- Michael Omondi (Accountant)

- Lucy Wambui (HR Manager)

- Daniel Kipchoge (IT Support Technician)

### Projects (3 records)

- Safaricom Network Upgrade

- KPLC ERP Implementation

- Equity Bank Mobile App

### Estimates (3 records)

- Network Equipment Quote

- IT Support Contract

- Website Redesign

### Invoices (3 records)

- Network Equipment Supply (Paid)

- IT Support - January (Partial)

- Software Development - Phase 1 (Sent)

### Payments (2 records)

- Full payment from Safaricom

- Partial payment from KPLC

### Expenses (3 records)

- Office Supplies

- Utilities (Electricity)

- Travel (Business trip)

### Opportunities (2 records)

- Twiga Foods ERP System

- Nation Media Digital Transformation

### Activity Log (4 records)

- Sample activity entries for dashboard

---

## Troubleshooting

### Database Connection Issues

```bash
# Check if MySQL is running
mysql -u root -p -e "SHOW DATABASES;"

# Verify database exists
mysql -u root -p -e "USE melitech_crm; SHOW TABLES;"
```

### Seed Script Errors

```bash
# Run with verbose output
DEBUG=* npx tsx scripts/seed.ts

# Check for TypeScript errors
pnpm check
```

### Reset and Re-seed

```bash
# Drop and recreate database (WARNING: This deletes all data)
mysql -u root -p -e "DROP DATABASE melitech_crm; CREATE DATABASE melitech_crm;"

# Push schema again
pnpm db:push

# Re-seed
pnpm seed
```

---

## UI Elements Connected to Backend

### Quick Actions Sidebar (RightSidebar.tsx)

- **Today's Stats**: Fetches real-time data from `dashboard.stats` endpoint

- **Recent Activity**: Fetches from `dashboard.recentActivity` endpoint

- **Quick Action Buttons**: Navigate to create pages for:
  - New Invoice → `/invoices/create`
  - New Client → `/clients/create`
  - New Project → `/projects/create`
  - New Estimate → `/estimates/create`
  - New Receipt → `/receipts/create`
  - Record Payment → `/payments/create`

### Settings Page (Settings.tsx)

- **Company Info Tab**: Connected to `settings.getCompanyInfo` and `settings.updateCompanyInfo`

- **Bank Details Tab**: Connected to `settings.getBankDetails` and `settings.updateBankDetails`

- **Document Numbering Tab**: Connected to `settings.getDocumentNumberingSettings` and `settings.updateDocumentPrefix`

### Dark Mode Toggle (DashboardNavbar.tsx)

- Toggle button in the navbar header

- Persists preference to localStorage

- Respects system preference as default

### File Upload Component (FileUpload.tsx)

- Drag and drop support

- File type validation

- Size limit validation

- Progress indicator

- Integration with storage API

---

## CRUD Operations by Module

### Clients

- **List**: `trpc.clients.list.useQuery()`

- **View**: `trpc.clients.getById.useQuery(id)`

- **Create**: `trpc.clients.create.useMutation()`

- **Update**: `trpc.clients.update.useMutation()`

- **Delete**: `trpc.clients.delete.useMutation()`

### Estimates

- **List**: `trpc.estimates.list.useQuery()`

- **View**: `trpc.estimates.getById.useQuery(id)`

- **Create**: `trpc.estimates.create.useMutation()`

- **Update**: `trpc.estimates.update.useMutation()`

- **Delete**: `trpc.estimates.delete.useMutation()`

### Invoices

- **List**: `trpc.invoices.list.useQuery()`

- **View**: `trpc.invoices.getById.useQuery(id)`

- **Create**: `trpc.invoices.create.useMutation()`

- **Update**: `trpc.invoices.update.useMutation()`

- **Delete**: `trpc.invoices.delete.useMutation()`

### Projects

- **List**: `trpc.projects.list.useQuery()`

- **View**: `trpc.projects.getById.useQuery(id)`

- **Create**: `trpc.projects.create.useMutation()`

- **Update**: `trpc.projects.update.useMutation()`

- **Delete**: `trpc.projects.delete.useMutation()`

### Products

- **List**: `trpc.products.list.useQuery()`

- **View**: `trpc.products.getById.useQuery(id)`

- **Create**: `trpc.products.create.useMutation()`

- **Update**: `trpc.products.update.useMutation()`

- **Delete**: `trpc.products.delete.useMutation()`

### Services

- **List**: `trpc.services.list.useQuery()`

- **View**: `trpc.services.getById.useQuery(id)`

- **Create**: `trpc.services.create.useMutation()`

- **Update**: `trpc.services.update.useMutation()`

- **Delete**: `trpc.services.delete.useMutation()`

### Employees

- **List**: `trpc.employees.list.useQuery()`

- **View**: `trpc.employees.getById.useQuery(id)`

- **Create**: `trpc.employees.create.useMutation()`

- **Update**: `trpc.employees.update.useMutation()`

- **Delete**: `trpc.employees.delete.useMutation()`

---

## Route Structure

All routes follow the pattern:

- **List**: `/module` (e.g., `/clients`)

- **Create**: `/module/create` (e.g., `/clients/create`)

- **View**: `/module/:id` (e.g., `/clients/abc123`)

- **Edit**: `/module/:id/edit` (e.g., `/clients/abc123/edit`)

**Important**: Static routes (`/create`) must be defined BEFORE dynamic routes (`/:id`) in the router to work correctly.

