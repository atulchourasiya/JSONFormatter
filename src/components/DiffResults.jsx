
import React from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Typography,
} from '@mui/material';

const getValue = (item, keys) => {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(item, key)) {
      return item[key];
    }
  }

  return undefined;
};

const formatValue = (value) => {
  if (value === undefined) return '—';
  if (value === null) return 'null';

  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
};

const getChangeColor = (type) => {
  switch (type) {
    case 'added':
      return 'success';
    case 'removed':
      return 'error';
    case 'changed':
      return 'warning';
    case 'type-changed':
      return 'info';
    default:
      return 'default';
  }
};

export default function DiffResults({ differences = [] }) {
  if (!differences.length) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="success.main">
          Both JSON documents are identical.
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer
      component={Paper}
      sx={{ mt: 2, maxHeight: 650, borderRadius: 2 }}
    >
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>JSON Path</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Old Value</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>New Value</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {differences.map((item, index) => {
            const oldValue = getValue(item, [
              'oldValue',
              'old',
              'before',
              'left',
              'originalValue',
              'previousValue',
            ]);

            const newValue = getValue(item, [
              'newValue',
              'new',
              'after',
              'right',
              'modifiedValue',
              'currentValue',
            ]);

            return (
              <TableRow
                key={`${item.path || item.key || index}-${index}`}
                hover
              >
                <TableCell sx={{ verticalAlign: 'top' }}>
                  <Chip
                    label={item.type || item.status || 'changed'}
                    color={getChangeColor(item.type || item.status)}
                    size="small"
                  />
                </TableCell>

                <TableCell
                  sx={{
                    fontFamily: 'monospace',
                    verticalAlign: 'top',
                    minWidth: 200,
                    overflowWrap: 'anywhere',
                  }}
                >
                  {item.path || item.key || '/'}
                </TableCell>

                <TableCell
                  sx={{
                    verticalAlign: 'top',
                    minWidth: 220,
                    maxWidth: 400,
                  }}
                >
                  <Box
                    component="pre"
                    sx={{
                      m: 0,
                      whiteSpace: 'pre-wrap',
                      overflowWrap: 'anywhere',
                      fontFamily: 'monospace',
                      fontSize: 13,
                      color: 'error.main',
                    }}
                  >
                    {formatValue(oldValue)}
                  </Box>
                </TableCell>

                <TableCell
                  sx={{
                    verticalAlign: 'top',
                    minWidth: 220,
                    maxWidth: 400,
                  }}
                >
                  <Box
                    component="pre"
                    sx={{
                      m: 0,
                      whiteSpace: 'pre-wrap',
                      overflowWrap: 'anywhere',
                      fontFamily: 'monospace',
                      fontSize: 13,
                      color: 'success.main',
                    }}
                  >
                    {formatValue(newValue)}
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
