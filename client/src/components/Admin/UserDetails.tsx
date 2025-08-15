import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthContext } from '~/hooks/AuthContext';

interface UserDetails {
  user: {
    _id: string;
    email: string;
    username?: string;
    name?: string;
    role: string;
    avatar?: string;
    createdAt: string;
    banned?: boolean;
    banReason?: string;
    bannedAt?: string;
  };
  stats: {
    conversationCount: number;
    messageCount: number;
    balance: number;
    totalTransactions: number;
  };
  recentActivity: {
    conversations: Array<{
      _id: string;
      title: string;
      createdAt: string;
      updatedAt: string;
    }>;
    messages: Array<{
      _id: string;
      text: string;
      createdAt: string;
      conversationId: string;
    }>;
    transactions: Array<{
      _id: string;
      amount: number;
      type: string;
      createdAt: string;
    }>;
  };
}

export default function UserDetails() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuthContext();
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'ADMIN' || !userId) {
      return;
    }
    fetchUserDetails();
  }, [user, userId]);

  const fetchUserDetails = async () => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserDetails(data);
      }
    } catch (error) {
      console.error('Failed to fetch user details:', error);
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

  if (!userDetails) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">User Not Found</h2>
          <p className="text-gray-500">The requested user could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">User Details</h1>
            <p className="text-gray-600">Detailed information for {userDetails.user.email}</p>
          </div>
          <a
            href="/admin/users"
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
          >
            ← Back to Users
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Information */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-4 mb-6">
              {userDetails.user.avatar ? (
                <img
                  className="h-16 w-16 rounded-full"
                  src={userDetails.user.avatar}
                  alt=""
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-xl font-medium text-gray-700">
                    {userDetails.user.name?.[0] || userDetails.user.email[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {userDetails.user.name || 'No name'}
                </h3>
                <p className="text-gray-600">{userDetails.user.email}</p>
                {userDetails.user.username && (
                  <p className="text-gray-500">@{userDetails.user.username}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Role</label>
                <p className="text-lg font-semibold text-gray-900">{userDetails.user.role}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <p className={`text-lg font-semibold ${
                  userDetails.user.banned ? 'text-red-600' : 'text-green-600'
                }`}>
                  {userDetails.user.banned ? 'Banned' : 'Active'}
                </p>
                {userDetails.user.banned && userDetails.user.banReason && (
                  <p className="text-sm text-gray-600 mt-1">
                    Reason: {userDetails.user.banReason}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Member Since</label>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(userDetails.user.createdAt).toLocaleDateString()}
                </p>
              </div>

              {userDetails.user.bannedAt && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Banned On</label>
                  <p className="text-lg font-semibold text-red-600">
                    {new Date(userDetails.user.bannedAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics and Activity */}
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {/* Statistics */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {userDetails.stats.conversationCount}
                  </div>
                  <div className="text-sm text-gray-600">Conversations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {userDetails.stats.messageCount}
                  </div>
                  <div className="text-sm text-gray-600">Messages</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {userDetails.stats.balance}
                  </div>
                  <div className="text-sm text-gray-600">Token Balance</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {userDetails.stats.totalTransactions}
                  </div>
                  <div className="text-sm text-gray-600">Transactions</div>
                </div>
              </div>
            </div>

            {/* Recent Conversations */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Conversations</h3>
              {userDetails.recentActivity.conversations.length === 0 ? (
                <p className="text-gray-500">No conversations found</p>
              ) : (
                <div className="space-y-3">
                  {userDetails.recentActivity.conversations.map((conversation) => (
                    <div
                      key={conversation._id}
                      className="flex justify-between items-center p-3 border border-gray-200 rounded"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {conversation.title || 'Untitled Conversation'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Created: {new Date(conversation.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">
                        Updated: {new Date(conversation.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Messages */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Messages</h3>
              {userDetails.recentActivity.messages.length === 0 ? (
                <p className="text-gray-500">No messages found</p>
              ) : (
                <div className="space-y-3">
                  {userDetails.recentActivity.messages.map((message) => (
                    <div
                      key={message._id}
                      className="p-3 border border-gray-200 rounded"
                    >
                      <p className="text-gray-900 mb-2">
                        {message.text.length > 100
                          ? `${message.text.substring(0, 100)}...`
                          : message.text}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(message.createdAt).toLocaleDateString()} • 
                        Conversation: {message.conversationId}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
              {userDetails.recentActivity.transactions.length === 0 ? (
                <p className="text-gray-500">No transactions found</p>
              ) : (
                <div className="space-y-3">
                  {userDetails.recentActivity.transactions.map((transaction) => (
                    <div
                      key={transaction._id}
                      className="flex justify-between items-center p-3 border border-gray-200 rounded"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{transaction.type}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={`font-semibold ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
