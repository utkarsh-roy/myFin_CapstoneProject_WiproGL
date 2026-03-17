import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, InputAdornment, IconButton, Link } from '@mui/material';
import { Visibility, VisibilityOff, AdminPanelSettings } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { toast } from 'react-toastify';
import { adminApi } from '../../api/axiosConfig';

const AdminRegister = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showSecretCode, setShowSecretCode] = useState(false);
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Enter a valid email').required('Email is required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    secretCode: Yup.string().min(6, 'Admin Secret must be at least 6 characters').required('Personal Admin Secret Code is required'),
  });

  const formik = useFormik({
    initialValues: { name: '', email: '', password: '', secretCode: '' },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await adminApi.post('/api/admin/register', {
          name: values.name,
          email: values.email,
          password: values.password,
          secretCode: values.secretCode
        });
        
        toast.success('Admin Registration successful! You can now log in.');
        navigate('/admin/login');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Admin registration failed. Please try again.');
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
            Register New Admin
          </Typography>
          <Typography variant="subtitle2" color="text.secondary" align="center">
            Set your personal secure Secret Code
          </Typography>
        </Box>

        <form onSubmit={formik.handleSubmit}>
          <TextField
             fullWidth
             id="name"
             name="name"
             label="Full Name"
             margin="normal"
             value={formik.values.name}
             onChange={formik.handleChange}
             onBlur={formik.handleBlur}
             error={formik.touched.name && Boolean(formik.errors.name)}
             helperText={formik.touched.name && formik.errors.name}
          />

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
             label="Personal Secret Code"
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
              '&:hover': { backgroundColor: '#B71C1C' }
            }}
          >
           {formik.isSubmitting ? 'Registering...' : 'Create Admin Profile'}
          </Button>
          
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Link component={RouterLink} to="/admin/login" variant="body2" sx={{ color: 'var(--color-error)', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
              Already have an Admin account? Secure Login
            </Link>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default AdminRegister;
