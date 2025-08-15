# LibreChat Admin Portal

A standalone web-based admin portal for managing LibreChat users and database operations.

## 🚀 Features

- **User Management**: View, edit, ban/unban, and delete users
- **Role Management**: Promote users to admin or demote to regular users
- **System Statistics**: Monitor user growth, conversations, and messages
- **Database Operations**: View database information and statistics
- **Secure Authentication**: JWT-based admin authentication

## 📋 Installation & Setup

1. **Navigate to the admin portal directory:**
   ```bash
   cd /Users/johnpraneeth/LibreChat/admin-portal
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Copy `.env` and update the following:
   ```env
   MONGO_URI=mongodb://localhost:27017/LibreChat
   JWT_SECRET=your_jwt_secret_here
   ADMIN_PORT=4000
   ```

4. **Create an admin user:**
   ```bash
   npm run create-admin
   ```

5. **Start the admin portal:**
   ```bash
   npm start
   ```

## 🌐 Access URLs

- **Admin Portal**: `http://localhost:4000`
- **Main LibreChat**: `http://localhost:3080`

## 🔐 Default Admin Credentials

After running `npm run create-admin`:
- **Email**: `admin@test.com`
- **Password**: `admin123`

## 📊 Admin Portal Sections

### Dashboard
- System overview with user counts
- Active user statistics
- Growth metrics (daily/weekly/monthly)

### User Management
- Search and filter users
- View user details
- Update user roles (USER ↔ ADMIN)
- Ban/unban users
- Delete users
- Pagination support

### Statistics
- Detailed system analytics
- User growth charts
- Activity metrics

### Database
- Database size and statistics
- Collection information
- Maintenance tools

## 🛠 Scripts

- `npm start` - Start the admin portal server
- `npm run dev` - Start with nodemon for development
- `npm run create-admin` - Create an admin user

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/verify` - Verify admin token

### Admin Operations
- `GET /api/admin/users` - List users with pagination
- `PUT /api/admin/users/:id/role` - Update user role
- `POST /api/admin/users/:id/ban` - Ban/unban user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/stats` - System statistics
- `GET /api/admin/database/info` - Database information

## 🔒 Security

- JWT token-based authentication
- Admin role verification for all operations
- Secure password hashing with bcrypt
- CORS protection
- Input validation and sanitization

## 📝 Notes

- The admin portal connects to the same MongoDB database as LibreChat
- All user operations are performed on the shared database
- Admin users can be created in either LibreChat or the admin portal
- The portal runs independently on port 4000 by default

## 🚨 Important

- Always backup your database before performing bulk operations
- Be careful when deleting users as this action cannot be undone
- Only trusted users should have admin access
- Change default passwords after initial setup
