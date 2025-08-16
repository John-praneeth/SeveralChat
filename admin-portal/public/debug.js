// Advanced admin portal testing and debugging
window.debugAPI = function() {
    const adminPortal = window.adminPortal;
    if (!adminPortal) {
        console.error('AdminPortal not found!');
        return;
    }

    console.log('🔍 Admin Portal Debug Tools');
    console.log('Token:', adminPortal.token ? 'Present' : 'Missing');
    
    // Test all API endpoints
    const testEndpoints = async () => {
        const endpoints = [
            { name: 'Stats', url: '/api/admin/stats' },
            { name: 'Users', url: '/api/admin/users' },
            { name: 'Security', url: '/api/admin/security/audit' },
            { name: 'Statistics', url: '/api/admin/statistics' },
            { name: 'Database', url: '/api/admin/database/info' }
        ];

        for (const endpoint of endpoints) {
            try {
                const response = await fetch(endpoint.url, {
                    headers: {
                        'Authorization': `Bearer ${adminPortal.token}`,
                    },
                });
                
                if (response.ok) {
                    const data = await response.json();
                    console.log(`✅ ${endpoint.name}:`, data);
                } else {
                    console.error(`❌ ${endpoint.name} failed:`, response.status);
                }
            } catch (error) {
                console.error(`💥 ${endpoint.name} error:`, error);
            }
        }
    };

    return {
        testEndpoints,
        loadUsers: () => adminPortal.loadUsers(),
        loadSecurity: () => adminPortal.loadSecurityDashboard(),
        loadStats: () => adminPortal.loadDetailedStatistics(),
        loadDatabase: () => adminPortal.loadDatabase(),
        showSection: (section) => adminPortal.showSection(section)
    };
};

// Enhanced error logging
const originalFetch = window.fetch;
window.fetch = function(...args) {
    console.log('🌐 API Call:', args[0]);
    return originalFetch.apply(this, args)
        .then(response => {
            if (!response.ok) {
                console.error('❌ API Error:', response.status, response.statusText);
            }
            return response;
        })
        .catch(error => {
            console.error('💥 Network Error:', error);
            throw error;
        });
};

console.log('🚀 Debug tools loaded! Use debugAPI() in console.');
