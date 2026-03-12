/**
 * Client-side CSV Template Generator
 * Simplified version for client-side CSV operations
 */

export type ModuleType = 
  | 'clients' | 'employees' | 'departments' 
  | 'jobGroups' | 'products' | 'services' 
  | 'payments' | 'accounts' | 'bankAccounts' 
  | 'expenses' | 'invoices' | 'users';

// Module definitions with column headers
const moduleColumns: Record<ModuleType, string[]> = {
  clients: ['companyName', 'contactPerson', 'email', 'phone', 'address', 'city', 'country', 'status'],
  employees: ['employeeNumber', 'firstName', 'lastName', 'email', 'phone', 'department', 'position', 'status'],
  departments: ['departmentName', 'code', 'description', 'budget', 'status'],
  jobGroups: ['name', 'minimumGrossSalary', 'maximumGrossSalary', 'description'],
  products: ['productName', 'productCode', 'description', 'category', 'unitPrice', 'quantity', 'status'],
  services: ['serviceName', 'serviceCode', 'description', 'category', 'hourlyRate', 'status'],
  payments: ['paymentNumber', 'amount', 'paymentMethod', 'paymentDate', 'status'],
  accounts: ['accountName', 'accountCode', 'accountType', 'balance'],
  bankAccounts: ['bankName', 'accountNumber', 'accountType', 'balance'],
  expenses: ['expenseDate', 'category', 'amount', 'description', 'status'],
  invoices: ['invoiceNumber', 'clientId', 'amount', 'issueDate', 'dueDate', 'status'],
  users: ['firstName', 'lastName', 'email', 'phone', 'department', 'role', 'status'],
};

/**
 * Get available modules for import
 */
export function getAvailableModules() {
  return Object.keys(moduleColumns).map(id => ({
    id,
    label: id.charAt(0).toUpperCase() + id.slice(1),
    description: `Import ${id} data`
  }));
}

/**
 * Generate CSV template file
 */
export function generateCSVTemplateFile(moduleType: ModuleType): Blob {
  const columns = moduleColumns[moduleType] || [];
  const header = columns.join(',');
  const content = header + '\n';
  
  return new Blob([content], { type: 'text/csv;charset=utf-8;' });
}

/**
 * Parse CSV content
 */
export function parseCSV(content: string): Record<string, any>[] {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim());
  const rows: Record<string, any>[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = parseCSVLine(lines[i]);
    const row: Record<string, any> = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    rows.push(row);
  }
  
  return rows;
}

/**
 * Parse a single CSV line handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let insideQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add last field
  result.push(current.trim());
  
  return result;
}
