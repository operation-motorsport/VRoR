import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { UserNotification, Notification } from '../types';
import { useAuth } from '../hooks/useAuth';

interface NotificationWithDetails extends UserNotification {
  notification: Notification;
}

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      console.log('Fetching notifications for user:', user.id);

      // Get user notifications with notification details
      const { data: userNotifs, error } = await supabase
        .from('user_notifications')
        .select(`
          *,
          notification:notifications(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      }

      console.log('Notifications loaded:', userNotifs?.length || 0);
      setNotifications(userNotifs as NotificationWithDetails[] || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (userNotificationId: string) => {
    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', userNotificationId);

      if (error) throw error;

      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === userNotificationId
            ? { ...notif, is_read: true, read_at: new Date().toISOString() }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      // Refresh notifications
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-24">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Mark all as read
          </button>
        )}
      </div>

      {unreadCount > 0 && (
        <div className="bg-primary-50 border border-primary-200 text-primary-700 px-4 py-2 rounded-md text-sm">
          You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-2">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-gray-500">No notifications yet</p>
          </div>
        ) : (
          notifications.map((userNotif) => (
            <div
              key={userNotif.id}
              className={`card cursor-pointer transition-colors ${
                !userNotif.is_read ? 'bg-primary-50 border-primary-200' : ''
              }`}
              onClick={() => !userNotif.is_read && markAsRead(userNotif.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    {!userNotif.is_read && (
                      <span className="inline-block w-2 h-2 bg-primary-600 rounded-full mr-2"></span>
                    )}
                    <h3 className="font-semibold text-gray-900">
                      {userNotif.notification?.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {userNotif.notification?.message}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(userNotif.created_at)}
                  </p>
                </div>

                {!userNotif.is_read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(userNotif.id);
                    }}
                    className="ml-4 p-1 text-gray-400 hover:text-primary-600 rounded transition-colors"
                    title="Mark as read"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
