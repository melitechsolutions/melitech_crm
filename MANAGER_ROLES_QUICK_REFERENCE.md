# Manager Roles - Quick Reference Guide

## Sales Manager
**Role ID**: `sales_manager`  
**Dashboard URL**: `/crm/sales`  
**Department**: Sales

### Accessible Features
| Feature | Access Level | Notes |
|---------|-------------|-------|
| Sales Dashboard | Full | Dedicated sales dashboard |
| Clients | Full CRUD | Create, view, edit clients |
| Opportunities | Full CRUD | Manage sales pipeline |
| Sales Pipeline | Full | Track opportunities through pipeline |
| Estimates | Full CRUD | Create and send estimates |
| Invoices | View & Create | Can view all, create new |
| Payment Reports | View | Monitor payment status |
| Receipts | View | Track incoming payments |
| Projects | View | Read-only project access |
| Payments | View | Monitor payment collections |
| Expenses | View | View department expenses |
| Reports | View | Access sales reports |
| Analytics | View | Sales analytics & metrics |
| AI Features | Full | Generate emails, summarize data |

### Restricted Features
- Cannot approve/delete invoices
- Cannot reconcile bank transactions
- Cannot manage accounts or users
- Cannot access HR or Procurement modules

---

## Procurement Manager
**Role ID**: `procurement_manager`  
**Dashboard URL**: `/crm/procurement`  
**Department**: Procurement

### Accessible Features
| Feature | Access Level | Notes |
|---------|-------------|-------|
| Procurement Dashboard | Full | Dedicated procurement dashboard |
| Local Purchase Orders | Full CRUD | Create and manage LPOs |
| Purchase Orders | Full CRUD | Manage purchase orders |
| Imprests | View & Create | Request and track imprests |
| Suppliers | View | Access supplier list |
| Supplier Management | Full | Manage supplier data |
| Inventory | View | Stock monitoring |
| Products | View | Available products |
| Clients | View | Read-only client access |
| Accounting | View | Financial overview only |
| Expenses | View | Monitor expenses |
| Reports | View | Procurement reports |
| Analytics | View | Procurement analytics |

### Restricted Features
- Cannot create/delete accounting records
- Cannot approve payments
- Cannot manage users or roles
- Cannot access HR module

---

## ICT Manager
**Role ID**: `ict_manager`  
**Dashboard URL**: `/crm/ict`  
**Department**: ICT

### Accessible Features
| Feature | Access Level | Notes |
|---------|-------------|-------|
| System Dashboard | Full | System health & statistics |
| User Management | Full | View all users |
| Security | View | Security logs & settings |
| System Settings | Full Admin | System-wide configuration |
| Database | Admin | Database operations |
| Backups | Admin | Manage backups |
| System Logs | View | Audit trail |
| Email Queue | Manage | Manage system emails |
| Session Management | Admin | Manage user sessions |
| Clients | View | Read-only |
| Projects | View | Read-only |
| HR | View | Read-only |
| Accounting | View | Financial overview |
| Procurement | View | Read-only |
| Analytics | View | System analytics |

### Restricted Features
- Cannot create/edit business data
- Cannot approve transactions
- Cannot manage accounting
- Cannot access client portal

---

## Permission Matrix

```
╔════════════════════════╦═══════════╦═════════════╦══════════════╗
║ Module                 ║ Sales Mgr ║ Proc Mgr    ║ ICT Mgr      ║
╠════════════════════════╬═══════════╬═════════════╬══════════════╣
║ Sales                  ║ Full      ║ -           ║ View         ║
║ Procurement            ║ -         ║ Full        ║ View         ║
║ Accounting             ║ View+Cr   ║ View        ║ View         ║
║ HR                     ║ -         ║ -           ║ View         ║
║ Clients                ║ Full      ║ View        ║ View         ║
║ Projects               ║ View      ║ -           ║ View         ║
║ Products               ║ View      ║ View        ║ View         ║
║ Analytics              ║ Full      ║ View        ║ Full         ║
║ Reports                ║ Full      ║ View        ║ Full         ║
║ System Admin           ║ -         ║ -           ║ Full         ║
║ User Management        ║ -         ║ -           ║ Full         ║
║ Dashboard              ║ Custom    ║ Custom      ║ Custom       ║
╚════════════════════════╩═══════════╩═════════════╩══════════════╝

Legend: Full = Create, Read, Update, Delete | View = Read Only
        View+Cr = Read and Create | - = No Access
```

---

## Dashboard Customization

Each manager has a role-specific dashboard:

### Sales Manager Dashboard (`/crm/sales`)
- Sales pipeline overview
- Recent opportunities
- Top clients
- Revenue metrics
- Invoice summary
- Forecast charts

### Procurement Manager Dashboard (`/crm/procurement`)
- Purchase order status
- Supplier performance
- Budget vs spending
- Imprest requests
- LPO pipeline
- Inventory alerts

### ICT Manager Dashboard (`/crm/ict`)
- System health metrics
- Active users
- Database status
- Backup summary
- System logs
- Performance metrics

---

## Navigation Menu Visibility

### Accounting Menu
- Accessible to: Super Admin, Admin, Accountant, Project Manager, Sales Manager, Procurement Manager

### Procurement Menu
- Accessible to: Super Admin, Admin, Procurement Manager

### Sales Menu
- Accessible to: Super Admin, Admin, Project Manager, Sales Manager

### Admin/Settings
- Accessible to: Super Admin, Admin, ICT Manager

---

## Creating Manager Users

### SQL Template

```sql
-- Create Sales Manager
INSERT INTO users (
  id, name, email, role, 
  createdAt, lastSignedIn, 
  department, isActive, 
  emailVerified, loginMethod
) VALUES (
  UUID(), 
  'John Sales', 
  'john.sales@company.com', 
  'sales_manager',
  NOW(), NOW(),
  'Sales', 1,
  NOW(), 'password'
);

-- Create Procurement Manager
INSERT INTO users (
  id, name, email, role, 
  createdAt, lastSignedIn, 
  department, isActive, 
  emailVerified, loginMethod
) VALUES (
  UUID(), 
  'Jane Procurement', 
  'jane.procurement@company.com', 
  'procurement_manager',
  NOW(), NOW(),
  'Procurement', 1,
  NOW(), 'password'
);

-- Create ICT Manager
INSERT INTO users (
  id, name, email, role, 
  createdAt, lastSignedIn, 
  department, isActive, 
  emailVerified, loginMethod
) VALUES (
  UUID(), 
  'Bob ICT', 
  'bob.ict@company.com', 
  'ict_manager',
  NOW(), NOW(),
  'ICT', 1,
  NOW(), 'password'
);
```

---

## API Permission Checks

When making API calls, these manager roles are automatically checked:

### Sales Manager Endpoints
- GET `/api/sales/*` - Allowed
- POST `/api/invoices` - Allowed (with restrictions)
- POST `/api/clients` - Allowed
- DELETE `/api/invoices/:id` - Denied

### Procurement Manager Endpoints
- GET `/api/procurement/*` - Allowed
- POST `/api/lpo` - Allowed
- POST `/api/orders` - Allowed
- DELETE `/api/suppliers/:id` - Denied

### ICT Manager Endpoints
- GET `/api/system/*` - Allowed
- POST `/api/users` - Allowed (admin only)
- DELETE `/api/sessions/:id` - Allowed
- POST `/api/settings` - Allowed (admin only)

---

## Best Practices

1. **Role Assignment**: Assign roles based on job responsibilities
2. **Monitor Activity**: Use ICT Manager to review audit logs
3. **Approval Workflows**: Route approvals to appropriate roles
4. **Separation of Duties**: Ensure proper controls between roles
5. **Regular Audits**: Review permissions quarterly

---

## Troubleshooting

### Cannot Access Feature
1. Verify user role is correct
2. Check if role has required permission
3. Review browser cache and reload
4. Check server logs for PERMISSION_DENIED errors

### Missing Dashboard
1. Verify role is correct
2. Check ROLE_DASHBOARDS mapping
3. Verify role-specific dashboard page exists
4. Check browser console for errors

### API Calls Failing
1. Verify user authentication
2. Check permission requirements
3. Review error response for details
4. Check middleware enforcement

---

**Last Updated**: 2024  
**Version**: 1.0  
**Status**: Ready for Production
