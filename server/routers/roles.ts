import { router, createFeatureRestrictedProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";
import { getDb } from "../db";
import { userRoles, users } from "../../drizzle/schema";
import { eq, sql } from "drizzle-orm";

export const rolesRouter = router({
  list: protectedProcedure.query(async () => {
    const roles = await db.getRoles();
    // Normalize shape for client
    return (roles || []).map((r: any) => ({
      id: r.id,
      name: r.role || r.roleName || r.name || r.displayName || '',
      displayName: r.roleName || r.displayName || r.name || r.role || '',
      description: r.description || '',
      permissions: r.permissions || [],
      isSystem: !!(r.isActive === 0 ? false : (r.isSystem || false)),
      createdAt: r.createdAt || r.created_at || new Date().toISOString(),
      updatedAt: r.updatedAt || r.updated_at || null,
    }));
  }),

  getPermissions: protectedProcedure.query(async () => {
    return await db.getPermissions();
  }),

  getUserCounts: protectedProcedure.query(async () => {
    const database = await getDb();
    if (!database) return {};

    const results = await database.select({ role: users.role, count: sql<number>`count(*)` }).from(users).groupBy(users.role);
    const counts: Record<string, number> = {};
    results.forEach(r => { if (r.role) counts[r.role] = Number(r.count); });
    return counts;
  }),

  create: createFeatureRestrictedProcedure("roles:create")
    .input(z.object({
      name: z.string(),
      displayName: z.string().optional(),
      description: z.string().optional(),
      permissions: z.array(z.string().optional()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const id = await db.createRole(input.name, input.description);
      const perms: string[] = (input.permissions || []).filter((p): p is string => typeof p === 'string' && p !== '');
      if (perms.length) {
        const allPerms = await db.getPermissions();
        for (const pName of perms) {
          const perm = allPerms.find((pp: any) => pp.permissionName === pName || pp.name === pName);
          if (perm && perm.id) {
            await db.assignPermissionToRole(id, perm.id);
          }
        }
      }
      await db.logActivity({ userId: ctx.user.id, action: 'role_created', entityType: 'role', entityId: id, description: `Created role: ${input.name}` });
      return { id, name: input.name, displayName: input.displayName || input.name, description: input.description };
    }),

  update: createFeatureRestrictedProcedure("roles:edit")
    .input(z.object({ id: z.string(), displayName: z.string().optional(), description: z.string().optional(), permissions: z.array(z.string().optional()).optional() }))
    .mutation(async ({ input, ctx }) => {
      const updateSet: any = {};
      if (input.displayName !== undefined) updateSet.roleName = input.displayName;
      if (input.description !== undefined) updateSet.description = input.description;
      if (Object.keys(updateSet).length > 0) {
        const dbconn = await getDb();
        if (dbconn) await dbconn.update(userRoles).set(updateSet).where(eq(userRoles.id, input.id));
      }

      if (input.permissions) {
        const existing = await db.getRolePermissions(input.id);
        for (const rp of existing) {
          if (rp.permissionId) await db.removePermissionFromRole(input.id, rp.permissionId);
        }
        const perms: string[] = (input.permissions || []).filter((p): p is string => typeof p === 'string' && p !== '');
        const allPerms = await db.getPermissions();
        for (const pName of perms) {
          const perm = allPerms.find((pp: any) => pp.permissionName === pName || pp.name === pName);
          if (perm && perm.id) await db.assignPermissionToRole(input.id, perm.id);
        }
      }

      await db.logActivity({ userId: ctx.user.id, action: 'role_updated', entityType: 'role', entityId: input.id, description: `Updated role: ${input.id}` });
      return { success: true };
    }),

  delete: createFeatureRestrictedProcedure("roles:delete")
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const dbconn = await getDb();
      if (!dbconn) throw new Error('Database not available');

      const role = await dbconn.select().from(userRoles).where(eq(userRoles.id, input)).limit(1);
      if (role.length && role[0].roleName && ['super_admin', 'admin'].includes(role[0].roleName)) {
        throw new Error('Cannot delete system role');
      }

      await dbconn.delete(userRoles).where(eq(userRoles.id, input));

      await db.logActivity({ userId: ctx.user.id, action: 'role_deleted', entityType: 'role', entityId: input, description: `Deleted role: ${input}` });
      return { success: true };
    }),
});
