#!/bin/bash

# Docker Installation Test Script for Melitech CRM
# This script validates the Docker setup and performs basic tests
# Usage: bash docker-test.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if Docker is installed
check_docker() {
    print_header "Checking Docker Installation"
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        echo "Please install Docker from: https://docs.docker.com/get-docker/"
        return 1
    fi
    
    print_success "Docker is installed"
    docker --version
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        echo "Please install Docker Compose from: https://docs.docker.com/compose/install/"
        return 1
    fi
    
    print_success "Docker Compose is installed"
    docker-compose --version
    
    return 0
}

# Check Docker daemon
check_docker_daemon() {
    print_header "Checking Docker Daemon"
    
    if ! docker ps &> /dev/null; then
        print_error "Docker daemon is not running"
        echo "Please start Docker Desktop or Docker daemon"
        return 1
    fi
    
    print_success "Docker daemon is running"
    return 0
}

# Check system resources
check_resources() {
    print_header "Checking System Resources"
    
    # Check available RAM (Linux only)
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        available_ram=$(free -m | awk '/^Mem:/{print $7}')
        print_info "Available RAM: ${available_ram}MB"
        
        if [ "$available_ram" -lt 2048 ]; then
            print_warning "Less than 2GB RAM available. Recommended: 4GB"
        else
            print_success "Sufficient RAM available"
        fi
    fi
    
    # Check disk space
    available_disk=$(df -BG . | awk 'NR==2 {print $4}' | sed 's/G//')
    print_info "Available disk space: ${available_disk}GB"
    
    if [ "$available_disk" -lt 10 ]; then
        print_warning "Less than 10GB disk space available. Recommended: 10GB"
    else
        print_success "Sufficient disk space available"
    fi
}

# Check ports
check_ports() {
    print_header "Checking Port Availability"
    
    local ports=(3000 3306 6379)
    local all_available=true
    
    for port in "${ports[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
            print_warning "Port $port is already in use"
            all_available=false
        else
            print_success "Port $port is available"
        fi
    done
    
    return 0
}

# Validate Docker files
validate_docker_files() {
    print_header "Validating Docker Configuration Files"
    
    files=("Dockerfile" "docker-compose.yml" ".dockerignore" ".env.docker.example")
    
    for file in "${files[@]}"; do
        if [ -f "$file" ]; then
            print_success "Found: $file"
        else
            print_error "Missing: $file"
            return 1
        fi
    done
    
    return 0
}

# Build Docker images
build_images() {
    print_header "Building Docker Images"
    
    if [ "$1" != "skip" ]; then
        print_info "This may take 2-5 minutes on first run..."
        
        if docker-compose build; then
            print_success "Docker images built successfully"
            return 0
        else
            print_error "Failed to build Docker images"
            return 1
        fi
    else
        print_info "Skipping image build (use 'bash docker-test.sh build' to build)"
        return 0
    fi
}

# Start services
start_services() {
    print_header "Starting Docker Services"
    
    if docker-compose up -d; then
        print_success "Docker services started"
        return 0
    else
        print_error "Failed to start Docker services"
        return 1
    fi
}

# Check service health
check_service_health() {
    print_header "Checking Service Health"
    
    print_info "Waiting for services to be healthy..."
    sleep 5
    
    # Check MySQL
    print_info "Checking MySQL..."
    if docker-compose exec -T mysql mysqladmin ping -h localhost &> /dev/null; then
        print_success "MySQL is healthy"
    else
        print_warning "MySQL is not responding yet (may still be starting)"
    fi
    
    # Check Redis
    print_info "Checking Redis..."
    if docker-compose exec -T redis redis-cli ping &> /dev/null; then
        print_success "Redis is healthy"
    else
        print_warning "Redis is not responding yet (may still be starting)"
    fi
    
    # Check App
    print_info "Checking Application..."
    if curl -s http://localhost:3000 > /dev/null; then
        print_success "Application is responding"
    else
        print_warning "Application is not responding yet (may still be starting)"
    fi
}

# Show service status
show_status() {
    print_header "Docker Service Status"
    docker-compose ps
}

# Show logs
show_logs() {
    print_header "Recent Service Logs"
    echo -e "\n${YELLOW}Application Logs:${NC}"
    docker-compose logs --tail=20 app
    
    echo -e "\n${YELLOW}MySQL Logs:${NC}"
    docker-compose logs --tail=20 mysql
}

# Run database migrations
run_migrations() {
    print_header "Running Database Migrations"
    
    print_info "Waiting for MySQL to be fully ready..."
    sleep 10
    
    if docker-compose exec app pnpm db:push; then
        print_success "Database migrations completed"
        return 0
    else
        print_warning "Database migrations may have failed (check logs)"
        return 1
    fi
}

# Test application access
test_application() {
    print_header "Testing Application Access"
    
    print_info "Testing HTTP connectivity..."
    
    for i in {1..30}; do
        if curl -s http://localhost:3000 > /dev/null; then
            print_success "Application is accessible at http://localhost:3000"
            return 0
        fi
        
        if [ $((i % 5)) -eq 0 ]; then
            print_info "Attempt $i/30: Waiting for application to start..."
        fi
        
        sleep 1
    done
    
    print_error "Application is not accessible after 30 seconds"
    return 1
}

# Cleanup function
cleanup() {
    print_header "Cleanup"
    
    read -p "Do you want to stop Docker services? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose down
        print_success "Docker services stopped"
    fi
}

# Main test flow
main() {
    print_header "Melitech CRM - Docker Installation Test"
    
    # Check prerequisites
    check_docker || exit 1
    check_docker_daemon || exit 1
    check_resources
    check_ports
    
    # Validate configuration
    validate_docker_files || exit 1
    
    # Prepare environment
    if [ ! -f ".env.docker" ]; then
        print_warning ".env.docker not found"
        print_info "Copying from .env.docker.example..."
        cp .env.docker.example .env.docker
        print_warning "Please update .env.docker with your configuration"
        echo "Required changes:"
        echo "  - VITE_APP_ID"
        echo "  - OAUTH_SERVER_URL"
        echo "  - VITE_OAUTH_PORTAL_URL"
        echo "  - JWT_SECRET (generate with: openssl rand -base64 32)"
        echo "  - OWNER_OPEN_ID"
        echo "  - OWNER_NAME"
        echo "  - BUILT_IN_FORGE_API_KEY"
        exit 1
    fi
    
    print_success ".env.docker found"
    
    # Build and start
    build_images "$1"
    start_services
    
    # Check health and test
    check_service_health
    show_status
    
    # Run migrations
    read -p "Run database migrations? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        run_migrations
    fi
    
    # Test application
    read -p "Test application access? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        test_application
    fi
    
    # Show final status
    print_header "Test Complete"
    print_success "Docker setup is ready!"
    print_info "Application URL: http://localhost:3000"
    print_info "MySQL: localhost:3306"
    print_info "Redis: localhost:6379"
    
    # Show logs
    read -p "Show service logs? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        show_logs
    fi
    
    # Cleanup option
    read -p "Keep Docker services running? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        cleanup
    fi
}

# Run main function
main "$@"
