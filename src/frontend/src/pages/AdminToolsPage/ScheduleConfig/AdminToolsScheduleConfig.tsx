import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { useAllShops, useCreateShop, useEditShop } from '../../../hooks/calendar.hooks';
import ShopModal from './ShopModal';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const AdminToolsScheduleConfig: React.FC = () => {
  const { data: shops, isLoading, isError, error } = useAllShops();
  const { mutateAsync: createShopMutate } = useCreateShop();

  const [editingShopId, setEditingShopId] = useState<string | null>(null);
  const editShopMutation = useEditShop(editingShopId ?? '');

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editingShop, setEditingShop] = useState<any>(null);

  if (isLoading) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={(error as Error).message} />;

  return (
    <Box padding="5px">
      <Typography variant="h5" gutterBottom borderBottom={1} color="#ef4345" borderColor="white">
        Schedule
      </Typography>

      <Grid container spacing={2}>
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

        {/* Shops Table */}
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
                {!shops || shops.length === 0 ? (
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
                          <Tooltip title="Edit" arrow>
                            <span>
                              <IconButton
                                size="small"
                                aria-label="edit shop"
                                onClick={() => {
                                  setEditingShop(shop);
                                  setEditingShopId(shop.shopId);
                                  setOpenEdit(true);
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>

                          <Tooltip title="Delete" arrow>
                            <span>
                              <IconButton size="small" color="error" disabled aria-label="delete shop">
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

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

      {/* Add Shop Modal */}
      <ShopModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        title="Add Shop"
        initialValues={{ name: '', description: '' }}
        onSubmit={async ({ name, description }) => {
          await createShopMutate({ name, description });
          setOpenCreate(false);
        }}
      />

      {/* Edit Shop Modal */}
      <ShopModal
        open={openEdit}
        onClose={() => {
          setOpenEdit(false);
          setEditingShop(null);
          setEditingShopId(null);
        }}
        title="Edit Shop"
        initialValues={{
          name: editingShop?.name ?? '',
          description: editingShop?.description ?? ''
        }}
        onSubmit={async ({ name, description }) => {
          if (!editingShopId) return;
          await editShopMutation.mutateAsync({ name, description });
          setOpenEdit(false);
          setEditingShop(null);
          setEditingShopId(null);
        }}
      />
    </Box>
  );
};

export default AdminToolsScheduleConfig;
