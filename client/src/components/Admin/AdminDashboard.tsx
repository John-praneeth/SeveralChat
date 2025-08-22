import { useState, useEffect } from 'react';
import { useAuthContext } from '~/hooks/AuthContext';

interface SystemStats {
  overview: {
    totalUsers: number;
    totalConversations: number;
    totalMessages: number;
    activeUsers: number;
  };
  userGrowth: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

export default function AdminDashboard() {
  const { user } = useAuthContext();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      return;
    }

    fetchSystemStats();
  }, [user]);

  const fetchSystemStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch system stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage users and monitor system performance</p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              👥
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.overview.totalUsers || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              📈
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.overview.activeUsers || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              💬
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Conversations</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.overview.totalConversations || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 text-orange-600">
              📊
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Messages</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.overview.totalMessages || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* User Growth Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">New users today:</span>
              <span className="font-semibold">{stats?.userGrowth.today || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">New users this week:</span>
              <span className="font-semibold">{stats?.userGrowth.thisWeek || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">New users this month:</span>
              <span className="font-semibold">{stats?.userGrowth.thisMonth || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <a
              href="/admin/users"
              className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-md border"
            >
              <div className="flex items-center">
                👥 <span className="ml-3">Manage Users</span>
              </div>
            </a>
            <a
              href="/admin/stats"
              className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-md border"
            >
              <div className="flex items-center">
                📊 <span className="ml-3">View Analytics</span>
              </div>
            </a>
            <a
              href="/admin/database"
              className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-md border"
            >
              <div className="flex items-center">
                🗃️ <span className="ml-3">Database Management</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
