import React, { useState } from 'react';
import { Box, Grid, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, Button } from '@mui/material';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import {
  useAllShops,
  useAllMachines,
  useCreateShop,
  useCreateMachinery,
  useEditMachinery
} from '../../../hooks/calendar.hooks';
import CreateShopModal from './Shop/CreateShopModal';
import { IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CreateMachineryModal from './Machinery/CreateMachineryModal';
import { EditMachineryModal } from './Machinery/EditMachineryModal';

const AdminToolsScheduleConfig: React.FC = () => {
  const { data: shops, isLoading: shopsLoading, isError: shopsError, error: shopsErrorMsg } = useAllShops();
  const { data: machines, isLoading: machinesLoading, isError: machinesError, error: machinesErrorMsg } = useAllMachines();
  const { mutateAsync: createShopMutate } = useCreateShop();
  const { mutateAsync: createMachineryMutate } = useCreateMachinery();
  const { mutateAsync: editMachineryMutate } = useEditMachinery();

  const [openCreate, setOpenCreate] = useState(false);
  const [openCreateMachinery, setOpenCreateMachinery] = useState(false);
  const [editMachineryId, setEditMachineryId] = useState<string | null>(null);

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
                              <IconButton size="small" disabled aria-label="edit shop">
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
                  machines.map((machine) => {
                    let shopName = '—';
                    let machineQuantity = '—';
                    if (machine.shops && machine.shops.length > 0) {
                      shopName = machine.shops[0].shop.name;
                      machineQuantity = machine.shops[0].quantity.toString();
                    }

                    return (
                      <TableRow key={machine.machineryId} hover>
                        <TableCell>{machine.name}</TableCell>
                        <TableCell sx={{ whiteSpace: 'pre-wrap' }}>{shopName}</TableCell>
                        <TableCell sx={{ whiteSpace: 'pre-wrap' }} align="center">
                          {machineQuantity}
                        </TableCell>
                        <TableCell align="center">
                          <Box display="flex" gap={1} justifyContent="center">
                            <Tooltip title="Edit" arrow>
                              <span>
                                <IconButton size="small" onClick={() => setEditMachineryId(machine.machineryId)}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>

                            <Tooltip title="Delete" arrow>
                              <span>
                                <IconButton size="small" color="error" disabled aria-label="delete machine">
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>

      {/* Create Shop Modal */}
      <CreateShopModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSubmit={async ({ name, description }) => {
          const result = await createShopMutate({ name, description });
          setOpenCreate(false);
          return result;
        }}
      />

      {/* Create Machine Modal */}
      <CreateMachineryModal
        open={openCreateMachinery}
        onClose={() => setOpenCreateMachinery(false)}
        onSubmit={async ({ shopId, machineName, quantity }) => {
          const result = await createMachineryMutate({ name: machineName, shopId, quantity });
          setOpenCreateMachinery(false);
          return result;
        }}
      />

      {/* Edit Machine Modal */}
      {editMachineryId &&
        machines &&
        (() => {
          const selectedMachine = machines.find((m) => m.machineryId === editMachineryId);
          if (!selectedMachine) return null;

          return (
            <EditMachineryModal
              open={true}
              onClose={() => setEditMachineryId(null)}
              initialValues={{
                machineName: selectedMachine.name,
                shopId: selectedMachine.shops?.[0]?.shop?.shopId || '',
                quantity: selectedMachine.shops?.[0]?.quantity || 1
              }}
              onSubmit={async ({ machineName, shopId, quantity }) => {
                // Closes the edit modal while updating the machinery so there's no flicker of input values
                const machineryId = editMachineryId;
                setEditMachineryId(null);
                return await editMachineryMutate({ machineryId, name: machineName, shopId, quantity });
              }}
            />
          );
        })()}
    </Box>
  );
};

export default AdminToolsScheduleConfig;
