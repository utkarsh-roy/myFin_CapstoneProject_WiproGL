import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, InputAdornment, IconButton, Link } from '@mui/material';
import { Visibility, VisibilityOff, AdminPanelSettings } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { toast } from 'react-toastify';
import { adminApi } from '../../api/axiosConfig';
import useAuth from '../../hooks/useAuth';
import { decodeToken } from '../../utils/tokenUtils';

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showSecretCode, setShowSecretCode] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    email: Yup.string().email('Enter a valid email').required('Email is required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    secretCode: Yup.string().required('Admin Secret Code is required'),
  });

  const formik = useFormik({
    initialValues: { email: '', password: '', secretCode: '' },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      // Backend validates the secret code securely via BCrypt hashing

      try {
        const response = await adminApi.post('/api/admin/login', {
          email: values.email,
          password: values.password,
          secretCode: values.secretCode
        });
        
        const token = response.data?.token || response.data?.accessToken || (typeof response.data === 'string' ? response.data : null);
        const decoded = token ? (decodeToken(token) || {}) : {};
        const userId = response.data?.userId || response.data?.id || response.data?.user?.id || decoded.userId || decoded.id || decoded.sub;
        const role = response.data?.role || response.data?.user?.role || decoded.role || 'ADMIN';
        const finalEmail = response.data?.email || response.data?.user?.email || decoded.email || values.email;
        const username = response.data?.username || response.data?.user?.username || decoded.username || decoded.name || '';
        
        login(token, role, userId, finalEmail, username);
        
        toast.success('Admin Login successful!');
        navigate('/admin/dashboard');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Admin login failed. Check credentials.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Box sx={{ maxWidth: 450, width: '100%', mx: 'auto', mt: 8 }}>
      <Paper elevation={6} sx={{ p: 4, borderRadius: 2, borderTop: '6px solid var(--color-error)' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <AdminPanelSettings sx={{ fontSize: 50, color: 'var(--color-error)', mb: 1 }} />
          <Typography variant="h5" component="h1" fontWeight="bold" color="var(--color-error)">
            Secure Admin Access
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Restricted System Portal
          </Typography>
        </Box>

        <form onSubmit={formik.handleSubmit}>
          <TextField
             fullWidth
             id="email"
             name="email"
             label="Admin Email"
             margin="normal"
             value={formik.values.email}
             onChange={formik.handleChange}
             onBlur={formik.handleBlur}
             error={formik.touched.email && Boolean(formik.errors.email)}
             helperText={formik.touched.email && formik.errors.email}
          />

          <TextField
             fullWidth
             id="password"
             name="password"
             label="Password"
             type={showPassword ? 'text' : 'password'}
             margin="normal"
             value={formik.values.password}
             onChange={formik.handleChange}
             onBlur={formik.handleBlur}
             error={formik.touched.password && Boolean(formik.errors.password)}
             helperText={formik.touched.password && formik.errors.password}
             InputProps={{
               endAdornment: (
                 <InputAdornment position="end">
                   <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                     {showPassword ? <VisibilityOff /> : <Visibility />}
                   </IconButton>
                 </InputAdornment>
               ),
             }}
          />

          <TextField
             fullWidth
             id="secretCode"
             name="secretCode"
             label="Admin Secret Code"
             type={showSecretCode ? 'text' : 'password'}
             margin="normal"
             value={formik.values.secretCode}
             onChange={formik.handleChange}
             onBlur={formik.handleBlur}
             error={formik.touched.secretCode && Boolean(formik.errors.secretCode)}
             helperText={formik.touched.secretCode && formik.errors.secretCode}
             InputProps={{
               endAdornment: (
                 <InputAdornment position="end">
                   <IconButton onClick={() => setShowSecretCode(!showSecretCode)} edge="end">
                     {showSecretCode ? <VisibilityOff /> : <Visibility />}
                   </IconButton>
                 </InputAdornment>
               ),
             }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={formik.isSubmitting}
            sx={{
              mt: 3,
              mb: 2,
              py: 1.5,
              backgroundColor: 'var(--color-error)',
              '&:hover': { backgroundColor: '#B71C1C' } // Darker red
            }}
          >
           {formik.isSubmitting ? 'Authenticating...' : 'Enter Admin Portal'}
          </Button>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Authorized Personnel Only
            </Typography>
            <Box mt={1}>
              <Link component={RouterLink} to="/admin/register" variant="body2" sx={{ color: 'var(--color-error)', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                Request new Admin Credentials
              </Link>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default AdminLogin;
