import "dotenv/config";
import * as bcrypt from "bcryptjs";
import { getUserByEmail } from "./server/db-users";
import { getUserPassword } from "./server/db";

async function verifyLogin() {
  const defaultEmail = "admin@melitech.com";
  const defaultPassword = "password123";

  console.log(`[Verify] Attempting to verify login for: ${defaultEmail}`);

  try {
    // 1. Find the user
    const user = await getUserByEmail(defaultEmail);

    if (!user) {
      console.error(`[Verify] ❌ User ${defaultEmail} not found.`);
      return;
    }

    console.log(`[Verify] ✅ User found: ${user.id}`);

    // 2. Get the stored password hash
    const passwordHash = await getUserPassword(user.id);

    if (!passwordHash) {
      console.error(`[Verify] ❌ Password hash not found for user ${user.id}.`);
      return;
    }

    console.log("[Verify] ✅ Password hash retrieved.");

    // 3. Verify the password
    const isPasswordValid = await bcrypt.compare(defaultPassword, passwordHash);

    if (isPasswordValid) {
      console.log(`[Verify] ✨ Login successful for ${defaultEmail}!`);
    } else {
      console.error(`[Verify] ❌ Login failed for ${defaultEmail}. Password mismatch.`);
    }
  } catch (error) {
    console.error("[Verify] 💥 Script execution failed:", error);
    process.exit(1);
  }
}

verifyLogin()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("[Verify] 💥 Script execution failed:", error);
    process.exit(1);
  });
