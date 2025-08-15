class AdminPortal {
    constructor() {
        this.token = localStorage.getItem('adminToken');
        this.currentPage = 1;
        this.init();
    }

    init() {
        if (this.token) {
            this.verifyToken();
        } else {
            this.showLogin();
        }

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // Sidebar navigation
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.currentTarget.dataset.section;
                this.showSection(section);
            });
        });

        // User search and filter
        document.getElementById('userSearch').addEventListener('input', () => {
            this.loadUsers();
        });

        document.getElementById('roleFilter').addEventListener('change', () => {
            this.loadUsers();
        });

        // Pagination
        document.getElementById('prevPage').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.loadUsers();
            }
        });

        document.getElementById('nextPage').addEventListener('click', () => {
            this.currentPage++;
            this.loadUsers();
        });
    }

    async login() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const errorDiv = document.getElementById('loginError');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.token;
                localStorage.setItem('adminToken', this.token);
                this.showMainApp(data.user);
            } else {
                errorDiv.textContent = data.error;
                errorDiv.classList.remove('hidden');
            }
        } catch (error) {
            errorDiv.textContent = 'Login failed. Please try again.';
            errorDiv.classList.remove('hidden');
        }
    }

    async verifyToken() {
        try {
            const response = await fetch('/api/auth/verify', {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                this.showMainApp(data.user);
            } else {
                this.logout();
            }
        } catch (error) {
            this.logout();
        }
    }

    logout() {
        localStorage.removeItem('adminToken');
        this.token = null;
        this.showLogin();
    }

    showLogin() {
        document.getElementById('loginModal').classList.remove('hidden');
        document.getElementById('mainApp').classList.add('hidden');
    }

    showMainApp(user) {
        document.getElementById('loginModal').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        document.getElementById('userInfo').textContent = `Welcome, ${user.name}`;
        
        this.loadDashboard();
    }

    showSection(section) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
        
        // Remove active class from all sidebar items
        document.querySelectorAll('.sidebar-item').forEach(item => 
            item.classList.remove('active'));
        
        // Show selected section
        document.getElementById(`${section}-section`).classList.remove('hidden');
        
        // Add active class to clicked sidebar item
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Load section content
        switch (section) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'users':
                this.loadUsers();
                break;
            case 'statistics':
                this.loadStatistics();
                break;
            case 'database':
                this.loadDatabase();
                break;
        }
    }

    async loadDashboard() {
        try {
            const response = await fetch('/api/admin/stats', {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                },
            });

            if (response.ok) {
                const stats = await response.json();
                
                // Update overview stats
                document.getElementById('totalUsers').textContent = stats.overview.totalUsers || 0;
                document.getElementById('activeUsers').textContent = stats.overview.activeUsers || 0;
                document.getElementById('totalConversations').textContent = stats.overview.totalConversations || 0;
                document.getElementById('totalMessages').textContent = stats.overview.totalMessages || 0;
                
                // Update growth stats
                document.getElementById('newUsersToday').textContent = stats.userGrowth.today || 0;
                document.getElementById('newUsersWeek').textContent = stats.userGrowth.thisWeek || 0;
                document.getElementById('newUsersMonth').textContent = stats.userGrowth.thisMonth || 0;
            }
        } catch (error) {
            console.error('Failed to load dashboard stats:', error);
        }
    }

    async loadUsers() {
        const search = document.getElementById('userSearch').value;
        const role = document.getElementById('roleFilter').value;
        
        try {
            const params = new URLSearchParams({
                page: this.currentPage,
                search,
                role,
            });

            const response = await fetch(`/api/admin/users?${params}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                this.renderUsers(data.users);
                this.renderPagination(data.pagination);
            }
        } catch (error) {
            console.error('Failed to load users:', error);
        }
    }

    renderUsers(users) {
        const tbody = document.getElementById('usersTable');
        tbody.innerHTML = '';

        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${user.name || 'N/A'}</div>
                            <div class="text-sm text-gray-500">${user.email}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                    }">
                        ${user.role}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.banned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }">
                        ${user.banned ? 'Banned' : 'Active'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="adminPortal.toggleUserRole('${user._id}', '${user.role}')" 
                            class="text-blue-600 hover:text-blue-900 mr-3">
                        ${user.role === 'ADMIN' ? 'Remove Admin' : 'Make Admin'}
                    </button>
                    <button onclick="adminPortal.toggleUserBan('${user._id}', ${user.banned})" 
                            class="text-yellow-600 hover:text-yellow-900 mr-3">
                        ${user.banned ? 'Unban' : 'Ban'}
                    </button>
                    <button onclick="adminPortal.deleteUser('${user._id}')" 
                            class="text-red-600 hover:text-red-900">
                        Delete
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    renderPagination(pagination) {
        document.getElementById('usersInfo').textContent = 
            `Showing ${pagination.totalUsers > 0 ? ((pagination.currentPage - 1) * 10) + 1 : 0} to ${Math.min(pagination.currentPage * 10, pagination.totalUsers)} of ${pagination.totalUsers} users`;
        
        document.getElementById('pageInfo').textContent = 
            `Page ${pagination.currentPage} of ${pagination.totalPages}`;
        
        document.getElementById('prevPage').disabled = !pagination.hasPrev;
        document.getElementById('nextPage').disabled = !pagination.hasNext;
    }

    async toggleUserRole(userId, currentRole) {
        const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
        
        try {
            const response = await fetch(`/api/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ role: newRole }),
            });

            if (response.ok) {
                this.loadUsers();
            } else {
                alert('Failed to update user role');
            }
        } catch (error) {
            alert('Failed to update user role');
        }
    }

    async toggleUserBan(userId, currentlyBanned) {
        try {
            const response = await fetch(`/api/admin/users/${userId}/ban`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                },
            });

            if (response.ok) {
                this.loadUsers();
            } else {
                alert('Failed to update user status');
            }
        } catch (error) {
            alert('Failed to update user status');
        }
    }

    async deleteUser(userId) {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                },
            });

            if (response.ok) {
                this.loadUsers();
            } else {
                alert('Failed to delete user');
            }
        } catch (error) {
            alert('Failed to delete user');
        }
    }

    loadStatistics() {
        // Implementation for statistics page
        console.log('Loading statistics...');
    }

    async loadDatabase() {
        try {
            const response = await fetch('/api/admin/database/info', {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                document.getElementById('databaseInfo').innerHTML = `
                    <h3 class="text-lg font-semibold mb-4">Database Information</h3>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <h4 class="font-medium">Database Stats</h4>
                            <p>Data Size: ${(data.database.dataSize / 1024 / 1024).toFixed(2)} MB</p>
                            <p>Index Size: ${(data.database.indexSize / 1024 / 1024).toFixed(2)} MB</p>
                            <p>Objects: ${data.database.objects}</p>
                        </div>
                        <div>
                            <h4 class="font-medium">Collections</h4>
                            <ul class="list-disc list-inside">
                                ${data.collections.map(col => `<li>${col}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Failed to load database info:', error);
        }
    }
}

// Initialize the admin portal
const adminPortal = new AdminPortal();
