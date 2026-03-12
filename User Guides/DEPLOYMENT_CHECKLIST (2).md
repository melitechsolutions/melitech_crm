# Melitech CRM - Deployment Checklist
**Date:** January 30, 2026

## Pre-Deployment Steps

### 1. Backup Current System
- [ ] Backup database
- [ ] Backup current codebase
- [ ] Document current version

### 2. Review Changes
- [ ] Review `IMPLEMENTATION_SUMMARY_JAN_30_2026.md`
- [ ] Check all modified files list
- [ ] Understand new features

## Deployment Steps

### 3. Update Codebase
```bash
# Navigate to project directory
cd /path/to/melitechcrm

# Pull/copy updated files
# Ensure these files are updated:
# - client/src/components/ExpenseForm.tsx
# - client/src/components/forms/CreateProjectForm.tsx
# - client/src/pages/EditProject.tsx
# - client/src/pages/Payments.tsx
# - client/src/pages/Expenses.tsx
# - server/routers/expenses.ts
# - server/routers/settings.ts
# - server/routers/payments.ts
# - server/routers/projects.ts
# - server/utils/pdf-generator.ts
# - server/utils/estimate-pdf-generator.ts (NEW FILE)
# - server/utils/receipt-pdf-generator.ts (NEW FILE)
```

### 4. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 5. Database Migration (If Needed)
```bash
# Check if these fields exist in your database:
# - expenses.chartOfAccountId
# - projects.progressPercentage
# - payments.approvedBy
# - payments.approvedAt

# Run migrations if needed
npm run db:push
# OR
npm run db:migrate
```

### 6. Build Project
```bash
npm run build
```

### 7. Test Build
```bash
# Start in development mode first
npm run dev

# Open browser and test:
# - Expenses page (COA selection)
# - Payments page (approval button)
# - Expenses page (approval button)
# - Create Project (backend integration)
# - Edit Project (progress percentage)
# - System Settings (Super Admin)
```

### 8. Fix DollarSign Error (If Occurs)
```bash
# Clear browser cache
# Hard refresh: Ctrl+Shift+R

# If still occurring:
rm -rf dist
rm -rf node_modules/.vite
npm run build
```

## Post-Deployment Testing

### 9. Functional Testing
- [ ] **Expenses:**
  - [ ] Create expense with COA selection
  - [ ] COA field is required
  - [ ] Approve pending expense
  - [ ] Verify status changes

- [ ] **Payments:**
  - [ ] Approve pending payment
  - [ ] Verify status changes to completed
  - [ ] Check approval timestamp

- [ ] **Projects:**
  - [ ] Create new project
  - [ ] Verify saves to database
  - [ ] Edit project progress percentage
  - [ ] Set progress to 100% and verify auto-completion

- [ ] **Documents:**
  - [ ] Generate invoice PDF
  - [ ] Verify terms and conditions appear
  - [ ] Verify payment details appear
  - [ ] Verify footer signature
  - [ ] Generate estimate PDF
  - [ ] Verify 45-day validity terms
  - [ ] Generate receipt PDF
  - [ ] Verify "Thank you" message

- [ ] **System Settings:**
  - [ ] Login as Super Admin
  - [ ] Update settings
  - [ ] Verify settings save
  - [ ] Refresh and verify persistence

- [ ] **Notifications:**
  - [ ] Check notification bell displays
  - [ ] Create test notification
  - [ ] Mark as read
  - [ ] Verify count updates

### 10. Performance Check
- [ ] Page load times acceptable
- [ ] No console errors
- [ ] All icons display correctly
- [ ] Forms submit successfully

### 11. User Acceptance
- [ ] Demo new features to stakeholders
- [ ] Gather feedback
- [ ] Document any issues

## Rollback Plan (If Needed)

### 12. Emergency Rollback
```bash
# Stop application
npm stop

# Restore backup
# [Your backup restoration commands]

# Restart application
npm start
```

## Production Deployment

### 13. Deploy to Production
```bash
# Stop production server
pm2 stop melitech-crm

# Pull latest changes
git pull origin main

# Install dependencies
npm install --legacy-peer-deps

# Build for production
npm run build

# Start production server
pm2 start melitech-crm
pm2 save
```

### 14. Monitor Production
- [ ] Check application logs
- [ ] Monitor error rates
- [ ] Watch performance metrics
- [ ] Verify user access

## Documentation

### 15. Update Documentation
- [ ] Update user manual with new features
- [ ] Document COA selection process
- [ ] Document approval workflow
- [ ] Document progress tracking
- [ ] Update training materials

## Communication

### 16. Notify Stakeholders
- [ ] Send deployment notification
- [ ] Highlight new features
- [ ] Provide training resources
- [ ] Share support contact

## Success Criteria

✅ All features working as expected  
✅ No critical errors in logs  
✅ Users can access all functionality  
✅ Performance is acceptable  
✅ Documentation is updated  

---

## Quick Reference

**New Features:**
1. COA selection in Expenses (required)
2. Approval buttons for Payments and Expenses
3. Project progress percentage tracking
4. Enhanced document templates (terms, payment details, signatures)
5. Working System Settings backend
6. Create Project backend integration

**Files to Watch:**
- Check browser console for errors
- Monitor server logs for backend issues
- Watch database for proper data storage

**Support:**
- Refer to `IMPLEMENTATION_SUMMARY_JAN_30_2026.md` for details
- Refer to `DOLLARSIGN_ERROR_FIX.md` for icon issues

---

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Status:** _______________  
**Notes:** _______________
