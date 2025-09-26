import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

export function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminUsers: 0,
    staffUsers: 0,
    totalVeterans: 0,
    totalTeams: 0,
    totalEvents: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // TEMPORARY: Use mock data instead of database calls
      console.log('Using mock admin data...');

      const mockUsers = [
        {
          id: '1',
          email: 'admin@operationmotorsport.org',
          role: 'admin' as const,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          email: 'staff1@operationmotorsport.org',
          role: 'staff' as const,
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z'
        },
        {
          id: '3',
          email: 'coordinator@operationmotorsport.org',
          role: 'staff' as const,
          created_at: '2024-01-03T00:00:00Z',
          updated_at: '2024-01-03T00:00:00Z'
        }
      ];

      setUsers(mockUsers);

      const totalUsers = mockUsers.length;
      const adminUsers = mockUsers.filter(u => u.role === 'admin').length;
      const staffUsers = totalUsers - adminUsers;

      setStats({
        totalUsers,
        adminUsers,
        staffUsers,
        totalVeterans: 2, // Mock count matching our veterans data
        totalTeams: 2,    // Mock count matching our teams data
        totalEvents: 3,   // Mock count matching our events data
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'staff' | 'admin') => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role');
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{stats.totalUsers}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.adminUsers}</div>
            <div className="text-sm text-gray-600">Admins</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalVeterans}</div>
            <div className="text-sm text-gray-600">Veterans</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.totalTeams}</div>
            <div className="text-sm text-gray-600">Race Teams</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.totalEvents}</div>
            <div className="text-sm text-gray-600">Events</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">{stats.staffUsers}</div>
            <div className="text-sm text-gray-600">Staff</div>
          </div>
        </div>
      </div>

      {/* User Management */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">User Management</h2>

        <div className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{user.email}</h3>
                  <p className="text-sm text-gray-500">
                    Joined: {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user.role === 'admin'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role}
                  </span>

                  <select
                    value={user.role}
                    onChange={(e) => updateUserRole(user.id, e.target.value as 'staff' | 'admin')}
                    className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>

        <div className="grid grid-cols-1 gap-3">
          <button className="btn-primary justify-start">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Veteran
          </button>

          <button className="btn-primary justify-start">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Add New Race Team
          </button>

          <button className="btn-primary justify-start">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Add New Event
          </button>

          <button className="btn-secondary justify-start">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            Manage File Uploads
          </button>
        </div>
      </div>
    </div>
  );
}