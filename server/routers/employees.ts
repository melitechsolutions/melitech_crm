import { router, protectedProcedure } from "../_core/trpc";
import { createFeatureRestrictedProcedure } from "../middleware/enhancedRbac";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { employees, jobGroups, users } from "../../drizzle/schema";
import { eq, desc, gt, inArray } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { generatePassword, hashPassword } from "../lib/passwordUtils";

// Helper function to generate next employee number
async function generateNextEmployeeNumber(db: any): Promise<string> {
  try {
    // Query for the highest employee number
    const result = await db.select({ empNum: employees.employeeNumber })
      .from(employees)
      .orderBy(desc(employees.employeeNumber))
      .limit(1);
    
    if (result.length === 0) {
      return "EMP-00100";
    }

    // Extract the numeric part from the employee number (e.g., "EMP-00101" -> 101)
    const lastNumber = result[0].empNum;
    const match = lastNumber.match(/(\d+)$/);
    
    if (!match) {
      return "EMP-00100";
    }

    const nextNum = parseInt(match[1]) + 1;
    return `EMP-${String(nextNum).padStart(6, '0')}`;
  } catch (err) {
    console.warn("Error generating employee number, using default:", err);
    return "EMP-00100";
  }
}

export const employeesRouter = router({
  list: createFeatureRestrictedProcedure("employees:read")
    .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }).optional())
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          console.error("[Employees] Database connection not available");
          return [];
        }
        console.log("[Employees] Attempting to fetch employees with limit:", input?.limit || 50);
        const result = await db.select().from(employees).limit(input?.limit || 50).offset(input?.offset || 0);
        console.log("[Employees] Successfully fetched", result?.length || 0, "employees");
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("[Employees] Error fetching employees - Database Error:", errorMessage);
        console.error("[Employees] Full error details:", error);
        return [];
      }
    }),

  getById: createFeatureRestrictedProcedure("employees:read")
    .input(z.string())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select().from(employees).where(eq(employees.id, input)).limit(1);
      return result[0] || null;
    }),

  byDepartment: createFeatureRestrictedProcedure("employees:read")
    .input(z.object({ department: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const result = await db.select().from(employees).where(eq(employees.department, input.department));
      return result;
    }),

  byJobGroup: createFeatureRestrictedProcedure("employees:read")
    .input(z.object({ jobGroupId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const result = await db.select().from(employees).where(eq(employees.jobGroupId, input.jobGroupId));
      return result;
    }),

  getNextEmployeeNumber: createFeatureRestrictedProcedure("employees:read")
    .query(async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const nextNumber = await generateNextEmployeeNumber(db);
      return { employeeNumber: nextNumber };
    }),

  create: createFeatureRestrictedProcedure("employees:create")
    .input(z.object({
      employeeNumber: z.string().optional(),
      firstName: z.string(),
      lastName: z.string(),
      email: z.string().optional(),
      phone: z.string().optional(),
      dateOfBirth: z.date().optional(),
      hireDate: z.date(),
      department: z.string().optional(),
      position: z.string().optional(),
      jobGroupId: z.string(),
      salary: z.number().optional(),
      employmentType: z.string().optional(),
      status: z.string().optional(),
      photoUrl: z.string().optional(),
      address: z.string().optional(),
      emergencyContact: z.string().optional(),
      bankAccountNumber: z.string().optional(),
      taxId: z.string().optional(),
      nationalId: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const id = uuidv4();
      let userId: string | null = null;
      
      // Generate employee number if not provided
      let employeeNumber = input.employeeNumber;
      if (!employeeNumber) {
        employeeNumber = await generateNextEmployeeNumber(db);
      }

      // Validate job group exists
      const jobGroup = await db.select().from(jobGroups)
        .where(eq(jobGroups.id, input.jobGroupId))
        .limit(1);
      
      if (!jobGroup || jobGroup.length === 0) {
        throw new Error("Job group not found");
      }

      // Validate salary is within job group range if provided
      if (input.salary) {
        if (input.salary < jobGroup[0].minimumGrossSalary || 
            input.salary > jobGroup[0].maximumGrossSalary) {
          throw new Error(
            `Salary must be between ${jobGroup[0].minimumGrossSalary} and ${jobGroup[0].maximumGrossSalary} for this job group`
          );
        }
      }

      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const hireDate = input.hireDate instanceof Date 
        ? input.hireDate.toISOString().replace('T', ' ').substring(0, 19)
        : new Date(input.hireDate).toISOString().replace('T', ' ').substring(0, 19);

      // Auto-create user account if email is provided (do this first to get userId)
      let generatedPassword: string | null = null;
      if (input.email) {
        try {
          userId = uuidv4();
          const userExists = await db.select().from(users)
            .where(eq(users.email, input.email))
            .limit(1);
          
          if (!userExists || userExists.length === 0) {
            // Generate a strong password
            generatedPassword = generatePassword(14);
            const passwordHash = await hashPassword(generatedPassword);
            
            await db.insert(users).values({
              id: userId,
              name: `${input.firstName} ${input.lastName}`.trim(),
              email: input.email,
              role: 'staff',
              passwordHash: passwordHash,
              isActive: 1,
              createdAt: now,
            } as any);
          } else {
            // User already exists, link to existing user
            userId = userExists[0].id;
          }
        } catch (userError) {
          // Log the error but continue with employee creation
          console.error("Failed to create/link user account for employee:", userError);
        }
      }

      await db.insert(employees).values({
        id,
        userId: userId || null,
        employeeNumber,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email || null,
        phone: input.phone || null,
        dateOfBirth: input.dateOfBirth ? input.dateOfBirth.toISOString().replace('T', ' ').substring(0, 19) : null,
        hireDate,
        department: input.department || null,
        position: input.position || null,
        jobGroupId: input.jobGroupId,
        salary: input.salary || null,
        employmentType: input.employmentType || 'full_time',
        status: input.status || 'active',
        photoUrl: input.photoUrl || null,
        address: input.address || null,
        emergencyContact: input.emergencyContact || null,
        bankAccountNumber: input.bankAccountNumber || null,
        taxId: input.taxId || null,
        nationalId: input.nationalId || null,
        createdBy: ctx.user.id,
        createdAt: now,
        updatedAt: now,
      } as any);
      
      return { id, employeeNumber, generatedPassword, userId };
    }),

  update: createFeatureRestrictedProcedure("employees:edit")
    .input(z.object({
      id: z.string(),
      employeeNumber: z.string().optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      dateOfBirth: z.date().optional(),
      hireDate: z.date().optional(),
      department: z.string().optional(),
      position: z.string().optional(),
      jobGroupId: z.string().optional(),
      salary: z.number().optional(),
      employmentType: z.string().optional(),
      status: z.string().optional(),
      photoUrl: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const { id, ...data } = input;

      // If jobGroupId or salary is being updated, validate
      if (data.jobGroupId || data.salary !== undefined) {
        const currentEmployee = await db.select().from(employees)
          .where(eq(employees.id, id))
          .limit(1);
        
        if (!currentEmployee || currentEmployee.length === 0) {
          throw new Error("Employee not found");
        }

        const jobGroupId = data.jobGroupId || currentEmployee[0].jobGroupId;
        const jobGroup = await db.select().from(jobGroups)
          .where(eq(jobGroups.id, jobGroupId))
          .limit(1);
        
        if (!jobGroup || jobGroup.length === 0) {
          throw new Error("Job group not found");
        }

        // Validate salary if provided
        if (data.salary !== undefined) {
          if (data.salary < jobGroup[0].minimumGrossSalary || 
              data.salary > jobGroup[0].maximumGrossSalary) {
            throw new Error(
              `Salary must be between ${jobGroup[0].minimumGrossSalary} and ${jobGroup[0].maximumGrossSalary} for this job group`
            );
          }
        }
      }

      const updateData: any = {
        ...data,
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };

      // Convert date fields if provided
      if (data.hireDate) {
        updateData.hireDate = data.hireDate instanceof Date 
          ? data.hireDate.toISOString().replace('T', ' ').substring(0, 19)
          : new Date(data.hireDate).toISOString().replace('T', ' ').substring(0, 19);
      }

      if (data.dateOfBirth) {
        updateData.dateOfBirth = data.dateOfBirth instanceof Date
          ? data.dateOfBirth.toISOString().replace('T', ' ').substring(0, 19)
          : new Date(data.dateOfBirth).toISOString().replace('T', ' ').substring(0, 19);
      }

      await db.update(employees).set(updateData).where(eq(employees.id, id));
      return { success: true };
    }),

  delete: createFeatureRestrictedProcedure("employees:delete")
    .input(z.string())
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.delete(employees).where(eq(employees.id, input));
      return { success: true };
    }),

  bulkUpdateStatus: createFeatureRestrictedProcedure("employees:edit")
    .input(z.object({ employeeIds: z.array(z.string()), status: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db
        .update(employees)
        .set({ status: input.status as any, updatedAt: new Date().toISOString() as any })
        .where(inArray(employees.id, input.employeeIds));
      return { success: true, count: input.employeeIds.length };
    }),

  bulkUpdateDepartment: createFeatureRestrictedProcedure("employees:edit")
    .input(z.object({ employeeIds: z.array(z.string()), department: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db
        .update(employees)
        .set({ department: input.department, updatedAt: new Date().toISOString() as any })
        .where(inArray(employees.id, input.employeeIds));
      return { success: true, count: input.employeeIds.length };
    }),

  bulkDelete: createFeatureRestrictedProcedure("employees:delete")
    .input(z.array(z.string()))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(employees).where(inArray(employees.id, input));
      return { success: true, count: input.length };
    }),

  // Promote employee to a new job group
  promote: createFeatureRestrictedProcedure("employees:edit")
    .input(z.object({
      employeeId: z.string(),
      newJobGroupId: z.string(),
      newSalary: z.number().optional().describe("New salary for the promoted position"),
      effectiveDate: z.date().default(() => new Date()),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Fetch current employee
      const employee = await db.select().from(employees).where(eq(employees.id, input.employeeId)).limit(1);
      if (!employee || employee.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Employee not found" });
      }

      // Fetch new job group
      const newJobGroup = await db.select().from(jobGroups).where(eq(jobGroups.id, input.newJobGroupId)).limit(1);
      if (!newJobGroup || newJobGroup.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "New job group not found" });
      }

      // Validate salary is within new job group range if provided
      if (input.newSalary) {
        if (input.newSalary < newJobGroup[0].minimumGrossSalary || input.newSalary > newJobGroup[0].maximumGrossSalary) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Salary must be between ${newJobGroup[0].minimumGrossSalary} and ${newJobGroup[0].maximumGrossSalary} for the new job group`,
          });
        }
      }

      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const effectiveDate = input.effectiveDate instanceof Date
        ? input.effectiveDate.toISOString().replace('T', ' ').substring(0, 19)
        : new Date(input.effectiveDate).toISOString().replace('T', ' ').substring(0, 19);

      // Update employee with new job group and salary
      await db.update(employees)
        .set({
          jobGroupId: input.newJobGroupId,
          salary: input.newSalary || employee[0].salary,
          updatedAt: now,
        })
        .where(eq(employees.id, input.employeeId));

      // Log the promotion
      await db.logActivity({
        userId: ctx.user.id,
        action: "employee_promoted",
        entityType: "employee",
        entityId: input.employeeId,
        description: `Employee promoted from ${employee[0].jobGroupId} to ${input.newJobGroupId}. Effective: ${effectiveDate}. ${input.notes ? `Notes: ${input.notes}` : ""}`,
      });

      return {
        success: true,
        message: `Employee promoted to ${newJobGroup[0].name}`,
        employee: {
          id: input.employeeId,
          newJobGroup: newJobGroup[0].name,
          newSalary: input.newSalary || employee[0].salary,
          effectiveDate,
        },
      };
    }),

  // Demote employee to a different job group
  demote: createFeatureRestrictedProcedure("employees:edit")
    .input(z.object({
      employeeId: z.string(),
      newJobGroupId: z.string(),
      newSalary: z.number().optional(),
      effectiveDate: z.date().default(() => new Date()),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Fetch current employee
      const employee = await db.select().from(employees).where(eq(employees.id, input.employeeId)).limit(1);
      if (!employee || employee.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Employee not found" });
      }

      // Fetch new job group
      const newJobGroup = await db.select().from(jobGroups).where(eq(jobGroups.id, input.newJobGroupId)).limit(1);
      if (!newJobGroup || newJobGroup.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "New job group not found" });
      }

      // Validate salary is within new job group range if provided
      if (input.newSalary) {
        if (input.newSalary < newJobGroup[0].minimumGrossSalary || input.newSalary > newJobGroup[0].maximumGrossSalary) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Salary must be between ${newJobGroup[0].minimumGrossSalary} and ${newJobGroup[0].maximumGrossSalary} for the new job group`,
          });
        }
      }

      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const effectiveDate = input.effectiveDate instanceof Date
        ? input.effectiveDate.toISOString().replace('T', ' ').substring(0, 19)
        : new Date(input.effectiveDate).toISOString().replace('T', ' ').substring(0, 19);

      // Update employee with new job group and salary
      await db.update(employees)
        .set({
          jobGroupId: input.newJobGroupId,
          salary: input.newSalary || employee[0].salary,
          updatedAt: now,
        })
        .where(eq(employees.id, input.employeeId));

      // Log the demotion
      await db.logActivity({
        userId: ctx.user.id,
        action: "employee_demoted",
        entityType: "employee",
        entityId: input.employeeId,
        description: `Employee demoted from ${employee[0].jobGroupId} to ${input.newJobGroupId}. Effective: ${effectiveDate}. ${input.reason ? `Reason: ${input.reason}` : ""}`,
      });

      return {
        success: true,
        message: `Employee demoted to ${newJobGroup[0].name}`,
        employee: {
          id: input.employeeId,
          newJobGroup: newJobGroup[0].name,
          newSalary: input.newSalary || employee[0].salary,
          effectiveDate,
        },
      };
    }),
});


