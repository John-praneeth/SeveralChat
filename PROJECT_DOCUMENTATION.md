# SeveralChat - Complete Project Documentation

<p align="center">
  <a href="https://librechat.ai">
    <img src="client/public/assets/logo.svg" height="256">
  </a>
  <h1 align="center">
    <a href="https://librechat.ai">SeveralChat</a>
  </h1>
</p>

<p align="center">
  Enhanced LibreChat with Custom Admin Portal
</p>

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [System Architecture](#-system-architecture)  
- [Quick Start Guide](#-quick-start-guide)
- [Features](#-features)
- [Technical Stack](#-technical-stack)
- [Configuration](#-configuration)
- [Development Setup](#-development-setup)
- [Admin Portal](#-admin-portal)
- [Security & Authentication](#-security--authentication)
- [Database Management](#-database-management)
- [Troubleshooting](#-troubleshooting)
- [Contributing Guidelines](#-contributing-guidelines)
- [Changelog](#-changelog)
- [License & Legal](#-license--legal)

---

## 📋 Project Overview

SeveralChat is a production-ready AI chat platform that extends the popular LibreChat with a powerful real-time admin portal. This comprehensive system combines:

- **LibreChat**: Enterprise-grade AI chat interface with multi-provider support
- **Custom Admin Portal**: Real-time user management system with blue UI theme
- **Bidirectional Sync**: Instant synchronization between components
- **Cloud Database**: MongoDB Atlas with real-time change streams
- **Docker Integration**: Containerized deployment for easy setup

### Current Running Services:
- ✅ **LibreChat** → http://localhost:3080 (Docker)
- ✅ **Admin Portal** → http://localhost:4000 (Node.js)
- ✅ **MongoDB Atlas** → Cloud Database
- ✅ **MeiliSearch** → Search Engine (Docker)
- ✅ **Vector Database** → AI Embeddings (Docker)  
- ✅ **RAG API** → AI Document Processing (Docker)

---

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   LibreChat     │    │  Admin Portal   │
│   Port 3080     │    │   Port 4000     │
│   (React UI)    │    │ (Express + UI)  │
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          ▼                      ▼
┌─────────────────────────────────────────┐
│          MongoDB Atlas                  │
│     Real-time Change Streams           │
│ mongodb+srv://...librechat.v7jxcfg.net  │
└─────────────────────────────────────────┘
          ▲
          │
┌─────────┴───────┐
│  Additional     │
│  Services:      │
│  - MeiliSearch  │
│  - Vector DB    │
│  - RAG API      │
└─────────────────┘
```

### Container Architecture:
- **LibreChat Container**: Main chat application
- **Admin Portal Container**: User management interface
- **MeiliSearch Container**: Full-text search capabilities
- **Vector DB Container**: AI embeddings and similarity search
- **RAG API Container**: Document processing and retrieval

---

## 🚀 Quick Start Guide

### Prerequisites
- Docker & Docker Compose
- Node.js 20.x (for development)
- Git

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd SeveralChat-dev-pa-2
   ```

2. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Update MongoDB URI and API keys
   - Configure authentication secrets

3. **Start All Services**
   ```bash
   docker-compose up -d
   ```

4. **Access Applications**
   - LibreChat: http://localhost:3080
   - Admin Portal: http://localhost:4000

5. **Create Admin User** (Optional)
   ```bash
   cd admin-portal
   npm run create-admin
   ```

---

## ✨ Features

### LibreChat Features
- **Multi-Provider AI Support**: OpenAI, Anthropic, Google, and more
- **User Registration**: Full signup/login system
- **Conversation Management**: Save, edit, and organize chats
- **File Attachments**: Upload and process documents
- **Multi-language Support**: 20+ languages
- **Responsive Design**: Works on desktop and mobile
- **Plugin System**: Extensible with custom plugins

### Admin Portal Features
- **User Management**: View, edit, ban/unban, and delete users
- **Role Management**: Promote users to admin or demote to regular users
- **Bulk Operations**: Perform actions on multiple users simultaneously
- **System Statistics**: Monitor user growth, conversations, and messages
- **Security Dashboard**: Track banned users, unverified accounts, 2FA usage
- **Real-time Updates**: Live data synchronization
- **Export Capabilities**: Download user data and reports
- **Blue UI Theme**: Modern, professional interface design

---

## 🔧 Technical Stack

### Frontend Technologies
- **LibreChat UI**: React.js with TypeScript
- **Admin Portal UI**: HTML5, CSS3, JavaScript ES6+
- **Styling**: Tailwind CSS with custom blue theme
- **Icons**: Font Awesome
- **Charts**: Chart.js for analytics

### Backend Technologies
- **LibreChat API**: Node.js with Express.js (Dockerized)
- **Admin Portal API**: Express.js with middleware stack
- **Database**: MongoDB Atlas (Cloud)
- **Search**: MeiliSearch
- **Vector Storage**: PostgreSQL with pgvector
- **Authentication**: JWT tokens with bcrypt

### DevOps & Infrastructure
- **Containerization**: Docker & Docker Compose
- **Orchestration**: Docker Compose with multi-service setup
- **Networking**: Internal Docker networks
- **Volumes**: Persistent data storage
- **Environment Management**: `.env` configuration

---

## ⚙️ Configuration

### Environment Variables

The `.env` file contains all configuration settings:

```bash
#=====================================================================#
#                       SeveralChat Configuration                     #
#=====================================================================#

# Server Configuration
HOST=localhost
PORT=3080
ADMIN_PORT=4000

# Database Configuration - MongoDB Atlas Cloud
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/LibreChat

# Authentication
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_EXPIRE=3600

# Registration and Login
ALLOW_EMAIL_LOGIN=true
ALLOW_REGISTRATION=true
ALLOW_SOCIAL_LOGIN=false
ALLOW_PASSWORD_RESET=true
ALLOW_UNVERIFIED_EMAIL_LOGIN=true

# AI Services
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GOOGLE_KEY=your_google_api_key_here

# Search Configuration
MEILI_HOST=http://meilisearch:7700
MEILI_MASTER_KEY=your_meili_key_here

# RAG API Configuration
RAG_PORT=8000
RAG_API_URL=http://rag_api:8000

# Debug and Logging
DEBUG_LOGGING=true
DEBUG_CONSOLE=false
CONSOLE_JSON=false
```

### Docker Compose Configuration

Key services in `docker-compose.yml`:

```yaml
services:
  api:
    image: ghcr.io/danny-avila/librechat-dev:latest
    ports:
      - "3080:3080"
    
  admin-portal:
    build: ./admin-portal
    ports:
      - "4000:4000"
    
  meilisearch:
    image: getmeili/meilisearch:v1.12.3
    
  vectordb:
    image: ankane/pgvector:latest
    
  rag_api:
    image: ghcr.io/danny-avila/librechat-rag-api-dev-lite:latest
```

---

## 🛠️ Development Setup

### Local Development Environment

1. **Install Dependencies**
   ```bash
   # Main project
   npm install
   
   # Admin portal
   cd admin-portal
   npm install
   ```

2. **Development Tools**
   - Node.js 20.x
   - TypeScript (global installation recommended)
   - ESLint & Prettier for code formatting
   - Jest for testing

3. **IDE Setup**
   - VS Code with recommended extensions
   - TypeScript support
   - Docker extension for container management

### Running in Development Mode

```bash
# Start all services
docker-compose up -d

# Watch for changes (if applicable)
npm run dev

# View logs
docker-compose logs -f api
docker-compose logs -f admin-portal
```

---

## 👨‍💼 Admin Portal

### Features Overview

The admin portal provides comprehensive user and system management:

#### User Management
- **User List**: Paginated view of all users with search and filtering
- **User Details**: View detailed information about each user
- **Bulk Actions**: Ban, unban, verify, or change roles for multiple users
- **Export Data**: Download user data in various formats

#### Security Dashboard
- **Banned Users**: Monitor and manage banned accounts
- **Unverified Users**: Track users who haven't verified their email
- **2FA Statistics**: Monitor two-factor authentication adoption
- **Security Events**: Real-time security event logging

#### System Statistics
- **User Growth**: Track registration and activity trends
- **Message Analytics**: Monitor conversation and message volumes
- **Performance Metrics**: System health and performance indicators
- **Custom Reports**: Generate detailed analytics reports

### Access & Authentication

1. **Access URL**: http://localhost:4000
2. **Default Credentials**: Created via `npm run create-admin`
3. **JWT Authentication**: Secure token-based authentication
4. **Session Management**: Configurable session expiration

### API Endpoints

The admin portal exposes several API endpoints:

```
GET /api/admin/users - Get all users
GET /api/admin/stats - Get system statistics
POST /api/admin/users/:id/ban - Ban a user
POST /api/admin/users/:id/unban - Unban a user
PUT /api/admin/users/:id/role - Change user role
DELETE /api/admin/users/:id - Delete a user
```

---

## 🔐 Security & Authentication

### Authentication Methods

1. **JWT Tokens**: Primary authentication method
2. **Session Management**: Configurable expiration times
3. **Password Hashing**: bcrypt with salt rounds
4. **Rate Limiting**: Protection against brute force attacks

### Security Features

- **CORS Protection**: Cross-origin request security
- **Helmet Middleware**: Security headers
- **Input Validation**: Sanitization of user inputs
- **SQL Injection Protection**: Parameterized queries
- **XSS Prevention**: Content Security Policy

### User Permissions

- **Regular Users**: Can create and manage their own conversations
- **Admin Users**: Full access to admin portal and user management
- **System Administrators**: Database and system-level access

---

## 💾 Database Management

### MongoDB Atlas Configuration

The project uses MongoDB Atlas for cloud database hosting:

- **Connection**: Secure SSL/TLS connection
- **Collections**: Users, Conversations, Messages, Sessions
- **Indexing**: Optimized queries for performance
- **Backup**: Automated cloud backups

### Database Schema

Key collections and their structure:

```javascript
// Users Collection
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  role: String (USER/ADMIN),
  emailVerified: Boolean,
  createdAt: Date,
  lastLogin: Date
}

// Conversations Collection
{
  _id: ObjectId,
  user: ObjectId (ref),
  title: String,
  messages: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}

// Messages Collection
{
  _id: ObjectId,
  conversation: ObjectId (ref),
  content: String,
  role: String (user/assistant),
  timestamp: Date
}
```

---

## 🔍 Troubleshooting

### Common Issues

#### Docker Container Issues
```bash
# Check container status
docker-compose ps

# View container logs
docker-compose logs api
docker-compose logs admin-portal

# Restart services
docker-compose restart
```

#### Database Connection Issues
- Verify MongoDB URI in `.env`
- Check network connectivity
- Ensure IP whitelist in MongoDB Atlas

#### Port Conflicts
- LibreChat: Port 3080
- Admin Portal: Port 4000
- Check for conflicting services: `lsof -i :3080`

#### Authentication Problems
- Verify JWT secrets in `.env`
- Check token expiration settings
- Clear browser cache and cookies

### Performance Optimization

1. **Database Indexing**: Ensure proper indexes on frequently queried fields
2. **Caching**: Implement Redis caching for frequently accessed data
3. **Connection Pooling**: Configure appropriate MongoDB connection pools
4. **Resource Limits**: Set appropriate Docker resource limits

---

## 🤝 Contributing Guidelines

### Development Standards

- **Node.js 20.x**: Use the latest LTS version
- **TypeScript**: Install globally for development
- **Code Style**: Follow ESLint and Prettier configurations
- **Testing**: Write tests for new features and bug fixes

### Contribution Process

1. **Feature Requests**: Submit proposals in GitHub Discussions
2. **Bug Reports**: Use GitHub Issues with detailed reproduction steps
3. **Pull Requests**: Follow the pull request template
4. **Code Review**: All changes require review before merging

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write or update tests
5. Submit a pull request
6. Participate in code review

---

## 📈 Changelog

### Latest Updates

#### ✨ New Features
- **User Registration**: Added signup functionality to LibreChat
- **Admin Portal**: Complete user management system
- **Blue UI Theme**: Professional interface design
- **Real-time Updates**: Live data synchronization
- **Bulk Operations**: Multi-user management capabilities
- **Security Dashboard**: Comprehensive security monitoring

#### 🔧 Recent Fixes
- Fixed Docker container networking issues
- Resolved authentication token expiration problems
- Improved error handling and logging
- Enhanced security with CSP headers
- Optimized database queries for better performance

#### 🌍 Internationalization
- Added support for 20+ languages
- Improved translation management
- Enhanced localization capabilities

### Version History

- **v0.7.8**: Latest stable release with enhanced features
- **v0.7.7**: Security improvements and bug fixes
- **v0.7.6**: Performance optimizations and UI updates

---

## 📄 License & Legal

### License Information

This project is based on LibreChat, which is licensed under the MIT License. The custom admin portal and modifications are also released under the MIT License.

### Third-Party Dependencies

The project uses various open-source libraries and services:

- **React**: Frontend framework (MIT License)
- **Express.js**: Backend framework (MIT License)
- **MongoDB**: Database service (Server Side Public License)
- **Docker**: Containerization platform (Apache License 2.0)
- **Tailwind CSS**: Styling framework (MIT License)

### Privacy & Data Protection

- **Data Collection**: Only necessary user data is collected
- **Data Storage**: Secure cloud storage with MongoDB Atlas
- **Data Retention**: Configurable retention policies
- **GDPR Compliance**: Features for data export and deletion

### Support & Community

- **Documentation**: https://docs.librechat.ai
- **Discord Community**: https://discord.librechat.ai
- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For community discussion and support

---

## 🔗 Quick Links

- **LibreChat**: http://localhost:3080
- **Admin Portal**: http://localhost:4000
- **GitHub Repository**: [Link to repository]
- **Documentation**: https://docs.librechat.ai
- **Community**: https://discord.librechat.ai

---

*Last Updated: August 22, 2025*
*Project Status: ✅ Fully Operational*
