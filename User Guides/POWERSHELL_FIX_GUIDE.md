# PowerShell Execution Policy Fix Guide

**Issue:** `File C:\Users\...\pnpm.ps1 cannot be loaded because running scripts is disabled`

**Cause:** Windows PowerShell has script execution disabled by default for security reasons

**Status:** ✅ EASY TO FIX

---

## Solution 1: Use Command Prompt (Easiest - No Admin Required)

The simplest solution is to use **Command Prompt (cmd.exe)** instead of PowerShell.

### Steps:

1. **Open Command Prompt** (not PowerShell)
   - Press `Win + R`
   - Type `cmd`
   - Press Enter

2. **Navigate to your project**
   ```cmd
   cd C:\melitech_crm
   ```

3. **Run pnpm commands**
   ```cmd
   pnpm install
   pnpm build
   pnpm start
   ```

### Why This Works
Command Prompt doesn't have the same execution policy restrictions as PowerShell.

---

## Solution 2: Bypass Execution Policy (PowerShell)

If you prefer PowerShell, you can bypass the execution policy for a single command.

### Step 1: Open PowerShell as Administrator
- Right-click PowerShell
- Select "Run as administrator"

### Step 2: Run pnpm with Bypass Flag
```powershell
powershell -ExecutionPolicy Bypass -Command "pnpm install"
```

Or for all commands in the session:
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUser
```

### Step 3: Run Your Commands
```powershell
pnpm install
pnpm build
pnpm start
```

### To Restore Original Policy
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## Solution 3: Change Execution Policy Permanently (PowerShell)

### Step 1: Open PowerShell as Administrator
- Right-click PowerShell
- Select "Run as administrator"

### Step 2: Set Execution Policy
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Step 3: Confirm the Change
When prompted, type `Y` and press Enter

### Step 4: Verify
```powershell
Get-ExecutionPolicy
```

You should see: `RemoteSigned`

### Step 5: Now You Can Use pnpm Normally
```powershell
pnpm install
pnpm build
pnpm start
```

---

## Solution 4: Use Node.js Command Directly

If you have Node.js installed, you can use npm to run pnpm:

```cmd
npm install -g pnpm
node "C:\Users\Enjuki\AppData\Roaming\npm\pnpm.cjs" install
```

Or simply:
```cmd
npm run install
```

---

## Recommended Approach

### For Immediate Use (No Admin Required)
**Use Command Prompt (Solution 1)**

```cmd
cd C:\melitech_crm
pnpm install
pnpm build
pnpm start
```

### For Long-Term Use (Requires Admin)
**Change Execution Policy (Solution 3)**

1. Open PowerShell as Administrator
2. Run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
3. Type `Y` to confirm
4. Now use PowerShell normally

---

## Complete Windows Setup Guide

### Step 1: Extract the Zip File
```cmd
# Using Command Prompt or PowerShell
cd C:\
Expand-Archive -Path melitech_crm.zip -DestinationPath .
cd melitech_crm
```

### Step 2: Install Dependencies
```cmd
# Using Command Prompt (Recommended if PowerShell has issues)
pnpm install
```

### Step 3: Build the Application
```cmd
pnpm build
```

### Step 4: Start the Server
```cmd
pnpm start
```

### Step 5: Access the Application
Open your browser and go to: **http://localhost:3000**

---

## Troubleshooting

### Issue: "pnpm: command not found"
**Solution:** Install pnpm globally
```cmd
npm install -g pnpm
```

### Issue: Still Getting Execution Policy Error in PowerShell
**Solution:** Use Command Prompt instead
```cmd
# Open Command Prompt (cmd.exe)
cd C:\melitech_crm
pnpm install
```

### Issue: Port 3000 Already in Use
**Solution:** The app will automatically use port 3001 or 3002

### Issue: "node_modules not found" after install
**Solution:** Run install again
```cmd
pnpm install
```

---

## Understanding Execution Policies

### What Are Execution Policies?
Windows PowerShell execution policies control which scripts can run on your computer.

### Common Policies
| Policy | Description |
|--------|-------------|
| **Restricted** | No scripts can run (default) |
| **RemoteSigned** | Downloaded scripts must be signed |
| **Unrestricted** | All scripts can run |
| **Bypass** | Nothing is blocked (temporary) |

### Why Does This Happen?
- Windows sets PowerShell to "Restricted" by default for security
- This prevents malicious scripts from running automatically
- pnpm needs to run scripts, so it conflicts with this policy

---

## Command Reference

### Using Command Prompt (Recommended)
```cmd
cd C:\melitech_crm
pnpm install
pnpm build
pnpm start
pnpm dev
pnpm format
pnpm check
pnpm test
pnpm db:push
pnpm db:seed
```

### Using PowerShell (After Fixing Execution Policy)
```powershell
cd C:\melitech_crm
pnpm install
pnpm build
pnpm start
pnpm dev
pnpm format
pnpm check
pnpm test
pnpm db:push
pnpm db:seed
```

---

## Quick Fix Checklist

- [ ] Close current PowerShell window
- [ ] Open Command Prompt (cmd.exe) instead
- [ ] Navigate to project: `cd C:\melitech_crm`
- [ ] Run: `pnpm install`
- [ ] Run: `pnpm build`
- [ ] Run: `pnpm start`
- [ ] Open browser: http://localhost:3000

---

## Additional Resources

### Microsoft Documentation
- [About Execution Policies](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_execution_policies)
- [Set-ExecutionPolicy](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.security/set-executionpolicy)

### Node.js & pnpm
- [pnpm Documentation](https://pnpm.io/)
- [Node.js Installation](https://nodejs.org/)

---

## Summary

| Method | Difficulty | Admin Required | Permanent |
|--------|-----------|-----------------|-----------|
| Use Command Prompt | ⭐ Easy | No | N/A |
| Bypass Flag | ⭐⭐ Medium | Yes | No |
| Change Policy | ⭐⭐ Medium | Yes | Yes |
| Use npm | ⭐⭐ Medium | No | N/A |

**Recommended:** Use Command Prompt (Solution 1) - It's the easiest and requires no admin rights.

---

**Status:** ✅ ISSUE SOLVABLE  
**Recommended Solution:** Use Command Prompt  
**Time to Fix:** < 1 minute
