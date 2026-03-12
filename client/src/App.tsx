import React, { Suspense } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Loader2 } from "lucide-react";

// lazily load all page components so the main bundle stays small and the
// dashboard (and other routes) only fetch what they actually need on
// navigation. this dramatically improves initial load time.
const NotFound = React.lazy(() => import("@/pages/NotFound"));
const Home = React.lazy(() => import("./pages/Home"));
const Projects = React.lazy(() => import("./pages/Projects"));
const ProjectDetails = React.lazy(() => import("./pages/ProjectDetails"));
const Profile = React.lazy(() => import("./pages/Profile"));
const Security = React.lazy(() => import("./pages/Security"));
const MFA = React.lazy(() => import("./pages/MFA"));
const Dashboard = React.lazy(() => import("./pages/dashboards/Dashboard"));
const DashboardHome = React.lazy(() => import("./pages/dashboards/DashboardHome"));
const Clients = React.lazy(() => import("./pages/Clients"));
const ClientDetails = React.lazy(() => import("./pages/ClientDetails"));
const EditClient = React.lazy(() => import("./pages/EditClient"));
const Invoices = React.lazy(() => import("./pages/Invoices"));
const InvoiceDetails = React.lazy(() => import("./pages/InvoiceDetails"));
const CreateInvoice = React.lazy(() => import("./pages/CreateInvoice"));
const EditInvoice = React.lazy(() => import("./pages/EditInvoice"));
const RecurringInvoices = React.lazy(() => import("./pages/RecurringInvoices"));
const PaymentPlans = React.lazy(() => import("./pages/PaymentPlans"));
const ProjectMilestones = React.lazy(() => import("./pages/ProjectMilestones"));
const TimeTracking = React.lazy(() => import("./pages/TimeTracking"));
const SalesPipeline = React.lazy(() => import("./pages/SalesPipeline"));
const Estimates = React.lazy(() => import("./pages/Estimates"));
const EstimateDetails = React.lazy(() => import("./pages/EstimateDetails"));
const CreateEstimate = React.lazy(() => import("./pages/CreateEstimate"));
const EditEstimate = React.lazy(() => import("./pages/EditEstimate"));
const Receipts = React.lazy(() => import("./pages/Receipts"));
const ReceiptDetails = React.lazy(() => import("./pages/ReceiptDetails"));
const CreateReceipt = React.lazy(() => import("./pages/CreateReceipt"));
const EditReceipt = React.lazy(() => import("./pages/EditReceipt"));
const TicketsPage = React.lazy(() => import("./pages/Tickets"));
const FinanceSettingsPage = React.lazy(() => import("./pages/FinanceSettings"));
const Opportunities = React.lazy(() => import("./pages/Opportunities"));
const Payments = React.lazy(() => import("./pages/Payments"));
const CreatePayment = React.lazy(() => import("./pages/CreatePayment"));
const PaymentReconciliation = React.lazy(() => import("./pages/PaymentReconciliation"));
const CreateProduct = React.lazy(() => import("./pages/CreateProduct"));
const CreateService = React.lazy(() => import("./pages/CreateService"));
const CreateExpense = React.lazy(() => import("./pages/CreateExpense"));
const CreateOpportunity = React.lazy(() => import("./pages/CreateOpportunity"));
const CreateEmployee = React.lazy(() => import("./pages/CreateEmployee"));
const CreateDepartment = React.lazy(() => import("./pages/CreateDepartment"));
const CreateAttendance = React.lazy(() => import("./pages/CreateAttendance"));
const CreatePayroll = React.lazy(() => import("./pages/CreatePayroll"));
const CreateLeaveRequest = React.lazy(() => import("./pages/CreateLeaveRequest"));
const CreateProject = React.lazy(() => import("./pages/CreateProject"));
const EditProject = React.lazy(() => import("./pages/EditProject"));
const EditProduct = React.lazy(() => import("./pages/EditProduct"));
const EditService = React.lazy(() => import("./pages/EditService"));
const EditExpense = React.lazy(() => import("./pages/EditExpense"));
const EditEmployee = React.lazy(() => import("./pages/EditEmployee"));
const EditOpportunity = React.lazy(() => import("./pages/EditOpportunity"));
const EditPayment = React.lazy(() => import("./pages/EditPayment"));
const Products = React.lazy(() => import("./pages/Products"));
const Services = React.lazy(() => import("./pages/Services"));
const HR = React.lazy(() => import("./pages/HR"));
const Employees = React.lazy(() => import("./pages/Employees"));
const EmployeeDetails = React.lazy(() => import("./pages/EmployeeDetails"));
const Attendance = React.lazy(() => import("./pages/Attendance"));
const Payroll = React.lazy(() => import("./pages/Payroll"));
const LeaveManagement = React.lazy(() => import("./pages/LeaveManagement"));
const JobGroups = React.lazy(() => import("./pages/JobGroups"));
const Reports = React.lazy(() => import("./pages/Reports"));
const Settings = React.lazy(() => import("@/pages/Settings"));
const TestPDFGeneration = React.lazy(() => import("@/pages/TestPDFGeneration"));
const Expenses = React.lazy(() => import("./pages/Expenses"));
const BankReconciliation = React.lazy(() => import("./pages/BankReconciliation"));
const ChartOfAccounts = React.lazy(() => import("./pages/ChartOfAccounts"));
const Departments = React.lazy(() => import("./pages/Departments"));
const DepartmentDetails = React.lazy(() => import("./pages/DepartmentDetails"));
const PaymentDetails = React.lazy(() => import("./pages/PaymentDetails"));
const ProductDetails = React.lazy(() => import("./pages/ProductDetails"));
const ServiceDetails = React.lazy(() => import("./pages/ServiceDetails"));
const OpportunityDetails = React.lazy(() => import("./pages/OpportunityDetails"));
const Login = React.lazy(() => import("./pages/Login"));
const ChangePassword = React.lazy(() => import("./pages/ChangePassword"));
const EnhancedChangePassword = React.lazy(() => import("./pages/EnhancedChangePassword"));
const BillingDashboard = React.lazy(() => import("./pages/BillingDashboard"));
const EnhancedReceiptManagement = React.lazy(() => import("./pages/EnhancedReceiptManagement"));
const Signup = React.lazy(() => import("./pages/Signup"));
const ForgotPassword = React.lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = React.lazy(() => import("./pages/ResetPassword"));
const ClientPortal = React.lazy(() => import("./pages/ClientPortal"));
const AttendanceDetails = React.lazy(() => import("@/pages/AttendanceDetails"));
const PayrollDetails = React.lazy(() => import("@/pages/PayrollDetails"));
const LeaveManagementDetails = React.lazy(() => import("@/pages/LeaveManagementDetails"));
const ReportsDetails = React.lazy(() => import("@/pages/ReportsDetails"));
const BankReconciliationDetails = React.lazy(() => import("@/pages/BankReconciliationDetails"));
const ChartOfAccountsDetails = React.lazy(() => import("@/pages/ChartOfAccountsDetails"));
const EditChartOfAccounts = React.lazy(() => import("@/pages/EditChartOfAccounts"));
const ExpensesDetails = React.lazy(() => import("@/pages/ExpensesDetails"));
const HRDetails = React.lazy(() => import("@/pages/HRDetails"));
const Account = React.lazy(() => import("./pages/Account"));
const Sales = React.lazy(() => import("./pages/Sales"));
const Accounting = React.lazy(() => import("./pages/Accounting"));
const CreateUser = React.lazy(() => import("./pages/CreateUser"));
const EditUser = React.lazy(() => import("./pages/EditUser"));
const AdminManagement = React.lazy(() => import("./pages/AdminManagement"));
const CreateClient = React.lazy(() => import("./pages/CreateClient"));
const EditDepartment = React.lazy(() => import("./pages/EditDepartment"));
const EditAttendance = React.lazy(() => import("./pages/EditAttendance"));
const EditPayroll = React.lazy(() => import("./pages/EditPayroll"));
const EditLeave = React.lazy(() => import("./pages/EditLeave"));
const RoleBasedDashboard = React.lazy(() => import("./components/RoleBasedDashboard"));
const SuperAdminDashboard = React.lazy(() => import("./pages/dashboards/SuperAdminDashboard"));
const AdminDashboard = React.lazy(() => import("./pages/dashboards/AdminDashboard"));
const HRDashboard = React.lazy(() => import("./pages/dashboards/HRDashboard"));
const AccountantDashboard = React.lazy(() => import("./pages/dashboards/AccountantDashboard"));
const StaffDashboard = React.lazy(() => import("./pages/dashboards/StaffDashboard"));
const ProjectManagerDashboard = React.lazy(() => import("./pages/dashboards/ProjectManagerDashboard"));
const ProcurementManagerDashboard = React.lazy(() => import("./pages/dashboards/ProcurementManagerDashboard"));
const SalesManagerDashboard = React.lazy(() => import("./pages/dashboards/SalesManagerDashboard"));
const ICTDashboard = React.lazy(() => import("./pages/ICTDashboard"));
const UnifiedLanding = React.lazy(() => import("./pages/UnifiedLanding"));
const LandingPage = React.lazy(() => import("./pages/LandingPage"));
const Roles = React.lazy(() => import("./pages/Roles.tsx"));
const AIHub = React.lazy(() => import("./pages/AIHub"));
const FinancialDashboard = React.lazy(() => import("./pages/FinancialDashboard"));
const WorkflowAutomation = React.lazy(() => import("./pages/WorkflowAutomation"));
const Demo = React.lazy(() => import("./pages/Demo"));
const HRPayrollManagement = React.lazy(() => import("./pages/HRPayrollManagement"));
const CreateSalaryStructure = React.lazy(() => import("./pages/CreateSalaryStructure"));
const CreateAllowance = React.lazy(() => import("./pages/CreateAllowance"));
const CreateDeduction = React.lazy(() => import("./pages/CreateDeduction"));
const CreateBenefit = React.lazy(() => import("./pages/CreateBenefit"));
const KenyanPayrollCalculator = React.lazy(() => import("./pages/KenyanPayrollCalculator"));
const OverduePayments = React.lazy(() => import("./pages/OverduePayments"));
const PaymentReports = React.lazy(() => import("./pages/PaymentReports"));
const TaxComplianceReportsPage = React.lazy(() => import("./pages/TaxComplianceReports"));
const SalesReportsPage = React.lazy(() => import("./pages/SalesReports"));
const FinancialReportsPage = React.lazy(() => import("./pages/FinancialReports"));
const ImprestsPage = React.lazy(() => import("./pages/Imprests"));
const BudgetsPage = React.lazy(() => import("./pages/Budgets"));
const CreateBudget = React.lazy(() => import("./pages/CreateBudget"));
const EditBudget = React.lazy(() => import("./pages/EditBudget"));
const ProfessionalBudgeting = React.lazy(() => import("./components/ProfessionalBudgeting"));
const ProcurementLPOs = React.lazy(() => import("./components/ProcurementLPOs"));
const ProcurementOrders = React.lazy(() => import("./components/ProcurementOrders"));
const ProcurementImprests = React.lazy(() => import("./components/ProcurementImprests"));
const HRAnalyticsPage = React.lazy(() => import("./pages/HRAnalyticsPage"));
const LPOsPage = React.lazy(() => import("./pages/LPOs"));
const CreateLPO = React.lazy(() => import("./pages/CreateLPO"));
const EditLPO = React.lazy(() => import("./pages/EditLPO"));
const OrdersPage = React.lazy(() => import("./pages/Orders"));
const CreateOrder = React.lazy(() => import("./pages/CreateOrder"));
const EditOrder = React.lazy(() => import("./pages/EditOrder"));
const ImportExcelPage = React.lazy(() => import("./pages/ImportExcel"));
const BrandCustomization = React.lazy(() => import("./pages/tools/BrandCustomization"));
const CustomHomepageBuilder = React.lazy(() => import("./pages/tools/CustomHomepageBuilder"));
const ThemeCustomization = React.lazy(() => import("./pages/tools/ThemeCustomization"));
const SystemSettings = React.lazy(() => import("./pages/tools/SystemSettings"));
const IntegrationGuides = React.lazy(() => import("./pages/tools/IntegrationGuides"));
const Tools = React.lazy(() => import("./pages/Tools"));
const DepartmentPayrollReports = React.lazy(() => import("./pages/DepartmentPayrollReports"));
const CustomReportBuilder = React.lazy(() => import("./pages/CustomReportBuilder"));
const Communications = React.lazy(() => import("./pages/Communications"));
const CreateCommunication = React.lazy(() => import("./pages/CreateCommunication"));
const Messages = React.lazy(() => import("./pages/Messages"));
const ActivityPage = React.lazy(() => import("./pages/Activity"));
const Approvals = React.lazy(() => import("./pages/Approvals"));
const Notifications = React.lazy(() => import("./pages/Notifications"));
const AccountSettings = React.lazy(() => import("./pages/AccountSettings"));
const PrivacyPolicy = React.lazy(() => import("./pages/PrivacyPolicy"));
const TermsAndConditions = React.lazy(() => import("./pages/TermsAndConditions"));
const Documentation = React.lazy(() => import("./pages/Documentation"));
const UserGuide = React.lazy(() => import("./pages/UserGuide"));
const TroubleshootingGuide = React.lazy(() => import("./pages/TroubleshootingGuide"));
const CreateImprest = React.lazy(() => import("./pages/CreateImprest"));
const CreatePurchaseOrder = React.lazy(() => import("./pages/CreatePurchaseOrder"));
const Inventory = React.lazy(() => import("./pages/Inventory"));
const Suppliers = React.lazy(() => import("./pages/Suppliers"));
const SupplierDetails = React.lazy(() => import("./pages/SupplierDetails"));
const ProcurementMaster = React.lazy(() => import("./pages/ProcurementMaster"));
const ExpenseBudgetReport = React.lazy(() => import("./pages/ExpenseBudgetReport"));
const HRAnalyticsDashboard = React.lazy(() => import("./pages/HRAnalyticsDashboard"));
const ProjectsManagement = React.lazy(() => import("./pages/ProjectsManagement"));
const AccountingManagement = React.lazy(() => import("./pages/AccountingManagement"));
const ContractManagement = React.lazy(() => import("./pages/ContractManagement"));
const AssetManagement = React.lazy(() => import("./pages/AssetManagement"));
const WarrantyManagement = React.lazy(() => import("./pages/WarrantyManagement"));
const Quotations = React.lazy(() => import("./pages/Quotations"));
const DeliveryNotes = React.lazy(() => import("./pages/DeliveryNotes"));
const GRN = React.lazy(() => import("./pages/GRN"));

/**
 * Main router with role-based dashboard routing
 * 
 * IMPORTANT: Route ordering matters in wouter!
 * - Static routes (like /create) must come BEFORE dynamic routes (like /:id)
 * - Otherwise, "create" will be treated as an :id parameter
 * 
 * Authentication flow:
 * 1. User logs in at /login
 * 2. Login component stores token and user data in localStorage
 * 3. User is redirected based on role:
 *    - super_admin -> /crm/super-admin
 *    - admin -> /admin/management
 *    - hr -> /crm/hr
 *    - accountant -> /crm/accountant
 *    - staff -> /crm/staff
 *    - client -> /crm/client-portal
 *    - project_manager -> /crm/project-manager
 *    - user -> /crm (default)
 */
function Router() {
  return (
    <Switch>
      {/* Auth Routes */}
      <Route path={"/login"} component={Login} />
      <Route path={"/signup"} component={Signup} />
      <Route path={"/forgot-password"} component={ForgotPassword} />
      <Route path={"/reset-password"} component={ResetPassword} />
      
      {/* Portal Routes */}
      <Route path={"/crm/client-portal"} component={ClientPortal} />
      
      {/* Home & Main Dashboard - Smart routing based on auth state */}
      <Route path={"/"} component={LandingPage} />
      <Route path={"/home"} component={Home} />
      <Route path={"/demo"} component={Demo} />
      <Route path={"/landing"} component={LandingPage} />
      <Route path={"/dashboard"} component={UnifiedLanding} />
      
      {/* Main Dashboard - Unified for all users with role-aware content */}
      <Route path={"/crm"} component={DashboardHome} />
      <Route path={"/dashboards/dashboardhome"} component={DashboardHome} />
      
      {/* Role-Specific Dashboards (for specialized views) */}
      <Route path={"\u002fcrm\u002fsuper-admin"} component={SuperAdminDashboard} />
      <Route path={"\u002fcrm\u002fadmin"} component={AdminDashboard} />
      <Route path={"\u002fcrm\u002fhr"} component={HRDashboard} />
      <Route path={"\u002fcrm\u002faccountant"} component={AccountantDashboard} />
      <Route path={"\u002fcrm\u002fproject-manager"} component={ProjectManagerDashboard} />
      <Route path={"\u002fcrm\u002fprocurement"} component={ProcurementManagerDashboard} />
      <Route path={"\u002fcrm\u002fsales"} component={SalesManagerDashboard} />
      <Route path={"\u002fcrm\u002fstaff"} component={StaffDashboard} />
      <Route path={"\u002fcrm\u002fict"} component={ICTDashboard} />
      
      {/* Legacy Dashboard Routes (kept for backward compatibility) */}
      <Route path={"/dashboard-home"} component={DashboardHome} />
      <Route path={"/rbd"} component={RoleBasedDashboard} />
      <Route path={"/account"} component={Account} />
      <Route path={"/sales"} component={Sales} />
      <Route path={"/accounting"} component={Accounting} />
      <Route path={"/accounting/management"} component={AccountingManagement} />
      
      {/* Admin Routes */}
      <Route path={"/admin/management"} component={AdminManagement} />
      <Route path={"/crm/admin"} component={AdminManagement} />
      
      {/* CRM Home for regular users */}
      <Route path={"/crm/home"} component={DashboardHome} />
      
      {/* User Routes - STATIC routes BEFORE dynamic routes */}
      <Route path={"/users/new"} component={CreateUser} />
      <Route path={"/users/:id/edit"} component={EditUser} />
      <Route path={"/users/:id"} component={EditUser} />
      
      {/* Project Routes - STATIC routes BEFORE dynamic routes */}
      <Route path={"/projects"} component={Projects} />
      <Route path={"/projects/management"} component={ProjectsManagement} />
      <Route path={"/projects/create"} component={CreateProject} />
      <Route path={"/projects/:id/edit"} component={EditProject} />
      <Route path={"/projects/:id"} component={ProjectDetails} />
      
      {/* Client Routes - STATIC routes BEFORE dynamic routes */}
      <Route path={"/clients"} component={Clients} />
      <Route path={"/clients/create"} component={CreateClient} />
      <Route path={"/clients/:id/edit"} component={EditClient} />
      <Route path={"/clients/:id"} component={ClientDetails} />
      
      {/* Invoice Routes - STATIC routes BEFORE dynamic routes */}
      <Route path={"/invoices"} component={Invoices} />
      <Route path={"/invoices/create"} component={CreateInvoice} />
      <Route path={"/invoices/:id/edit"} component={EditInvoice} />
      <Route path={"/invoices/:id"} component={InvoiceDetails} />
      
      {/* Recurring Invoice Routes */}
      <Route path={"/recurring-invoices"} component={RecurringInvoices} />
      
      {/* Payment Plans Routes */}
      <Route path={"/payment-plans"} component={PaymentPlans} />
      
      {/* Project Milestones Routes */}
      <Route path={"/project-milestones"} component={ProjectMilestones} />
      
      {/* Time Tracking Routes */}
      <Route path={"/time-tracking"} component={TimeTracking} />
      
      {/* Sales Pipeline Routes */}
      <Route path={"/sales-pipeline"} component={SalesPipeline} />
      {/* Workflow Automation Routes */}
      <Route path={"/workflow-automation"} component={WorkflowAutomation} />
      {/* Estimate Routes - STATIC routes BEFORE dynamic routes */}
      <Route path={"/estimates"} component={Estimates} />
      <Route path={"/estimates/create"} component={CreateEstimate} />
      <Route path={"/estimates/:id/edit"} component={EditEstimate} />
      <Route path={"/estimates/:id"} component={EstimateDetails} />
      
      {/* Receipt Routes - STATIC routes BEFORE dynamic routes */}
      <Route path={"/tickets"} component={TicketsPage} />
      <Route path={"/finance/settings"} component={FinanceSettingsPage} />
      <Route path={"/receipts"} component={Receipts} />
      <Route path={"/receipts/create"} component={CreateReceipt} />
      <Route path={"/receipts/:id/edit"} component={EditReceipt} />
      <Route path={"/receipts/:id"} component={ReceiptDetails} />
      
      {/* Opportunity Routes - STATIC routes BEFORE dynamic routes */}
      <Route path={"/opportunities"} component={Opportunities} />
      <Route path={"/opportunities/create"} component={CreateOpportunity} />
      <Route path={"/opportunities/:id/edit"} component={EditOpportunity} />
      <Route path={"/opportunities/:id"} component={OpportunityDetails} />
      
      {/* Payment Routes - STATIC routes BEFORE dynamic routes */}
      <Route path={"/payments"} component={Payments} />
      <Route path={"/payments/create"} component={CreatePayment} />
      <Route path={"/payments/reconciliation"} component={PaymentReconciliation} />
      <Route path={"/payments/overdue"} component={OverduePayments} />
      <Route path={"/payments/reports"} component={PaymentReports} />
      <Route path={"/payments/:id/edit"} component={EditPayment} />
      <Route path={"/payments/:id"} component={PaymentDetails} />
      
      {/* Product Routes - STATIC routes BEFORE dynamic routes */}
      <Route path={"/products"} component={Products} />
      <Route path={"/products/create"} component={CreateProduct} />
      <Route path={"/products/:id/edit"} component={EditProduct} />
      <Route path={"/products/:id"} component={ProductDetails} />
      
      {/* Service Routes - STATIC routes BEFORE dynamic routes */}
      <Route path={"/services"} component={Services} />
      <Route path={"/services/create"} component={CreateService} />
      <Route path={"/services/:id/edit"} component={EditService} />
      <Route path={"/services/:id"} component={ServiceDetails} />
      
      {/* Expense Routes - STATIC routes BEFORE dynamic routes */}
      <Route path={"/expenses"} component={Expenses} />
      <Route path={"/expenses/create"} component={CreateExpense} />
      <Route path={"/expenses/:id/edit"} component={EditExpense} />
      <Route path={"/expenses/:id"} component={ExpensesDetails} />
      
      {/* HR Routes - STATIC routes BEFORE dynamic routes */}
      <Route path={"/hr"} component={HR} />
      <Route path={"/hr/:id"} component={HRDetails} />
      <Route path={"/job-groups"} component={JobGroups} />
      
      {/* Employee Routes - STATIC routes BEFORE dynamic routes */}
      <Route path={"/employees"} component={Employees} />
      <Route path={"/employees/create"} component={CreateEmployee} />
      <Route path={"/employees/:id/edit"} component={EditEmployee} />
      <Route path={"/employees/:id"} component={EmployeeDetails} />
      
      {/* Attendance Routes - STATIC routes BEFORE dynamic routes */}
      <Route path={"/attendance"} component={Attendance} />
      <Route path={"/attendance/new"} component={CreateAttendance} />
      <Route path={"/attendance/create"} component={CreateAttendance} />
      <Route path={"/attendance/:id/edit"} component={EditAttendance} />
      <Route path={"/attendance/:id"} component={AttendanceDetails} />
      
      {/* Payroll Routes - STATIC routes BEFORE dynamic routes */}
      <Route path={"/payroll"} component={HRPayrollManagement} />
      <Route path={"/payroll/kenyan"} component={KenyanPayrollCalculator} />
      <Route path={"/payroll/tax-compliance"} component={TaxComplianceReportsPage} />
      <Route path={"/finance/reports"} component={FinancialReportsPage} />
      <Route path={"/imprests"} component={ImprestsPage} />
      <Route path={"/reports/sales"} component={SalesReportsPage} />
      <Route path={"/import-excel"} component={ImportExcelPage} />
      <Route path={"/tools"} component={Tools} />
      <Route path={"/tools/theme-customization"} component={ThemeCustomization} />
      <Route path={"/tools/brand-customization"} component={BrandCustomization} />
      <Route path={"/tools/homepage-builder"} component={CustomHomepageBuilder} />
      <Route path={"/tools/system-settings"} component={SystemSettings} />
      <Route path={"/tools/integration-guides"} component={IntegrationGuides} />
      <Route path={"/tools/system-settings"} component={SystemSettings} />
      <Route path={"/tools/integration-guides"} component={IntegrationGuides} />
      
      {/* Payroll - Full CRUD Routes */}
      <Route path={"/payroll/create"} component={CreatePayroll} />
      <Route path={"/payroll/:id/edit"} component={EditPayroll} />
      <Route path={"/payroll/:id"} component={PayrollDetails} />
      
      {/* Salary Structures - Full CRUD Routes */}
      <Route path={"/salary-structures/create"} component={CreateSalaryStructure} />
      <Route path={"/payroll/salary-structures/create"} component={CreateSalaryStructure} />
      
      {/* Allowances - Full CRUD Routes */}
      <Route path={"/allowances/create"} component={CreateAllowance} />
      <Route path={"/payroll/allowances/create"} component={CreateAllowance} />
      
      {/* Deductions - Full CRUD Routes */}
      <Route path={"/deductions/create"} component={CreateDeduction} />
      <Route path={"/payroll/deductions/create"} component={CreateDeduction} />
      
      {/* Benefits - Full CRUD Routes */}
      <Route path={"/benefits/create"} component={CreateBenefit} />
      <Route path={"/payroll/benefits/create"} component={CreateBenefit} />
      
      {/* Leave Management Routes - STATIC routes BEFORE dynamic routes */}
      <Route path={"/leave-management"} component={LeaveManagement} />
      <Route path={"/leave-management/create"} component={CreateLeaveRequest} />
      <Route path={"/leave-management/:id/edit"} component={EditLeave} />
      <Route path={"/leave-management/:id"} component={LeaveManagementDetails} />
      
      {/* Department Routes - STATIC routes BEFORE dynamic routes */}
      <Route path={"/departments"} component={Departments} />
      <Route path={"/departments/create"} component={CreateDepartment} />
      <Route path={"/departments/:id/edit"} component={EditDepartment} />
      <Route path={"/departments/:id"} component={DepartmentDetails} />
      
      {/* Budget Routes - STATIC routes BEFORE dynamic routes */}
      <Route path={"/budgets"} component={BudgetsPage} />
      <Route path={"/budgets/create"} component={CreateBudget} />
      <Route path={"/budgets/professional"} component={ProfessionalBudgeting} />
      <Route path={"/budgets/:id/edit"} component={EditBudget} />
      
      {/* Procurement Master Route - Main procurement hub */}
      <Route path={"/procurement"} component={ProcurementMaster} />
      
      {/* Supplier Routes - STATIC routes BEFORE dynamic routes */}
      <Route path={"/suppliers"} component={Suppliers} />
      <Route path={"/suppliers/:id"} component={SupplierDetails} />
      
      {/* LPO Routes - STATIC routes BEFORE dynamic routes */}
      <Route path={"/lpos"} component={LPOsPage} />
      <Route path={"/lpos/create"} component={CreateLPO} />
      <Route path={"/lpos/professional"} component={ProcurementLPOs} />
      <Route path={"/lpos/:id/edit"} component={EditLPO} />
      
      {/* Order Routes - STATIC routes BEFORE dynamic routes */}
      <Route path={"/orders"} component={OrdersPage} />
      <Route path={"/orders/create"} component={CreateOrder} />
      <Route path={"/orders/professional"} component={ProcurementOrders} />
      <Route path={"/orders/:id/edit"} component={EditOrder} />
      
      {/* Imprest Routes */}
      <Route path={"/imprests/professional"} component={ProcurementImprests} />
      
      {/* Phase 20 - Quotations & RFQs */}
      <Route path={"/quotations"} component={Quotations} />
      
      {/* Phase 20 - Delivery Notes */}
      <Route path={"/delivery-notes"} component={DeliveryNotes} />
      
      {/* Phase 20 - Goods Received Notes */}
      <Route path={"/grn"} component={GRN} />
      
      {/* Phase 20 - Contracts Management */}
      <Route path={"/contracts"} component={ContractManagement} />
      
      {/* Phase 20 - Asset Management */}
      <Route path={"/assets"} component={AssetManagement} />
      
      {/* Phase 20 - Warranty Management */}
      <Route path={"/warranty"} component={WarrantyManagement} />
      
      {/* HR Analytics Route */}
      <Route path={"/hr/analytics"} component={HRAnalyticsPage} />
      <Route path={"/hr/analytics-dashboard"} component={HRAnalyticsDashboard} />
      
      {/* Payroll Reports */}
      <Route path={"/payroll/department-reports"} component={DepartmentPayrollReports} />
      <Route path={"/budgets/expense-report"} component={ExpenseBudgetReport} />
      <Route path={"/reports/custom-builder"} component={CustomReportBuilder} />
      
      {/* Approvals Route */}
      <Route path={"/approvals"} component={Approvals} />
      <Route path={"/notifications"} component={Notifications} />
      
      {/* Dashboard Route */}
      <Route path={"/dashboard"} component={RoleBasedDashboard} />
      
      {/* Communications Routes - STATIC routes BEFORE dynamic routes */}
      <Route path={"/communications/new"} component={CreateCommunication} />
      <Route path={"/communications"} component={Communications} />
      <Route path={"/communications/:id"} component={Communications} />
      
      {/* Messages Route */}
      <Route path={"/messages"} component={Messages} />
      
      {/* Activity Route */}
      <Route path={"/activity"} component={ActivityPage} />
      
      {/* Accounting Routes */}
      <Route path={"/bank-reconciliation"} component={BankReconciliation} />
      <Route path={"/bank-reconciliation/:id"} component={BankReconciliationDetails} />
      <Route path={"/chart-of-accounts"} component={ChartOfAccounts} />
      <Route path={"/chart-of-accounts/:id/edit"} component={EditChartOfAccounts} />
      <Route path={"/chart-of-accounts/:id"} component={ChartOfAccountsDetails} />
      
      {/* Report Routes */}
      <Route path={"/reports"} component={Reports} />
      <Route path={"/reports/:id"} component={ReportsDetails} />
      
      {/* Account Routes */}
      <Route path={"/account"} component={AccountSettings} />
      <Route path={"/privacy-policy"} component={PrivacyPolicy} />
      <Route path={"/terms-and-conditions"} component={TermsAndConditions} />
      <Route path={"/documentation"} component={Documentation} />
      <Route path={"/user-guide"} component={UserGuide} />
      <Route path={"/troubleshooting"} component={TroubleshootingGuide} />
      <Route path={"/create-imprest"} component={CreateImprest} />
      <Route path={"/create-purchase-order"} component={CreatePurchaseOrder} />
      
      {/* Inventory Routes */}
      <Route path={"/inventory"} component={Inventory} />
      
      {/* Financial Dashboard Routes */}
      <Route path={"/financial-dashboard"} component={FinancialDashboard} />
      
      {/* User Profile Routes */}
      <Route path={"/profile"} component={Profile} />
      <Route path={"/security"} component={Security} />
      <Route path={"/mfa"} component={MFA} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/roles"} component={Roles} />

      {/* AI Hub Route */}
      <Route path={"/ai-hub"} component={AIHub} />
      
      {/* Test Routes */}
      <Route path={"/test-pdf"} component={TestPDFGeneration} />
      
      {/* Password Management Routes */}
      <Route path={"/change-password"} component={ChangePassword} />
      <Route path={"/change-password-enhanced"} component={EnhancedChangePassword} />
      
      {/* Phase 4 Billing & Finance Routes */}
      <Route path={"/billing"} component={BillingDashboard} />
      <Route path={"/receipts-advanced"} component={EnhancedReceiptManagement} />
      
      {/* 404 Not Found */}
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <TooltipProvider>
          <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="size-8 animate-spin text-blue-500" /></div>}>
            <Router />
          </Suspense>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}