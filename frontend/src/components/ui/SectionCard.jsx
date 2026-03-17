import React from 'react';
import { Card, CardHeader, CardContent, Divider } from '@mui/material';

export default function SectionCard({ title, subtitle, action, padding = '24px', children, style = {} }) {
  return (
    <Card sx={{ mb: 3, ...style }}>
      {(title || action) && (
        <>
          <CardHeader
            title={title}
            subheader={subtitle}
            action={action}
            titleTypographyProps={{ variant: 'h6', fontWeight: 800, color: 'primary.main' }}
            subheaderTypographyProps={{ variant: 'body2', mt: 0.5 }}
            sx={{ p: 2.5, pb: subtitle ? 2 : 2.5 }}
          />
          <Divider sx={{ borderColor: 'rgba(26,35,126,0.07)' }} />
        </>
      )}
      <CardContent sx={{ p: padding, '&:last-child': { pb: padding } }}>
        {children}
      </CardContent>
    </Card>
  );
}
