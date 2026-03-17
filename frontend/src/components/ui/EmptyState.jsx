import React from 'react';
import { Box, Typography } from '@mui/material';

export default function EmptyState({ icon, title, message, action }) {
  return (
    <Box sx={{ 
      py: 6, px: 2, 
      display: 'flex', flexDirection: 'column', 
      alignItems: 'center', justifyContent: 'center', 
      textAlign: 'center', bgcolor: 'transparent'
    }}>
      {icon && (
        <Typography sx={{ fontSize: '48px', mb: 2, opacity: 0.8 }}>
          {icon}
        </Typography>
      )}
      <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
        {title}
      </Typography>
      {message && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mb: 3 }}>
          {message}
        </Typography>
      )}
      {action && (
        <Box sx={{ mt: 1 }}>
          {action}
        </Box>
      )}
    </Box>
  );
}
