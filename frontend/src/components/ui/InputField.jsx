import React, { useState } from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export default function InputField({
  label, name, type = 'text', value, onChange, onBlur,
  placeholder, error, icon, disabled = false, required = false,
  fullWidth = true, showToggle = false
}) {
  const [showPassword, setShowPassword] = useState(false);

  // If showToggle is true AND type is password, we allow toggling
  const isPassword = type === 'password';
  const effectiveType = (isPassword && showToggle && showPassword) ? 'text' : type;

  return (
    <TextField
      id={name}
      name={name}
      label={label}
      type={effectiveType}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      error={!!error}
      helperText={error}
      disabled={disabled}
      required={required}
      fullWidth={fullWidth}
      margin="normal"
      autoComplete="new-password" // Better than 'off' for security fields
      slotProps={{
        input: {
          startAdornment: icon ? (
            <InputAdornment position="start" sx={{ fontSize: '18px', color: 'text.secondary' }}>
              {icon}
            </InputAdornment>
          ) : undefined,
          endAdornment: (isPassword && showToggle) ? (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
                size="small"
              >
                {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
              </IconButton>
            </InputAdornment>
          ) : undefined,
        }
      }}
      sx={{ 
        mb: 2, mt: 0,
        '& .MuiOutlinedInput-root': { borderRadius: '10px' }
      }}
    />
  );
}
