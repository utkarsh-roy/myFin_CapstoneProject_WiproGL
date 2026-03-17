import React, { useState } from 'react';
import { 
  TableContainer, Table, TableHead, TableBody, TableRow, TableCell, 
  TableSortLabel, Paper, CircularProgress, Box, Typography 
} from '@mui/material';

export default function DataTable({ columns = [], rows = [], keyField = 'id', emptyText = 'No data found.', loading = false }) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sorted = [...rows].sort((a, b) => {
    if (!sortKey) return 0;
    const av = a[sortKey], bv = b[sortKey];
    if (av == null) return 1; if (bv == null) return -1;
    return sortDir === 'asc'
      ? String(av).localeCompare(String(bv), undefined, { numeric: true })
      : String(bv).localeCompare(String(av), undefined, { numeric: true });
  });

  return (
    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid rgba(26,35,126,0.07)', borderRadius: 2 }}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead sx={{ bgcolor: 'background.default' }}>
          <TableRow>
            {columns.map(col => (
              <TableCell 
                key={col.key} 
                sortDirection={sortKey === col.key ? sortDir : false}
                sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.8px' }}
              >
                <TableSortLabel
                  active={sortKey === col.key}
                  direction={sortKey === col.key ? sortDir : 'asc'}
                  onClick={() => handleSort(col.key)}
                >
                  {col.label}
                </TableSortLabel>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                <CircularProgress size={32} />
              </TableCell>
            </TableRow>
          ) : sorted.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                <Typography variant="body2" color="text.secondary" fontStyle="italic">
                  {emptyText}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            sorted.map((row, i) => (
              <TableRow 
                hover 
                key={row[keyField] ?? i}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                {columns.map(col => (
                  <TableCell key={col.key} sx={{ py: 2 }}>
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
