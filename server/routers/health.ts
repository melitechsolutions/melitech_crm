import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";

export const healthRouter = router({
  // Check backend health (always accessible)
  status: publicProcedure.query(async () => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "production",
    };
  }),

  // Detailed health check including database
  detailed: publicProcedure.query(async () => {
    const checks: any = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "production",
      database: { status: "unknown", connected: false, tablesCount: 0, error: null },
      features: {
        database: !!process.env.DATABASE_URL,
        environment: process.env.NODE_ENV || "development",
      },
    };

    try {
      const db = await getDb();
      if (db) {
        checks.database.connected = true;
        checks.database.status = "connected";
        
        try {
          // Try to query the database for table count
          const result = await db.raw(`
            SELECT COUNT(*) as tableCount 
            FROM information_schema.tables 
            WHERE table_schema = DATABASE()
          `);
          
          if (result && result[0]) {
            checks.database.tablesCount = result[0].tableCount || 0;
          }

          // Check if invoices table exists
          const invoiceCheck = await db.raw(`
            SELECT COUNT(*) as exists FROM information_schema.tables 
            WHERE table_schema = DATABASE() 
            AND table_name = 'invoices'
          `);
          
          checks.database.tablesExist = {
            invoices: invoiceCheck?.[0]?.exists > 0 ? "yes" : "no",
          };
        } catch (tableErr) {
          checks.database.tableCheckError = tableErr instanceof Error ? tableErr.message : String(tableErr);
        }
      } else {
        checks.database.status = "not_connected";
        checks.database.error = "Database instance is null";
      }
    } catch (err) {
      checks.database.status = "error";
      checks.database.connected = false;
      checks.database.error = err instanceof Error ? err.message : String(err);
    }

    return checks;
  }),

  // Database migration status
  migrations: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return {
        status: "error",
        message: "Database not connected",
        migrations: [],
      };
    }

    try {
      const result = await db.raw(`
        SELECT name FROM __drizzle_migrations__ 
        ORDER BY id DESC
      `).catch(() => []);

      return {
        status: "success",
        message: "Migrations retrieved",
        migrations: result || [],
        count: (result || []).length,
      };
    } catch (err) {
      return {
        status: "error",
        message: err instanceof Error ? err.message : String(err),
        migrations: [],
      };
    }
  }),
});
