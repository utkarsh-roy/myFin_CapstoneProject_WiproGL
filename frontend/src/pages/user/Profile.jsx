import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { userApi } from '../../api/axiosConfig';
import useAuth from '../../hooks/useAuth';
import Loader from '../../components/Loader';
import { toast } from 'react-toastify';
import { Box } from '@mui/material';
import { PageHeader, Badge, Button, SectionCard, InputField } from '../../components/ui';

const Profile = () => {
  const { user, login } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        if (!user?.userId) return;
        const res = await userApi.get(`/api/users/profile/${user.userId}`);
        setProfileData(res.data);
      } catch {
        toast.error('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const profileForm = useFormik({
    initialValues: { username: profileData?.username || '', email: profileData?.email || '' },
    enableReinitialize: true,
    validationSchema: Yup.object({
      username: Yup.string().min(3, 'At least 3 characters').required('Required'),
      email: Yup.string().email('Invalid email').required('Required'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await userApi.put(`/api/users/profile/${user.userId}`, values);
        toast.success('Profile updated successfully!');
        login(user.token, user.role, user.userId, values.email, values.username);
      } catch {
        toast.error('Failed to update profile.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const passwordForm = useFormik({
    initialValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
    validationSchema: Yup.object({
      currentPassword: Yup.string().required('Required'),
      newPassword: Yup.string().min(6, 'At least 6 characters').required('Required'),
      confirmPassword: Yup.string().oneOf([Yup.ref('newPassword')], 'Passwords must match').required('Required'),
    }),
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        await userApi.put(`/api/users/change-password/${user.userId}`, {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        });
        toast.success('Password changed successfully!');
        resetForm();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to change password.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (loading) return <Loader message="Loading profile..." />;

  return (
    <Box sx={{ width: '100%', paddingBottom: '40px' }}>
      <PageHeader
        title="Account Settings"
        icon="⚙️"
        subtitle="Manage your personal information and security"
        rightSlot={
          <Badge
            label={profileData?.active ? 'ACTIVE' : 'INACTIVE'}
            variant={profileData?.active ? 'success' : 'danger'}
          />
        }
      />

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(380px, 1fr))', gap:'24px' }}>
        {/* Personal Information */}
        <SectionCard title="✅ Personal Information" subtitle="Update your name and email address">
          <form onSubmit={profileForm.handleSubmit}>
            <InputField
              label="Full Name"
              name="username"
              icon="👤"
              value={profileForm.values.username}
              onChange={profileForm.handleChange}
              onBlur={profileForm.handleBlur}
              error={profileForm.touched.username && profileForm.errors.username}
              required
            />
            <InputField
              label="Email Address"
              name="email"
              type="email"
              icon="✉️"
              value={profileForm.values.email}
              onChange={profileForm.handleChange}
              onBlur={profileForm.handleBlur}
              error={profileForm.touched.email && profileForm.errors.email}
              required
            />
            <div style={{ marginTop:'8px' }}>
              <Button type="submit" variant="primary" fullWidth loading={profileForm.isSubmitting}>
                Save Changes
              </Button>
            </div>
          </form>
        </SectionCard>

        {/* Security & Password */}
        <SectionCard title="🔐 Security & Password" subtitle="Keep your account safe with a strong password">
          <form onSubmit={passwordForm.handleSubmit}>
            <InputField
              label="Current Password"
              name="currentPassword"
              type="password"
              showToggle={true}
              icon="🔑"
              value={passwordForm.values.currentPassword}
              onChange={passwordForm.handleChange}
              onBlur={passwordForm.handleBlur}
              error={passwordForm.touched.currentPassword && passwordForm.errors.currentPassword}
              required
            />
            <div style={{ borderTop:'1px solid #F0F0F0', margin:'16px 0' }} />
            <InputField
              label="New Password"
              name="newPassword"
              type="password"
              showToggle={true}
              icon="🔒"
              value={passwordForm.values.newPassword}
              onChange={passwordForm.handleChange}
              onBlur={passwordForm.handleBlur}
              error={passwordForm.touched.newPassword && passwordForm.errors.newPassword}
              required
            />
            <InputField
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              showToggle={true}
              icon="🔒"
              value={passwordForm.values.confirmPassword}
              onChange={passwordForm.handleChange}
              onBlur={passwordForm.handleBlur}
              error={passwordForm.touched.confirmPassword && passwordForm.errors.confirmPassword}
              required
            />
            <Button type="submit" variant="ghost" fullWidth loading={passwordForm.isSubmitting}>
              Update Password
            </Button>
          </form>
        </SectionCard>
      </div>
    </Box>
  );
};

export default Profile;
