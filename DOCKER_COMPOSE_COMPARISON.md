# Docker Compose Configuration Comparison

**Last Updated**: December 9, 2025  
**Version**: 1.0

---

## Executive Summary

This document compares the two docker-compose configurations available for Melitech CRM:

1. **docker-compose(skipvite).yml** - Simplified configuration
2. **docker-compose.yml** - Full-featured configuration (RECOMMENDED)

---

## Side-by-Side Comparison

| Feature | Simplified | Full-Featured |
|---------|-----------|---------------|
| **File Name** | `docker-compose(skipvite).yml` | `docker-compose.yml` |
| **Services** | MySQL + App | MySQL + App + Redis |
| **Networking** | None | Docker bridge network |
| **Health Checks** | Database only | Database + App + Redis |
| **Redis Cache** | ❌ No | ✅ Yes |
| **Network Isolation** | ❌ No | ✅ Yes |
| **Production Ready** | ⚠️ Partial | ✅ Yes |
| **Startup Time** | ~2 minutes | ~2-3 minutes |
| **Memory Usage** | ~400MB | ~600MB |
| **Complexity** | Low | Medium |
| **Recommended For** | Development | Production |

---

## Detailed Comparison

### 1. Services

#### Simplified (docker-compose(skipvite).yml)
```yaml
services:
  db:
    image: mysql:8.0
    container_name: melitech_crm_db
    
  app:
    build: .
    container_name: melitech_crm_app
```

**Services**: 2 (MySQL, App)

#### Full-Featured (docker-compose.yml)
```yaml
services:
  db:
    image: mysql:8.0
    container_name: melitech_crm_db
    
  app:
    build: .
    container_name: melitech_crm_app
    
  redis:
    image: redis:7-alpine
    container_name: melitech_crm_redis
```

**Services**: 3 (MySQL, App, Redis)

---

### 2. Networking

#### Simplified
```yaml
# No networking configuration
# Services communicate via localhost
```

**Issues**:
- ❌ No network isolation
- ❌ All ports exposed
- ❌ Potential security risks

#### Full-Featured
```yaml
networks:
  melitech-network:
    driver: bridge

services:
  db:
    networks: [melitech-network]
  app:
    networks: [melitech-network]
  redis:
    networks: [melitech-network]
```

**Benefits**:
- ✅ Network isolation
- ✅ Service discovery
- ✅ Better security
- ✅ Production-ready

---

### 3. Health Checks

#### Simplified
```yaml
db:
  healthcheck:
    test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
    timeout: 20s
    retries: 10
```

**Coverage**: Database only

#### Full-Featured
```yaml
db:
  healthcheck:
    test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
    timeout: 20s
    retries: 10

app:
  healthcheck:
    test: ["CMD", "node", "-e", "require('http').get(...)"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 40s

redis:
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
    timeout: 10s
    retries: 5
    interval: 10s
```

**Coverage**: Database, App, Redis

---

### 4. Port Mapping

#### Simplified
```yaml
db:
  ports: ["3307:3306"]

app:
  ports: ["3000:3000"]
```

**Exposed Ports**: 2 (3307, 3000)

#### Full-Featured
```yaml
db:
  ports: ["${DB_PORT:-3307}:3306"]

app:
  ports: ["${APP_PORT:-3000}:3000"]

redis:
  ports: ["${REDIS_PORT:-6379}:6379"]
```

**Exposed Ports**: 3 (3307, 3000, 6379)  
**Configurable**: Yes (via environment variables)

---

### 5. Volumes

#### Simplified
```yaml
db:
  volumes:
    - melitech_crm_data:/var/lib/mysql
    - ./scripts/init.sql:/docker-entrypoint-initdb.d/init.sql

volumes:
  melitech_crm_data:
```

#### Full-Featured
```yaml
db:
  volumes:
    - mysql_data:/var/lib/mysql
    - ./scripts/init.sql:/docker-entrypoint-initdb.d/init.sql

app:
  volumes:
    - ./logs:/app/logs

redis:
  volumes:
    - redis_data:/data

volumes:
  mysql_data:
    driver: local
  redis_data:
    driver: local
```

**Additional Features**:
- ✅ App logs volume
- ✅ Redis data persistence
- ✅ Explicit driver specification

---

### 6. Environment Variables

#### Simplified
```yaml
app:
  environment:
    DATABASE_URL: mysql://melitech_user:twMH*4dFIQRoT35D@@Xg@db:3306/melitech_crm
    JWT_SECRET: ro5A_c25AwsQHy30Dqg6VAbqQHmeezt1Xfx-e37ApnE
    NODE_ENV: production
```

**Variables**: 3

#### Full-Featured
```yaml
app:
  environment:
    NODE_ENV: production
    DATABASE_URL: mysql://...
    JWT_SECRET: ...
    AUTH_MODE: local
    VITE_APP_ID: standalone
    OAUTH_SERVER_URL: http://localhost:3000
    VITE_OAUTH_PORTAL_URL: http://localhost:3000
    OWNER_OPEN_ID: admin
    OWNER_NAME: Administrator
    VITE_APP_TITLE: Melitech Solutions CRM
    VITE_APP_LOGO: ...
    BUILT_IN_FORGE_API_URL: ...
    BUILT_IN_FORGE_API_KEY: ...
    VITE_FRONTEND_FORGE_API_URL: ...
    VITE_FRONTEND_FORGE_API_KEY: ...
    VITE_ANALYTICS_ENDPOINT: ...
    VITE_ANALYTICS_WEBSITE_ID: ...
```

**Variables**: 18+  
**Flexibility**: High (supports environment variable substitution)

---

### 7. Restart Policies

#### Simplified
```yaml
db:
  restart: always

app:
  restart: always
```

#### Full-Featured
```yaml
db:
  restart: always

app:
  restart: always

redis:
  restart: unless-stopped
```

**Difference**: Redis uses `unless-stopped` (respects manual stop)

---

## Use Case Recommendations

### Use Simplified (docker-compose(skipvite).yml) When:

1. **Development Environment**
   - Quick testing
   - Learning Docker
   - Minimal resource usage

2. **CI/CD Testing**
   - Automated tests
   - Fast feedback loop
   - Resource-constrained environments

3. **Proof of Concept**
   - Quick demo setup
   - Temporary testing
   - No production requirements

**Example**:
```bash
docker-compose -f docker-compose(skipvite).yml up -d
```

---

### Use Full-Featured (docker-compose.yml) When:

1. **Production Deployment**
   - ✅ Network isolation
   - ✅ Health monitoring
   - ✅ Redis caching
   - ✅ Proper logging

2. **Performance-Critical**
   - Redis caching improves response times
   - Better resource management
   - Scalability ready

3. **Enterprise Environments**
   - Security requirements
   - Monitoring and alerting
   - Disaster recovery
   - Compliance needs

4. **Long-Running Services**
   - Stability and reliability
   - Automatic recovery
   - Resource optimization

**Example** (RECOMMENDED):
```bash
docker-compose up -d
```

---

## Migration Path

### From Simplified to Full-Featured

```bash
# 1. Stop simplified setup
docker-compose -f docker-compose(skipvite).yml down

# 2. Backup database
docker exec melitech_crm_db mysqldump -u melitech_user -ptwMH*4dFIQRoT35D@@Xg melitech_crm > backup.sql

# 3. Start full-featured setup
docker-compose up -d

# 4. Restore database (if needed)
docker exec -i melitech_crm_db mysql -u melitech_user -ptwMH*4dFIQRoT35D@@Xg melitech_crm < backup.sql

# 5. Verify
docker-compose ps
```

---

## Performance Comparison

### Startup Time

| Phase | Simplified | Full-Featured |
|-------|-----------|---------------|
| Docker build | 30-60s | 30-60s |
| MySQL start | 10-20s | 10-20s |
| App migrations | 5-10s | 5-10s |
| App startup | 10-20s | 10-20s |
| Redis start | N/A | 5-10s |
| **Total** | **60-120s** | **120-180s** |

### Memory Usage

| Service | Simplified | Full-Featured |
|---------|-----------|---------------|
| MySQL | ~200MB | ~200MB |
| App | ~150MB | ~150MB |
| Redis | N/A | ~50MB |
| **Total** | **~350MB** | **~400MB** |

### Network Overhead

| Configuration | Overhead |
|---------------|----------|
| Simplified | Low (direct localhost) |
| Full-Featured | Low (Docker bridge network) |

---

## Configuration File Locations

### Simplified
```
melitech_crm/
├── docker-compose(skipvite).yml    # Use this file
├── Dockerfile
├── init-db.ts
├── scripts/
│   └── init.sql
└── .env.local-auth                 # Environment config
```

### Full-Featured
```
melitech_crm/
├── docker-compose.yml              # Use this file (RECOMMENDED)
├── Dockerfile
├── init-db.ts
├── scripts/
│   └── init.sql
└── .env.local-auth                 # Environment config
```

---

## Quick Start Commands

### Simplified
```bash
# Start
docker-compose -f docker-compose(skipvite).yml up -d

# Stop
docker-compose -f docker-compose(skipvite).yml down

# Logs
docker-compose -f docker-compose(skipvite).yml logs -f app
```

### Full-Featured (RECOMMENDED)
```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Logs
docker-compose logs -f app

# Status
docker-compose ps

# Health check
docker-compose ps | grep -E "healthy|unhealthy"
```

---

## Troubleshooting

### Issue: "Cannot find docker-compose file"

**Solution**:
```bash
# Ensure you're in the correct directory
cd /path/to/melitech_crm

# List available files
ls -la docker-compose*.yml

# Use correct file
docker-compose -f docker-compose(skipvite).yml up -d
```

### Issue: "Port already in use"

**Solution**:
```bash
# Check what's using the port
lsof -i :3307

# Change port in .env
DB_PORT=3308

# Restart
docker-compose down
docker-compose up -d
```

### Issue: "Services not communicating"

**Solution** (Full-Featured):
```bash
# Check network
docker network ls
docker network inspect melitech-network

# Verify service connectivity
docker-compose exec app ping db
docker-compose exec app redis-cli -h redis ping
```

---

## Recommendation

**For most users, we recommend using `docker-compose.yml` (Full-Featured) because**:

1. ✅ Production-ready
2. ✅ Better security (network isolation)
3. ✅ Redis caching for performance
4. ✅ Health monitoring
5. ✅ Proper logging
6. ✅ Only ~50MB more memory
7. ✅ Minimal additional startup time

**Use Simplified only if**:
- You have strict resource constraints
- You're just testing locally
- You want minimal complexity

---

## Summary Table

| Aspect | Simplified | Full-Featured |
|--------|-----------|---------------|
| **Best For** | Development | Production |
| **Services** | 2 | 3 |
| **Networking** | Basic | Advanced |
| **Caching** | None | Redis |
| **Health Checks** | Partial | Complete |
| **Memory** | ~350MB | ~400MB |
| **Startup** | ~2 min | ~2-3 min |
| **Security** | Good | Excellent |
| **Monitoring** | Basic | Advanced |
| **Recommended** | ⚠️ Limited | ✅ Yes |

---

**Status**: ✅ Complete  
**Last Updated**: December 9, 2025  
**Version**: 1.0
