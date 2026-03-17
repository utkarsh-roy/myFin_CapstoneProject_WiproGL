import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import { PageHeader, Badge, Button, SectionCard, DataTable, EmptyState, Modal, InputField, statusVariant } from '../../components/ui';
import Loader from '../../components/Loader';
import { Box } from '@mui/material';

const ManageUsers = () => {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, userId: null, email: '' });
  const [resetModal, setResetModal] = useState({ open: false, userId: null, email: '' });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminApi.get('/api/admin/users/all');
      setUsers(res.data || []);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggleStatus = async (user) => {
    try {
      if (user.active) {
        await adminApi.put(`/api/admin/users/deactivate/${user.id}`);
        toast.success(`${user.email} deactivated`);
      } else {
        await adminApi.put(`/api/admin/users/activate/${user.id}`);
        toast.success(`${user.email} activated`);
      }
      fetchUsers();
    } catch {
      toast.error('Failed to update user status');
    }
  };

  const openDeleteDialog = (user) => {
    if (user.role === 'ADMIN') { toast.error('Cannot delete an admin user.'); return; }
    setDeleteDialog({ open: true, userId: user.id, email: user.email });
  };

  const handleConfirmDelete = async () => {
    try {
      await adminApi.delete(`/api/admin/users/${deleteDialog.userId}`);
      toast.success('User deleted permanently.');
      fetchUsers();
    } catch {
      toast.error('Failed to delete user.');
    } finally {
      setDeleteDialog({ open: false, userId: null, email: '' });
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      setResetting(true);
      await adminApi.put(`/api/admin/users/reset-password/${resetModal.userId}`, { newPassword });
      toast.success(`Password reset for ${resetModal.email}`);
      setResetModal({ open: false, userId: null, email: '' });
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      toast.error('Failed to reset password');
    } finally {
      setResetting(false);
    }
  };

  const filtered = users.filter(u =>
    (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.username || '').toLowerCase().includes(search.toLowerCase())
  );

  // DataTable column definitions
  const columns = [
    { key: 'id',       label: 'ID' },
    { key: 'username', label: 'Username' },
    { key: 'email',    label: 'Email' },
    {
      key: 'role', label: 'Role',
      render: (val) => <Badge label={val} variant={statusVariant(val)} />,
    },
    {
      key: 'active', label: 'Status',
      render: (val) => <Badge label={val ? 'ACTIVE' : 'INACTIVE'} variant={val ? 'success' : 'danger'} />,
    },
    {
      key: '_actions', label: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button
            variant={row.active ? 'ghost' : 'success'}
            size="sm"
            disabled={row.role === 'ADMIN'}
            onClick={() => handleToggleStatus(row)}
          >
            {row.active ? '🔒 Deactivate' : '🔓 Activate'}
          </Button>
          <Button
            variant="danger"
            size="sm"
            disabled={row.role === 'ADMIN'}
            onClick={() => openDeleteDialog(row)}
          >
            🗑 Delete
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={row.role === 'ADMIN'}
            onClick={() => setResetModal({ open: true, userId: row.id, email: row.email })}
          >
            🔑 Reset Pass
          </Button>
        </div>
      ),
    },
  ];

  if (loading) return <Loader message="Loading User Directory..." />;

  return (
    <Box sx={{ width: '100%', paddingBottom: '40px' }}>
      <PageHeader
        title="User Management"
        icon="👥"
        subtitle={`${users.length} registered users`}
        rightSlot={
          <Button variant="primary" size="sm" icon="🔄" onClick={fetchUsers}>
            Refresh
          </Button>
        }
      />

      <SectionCard
        title="All Users"
        action={
          <InputField
            name="search"
            placeholder="Search by email or name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            icon="🔍"
            style={{ margin: 0, width: '280px' }}
          />
        }
      >
        {filtered.length === 0
          ? <EmptyState icon="👤" title="No users found" message="Try adjusting your search." />
          : <DataTable columns={columns} rows={filtered} />
        }
      </SectionCard>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, userId: null, email: '' })}
        title="Confirm Deletion"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setDeleteDialog({ open: false, userId: null, email: '' })}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmDelete}>
              🗑 Delete Permanently
            </Button>
          </>
        }
      >
        <p style={{ margin: 0, fontSize: '14px', color: '#757575', lineHeight: 1.7 }}>
          Are you sure you want to permanently delete user{' '}
          <strong style={{ color: '#D32F2F' }}>{deleteDialog.email}</strong>?
          <br />
          This action <strong>cannot be undone</strong> and may remove their accounts and transactions.
        </p>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        open={resetModal.open}
        onClose={() => !resetting && setResetModal({ open: false, userId: null, email: '' })}
        title="🔑 Admin Password Reset"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setResetModal({ open: false, userId: null, email: '' })} disabled={resetting}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleResetPassword} disabled={resetting}>
              {resetting ? 'Resetting...' : 'Set New Password'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#757575' }}>
            Setting new password for: <strong style={{ color: '#1A237E' }}>{resetModal.email}</strong>
          </p>
          <InputField
            label="New Password"
            type="password"
            showToggle={true}
            placeholder="Enter at least 6 characters"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
          />
          <InputField
            label="Confirm New Password"
            type="password"
            showToggle={true}
            placeholder="Repeat password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
          />
        </div>
      </Modal>
    </Box>
  );
};

export default ManageUsers;
