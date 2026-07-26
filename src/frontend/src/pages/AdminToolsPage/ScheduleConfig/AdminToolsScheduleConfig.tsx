import React, { useState } from 'react';
import { Box, Grid, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, Button } from '@mui/material';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';

import { IconButton, Tooltip } from '@mui/material';
import {
  useAllShops,
  useAllMachines,
  useDeleteMachinery,
  useDeleteShop,
  useDeleteCalendar,
  useAllCalendars,
  useAllEventTypes,
  useDeleteEventType
} from '../../../hooks/calendar.hooks';
import CreateShopModal from './Shop/AddShopModal';
import EditShopModal from './Shop/EditShopModal';
import CreateCalendarModal from './Calendar/CreateCalendarModal';
import EditCalendarModal from './Calendar/EditCalendarModal';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CreateMachineryModal from './Machinery/CreateMachineryModal';
import EditMachineryModal from './Machinery/EditMachineryModal';
import CreateEventTypeModal from './EventType/CreateEventTypeModal';
import EditEventTypeModal from './EventType/EditEventTypeModal';
import { Shop, EventType, Calendar } from 'shared';
import { useToast } from '../../../hooks/toasts.hooks';
import NERDeleteModal from '../../../components/NERDeleteModal';

const AdminToolsScheduleConfig: React.FC = () => {
  const { data: shops, isLoading: shopsLoading, isError: shopsError, error: shopsErrorMsg } = useAllShops();
  const { data: machines, isLoading: machinesLoading, isError: machinesError, error: machinesErrorMsg } = useAllMachines();
  const {
    data: eventTypes,
    isLoading: eventTypesLoading,
    isError: eventTypesError,
    error: eventTypesErrorMsg
  } = useAllEventTypes();
  const {
    data: calendars,
    isLoading: calendarsLoading,
    isError: calendarsError,
    error: calendarsErrorMsg
  } = useAllCalendars();
  const [machineryToDelete, setMachineryToDelete] = useState<{
    machineryId: string;
    machineName: string;
  } | null>(null);
  const { mutateAsync: deleteMachinery } = useDeleteMachinery();
  const { mutateAsync: deleteShop } = useDeleteShop();
  const { mutateAsync: deleteCalendar } = useDeleteCalendar();
  const { mutateAsync: deleteEventType } = useDeleteEventType();
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

  const handleShopDelete = async () => {
    if (!shopToDelete) return;
    setShopToDelete(undefined);
    try {
      await deleteShop(shopToDelete.shopId);
      toast.success('Shop deleted successfully');
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message, 3000);
      } else {
        toast.error('Failed to delete shop', 3000);
      }
    }
  };

  const handleCalendarDelete = async () => {
    if (!calendarToDelete) return;
    setCalendarToDelete(undefined);
    try {
      await deleteCalendar(calendarToDelete.calendarId);
      toast.success('Calendar deleted successfully');
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message, 3000);
      } else {
        toast.error('Failed to delete calendar', 3000);
      }
    }
  };

  const handleEventTypeDelete = async () => {
    if (!eventTypeToDelete) return;
    setEventTypeToDelete(undefined);
    try {
      await deleteEventType(eventTypeToDelete.eventTypeId);
      toast.success('Event type deleted successfully');
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message, 3000);
      } else {
        toast.error('Failed to delete event type', 3000);
      }
    }
  };

  const [openCreate, setOpenCreate] = useState(false);
  const [openCreateMachinery, setOpenCreateMachinery] = useState(false);
  const [editMachineryId, setEditMachineryId] = useState<string | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [shopToDelete, setShopToDelete] = useState<Shop | undefined>(undefined);
  const [openCreateEventType, setOpenCreateEventType] = useState(false);
  const [editingEventType, setEditingEventType] = useState<EventType | null>(null);
  const [eventTypeToDelete, setEventTypeToDelete] = useState<EventType | undefined>(undefined);
  const [calendarToDelete, setCalendarToDelete] = useState<Calendar | undefined>(undefined);
  const [openCreateCalendar, setOpenCreateCalendar] = useState(false);
  const [openEditCalendar, setOpenEditCalendar] = useState(false);
  const [editingCalendar, setEditingCalendar] = useState<Calendar | undefined>(undefined);

  if (shopsLoading || machinesLoading || eventTypesLoading || calendarsLoading) return <LoadingIndicator />;
  if (shopsError) return <ErrorPage message={(shopsErrorMsg as Error).message} />;
  if (machinesError) return <ErrorPage message={(machinesErrorMsg as Error).message} />;
  if (eventTypesError) return <ErrorPage message={(eventTypesErrorMsg as Error).message} />;
  if (calendarsError) return <ErrorPage message={(calendarsErrorMsg as Error).message} />;

  return (
    <Box padding="5px">
      <Typography variant="h5" gutterBottom borderBottom={1} color="#ef4345" borderColor="white">
        Schedule
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, backgroundColor: 'transparent' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Typography variant="h6">Calendars</Typography>
              <Button
                variant="contained"
                onClick={() => {
                  setOpenCreateCalendar(true);
                }}
              >
                Add Calendar
              </Button>
            </Box>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">
                    Color
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">
                    New Member
                  </TableCell>
                  <TableCell sx={{ width: 100 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {!calendars || !Array.isArray(calendars) || calendars.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No calendars yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  calendars.map((calendar: Calendar) => (
                    <TableRow key={calendar.calendarId} hover>
                      <TableCell>{calendar.name}</TableCell>
                      <TableCell sx={{ whiteSpace: 'pre-wrap' }}>{calendar.description ?? '—'}</TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: 'inline-block',
                            width: 28,
                            height: 28,
                            borderRadius: 2,
                            border: '1px solid #ccc',
                            backgroundColor: calendar.color ?? '#EF4345'
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {calendar.isNewMemberCalendar && <CheckIcon fontSize="small" color="success" />}
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" gap={1} justifyContent="center">
                          <Tooltip title="Edit" arrow>
                            <span>
                              <IconButton
                                size="small"
                                aria-label="edit calendar"
                                onClick={() => {
                                  setEditingCalendar(calendar);
                                  setOpenEditCalendar(true);
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>

                          <Tooltip title="Delete" arrow>
                            <span>
                              <IconButton
                                size="small"
                                color="error"
                                aria-label="delete calendar"
                                onClick={() => setCalendarToDelete(calendar)}
                              >
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

        {/* Event Types Table */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, backgroundColor: 'transparent' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Typography variant="h6">Event Type</Typography>
              <Button variant="contained" onClick={() => setOpenCreateEventType(true)}>
                Add Event Type
              </Button>
            </Box>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: 160 }} align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!eventTypes || !Array.isArray(eventTypes) || eventTypes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} align="center">
                      No event types yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  eventTypes.map((eventType) => (
                    <TableRow key={eventType.eventTypeId} hover>
                      <TableCell>{eventType.name}</TableCell>
                      <TableCell align="center">
                        <Box display="flex" gap={1} justifyContent="center">
                          <Tooltip title="Edit" arrow>
                            <span>
                              <IconButton
                                size="small"
                                aria-label="edit event type"
                                onClick={() => {
                                  setEditingEventType(eventType);
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>

                          <Tooltip title="Delete" arrow>
                            <span>
                              <IconButton
                                size="small"
                                color="error"
                                aria-label="delete event type"
                                onClick={() => setEventTypeToDelete(eventType)}
                              >
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
                                  setOpenEdit(true);
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>

                          <Tooltip title="Delete" arrow>
                            <span>
                              <IconButton
                                size="small"
                                color="error"
                                aria-label="delete shop"
                                onClick={() => {
                                  setShopToDelete(shop);
                                }}
                              >
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
                                    <IconButton size="small" onClick={() => setEditMachineryId(machine.machineryId)}>
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

      {/* Delete Calendars Modal */}
      <NERDeleteModal
        open={!!calendarToDelete}
        onHide={() => setCalendarToDelete(undefined)}
        formId="delete-calendar-form"
        dataType={calendarToDelete?.name || ''}
        onFormSubmit={handleCalendarDelete}
      />

      {/* Create Calendar Modal */}
      <CreateCalendarModal open={openCreateCalendar} onClose={() => setOpenCreateCalendar(false)} />

      {/* Edit Calendar Modal */}
      {editingCalendar && (
        <EditCalendarModal
          open={openEditCalendar}
          onClose={() => {
            setOpenEditCalendar(false);
            setEditingCalendar(undefined);
          }}
          calendar={editingCalendar}
        />
      )}

      {/* Add Shop Modal */}
      <CreateShopModal open={openCreate} onClose={() => setOpenCreate(false)} />

      {/* Delete Shop Modal */}
      <NERDeleteModal
        open={!!shopToDelete}
        onHide={() => setShopToDelete(undefined)}
        formId="delete-shop-form"
        dataType={shopToDelete?.name || ''}
        onFormSubmit={handleShopDelete}
      />

      {/* Create Machine Modal */}
      <CreateMachineryModal open={openCreateMachinery} onClose={() => setOpenCreateMachinery(false)} />

      {/* Edit Machine Modal */}
      {editMachineryId &&
        machines &&
        (() => {
          const selectedMachine = machines.find((m) => m.machineryId === editMachineryId);
          if (!selectedMachine) return null;

          return <EditMachineryModal open={true} onClose={() => setEditMachineryId(null)} machinery={selectedMachine} />;
        })()}

      {/* Edit Shop Modal */}
      {editingShop && (
        <EditShopModal
          open={openEdit}
          onClose={() => {
            setOpenEdit(false);
            setEditingShop(null);
          }}
          shop={editingShop}
        />
      )}

      {/* Delete Machinery */}
      <NERDeleteModal
        open={!!machineryToDelete}
        onHide={() => setMachineryToDelete(null)}
        formId="delete-machinery-form"
        dataType={`machine ${machineryToDelete?.machineName || ''}`}
        onFormSubmit={handleDeleteMachinery}
      />

      {/* Create Event Type Modal */}
      <CreateEventTypeModal open={openCreateEventType} onClose={() => setOpenCreateEventType(false)} />

      {/* Edit Event Type Modal */}
      {editingEventType && (
        <EditEventTypeModal open={true} onClose={() => setEditingEventType(null)} eventType={editingEventType} />
      )}

      {/* Delete Event Type Modal */}
      <NERDeleteModal
        open={!!eventTypeToDelete}
        onHide={() => setEventTypeToDelete(undefined)}
        formId="delete-event-type-form"
        dataType={`event type "${eventTypeToDelete?.name || ''}"`}
        onFormSubmit={handleEventTypeDelete}
      />
    </Box>
  );
};

export default AdminToolsScheduleConfig;
