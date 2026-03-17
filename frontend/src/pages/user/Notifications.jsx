import React, { useState, useEffect } from 'react';
import { loanApi } from '../../api/axiosConfig';
import useAuth from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import { PageHeader, SectionCard, Badge, Button, EmptyState } from '../../components/ui';
import Loader from '../../components/Loader';

const ICON_MAP = {
  LOAN_APPLIED:  '📝',
  LOAN_APPROVED: '✅',
  LOAN_DENIED:   '❌',
  SYSTEM:        'ℹ️',
  INFO:          'ℹ️',
  WARNING:       '⚠️',
};

const relativeTime = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)    return 'just now';
  if (mins  < 60)   return `${mins} min ago`;
  if (hours < 24)   return `${hours} hr ago`;
  if (days  < 7)    return `${days} day${days > 1 ? 's' : ''} ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};

const typeVariant = (type) => {
  if (['LOAN_APPROVED', 'SUCCESS'].includes(type)) return 'success';
  if (['LOAN_DENIED', 'ERROR'].includes(type))     return 'danger';
  if (['WARNING'].includes(type))                  return 'warning';
  return 'info';
};

const TABS = ['ALL', 'UNREAD', 'LOAN', 'SYSTEM'];

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('ALL');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await loanApi.get(`/api/notifications/user/${user.userId}`);
      setNotifications(res.data || []);
    } catch {
      toast.error('Failed to load notifications');
    } finally { setLoading(false); }
  };

  useEffect(() => { if (user?.userId) fetchNotifications(); }, [user]);

  const markRead = async (id) => {
    try {
      await loanApi.put(`/api/notifications/read/${id}`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      window.dispatchEvent(new Event('notificationsUpdated'));
    } catch { /* silent */ }
  };

  const markAllRead = async () => {
    try {
      await loanApi.put(`/api/notifications/read-all/${user.userId}`);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
      window.dispatchEvent(new Event('notificationsUpdated'));
    } catch {
      toast.error('Failed to mark notifications as read');
    }
  };

  const filtered = notifications.filter(n => {
    if (tab === 'ALL')    return true;
    if (tab === 'UNREAD') return !n.isRead;
    if (tab === 'LOAN')   return (n.type || '').startsWith('LOAN');
    if (tab === 'SYSTEM') return (n.type || '') === 'SYSTEM' || (n.type || '') === 'INFO';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const tabStyle = (active) => ({
    padding: '8px 18px', fontSize: '13px', fontWeight: 700, border: 'none',
    cursor: 'pointer', borderRadius: '8px', whiteSpace: 'nowrap',
    background: active ? '#1A237E' : 'transparent',
    color: active ? '#fff' : '#757575', transition: 'all 0.18s',
  });

  if (loading) return <Loader message="Loading notifications..." />;

  return (
    <div style={{ paddingBottom: '40px', maxWidth: '720px' }}>
      <PageHeader
        title="Notifications"
        icon="🔔"
        subtitle={`${notifications.length} total · ${unreadCount} unread`}
        rightSlot={
          unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllRead}>
              ✓ Mark All Read
            </Button>
          )
        }
      />

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '4px', background: '#F5F7FA', borderRadius: '10px', padding: '4px', width: 'fit-content', marginBottom: '20px', flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t} style={tabStyle(tab === t)} onClick={() => setTab(t)}>
            {t}
            {t === 'UNREAD' && unreadCount > 0 && (
              <span style={{ background: '#D32F2F', color: '#fff', borderRadius: '100px', padding: '1px 6px', fontSize: '11px', marginLeft: '6px' }}>
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <SectionCard padding="0">
        {filtered.length === 0 ? (
          <EmptyState icon="🔔" title="No notifications" message={tab === 'UNREAD' ? 'You\'re all caught up!' : 'No notifications found.'} />
        ) : (
          filtered.map((notif, i) => {
            const icon = ICON_MAP[notif.type] || 'ℹ️';
            return (
              <div
                key={notif.id}
                onClick={() => !notif.isRead && markRead(notif.id)}
                style={{
                  display: 'flex', gap: '14px', alignItems: 'flex-start',
                  padding: '16px 20px', cursor: !notif.isRead ? 'pointer' : 'default',
                  background: notif.isRead ? '#fff' : 'rgba(26,35,126,0.03)',
                  borderBottom: i < filtered.length - 1 ? '1px solid #F5F7FA' : 'none',
                  transition: 'background 0.18s',
                }}
                onMouseEnter={e => { if (!notif.isRead) e.currentTarget.style.background = 'rgba(26,35,126,0.05)'; }}
                onMouseLeave={e => { if (!notif.isRead) e.currentTarget.style.background = 'rgba(26,35,126,0.03)'; }}
              >
                {/* Icon circle */}
                <div style={{
                  width: '42px', height: '42px', borderRadius: '50%',
                  background: notif.isRead ? '#F5F7FA' : 'rgba(26,35,126,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px', flexShrink: 0,
                }}>
                  {icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <p style={{
                      margin: 0, fontSize: '14px', lineHeight: 1.5,
                      fontWeight: notif.isRead ? 400 : 700,
                      color: notif.isRead ? '#757575' : '#212121',
                    }}>
                      {notif.message}
                    </p>
                    {!notif.isRead && (
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1A237E', flexShrink: 0, marginTop: '4px' }} />
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                    <Badge label={notif.type || 'INFO'} variant={typeVariant(notif.type)} />
                    <span style={{ fontSize: '12px', color: '#BDBDBD' }}>{relativeTime(notif.createdAt || notif.timestamp)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </SectionCard>
    </div>
  );
}
