import React, { useState } from 'react';
import { Box, Grid, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, Button } from '@mui/material';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';

import { IconButton, Tooltip } from '@mui/material';
import { useAllShops, useCreateShop, useEditShop, useAllMachines, useDeleteMachinery } from '../../../hooks/calendar.hooks';
import ShopModal from './Shop/ShopModal';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CreateMachineryModal from './Machinery/CreateMachineryModal';
import EditMachineryModal from './Machinery/EditMachineryModal';
import NERDeleteModal from '../../../components/NERDeleteModal';
import { useToast } from '../../../hooks/toasts.hooks';

const AdminToolsScheduleConfig: React.FC = () => {
  const { data: shops, isLoading: shopsLoading, isError: shopsError, error: shopsErrorMsg } = useAllShops();
  const { data: machines, isLoading: machinesLoading, isError: machinesError, error: machinesErrorMsg } = useAllMachines();
  const { mutateAsync: createShopMutate } = useCreateShop();

  const [editingShopId, setEditingShopId] = useState<string | undefined>();
  const editShopMutation = useEditShop(editingShopId ?? '');
  const [machineryToDelete, setMachineryToDelete] = useState<{
    machineryId: string;
    machineName: string;
  } | null>(null);
  const { mutateAsync: deleteMachinery } = useDeleteMachinery();
  const toast = useToast();

  const handleDeleteMachinery = async () => {
    if (!machineryToDelete) return;
    setMachineryToDelete(null);
    try {
      await deleteMachinery(machineryToDelete.machineryId);
      toast.success('Machinery deleted successfully');
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message, 3000);
      } else {
        toast.error('Failed to delete machinery', 3000);
      }
    }
  };

  const [openCreate, setOpenCreate] = useState(false);
  const [openCreateMachinery, setOpenCreateMachinery] = useState(false);
  const [editMachinery, setEditMachinery] = useState<{ machineryId: string; shopId: string } | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [editingShop, setEditingShop] = useState<any>(null);

  if (shopsLoading || machinesLoading) return <LoadingIndicator />;
  if (shopsError) return <ErrorPage message={(shopsErrorMsg as Error).message} />;
  if (machinesError) return <ErrorPage message={(machinesErrorMsg as Error).message} />;

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

        {/*Machinery Table */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, backgroundColor: 'transparent' }}>
            <Box display="flex" alignItems="center" flexDirection="row" justifyContent="space-between" mb={1}>
              <Typography variant="h6">Machinery</Typography>
              <Button variant="contained" onClick={() => setOpenCreateMachinery(true)}>
                Add Machine
              </Button>
            </Box>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Shop</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">
                    # of Machines
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, width: 160 }} align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!machines || !Array.isArray(machines) || machines.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No machinery yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  machines.flatMap(
                    (machine) =>
                      machine.shops?.map(
                        (shopMachinery: {
                          shopMachineryId: string;
                          quantity: number;
                          shop: { shopId: string; name: string };
                        }) => (
                          <TableRow key={`${machine.machineryId}-${shopMachinery.shopMachineryId}`} hover>
                            <TableCell>{machine.name}</TableCell>
                            <TableCell sx={{ whiteSpace: 'pre-wrap' }}>{shopMachinery.shop.name}</TableCell>
                            <TableCell sx={{ whiteSpace: 'pre-wrap' }} align="center">
                              {shopMachinery.quantity.toString()}
                            </TableCell>
                            <TableCell align="center">
                              <Box display="flex" gap={1} justifyContent="center">
                                <Tooltip title="Edit" arrow>
                                  <span>
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        setEditMachinery({
                                          machineryId: machine.machineryId,
                                          shopId: shopMachinery.shop.shopId
                                        })
                                      }
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </span>
                                </Tooltip>

                                <Tooltip title="Delete Machine" arrow>
                                  <span>
                                    <IconButton
                                      size="small"
                                      color="inherit"
                                      aria-label="delete machine"
                                      onClick={() =>
                                        setMachineryToDelete({
                                          machineryId: machine.machineryId,
                                          machineName: machine.name
                                        })
                                      }
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )
                      ) || []
                  )
                )}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>

      {/* Add Shop Modal */}
      <ShopModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSubmit={async ({ name, description }) => {
          const result = await createShopMutate({ name, description });
          setOpenCreate(false);
          return result;
        }}
      />

      {/* Create Machine Modal */}
      <CreateMachineryModal open={openCreateMachinery} onClose={() => setOpenCreateMachinery(false)} />

      {/* Edit Machine Modal */}
      {editMachinery &&
        machines &&
        (() => {
          const selectedMachine = machines.find((m) => m.machineryId === editMachinery.machineryId);
          if (!selectedMachine) return null;

          const selectedShopMachinery = selectedMachine.shops?.find(
            (sm: { shop: { shopId: string } }) => sm.shop.shopId === editMachinery.shopId
          );

          if (!selectedShopMachinery) return null;

          const machineryForEdit: typeof selectedMachine = {
            ...selectedMachine,
            shops: [selectedShopMachinery]
          };

          return <EditMachineryModal open={true} onClose={() => setEditMachinery(null)} machinery={machineryForEdit} />;
        })()}

      {/* Edit Shop Modal */}
      <ShopModal
        open={openEdit}
        onClose={() => {
          setOpenEdit(false);
          setEditingShop(null);
          setEditingShopId(undefined);
        }}
        initialValues={{
          name: editingShop?.name ?? '',
          description: editingShop?.description ?? ''
        }}
        onSubmit={async ({ name, description }) => {
          if (!editingShopId) return;
          await editShopMutation.mutateAsync({ name, description });
          setOpenEdit(false);
          setEditingShop(null);
          setEditingShopId(undefined);
        }}
      />

      {/* Delete Machinery Modal */}
      <NERDeleteModal
        open={!!machineryToDelete}
        onHide={() => setMachineryToDelete(null)}
        formId="delete-machinery-form"
        dataType={`machine ${machineryToDelete?.machineName || ''}`}
        onFormSubmit={handleDeleteMachinery}
      />
    </Box>
  );
};

export default AdminToolsScheduleConfig;
