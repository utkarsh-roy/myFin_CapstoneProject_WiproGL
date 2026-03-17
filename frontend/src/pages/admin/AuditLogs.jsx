import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import { PageHeader, StatCard, SectionCard, Badge, DataTable, EmptyState, InputField, Button } from '../../components/ui';
import Loader from '../../components/Loader';

const fmtDate = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const ACTION_VARIANTS = {
  LOAN_APPROVED:    'success',
  LOAN_DENIED:      'danger',
  USER_ACTIVATED:   'success',
  USER_DEACTIVATED: 'warning',
  USER_DELETED:     'danger',
  PIN_RESET:        'info',
  PASSWORD_RESET:   'primary',
  ADMIN_LOGIN:      'neutral',
};

const SEVERITY_MAP = {
  USER_DELETED:     'HIGH',
  LOAN_DENIED:      'HIGH',
  USER_DEACTIVATED: 'MEDIUM',
  PASSWORD_RESET:   'MEDIUM',
  LOAN_APPROVED:    'LOW',
  USER_ACTIVATED:   'LOW',
  ADMIN_LOGIN:      'LOW',
};

const ACTION_TYPES = ['ALL', 'LOAN_APPROVED', 'LOAN_DENIED', 'USER_ACTIVATED', 'USER_DEACTIVATED', 'USER_DELETED', 'PIN_RESET', 'PASSWORD_RESET', 'ADMIN_LOGIN'];
const DATE_FILTERS = ['ALL', 'TODAY', 'THIS_WEEK'];

export default function AuditLogs() {
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('ALL');
  const [dateRange, setDateRange] = useState('ALL');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await adminApi.get('/api/admin/logs');
      setLogs(res.data || []);
    } catch {
      toast.error('Failed to load audit logs');
    } finally { setLoading(false); }
  };

  const exportToCSV = () => {
    if (logs.length === 0) return;
    const headers = ["Timestamp", "Admin Email", "Action", "Target", "Severity", "Details"];
    const rows = filtered.map(l => [
      fmtDate(l.timestamp || l.createdAt),
      l.adminEmail || '',
      l.action || '',
      l.targetId || '',
      SEVERITY_MAP[l.action] || 'LOW',
      (l.details || '').replace(/,/g, ';')
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `myfin_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Audit logs exported successfully');
  };

  useEffect(() => { fetchLogs(); }, []);

  const now = new Date();
  const today = new Date().toDateString();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const todayLogs      = logs.filter(l => new Date(l.timestamp || l.createdAt).toDateString() === today);
  const loanActions    = logs.filter(l => (l.action || '').startsWith('LOAN'));
  const userManagement = logs.filter(l => (l.action || '').startsWith('USER') || l.action === 'PIN_RESET');
  const securityEvents = logs.filter(l => l.action === 'ADMIN_LOGIN' || l.action === 'PASSWORD_RESET');

  const filtered = logs.filter(l => {
    const logDate = new Date(l.timestamp || l.createdAt);
    const matchSearch = !search ||
      (l.adminEmail || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.targetId || '').toString().includes(search) ||
      (l.details || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'ALL' || l.action === filter;
    
    let matchDate = true;
    if (dateRange === 'TODAY') matchDate = logDate.toDateString() === today;
    if (dateRange === 'THIS_WEEK') matchDate = logDate >= oneWeekAgo;
    
    return matchSearch && matchFilter && matchDate;
  });

  const columns = [
    { key: 'timestamp', label: 'Timestamp',
      render: (v, row) => <span style={{ fontSize: '11px', color: '#6B7280', whiteSpace: 'nowrap' }}>{fmtDate(v || row.createdAt)}</span> },
    { key: 'adminEmail', label: 'Admin Email',
      render: (v) => <span style={{ fontWeight: 600, color: '#1A237E', fontSize: '13px' }}>{v || '—'}</span> },
    { key: 'action', label: 'Action',
      render: (v) => <Badge label={v?.replace('_', ' ') || '—'} variant={ACTION_VARIANTS[v] || 'neutral'} /> },
    { key: 'targetId', label: 'Target',
      render: (v, row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <code style={{ fontSize: '11px', background: '#F3F4F6', padding: '1px 5px', borderRadius: '4px', width: 'fit-content' }}>#{v || '—'}</code>
          <span style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 600 }}>{row.targetType}</span>
        </div>
      )
    },
    { key: 'action', label: 'Severity',
      render: (v) => {
        const sev = SEVERITY_MAP[v] || 'LOW';
        const color = sev === 'HIGH' ? '#D32F2F' : sev === 'MEDIUM' ? '#EF6C00' : '#1976D2';
        return <span style={{ fontSize: '11px', fontWeight: 800, color }}>{sev}</span>;
      }
    },
    { key: 'details', label: 'Details',
      render: (v) => <span style={{ fontSize: '12px', color: '#4B5563', lineHeight: 1.4, display: 'block', minWidth: '180px' }}>{v || '—'}</span> },
  ];

  if (loading) return <Loader message="Loading audit logs..." />;

  return (
    <div style={{ paddingBottom: '40px' }}>
      <PageHeader
        title="Audit Logs"
        icon="📝"
        subtitle={`${logs.length} total audit entries`}
        rightSlot={<Button variant="primary" size="sm" icon="🔄" onClick={fetchLogs}>Refresh</Button>}
      />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: '16px', marginBottom: '28px' }}>
        <StatCard label="Total Actions Today"   value={todayLogs.length}   icon="📊" color="#1A237E" />
        <StatCard label="Loan Actions"          value={loanActions.length}  icon="📝" color="#2E7D32" />
        <StatCard label="User Management"       value={userManagement.length} icon="👥" color="#0277BD" />
        <StatCard label="Security Events"       value={securityEvents.length} icon="🛡️" color="#C62828" />
      </div>

      <SectionCard
        title="All Audit Entries"
        action={
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button variant="ghost" size="sm" icon="📥" onClick={exportToCSV} disabled={filtered.length === 0}>
              Export CSV
            </Button>
            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
              style={{ padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #E5E7EB', fontSize: '12px', fontWeight: 600, color: '#374151', background: '#F9FAFB' }}
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="THIS_WEEK">This Week</option>
            </select>
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              style={{ padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #E5E7EB', fontSize: '12px', fontWeight: 600, color: '#374151', background: '#F9FAFB' }}
            >
              {ACTION_TYPES.map(t => <option key={t} value={t}>{t === 'ALL' ? 'All Actions' : t.replace(/_/g, ' ')}</option>)}
            </select>
            <InputField
              name="search" placeholder="Search logs…" value={search}
              onChange={e => setSearch(e.target.value)} icon="🔍"
              style={{ margin: 0, width: '200px' }}
            />
          </div>
        }
        padding="0"
      >
        {filtered.length === 0
          ? <EmptyState icon="📝" title="No audit entries" message="No log entries match your current filter." />
          : <DataTable columns={columns} rows={filtered} keyField="id" />
        }
      </SectionCard>
    </div>
  );
}
