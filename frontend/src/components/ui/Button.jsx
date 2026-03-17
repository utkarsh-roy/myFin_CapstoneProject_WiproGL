import React from 'react';
import { Button as MuiButton, CircularProgress } from '@mui/material';

export default function Button({
  children, variant = 'primary', size = 'md',
  fullWidth, loading, icon, onClick, type = 'button',
  disabled, style, className
}) {
  const muiVariant = variant === 'ghost' || variant === 'text' ? 'text' :
                     variant === 'outline' ? 'outlined' : 'contained';

  // Map our custom variants to MUI colors
  let color = 'primary';
  if (variant === 'success') color = 'success';
  if (variant === 'danger') color = 'error';
  if (variant === 'warning') color = 'warning';
  
  const muiSize = size === 'sm' ? 'small' : size === 'lg' ? 'large' : 'medium';

  return (
    <MuiButton
      type={type}
      variant={muiVariant}
      color={color}
      size={muiSize}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      onClick={onClick}
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : icon}
      sx={style}
      className={className}
    >
      {children}
    </MuiButton>
  );
}
