# Docker Setup Guide for Melitech CRM

This guide provides instructions for deploying the Melitech Solutions CRM using Docker and Docker Compose.

## Prerequisites

- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose (included with Docker Desktop)
- At least 4GB RAM available for Docker
- 10GB free disk space

## Quick Start

### 1. Prepare Environment Variables

```bash
# Copy the example environment file
cp .env.docker.example .env.docker

# Edit with your configuration
nano .env.docker
```

### 2. Build and Start Services

```bash
# Build Docker images
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app
```

### 3. Initialize Database

```bash
# Run database migrations
docker-compose exec app pnpm db:push

# Seed initial data (if applicable)
docker-compose exec app pnpm db:seed
```

### 4. Access the Application

- **Application**: http://localhost:3000
- **MySQL**: localhost:3306
- **Redis**: localhost:6379

## Services

### MySQL Database
- **Container**: melitech-mysql
- **Port**: 3306
- **Volume**: mysql_data (persistent)
- **Health Check**: Enabled

### Node.js Application
- **Container**: melitech-app
- **Port**: 3000
- **Volume**: logs (persistent)
- **Health Check**: Enabled

### Redis Cache (Optional)
- **Container**: melitech-redis
- **Port**: 6379
- **Volume**: redis_data (persistent)
- **Health Check**: Enabled

## Common Commands

### View Service Status
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f mysql
```

### Stop Services
```bash
docker-compose stop
```

### Restart Services
```bash
docker-compose restart
```

### Remove Services and Volumes
```bash
# Stop and remove containers
docker-compose down

# Also remove volumes (WARNING: deletes data)
docker-compose down -v
```

### Execute Commands in Container
```bash
# Run shell command
docker-compose exec app sh

# Run npm command
docker-compose exec app pnpm list

# Run database migration
docker-compose exec app pnpm db:push
```

## Environment Variables

### Required Variables
- `VITE_APP_ID`: Manus OAuth application ID
- `OAUTH_SERVER_URL`: OAuth server URL
- `VITE_OAUTH_PORTAL_URL`: OAuth portal URL
- `JWT_SECRET`: Session signing secret (change in production!)

### Database Variables
- `MYSQL_ROOT_PASSWORD`: MySQL root password
- `MYSQL_DATABASE`: Database name
- `MYSQL_USER`: Database user
- `MYSQL_PASSWORD`: Database password

### Optional Variables
- `NODE_ENV`: Set to 'production' for production deployments
- `LOG_LEVEL`: Logging level (debug, info, warn, error)

## Production Deployment

### Security Recommendations

1. **Change Secrets**
   ```bash
   # Generate strong JWT secret
   openssl rand -base64 32
   ```

2. **Use Environment Secrets**
   - Never commit `.env.docker` to version control
   - Use Docker secrets or environment management tools

3. **Enable SSL/TLS**
   - Use a reverse proxy (nginx, traefik)
   - Configure SSL certificates

4. **Database Backups**
   ```bash
   # Backup MySQL database
   docker-compose exec mysql mysqldump -u melitech -p melitech_crm > backup.sql
   
   # Restore from backup
   docker-compose exec -T mysql mysql -u melitech -p melitech_crm < backup.sql
   ```

5. **Resource Limits**
   - Set memory limits in docker-compose.yml
   - Monitor container resource usage

### Scaling

For production with multiple instances:

1. Use Docker Swarm or Kubernetes
2. Configure load balancing (nginx, HAProxy)
3. Use managed database service (AWS RDS, Google Cloud SQL)
4. Implement Redis clustering for cache

## Troubleshooting

### Container Won't Start
```bash
# Check logs
docker-compose logs app

# Verify environment variables
docker-compose config

# Rebuild image
docker-compose build --no-cache
```

### Database Connection Issues
```bash
# Test MySQL connection
docker-compose exec app mysql -h mysql -u melitech -p melitech_crm -e "SELECT 1"

# Check MySQL logs
docker-compose logs mysql
```

### Port Already in Use
```bash
# Change ports in docker-compose.yml
# Or kill process using the port
lsof -ti:3000 | xargs kill -9
```

### Out of Disk Space
```bash
# Clean up Docker resources
docker system prune -a

# Remove unused volumes
docker volume prune
```

## Monitoring

### Health Checks
Services include health checks that automatically restart failed containers:

```bash
# View health status
docker-compose ps

# Check container health
docker inspect melitech-app --format='{{.State.Health.Status}}'
```

### Logs
```bash
# Real-time logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# Logs since specific time
docker-compose logs --since 2024-01-01
```

## Backup and Restore

### Backup Database
```bash
docker-compose exec mysql mysqldump \
  -u melitech -p melitech_crm \
  --single-transaction \
  > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database
```bash
docker-compose exec -T mysql mysql \
  -u melitech -p melitech_crm \
  < backup_20240101_120000.sql
```

### Backup Volumes
```bash
# Backup MySQL data
docker run --rm -v melitech_crm_mysql_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/mysql_data.tar.gz -C /data .

# Restore MySQL data
docker run --rm -v melitech_crm_mysql_data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/mysql_data.tar.gz -C /data
```

## Support

For issues or questions:
1. Check Docker logs: `docker-compose logs`
2. Review environment configuration
3. Verify all required environment variables are set
4. Check Docker and Docker Compose versions
5. Consult Melitech CRM documentation

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Node.js Docker Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
