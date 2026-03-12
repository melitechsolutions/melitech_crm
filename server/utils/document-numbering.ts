import { desc } from "drizzle-orm";
import { 
  invoices, 
  estimates, 
  expenses, 
  receipts, 
  proposals, 
  payments 
} from "../../drizzle/schema";

/**
 * Helper function to generate next document number in format PREFIx-000000
 * Supports: INV, EST, EXP, REC, PROP, PAY
 */
async function generateNextDocumentNumber(
  db: any,
  documentType: "invoice" | "estimate" | "expense" | "receipt" | "proposal" | "payment"
): Promise<string> {
  try {
    const prefixes: Record<string, { table: any; field: any; prefix: string }> = {
      invoice: { table: invoices, field: invoices.invoiceNumber, prefix: "INV" },
      estimate: { table: estimates, field: estimates.estimateNumber, prefix: "EST" },
      expense: { table: expenses, field: expenses.expenseNumber, prefix: "EXP" },
      receipt: { table: receipts, field: receipts.receiptNumber, prefix: "REC" },
      proposal: { table: proposals, field: proposals.proposalNumber, prefix: "PROP" },
      payment: { table: payments, field: payments.referenceNumber, prefix: "PAY" },
    };

    const config = prefixes[documentType];
    if (!config) throw new Error(`Unknown document type: ${documentType}`);

    // Find the highest document number
    const result = await db
      .select({ docNum: config.field })
      .from(config.table)
      .orderBy(desc(config.field))
      .limit(1);

    let maxSequence = 0;

    if (result && result.length > 0 && result[0].docNum) {
      const match = result[0].docNum.match(/(\d+)$/);
      if (match) {
        maxSequence = parseInt(match[1]);
      }
    }

    const nextSequence = maxSequence + 1;
    return `${config.prefix}-${String(nextSequence).padStart(6, "0")}`;
  } catch (err) {
    console.warn(`Error generating ${documentType} number, using default:`, err);
    const prefixes: Record<string, string> = {
      invoice: "INV-000001",
      estimate: "EST-000001",
      expense: "EXP-000001",
      receipt: "REC-000001",
      proposal: "PROP-000001",
      payment: "PAY-000001",
    };
    return prefixes[documentType] || "DOC-000001";
  }
}

export {
  generateNextDocumentNumber,
};
