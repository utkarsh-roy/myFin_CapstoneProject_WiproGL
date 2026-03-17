import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Link as MuiLink, Select, MenuItem, FormControl, InputLabel, FormHelperText, LinearProgress } from '@mui/material';
import { PageHeader, InputField } from '../../components/ui';
import { AccountBalance } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { userApi } from '../../api/axiosConfig';

const Register = () => {
  const navigate = useNavigate();

  // Simple password strength calculation
  const getPasswordStrength = (password) => {
    let score = 0;
    if (!password) return 0;
    if (password.length > 5) score += 25;
    if (password.length > 8) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/[0-9]/.test(password)) score += 25;
    return score;
  };

  const validationSchema = Yup.object({
    username: Yup.string().min(3, 'Username must be at least 3 characters').required('Username is required'),
    email: Yup.string().email('Enter a valid email').required('Email is required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm password is required'),
    role: Yup.string().required('Role is required'),
  });

  const formik = useFormik({
    initialValues: { username: '', email: '', password: '', confirmPassword: '', role: 'USER' },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await userApi.post('/api/auth/register', {
          username: values.username,
          email: values.email,
          password: values.password,
          role: values.role
        });
        
        toast.success('Registration successful! Please login.');
        navigate('/login');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Registration failed.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const passwordStrength = getPasswordStrength(formik.values.password);
  const strengthColor = passwordStrength > 75 ? 'success' : passwordStrength > 50 ? 'warning' : 'error';

  return (
    <Box sx={{ maxWidth: 500, width: '100%', mx: 'auto', py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }} className="card-shadow">
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <AccountBalance sx={{ fontSize: 40, color: 'var(--color-primary)', mb: 1 }} />
          <Typography variant="h5" component="h1" fontWeight="bold" color="var(--color-primary)">
            Create MyFin Account
          </Typography>
        </Box>

        <form onSubmit={formik.handleSubmit}>
          <InputField
             fullWidth
             id="username"
             name="username"
             label="Username"
             icon="👤"
             value={formik.values.username}
             onChange={formik.handleChange}
             onBlur={formik.handleBlur}
             error={formik.touched.username && formik.errors.username}
          />

          <InputField
             fullWidth
             id="email"
             name="email"
             label="Email Address"
             icon="✉️"
             value={formik.values.email}
             onChange={formik.handleChange}
             onBlur={formik.handleBlur}
             error={formik.touched.email && formik.errors.email}
          />

          <InputField
             fullWidth
             id="password"
             name="password"
             label="Password"
             type="password"
             showToggle={true}
             icon="🔒"
             value={formik.values.password}
             onChange={formik.handleChange}
             onBlur={formik.handleBlur}
             error={formik.touched.password && formik.errors.password}
          />

          {formik.values.password && (
             <Box sx={{ mb: 2, mt: 1 }}>
               <LinearProgress variant="determinate" value={passwordStrength} color={strengthColor} />
               <Typography variant="caption" color="text.secondary">
                 Password Strength: {passwordStrength > 75 ? 'Strong' : passwordStrength > 50 ? 'Medium' : 'Weak'}
               </Typography>
             </Box>
          )}

          <InputField
             fullWidth
             id="confirmPassword"
             name="confirmPassword"
             label="Confirm Password"
             type="password"
             showToggle={true}
             icon="🔒"
             value={formik.values.confirmPassword}
             onChange={formik.handleChange}
             onBlur={formik.handleBlur}
             error={formik.touched.confirmPassword && formik.errors.confirmPassword}
          />

          <FormControl fullWidth margin="normal" size="small" error={formik.touched.role && Boolean(formik.errors.role)}>
            <InputLabel id="role-label">Account Role</InputLabel>
            <Select
              labelId="role-label"
              id="role"
              name="role"
              value={formik.values.role}
              label="Account Role"
              onChange={formik.handleChange}
            >
              <MenuItem value="USER">Personal Account (USER)</MenuItem>
            </Select>
            {formik.touched.role && <FormHelperText>{formik.errors.role}</FormHelperText>}
          </FormControl>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={formik.isSubmitting}
            sx={{
              mt: 3,
              mb: 2,
              py: 1.5,
              backgroundColor: 'var(--color-primary)',
              '&:hover': { backgroundColor: 'var(--color-secondary)' }
            }}
          >
           {formik.isSubmitting ? 'Creating account...' : 'Register Account'}
          </Button>

          <Typography align="center" variant="body2">
            Already have an account?{' '}
            <MuiLink component={Link} to="/login" sx={{ fontWeight: 'bold' }}>
              Sign in
            </MuiLink>
          </Typography>
        </form>
      </Paper>
    </Box>
  );
};

export default Register;
