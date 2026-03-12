import { describe, it, expect } from "vitest";
import { generateP9Form, generateP9DataFromPayroll, P9FormData } from "../utils/p9-form-generator";

// minimal data to exercise generator
const sampleData: P9FormData = {
  employeeId: "emp-001",
  employeeName: "John Doe",
  nationalId: "12345678",
  knRegNo: "A123456789B",
  grossSalary: 120000,
  paye: 20000,
  nssf: 5000,
  shif: 1000,
  housingLevy: 2000,
  totalDeductions: 28000,
  netIncome: 92000,
  taxYear: 2024,
  monthFrom: 1,
  monthTo: 12,
  companyName: "Acme Ltd",
  companyKRAPin: "P123456789X",
  companyAddress: "45 Corporate Blvd",
  certificationDate: new Date("2024-03-15"),
  certifiedBy: "Jane Smith",
  certifiedByTitle: "HR Manager",
};

describe("P9 Form Generator", () => {
  it("should produce HTML containing key information", () => {
    const html = generateP9Form(sampleData);
    expect(html).toContain("John Doe");
    expect(html).toContain("Acme Ltd");
    expect(html).toContain("2024");
    expect(html).toContain("Income Tax Certificate");
    // ensure numeric values appear (formatted with commas)
    expect(html).toMatch(/1,200/);
    expect(html).toMatch(/920/);
  });

  it("should generate consistent data from payroll records", () => {
    const payrollRecord = {
      basicSalary: 100000,
      allowances: 20000,
      tax: 18000,
      nssf: 5000,
      shif: 1000,
      housingLevy: 2000,
      netSalary: 94000,
    };
    const employee = {
      employeeNumber: "emp-789",
      firstName: "Alice",
      lastName: "Wong",
      nationalId: "98765432",
      taxId: "TAX001",
    };
    const company = {
      name: "Beta Co",
      kraPin: "PIN123",
      address: "99 Business Rd",
    };
    const certifier = { name: "Bob", title: "Finance Director" };

    const data = generateP9DataFromPayroll(payrollRecord, employee, company, certifier);
    expect(data.employeeId).toBe("emp-789");
    expect(data.employeeName).toBe("Alice Wong");
    expect(data.grossSalary).toBe(120000);
    expect(data.paye).toBe(18000);
    expect(data.netIncome).toBe(94000);
    expect(data.companyName).toBe("Beta Co");
    expect(data.certifiedBy).toBe("Bob");
  });
});
