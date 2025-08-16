#!/bin/bash

# LibreChat + Admin Portal Docker Management Script
# This script manages both LibreChat and Admin Portal containers together

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}
╔══════════════════════════════════════════════════════════╗
║            LibreChat + Admin Portal Manager             ║
║                   Docker Edition                        ║
╚══════════════════════════════════════════════════════════╝${NC}"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to show status
show_status() {
    print_status "Checking container status..."
    echo
    echo "📊 LibreChat Services:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(LibreChat|chat-|rag_api|vectordb)"
    
    echo
    echo "🔧 Admin Portal:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -i admin || echo "Admin Portal not running"
    
    echo
    echo "🌐 Access URLs:"
    echo "  LibreChat:    http://localhost:3080"
    echo "  Admin Portal: http://localhost:4000"
    echo "  Credentials:  admin@test.com / admin123"
}

# Function to start all services
start_all() {
    print_status "Starting LibreChat + Admin Portal..."
    
    # Start LibreChat services first
    print_status "Starting LibreChat services..."
    docker-compose up api meilisearch vectordb rag_api -d
    
    # Wait a moment for services to initialize
    sleep 3
    
    # Start Admin Portal
    print_status "Starting Admin Portal..."
    docker-compose up admin-portal -d
    
    # Wait for health checks
    print_status "Waiting for services to be healthy..."
    sleep 10
    
    show_status
    
    echo
    print_status "🎉 All services started successfully!"
    echo
    echo "Access your applications:"
    echo "  📱 LibreChat:    http://localhost:3080"
    echo "  🔧 Admin Portal: http://localhost:4000 (admin@test.com / admin123)"
}

# Function to stop all services
stop_all() {
    print_status "Stopping all services..."
    docker-compose down
    print_status "All services stopped."
}

# Function to restart all services
restart_all() {
    print_status "Restarting all services..."
    stop_all
    sleep 2
    start_all
}

# Function to show logs
show_logs() {
    local service=${1:-"all"}
    
    if [ "$service" = "all" ]; then
        print_status "Showing logs for all services..."
        docker-compose logs -f --tail=50
    elif [ "$service" = "admin" ]; then
        print_status "Showing Admin Portal logs..."
        docker-compose logs -f --tail=50 admin-portal
    elif [ "$service" = "librechat" ]; then
        print_status "Showing LibreChat logs..."
        docker-compose logs -f --tail=50 api
    else
        print_status "Showing logs for $service..."
        docker-compose logs -f --tail=50 "$service"
    fi
}

# Function to rebuild admin portal
rebuild_admin() {
    print_status "Rebuilding Admin Portal..."
    docker-compose down admin-portal
    docker-compose build admin-portal --no-cache
    docker-compose up admin-portal -d
    print_status "Admin Portal rebuilt and restarted."
}

# Function to run tests
run_tests() {
    print_status "Running Admin Portal tests..."
    
    # Wait for services to be ready
    sleep 5
    
    # Run the test script
    if [ -f "admin-portal/test-all-features.js" ]; then
        cd admin-portal
        node test-all-features.js
        cd ..
    else
        print_warning "Test script not found. Please check admin-portal/test-all-features.js"
    fi
}

# Function to backup data
backup_data() {
    local backup_dir="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    print_status "Creating backup in $backup_dir..."
    
    # Backup Docker volumes
    docker run --rm -v librechat_pgdata2:/data -v "$(pwd)/$backup_dir":/backup alpine tar czf /backup/pgdata2.tar.gz /data
    
    # Backup environment files
    cp .env "$backup_dir/" 2>/dev/null || print_warning ".env file not found"
    cp admin-portal/.env "$backup_dir/admin-portal.env" 2>/dev/null || print_warning "admin-portal/.env file not found"
    
    print_status "Backup completed in $backup_dir"
}

# Function to show help
show_help() {
    echo "Usage: $0 [COMMAND]"
    echo
    echo "Commands:"
    echo "  start     Start all services (LibreChat + Admin Portal)"
    echo "  stop      Stop all services"
    echo "  restart   Restart all services"
    echo "  status    Show status of all containers"
    echo "  logs      Show logs for all services"
    echo "  logs <service>  Show logs for specific service (admin, librechat, etc.)"
    echo "  rebuild   Rebuild and restart Admin Portal"
    echo "  test      Run Admin Portal feature tests"
    echo "  backup    Backup data and configuration"
    echo "  help      Show this help message"
    echo
    echo "Examples:"
    echo "  $0 start                # Start everything"
    echo "  $0 logs admin          # Show admin portal logs"
    echo "  $0 rebuild             # Rebuild admin portal"
}

# Main script logic
main() {
    print_header
    check_docker
    
    case "${1:-help}" in
        "start")
            start_all
            ;;
        "stop")
            stop_all
            ;;
        "restart")
            restart_all
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs "$2"
            ;;
        "rebuild")
            rebuild_admin
            ;;
        "test")
            run_tests
            ;;
        "backup")
            backup_data
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Run main function with all arguments
main "$@"
