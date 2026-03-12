# Melitech CRM - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Windows Users

1. **Extract the ZIP file**
2. **Double-click**: `SETUP-WINDOWS.bat`
3. **Wait for setup to complete**
4. **Double-click**: `START-DEV-WINDOWS.bat`
5. **Open browser**: http://localhost:5173

### Linux Users

1. **Extract the ZIP file**
   ```bash
   unzip melitech-crm-linux.zip
   cd melitech-crm
   ```

2. **Run setup**
   ```bash
   ./setup-linux.sh
   ```

3. **Start development server**
   ```bash
   ./start-dev-linux.sh
   ```

4. **Open browser**: http://localhost:5173

### Docker Users (Windows)

1. **Extract the ZIP file**
2. **Ensure Docker Desktop is running**
3. **Double-click**: `SETUP-DOCKER-WINDOWS.bat`
4. **Open browser**: http://localhost:5173

### Docker Users (Linux)

1. **Extract the ZIP file**
   ```bash
   unzip melitech-crm-linux.zip
   cd melitech-crm
   ```

2. **Run Docker setup**
   ```bash
   ./setup-docker-linux.sh
   ```

3. **Open browser**: http://localhost:5173

---

## 📋 What's Fixed

✅ **Login Persistence** - Stay logged in after page refresh
✅ **Role-Based Dashboards** - Super Admin, Admin, HR, Accountant, Staff
✅ **Docker Support** - Works in Docker HTTP environment
✅ **Client Portal** - Connected to backend API
✅ **Authentication** - Secure cookie/localStorage fallback

---

## 🔑 Default Login

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@melitech.com | password123 |
| Admin | admin2@melitech.com | password123 |
| HR | hr@melitech.com | password123 |
| Accountant | accountant@melitech.com | password123 |
| Staff | staff@melitech.com | password123 |
| Client | client@melitech.com | password123 |

*Note: Change these credentials in production*

---

## 📍 Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Database**: localhost:3306

---

## 🛠️ Common Commands

### Windows
```batch
SETUP-WINDOWS.bat              # Initial setup
START-DEV-WINDOWS.bat          # Start development
SETUP-DOCKER-WINDOWS.bat       # Docker setup
npm run build                  # Build for production
npm run start                  # Start production server
```

### Linux
```bash
./setup-linux.sh               # Initial setup
./start-dev-linux.sh           # Start development
./setup-docker-linux.sh        # Docker setup
npm run build                  # Build for production
npm run start                  # Start production server
```

---

## ❓ Need Help?

1. **Read**: `SETUP_GUIDE.md` - Comprehensive setup guide
2. **Check**: `IMPLEMENTATION_GUIDE.md` - Implementation details
3. **Review**: `BACKEND_API_ROUTES.md` - API documentation
4. **Troubleshoot**: See SETUP_GUIDE.md → Troubleshooting section

---

## 🎯 Next Steps

1. ✅ Setup the application (see above)
2. 📝 Update `.env` with your database credentials
3. 🔐 Change default passwords
4. 🚀 Deploy to your server
5. 📚 Read full documentation in `SETUP_GUIDE.md`

---

**Happy Coding! 🎉**

