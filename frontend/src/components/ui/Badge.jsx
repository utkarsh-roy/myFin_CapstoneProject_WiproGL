import React from 'react';
import { Chip } from '@mui/material';

export default function Badge({ label, variant = 'neutral', icon }) {
  let color = 'default';
  if (variant === 'primary') color = 'primary';
  if (variant === 'success') color = 'success';
  if (variant === 'danger' || variant === 'error') color = 'error';
  if (variant === 'warning') color = 'warning';
  if (variant === 'info') color = 'info';

  return (
    <Chip
      label={label}
      color={color}
      icon={icon ? <span style={{ marginLeft: 4 }}>{icon}</span> : undefined}
      size="small"
      sx={{ fontWeight: 700, borderRadius: '6px' }}
    />
  );
}

// Helper to deduce variant from common status strings
export function statusVariant(statusStr) {
  if (!statusStr) return 'neutral';
  const s = statusStr.toUpperCase();
  if (['ACTIVE', 'COMPLETED', 'APPROVED', 'SUCCESS'].includes(s)) return 'success';
  if (['PENDING', 'WARNING'].includes(s)) return 'warning';
  if (['INACTIVE', 'DENIED', 'FAIL', 'FAILED', 'ERROR', 'CANCELLED'].includes(s)) return 'danger';
  if (['TRANSFER', 'INFO'].includes(s)) return 'info';
  return 'primary';
}
