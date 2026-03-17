import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Checkbox, FormControlLabel, InputAdornment, IconButton, Paper, Link as MuiLink, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { Visibility, VisibilityOff, AccountBalance, AdminPanelSettings, LockPerson } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { userApi, adminApi } from '../../api/axiosConfig';
import useAuth from '../../hooks/useAuth';
import { decodeToken } from '../../utils/tokenUtils';

const Login = () => {
  const [role, setRole] = useState('USER'); // 'USER' or 'ADMIN'
  const [showPassword, setShowPassword] = useState(false);
  const [showSecretCode, setShowSecretCode] = useState(false);
  const [showLockedModal, setShowLockedModal] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const isUser = role === 'USER';
  const themeColor = isUser ? 'var(--color-primary)' : 'var(--color-error)';
  const hoverColor = isUser ? 'var(--color-secondary)' : '#B71C1C';

  const validationSchema = Yup.object({
    email: Yup.string().email('Enter a valid email').required('Email is required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    secretCode: !isUser ? Yup.string().required('Admin Secret Code is required') : Yup.string(),
  });

  const formik = useFormik({
    initialValues: { email: '', password: '', secretCode: '', rememberMe: false, },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const endpoint = isUser ? '/api/auth/login' : '/api/admin/login';
        const api = isUser ? userApi : adminApi;
        const payload = isUser 
          ? { email: values.email, password: values.password }
          : { email: values.email, password: values.password, secretCode: values.secretCode };
        
        const response = await api.post(endpoint, payload);
        
        const token = response.data?.token || response.data?.accessToken || (typeof response.data === 'string' ? response.data : null);
        const decoded = token ? (decodeToken(token) || {}) : {};
        const userId = response.data?.userId || response.data?.id || response.data?.user?.id || decoded.userId || decoded.id || decoded.sub;
        const finalRole = response.data?.role || response.data?.user?.role || decoded.role || role;
        const finalEmail = response.data?.email || response.data?.user?.email || decoded.email || values.email;
        const username = response.data?.username || response.data?.user?.username || decoded.username || decoded.name || '';
        
        login(token, finalRole, userId, finalEmail, username);
        
        toast.success(`${isUser ? 'User' : 'Admin'} Login successful!`);
        navigate(isUser ? '/dashboard' : '/admin/dashboard');
      } catch (error) {
        const msg = error.response?.data?.message || "";
        
        if (isUser && msg.includes("ACCOUNT_LOCKED")) {
          setShowLockedModal(true);
        } else if (msg.includes("INVALID_PASSWORD") && isUser) {
          const remaining = msg.match(/\d+/)?.[0];
          setError(`Wrong password. ${remaining} attempts left`);
        } else if (msg.includes("ACCOUNT_DEACTIVATED")) {
          setError("Account deactivated. Contact bank.");
        } else {
          toast.error(msg || 'Login failed. Please check credentials.');
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Box sx={{ maxWidth: 450, width: '100%', mx: 'auto' }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, borderTop: `6px solid ${themeColor}`, transition: 'all 0.3s ease' }} className="card-shadow">
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          {isUser ? (
            <AccountBalance sx={{ fontSize: 48, color: themeColor, mb: 1 }} />
          ) : (
            <AdminPanelSettings sx={{ fontSize: 48, color: themeColor, mb: 1 }} />
          )}
          <Typography variant="h5" component="h1" fontWeight="bold" color={themeColor}>
            {isUser ? 'MyFin Bank' : 'Admin Portal'}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            {isUser ? 'Secure Digital Banking Profile Access' : 'Restricted System Management'}
          </Typography>
        </Box>

        {/* Role Selector */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <ToggleButtonGroup
            value={role}
            exclusive
            onChange={(e, val) => val && setRole(val)}
            size="small"
            color={isUser ? "primary" : "error"}
          >
            <ToggleButton value="USER" sx={{ px: 3, fontWeight: 700 }}>
              👤 User
            </ToggleButton>
            <ToggleButton value="ADMIN" sx={{ px: 3, fontWeight: 700 }}>
              🔐 Admin
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <form onSubmit={formik.handleSubmit}>
          {error && (
            <Box sx={{ mb: 2, p: 1.5, bgcolor: '#FFEBEE', color: '#C62828', borderRadius: 1, fontSize: '0.85rem', fontWeight: 600, textAlign: 'center' }}>
              {error}
            </Box>
          )}

          <TextField
             fullWidth
             id="email"
             name="email"
             label={isUser ? "Email Address" : "Admin Email"}
             placeholder="Enter your email"
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

          {!isUser && (
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
          )}

          {isUser && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox 
                    id="rememberMe" 
                    name="rememberMe" 
                    checked={formik.values.rememberMe}
                    onChange={formik.handleChange} 
                    color="primary" 
                  />
                }
                label="Remember me"
              />
              <MuiLink component={Link} to="/forgot-password" variant="body2" sx={{ color: 'var(--color-secondary)' }}>
                Forgot password?
              </MuiLink>
            </Box>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={formik.isSubmitting}
            sx={{
              py: 1.5,
              mt: isUser ? 0 : 2,
              mb: 2,
              backgroundColor: themeColor,
              '&:hover': { backgroundColor: hoverColor }
            }}
          >
           {formik.isSubmitting ? 'Authenticating...' : isUser ? 'Sign In To MyFin' : 'Enter Admin Portal'}
          </Button>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            {isUser ? (
              <Typography variant="body2">
                Don't have an account?{' '}
                <MuiLink component={Link} to="/register" sx={{ fontWeight: 'bold' }}>
                  Register Now
                </MuiLink>
              </Typography>
            ) : (
              <MuiLink component={Link} to="/admin/register" variant="body2" sx={{ color: 'var(--color-error)', fontWeight: 'bold' }}>
                Request new Admin Credentials
              </MuiLink>
            )}
          </Box>
        </form>
      </Paper>

      {/* Account Locked Modal */}
      <Box 
        sx={{ 
          display: showLockedModal ? 'block' : 'none',
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          bgcolor: 'rgba(0,0,0,0.5)', zIndex: 9999
        }}
        onClick={() => setShowLockedModal(false)}
      >
        <Paper 
          sx={{ 
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: 400, p: 4, textAlign: 'center', borderRadius: 2
          }}
          onClick={e => e.stopPropagation()}
        >
          <Typography variant="h4" sx={{ mb: 2 }}>🔒</Typography>
          <Typography variant="h5" fontWeight="bold" color="error" gutterBottom>
            Account Locked
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Your account has been locked due to too many failed login attempts.
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Please contact MyFin Bank to activate your account.
          </Typography>
          <Box sx={{ mt: 3, p: 2, bgcolor: '#F5F7FA', borderRadius: 1 }}>
            <Typography variant="body2" fontWeight="bold">Contact: support@myfinbank.com</Typography>
            <Typography variant="body2" fontWeight="bold">Phone: 1-800-MYFIN-BANK</Typography>
          </Box>
          <Button 
            fullWidth variant="contained" sx={{ mt: 3 }}
            onClick={() => setShowLockedModal(false)}
          >
            I Understand
          </Button>
        </Paper>
      </Box>
    </Box>
  );
};

export default Login;
