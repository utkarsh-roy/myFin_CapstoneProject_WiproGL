import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: '#FFFFFF',
        color: 'var(--color-text-light)',
        borderTop: '1px solid #E0E0E0',
        textAlign: 'center'
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          © {new Date().getFullYear()} MyFin Bank. All rights reserved.
        </Typography>
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          Need Help? Contact 1-800-MYFIN-BANK or support@myfinbank.com
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
