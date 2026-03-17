import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export default function Modal({ open, onClose, title, children, maxWidth = 'sm', footer }) {
  // Map our custom css max-widths to MUI's predefined maxWidths where possible
  // SM = 600px, XS = 444px.
  let muiMaxWidth = 'sm';
  if (maxWidth === '420px' || maxWidth === '460px' || maxWidth === '480px') {
    muiMaxWidth = 'xs';
  }

  return (
    <Dialog 
      open={!!open} 
      onClose={onClose}
      maxWidth={muiMaxWidth}
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, boxShadow: '0 24px 56px rgba(26,35,126,0.18)' }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
          {title}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: 'text.secondary' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 3, borderColor: 'rgba(26,35,126,0.08)' }}>
        {children}
      </DialogContent>
      
      {footer && (
        <DialogActions sx={{ p: 2, px: 3, borderColor: 'rgba(26,35,126,0.08)' }}>
          {footer}
        </DialogActions>
      )}
    </Dialog>
  );
}
