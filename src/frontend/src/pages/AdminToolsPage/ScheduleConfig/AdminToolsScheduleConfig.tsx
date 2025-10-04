// src/layouts/pages/admintoolspage/AdminToolsScheduleConfig.tsx
import React, { useState } from 'react';
import { Box, Grid, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, Button } from '@mui/material';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { useShops, useCreateShop } from '../../../hooks/calendar.hooks';
import CreateShopModal from './CreateShopModal';

const AdminToolsScheduleConfig: React.FC = () => {
  const { data: shops, isLoading, isError, error } = useShops();
  const createShop = useCreateShop();

  const [openCreate, setOpenCreate] = useState(false);

  if (isError) return <ErrorPage error={error as Error} />;
  if (isLoading || !shops) return <LoadingIndicator />;

  return (
    <Box padding="5px">
      {/* top page header*/}
      <Typography variant="h5" gutterBottom borderBottom={1} color="#ef4345" borderColor="white">
        Schedule
      </Typography>

      <Grid container spacing={2}>
        {/* Top-left (placeholder) */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, backgroundColor: 'transparent' }}>
            <Typography variant="h6" gutterBottom>
              Calendars
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ...
            </Typography>
          </Paper>
        </Grid>

        {/* Top-right (placeholder) */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, backgroundColor: 'transparent' }}>
            <Typography variant="h6" gutterBottom>
              Event Types
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ...
            </Typography>
          </Paper>
        </Grid>

        {/* Shops table */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, backgroundColor: 'transparent' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Typography variant="h6">Shops</Typography>
              <Button variant="contained" onClick={() => setOpenCreate(true)}>
                Add Shop
              </Button>
            </Box>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: 160 }} align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {shops.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      No shops yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  shops.map((shop) => (
                    <TableRow key={shop.shopId} hover>
                      <TableCell>{shop.name}</TableCell>
                      <TableCell sx={{ whiteSpace: 'pre-wrap' }}>{shop.description ?? '—'}</TableCell>
                      <TableCell align="center">
                        <Box display="flex" gap={1} justifyContent="center">
                          <Button size="small" variant="outlined" disabled>
                            Edit
                          </Button>
                          <Button size="small" variant="outlined" color="error" disabled>
                            Delete
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        {/* Bottom-right (placeholder) */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, backgroundColor: 'transparent' }}>
            <Typography variant="h6" gutterBottom>
              Machinery
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ...
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Create Shop Modal */}
      <CreateShopModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSubmit={async ({ name, description }) => {
          await createShop.mutateAsync({ name, description });
          setOpenCreate(false);
        }}
      />
    </Box>
  );
};

export default AdminToolsScheduleConfig;
