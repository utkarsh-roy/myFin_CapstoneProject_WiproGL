import React, { useState, useEffect } from 'react';
import { loanApi } from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import { PageHeader, SectionCard, Badge, Button, EmptyState, statusVariant } from '../../components/ui';
import Loader from '../../components/Loader';

const ICON_MAP = {
  SYSTEM_ALERT: '🚨',
  NEW_USER:     '👤',
  LOAN_ACTION:  '📝',
  INFO:         'ℹ️',
};

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await loanApi.get('/api/notifications/admin/all');
      // Sort: Unread first, then by date descending
      const data = res.data || [];
      const sorted = data.sort((a, b) => {
        if (a.isRead === b.isRead) return new Date(b.createdAt) - new Date(a.createdAt);
        return a.isRead ? 1 : -1;
      });
      setNotifications(sorted);
    } catch {
      toast.error('Failed to load system alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await loanApi.put(`/api/notifications/read/${id}`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      window.dispatchEvent(new Event('notificationsUpdated'));
    } catch {
      toast.error('Could not update notification');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      // Backend should ideally have an admin read-all, but if not we can use user endpoint if userId=0 or similar
      // Logic for admin read-all might be different, let's check if we can simulate or if there is an endpoint
      // Based on Controller, there is only markAllRead(userId). 
      // Let's mark only currently loaded unread ones for now if no specific admin-read-all exists
      const unread = notifications.filter(n => !n.isRead);
      if (unread.length === 0) return;
      
      await Promise.all(unread.map(n => loanApi.put(`/api/notifications/read/${n.id}`)));
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All alerts marked as read');
      window.dispatchEvent(new Event('notificationsUpdated'));
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  if (loading) return <Loader message="Loading System Alerts..." />;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div style={{ pb: '40px' }}>
      <PageHeader
        title="System Notifications"
        icon="🔔"
        subtitle={`${notifications.length} total alerts · ${unreadCount} unread`}
        rightSlot={
          unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
              ✓ Mark All Read
            </Button>
          )
        }
      />

      <SectionCard padding="0">
        {notifications.length === 0 ? (
          <EmptyState icon="🎉" title="No system alerts" message="The system is running smoothly. No new notifications." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {notifications.map((notif, idx) => {
              const icon = ICON_MAP[notif.type] || 'ℹ️';
              const variant = notif.type === 'SYSTEM_ALERT' ? 'danger' : notif.type === 'NEW_USER' ? 'success' : 'info';
              
              return (
                <div 
                  key={notif.id}
                  style={{
                    display: 'flex', gap: '16px', padding: '20px 24px',
                    backgroundColor: notif.isRead ? 'transparent' : 'rgba(26,35,126,0.03)',
                    borderLeft: `4px solid ${notif.isRead ? 'transparent' : (notif.type === 'SYSTEM_ALERT' ? '#D32F2F' : '#1A237E')}`,
                    borderBottom: idx < notifications.length - 1 ? '1px solid #F3F4F6' : 'none',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                >
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: notif.isRead ? '#F5F7FA' : 'rgba(26,35,126,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '22px', flexShrink: 0
                  }}>
                    {icon}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: '4px' }}>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: notif.isRead ? 600 : 800, color: '#1A1A2E' }}>
                        {notif.type.replace('_', ' ')}
                      </h4>
                      <Badge label={notif.isRead ? 'READ' : 'NEW'} variant={notif.isRead ? 'neutral' : variant} />
                    </div>
                    
                    <p style={{ margin: '6px 0', fontSize: '14px', color: '#4B5563', lineHeight: 1.5 }}>
                      {notif.message}
                    </p>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
                        {new Date(notif.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {!notif.isRead && (
                        <Button variant="ghost" size="xs" onClick={() => handleMarkAsRead(notif.id)}>
                          Mark Read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
    </div>
  );
};

export default AdminNotifications;
