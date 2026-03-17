import React from 'react';
import { Card, Box, Typography } from '@mui/material';

export default function StatCard({ label, value, icon, color = '#00897B', trend, trendUp }) {
  return (
    <Card sx={{ 
      p: 3, 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 1.5,
      transition: 'box-shadow 0.2s, transform 0.2s',
      cursor: 'default',
      '&:hover': {
        boxShadow: '0 8px 28px rgba(26,35,126,0.13)',
        transform: 'translateY(-3px)'
      }
    }}>
      {/* Icon */}
      <Box sx={{
        width: 46, height: 46, borderRadius: 3,
        bgcolor: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '24px', color: color
      }}>
        {icon}
      </Box>

      {/* Value */}
      <Typography variant="h4" sx={{ 
        fontWeight: 900, color: 'primary.main', 
        letterSpacing: '-0.5px', lineHeight: 1 
      }}>
        {value}
      </Typography>

      {/* Label */}
      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
        {label}
      </Typography>

      {/* Trend (optional) */}
      {trend && (
        <Typography variant="caption" sx={{ 
          fontWeight: 600, 
          color: trendUp ? 'success.main' : 'error.main',
          display: 'flex', alignItems: 'center', gap: 0.5
        }}>
          {trendUp ? '▲' : '▼'} {trend}
        </Typography>
      )}
    </Card>
  );
}
