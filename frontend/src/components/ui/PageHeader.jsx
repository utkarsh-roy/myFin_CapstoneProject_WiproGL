import React from 'react';
import { Box, Typography } from '@mui/material';

export default function PageHeader({ title, subtitle, icon, rightSlot }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {icon && (
          <Box sx={{
            width: 48, height: 48, borderRadius: 2, bgcolor: 'primary.main',
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', flexShrink: 0
          }}>
            {icon}
          </Box>
        )}
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: '-0.5px' }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
      
      {rightSlot && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {rightSlot}
        </Box>
      )}
    </Box>
  );
}
