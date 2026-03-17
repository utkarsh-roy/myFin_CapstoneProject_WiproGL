import React from 'react';
import { Alert, AlertTitle } from '@mui/material';

export default function AlertBanner({ type = 'info', title, message, dismissible, onClose, style }) {
  let severity = 'info';
  if (type === 'success') severity = 'success';
  if (type === 'danger' || type === 'error') severity = 'error';
  if (type === 'warning') severity = 'warning';

  return (
    <Alert 
      severity={severity} 
      onClose={dismissible ? onClose : undefined}
      sx={{ mb: 3, borderRadius: 2, ...style }}
    >
      {title && <AlertTitle sx={{ fontWeight: 700 }}>{title}</AlertTitle>}
      {message}
    </Alert>
  );
}
