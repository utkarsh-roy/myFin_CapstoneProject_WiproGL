import React from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';

/**
 * Reusable full-page or component-level loading spinner
 * Matches MyFin primary colors
 */
const Loader = ({ message = 'Loading...', fullScreen = true }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: fullScreen ? '100vh' : '200px',
        width: '100%',
        backgroundColor: 'var(--color-background)',
      }}
    >
      <CircularProgress sx={{ color: 'var(--color-primary)', mb: 2 }} />
      <Typography variant="body1" sx={{ color: 'var(--color-text)', fontWeight: 500 }}>
        {message}
      </Typography>
    </Box>
  );
};

export default Loader;
