# LibreChat + Admin Portal Docker Setup

This repository now includes a fully containerized admin portal that runs alongside LibreChat using Docker.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Git (to clone the repository)

### 1. Start Everything
```bash
./manage.sh start
```

### 2. Access Applications
- **LibreChat**: http://localhost:3080
- **Admin Portal**: http://localhost:4000
  - Login: `admin@test.com`
  - Password: `admin123`

## 📋 Management Commands

Use the `manage.sh` script to control both LibreChat and the Admin Portal:

```bash
# Start all services
./manage.sh start

# Check status
./manage.sh status

# View logs
./manage.sh logs
./manage.sh logs admin        # Admin portal only
./manage.sh logs librechat    # LibreChat only

# Restart everything
./manage.sh restart

# Stop all services
./manage.sh stop

# Rebuild admin portal
./manage.sh rebuild

# Run tests
./manage.sh test

# Create backup
./manage.sh backup
```

## 🐳 Docker Architecture

### Services Running:
1. **LibreChat** (`api`) - Main chat application on port 3080
2. **Admin Portal** (`admin-portal`) - Management interface on port 4000
3. **Meilisearch** (`meilisearch`) - Search engine
4. **VectorDB** (`vectordb`) - PostgreSQL with pgvector
5. **RAG API** (`rag_api`) - Retrieval Augmented Generation

### Docker Images:
- **LibreChat**: `ghcr.io/danny-avila/librechat-dev:latest`
- **Admin Portal**: `librechat-admin-portal:latest` (built locally)
- **Meilisearch**: `getmeili/meilisearch:v1.12.3`
- **PostgreSQL**: `ankane/pgvector:latest`
- **RAG API**: `ghcr.io/danny-avila/librechat-rag-api-dev-lite:latest`

## 🔧 Admin Portal Features

The containerized admin portal includes:

- ✅ **User Management**: View, edit, ban, delete users
- ✅ **Role Management**: Promote/demote admins
- ✅ **Security Dashboard**: Monitor banned users, 2FA status
- ✅ **System Statistics**: User growth, message activity
- ✅ **Database Management**: View database info and collections
- ✅ **Real-time Updates**: Live data from MongoDB Atlas
- ✅ **Export Capabilities**: Download user and statistics data
- ✅ **Health Monitoring**: Docker health checks

## 🛠️ Development

### Building the Admin Portal
```bash
# Build only the admin portal
docker-compose build admin-portal

# Build with no cache
docker-compose build admin-portal --no-cache
```

### Accessing Container Logs
```bash
# Real-time logs
docker-compose logs -f admin-portal

# Last 100 lines
docker-compose logs --tail=100 admin-portal
```

### Environment Variables
The admin portal uses these environment variables:
- `NODE_ENV=production`
- `ADMIN_PORT=4000`
- `MONGO_URI` (from .env file)
- `JWT_SECRET` (from .env file)

## 🔍 Debugging

### Check Container Health
```bash
docker ps
curl http://localhost:4000/api/health
```

### Access Container Shell
```bash
docker exec -it LibreChat-AdminPortal sh
```

### View Container Stats
```bash
docker stats LibreChat-AdminPortal
```

## 📁 File Structure

```
LibreChat/
├── admin-portal/
│   ├── Dockerfile              # Admin portal container definition
│   ├── .dockerignore          # Docker ignore rules
│   ├── server.js              # Express server
│   ├── routes/                # API routes
│   ├── models/                # Database models
│   ├── public/                # Frontend files
│   └── logs/                  # Container logs (mounted)
├── docker-compose.yml         # Main compose file (includes admin-portal)
├── docker-compose.admin.yml   # Separate admin portal compose file
├── manage.sh                  # Management script
└── README-Docker.md           # This file
```

## 🚨 Troubleshooting

### Admin Portal Won't Start
```bash
# Check logs
./manage.sh logs admin

# Rebuild container
./manage.sh rebuild
```

### Database Connection Issues
```bash
# Verify MongoDB connection
docker exec -it LibreChat-AdminPortal node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));
"
```

### Port Conflicts
If port 4000 is in use, modify `docker-compose.yml`:
```yaml
admin-portal:
  ports:
    - "4001:4000"  # Change external port
```

## 🔒 Security Notes

- Admin portal runs as non-root user (`adminportal:nodejs`)
- Health checks ensure container reliability
- Environment variables are properly isolated
- JWT tokens secure API access

## 📊 Monitoring

The admin portal includes built-in monitoring:
- Health check endpoint: `/api/health`
- Real-time user statistics
- Database connection monitoring
- API response time tracking

## 🎯 Next Steps

1. **Access the admin portal**: http://localhost:4000
2. **Login with**: `admin@test.com` / `admin123`
3. **Explore all sections**: Dashboard, Users, Security, Statistics, Database
4. **Test the debugging tools**: Open browser dev tools and run `debugAPI()`

Both LibreChat and the Admin Portal are now running in Docker containers with proper networking, health checks, and persistent data storage! 🎉
