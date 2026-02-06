import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  FormControl,
  FormHelperText,
  MenuItem,
  Select,
  TextField,
  Typography,
  Autocomplete,
  Chip,
  IconButton,
  Button,
  Stack,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  DayOfWeek,
  EventDocumentUploadArgs,
  WbsElementStatus,
  wbsNamePipe,
  EventType,
  isHead,
  MAX_FILE_SIZE,
  getNextSevenDays,
  getDay
} from 'shared';
import { useToast } from '../../../hooks/toasts.hooks';
import { useAllUsers, useCurrentUser } from '../../../hooks/users.hooks';
import { useAllWorkPackagesPreview } from '../../../hooks/work-packages.hooks';
import { useAllTeamPreviews } from '../../../hooks/teams.hooks';
import { userToAutocompleteOption } from '../../../utils/teams.utils';
import ErrorPage from '../../ErrorPage';
import NERFormModal from '../../../components/NERFormModal';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VideocamIcon from '@mui/icons-material/Videocam';
import WorkIcon from '@mui/icons-material/Work';
import DescriptionIcon from '@mui/icons-material/Description';
import BusinessIcon from '@mui/icons-material/Business';
import { useAllTeamTypes } from '../../../hooks/team-types.hooks';
import { ClearIcon } from '@mui/x-date-pickers';
import { useAllMachines, useAllShops, usePreviewScheduleSlotRecurringEdits } from '../../../hooks/calendar.hooks';
import StoreIcon from '@mui/icons-material/Store';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Tooltip from '@mui/material/Tooltip';
import { convertDayToInt, convertIntToDay } from '../../../utils/calendar.utils';
import EditSeriesConfirmationModal from './EditSeriesConfirmationModal';

export interface EventFormValues {
  title: string;
  eventTypeId: string;
  requiredMemberIds: string[];
  optionalMemberIds: string[];
  teamIds: string[];
  teamTypeId?: string;
  location?: string;
  zoomLink?: string;
  shopIds: string[];
  machineryIds: string[];
  workPackageIds: string[];
  documentFiles: EventDocumentUploadArgs[];
  questionDocumentLink?: string;
  description?: string;
  scheduleDate: Date;
  startTime: Date;
  endTime: Date;
  allDay: boolean;
  recurrenceNumber: number;
  days: DayOfWeek[];
  selectedScheduleSlotId?: string;
}

export interface EventPayload {
  title: string;
  eventTypeId: string;
  requiredMemberIds: string[];
  optionalMemberIds: string[];
  teamIds: string[];
  teamTypeId?: string;
  location?: string;
  zoomLink?: string;
  shopIds: string[];
  machineryIds: string[];
  workPackageIds: string[];
  documentFiles: EventDocumentUploadArgs[];
  questionDocumentLink?: string;
  description?: string;
  // If the event type requires confirmation, only intialDateScheduled will be populated. If not,
  // scheduleSlots will be populated based on if the event is being editted or created
  initialDateScheduled?: Date;
  createScheduleSlotArgs?: {
    startTime: Date;
    endTime: Date;
    days: DayOfWeek[];
    recurrenceNumber: number;
    allDay: boolean;
  };
  // For editing, only single schedule slots can be editted (and optionally propogated)
  editScheduleSlotArgs?: {
    scheduleSlotId: string;
    newStartTime: Date;
    newEndTime: Date;
    newAllDay: boolean;
    editAllInSeries: boolean;
  };
}

const schema = yup.object().shape({
  title: yup.string().required('Title is required'),
  eventTypeId: yup.string().required('Event Type is required'),
  requiredMemberIds: yup.array().of(yup.string().required()).default([]),
  optionalMemberIds: yup.array().of(yup.string().required()).default([]),
  teamIds: yup.array().of(yup.string().required()).default([]),
  teamTypeId: yup.string().optional(),
  location: yup.string().optional(),
  zoomLink: yup.string().url('Must be a valid URL').optional(),
  shopIds: yup.array().of(yup.string().required()).default([]),
  machineryIds: yup.array().of(yup.string().required()).default([]),
  workPackageIds: yup.array().of(yup.string().required()).default([]),
  documentFiles: yup.array().of(yup.mixed<EventDocumentUploadArgs>().required()).default([]),
  questionDocumentLink: yup.string().optional(),
  description: yup.string().optional(),
  scheduleDate: yup.date().required('Date is required'),
  startTime: yup.date().required('Start time is required'),
  endTime: yup
    .date()
    .required('End time is required')
    .test('is-after-start', 'End time must be after start time', function (value) {
      const { startTime } = this.parent;
      if (!value || !startTime) return true;
      return new Date(value).getTime() >= new Date(startTime).getTime();
    }),
  allDay: yup.boolean().required(),
  recurrenceNumber: yup.number().min(0).required('Recurrence is required'),
  days: yup.array().of(yup.mixed<DayOfWeek>().required()).default([]),
  selectedScheduleSlotId: yup.string().optional()
});

export interface BaseEventModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EventPayload) => Promise<unknown> | unknown;
  initialValues?: Partial<EventFormValues>;
  eventTypes: EventType[];
  defaultDate?: Date;
  eventId?: string; // Required for edit mode to fetch preview of affected schedule slots
}

/**
 * Checks if the time has changed between initial values and current form data.
 * Compares the combined date (from scheduleDate) and time (from startTime/endTime).
 */
const hasTimeChanged = (initialValues: Partial<EventFormValues> | undefined, currentData: EventFormValues): boolean => {
  if (!initialValues?.startTime || !initialValues?.endTime || !initialValues?.scheduleDate) return false;

  // Combine scheduleDate with time portions for comparison (matches how we send to backend)
  const currentCombinedStart = new Date(currentData.scheduleDate);
  currentCombinedStart.setHours(
    currentData.startTime.getHours(),
    currentData.startTime.getMinutes(),
    currentData.startTime.getSeconds(),
    currentData.startTime.getMilliseconds()
  );

  const currentCombinedEnd = new Date(currentData.scheduleDate);
  currentCombinedEnd.setHours(
    currentData.endTime.getHours(),
    currentData.endTime.getMinutes(),
    currentData.endTime.getSeconds(),
    currentData.endTime.getMilliseconds()
  );

  const originalStartTime = new Date(initialValues.startTime).getTime();
  const originalEndTime = new Date(initialValues.endTime).getTime();

  return (
    originalStartTime !== currentCombinedStart.getTime() ||
    originalEndTime !== currentCombinedEnd.getTime() ||
    initialValues.allDay !== currentData.allDay
  );
};

/**
 * Calculate default start and end times based on current time.
 * Start time is the current hour (rounded up), end time is 1 hour later.
 */
const getDefaultTimes = (): { startTime: Date; endTime: Date } => {
  const startTime = new Date();
  startTime.setMinutes(0, 0, 0);
  startTime.setHours(startTime.getHours() + 1); // Default to next hour;

  const endTime = new Date(startTime);
  endTime.setHours(endTime.getHours() + 1); // Default to 1 hour duration

  return { startTime, endTime };
};

const EventModal: React.FC<BaseEventModalProps> = ({
  open,
  onClose,
  onSubmit,
  initialValues,
  eventTypes,
  defaultDate = new Date(),
  eventId
}) => {
  const toast = useToast();
  const user = useCurrentUser();
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [startTimePickerOpen, setStartTimePickerOpen] = useState(false);
  const [endTimePickerOpen, setEndTimePickerOpen] = useState(false);
  const [showRecurringOptions, setShowRecurringOptions] = useState(false);
  const [requiredMembers, setRequiredMembers] = useState<Array<{ id: string; label: string }>>([]);
  const [optionalMembers, setOptionalMembers] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedTeams, setSelectedTeams] = useState<Array<{ id: string; label: string }>>([]);
  const [requiredMemberInput, setRequiredMemberInput] = useState('');
  const [optionalMemberInput, setOptionalMemberInput] = useState('');
  const [teamInput, setTeamInput] = useState('');

  // State for the series confirmation modal (only used in edit mode when time changes)
  const [showSeriesConfirmModal, setShowSeriesConfirmModal] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<EventPayload | null>(null);
  const [pendingFormData, setPendingFormData] = useState<EventFormValues | null>(null);

  // Fetch preview of other schedule slots that would be affected when editing with "edit all in series"
  const isEditMode = !!initialValues;
  const scheduleSlotId = initialValues?.selectedScheduleSlotId;
  const { data: affectedSlots = [] } = usePreviewScheduleSlotRecurringEdits(
    eventId ?? '',
    scheduleSlotId ?? '',
    isEditMode && !!eventId && !!scheduleSlotId
  );

  // Lazy load all data needed for the form so users can start filling out instantly
  const { isLoading: usersLoading, isError: usersError, error: usersErrorMsg, data: users } = useAllUsers();
  const { isLoading: shopsLoading, isError: shopsError, error: shopsErrorMsg, data: shops } = useAllShops();
  const { isError: machineryError, error: machineryErrorMsg, data: machinery } = useAllMachines();
  const {
    isLoading: workPackagesLoading,
    isError: workPackagesError,
    error: workPackagesErrorMsg,
    data: allWorkPackages
  } = useAllWorkPackagesPreview();
  const { isLoading: teamsLoading, isError: teamsError, error: teamsErrorMsg, data: teams } = useAllTeamPreviews();
  const { isError: teamTypesError, error: teamTypesErrorMsg, data: teamTypes } = useAllTeamTypes();

  // Compute default form values - memo ensures stable reference
  const defaultFormData = useMemo(() => {
    const defaultTimes = getDefaultTimes();
    return {
      title: initialValues?.title ?? '',
      eventTypeId: initialValues?.eventTypeId ?? '',
      requiredMemberIds: initialValues?.requiredMemberIds ?? [],
      optionalMemberIds: initialValues?.optionalMemberIds ?? [],
      teamIds: initialValues?.teamIds ?? [],
      teamTypeId: initialValues?.teamTypeId,
      location: initialValues?.location,
      zoomLink: initialValues?.zoomLink,
      shopIds: initialValues?.shopIds ?? [],
      machineryIds: initialValues?.machineryIds ?? [],
      workPackageIds: initialValues?.workPackageIds ?? [],
      documentFiles: initialValues?.documentFiles ?? [],
      questionDocumentLink: initialValues?.questionDocumentLink,
      description: initialValues?.description,
      scheduleDate: initialValues?.scheduleDate ?? defaultDate,
      startTime: initialValues?.startTime ?? defaultTimes.startTime,
      endTime: initialValues?.endTime ?? defaultTimes.endTime,
      allDay: initialValues?.allDay ?? false,
      recurrenceNumber: 0,
      days: [],
      selectedScheduleSlotId: initialValues?.selectedScheduleSlotId
    };
  }, [initialValues, defaultDate]);

  const allowedEventTypes = useMemo(() => {
    return eventTypes.filter((et) => {
      if (!et.onlyHeadsOrAboveForEventCreation) return true;
      return isHead(user.role);
    });
  }, [eventTypes, user]);

  const {
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<EventFormValues>({
    resolver: yupResolver(schema),
    defaultValues: defaultFormData
  });

  const shopIds = watch('shopIds');
  const selectedEventTypeId = watch('eventTypeId');
  const documentFiles = watch('documentFiles');

  const selectedEventType = useMemo(
    () => allowedEventTypes.find((et) => et.eventTypeId === selectedEventTypeId),
    [allowedEventTypes, selectedEventTypeId]
  );

  // Filter machinery based on selected shops
  const filteredMachineryOptions = useMemo(() => {
    if (!machinery || !shops) {
      return [];
    }

    const allMachineryOptions = machinery.map((m) => ({ id: m.machineryId, label: m.name }));

    if (shopIds.length === 0) {
      return allMachineryOptions;
    }

    return allMachineryOptions.filter((machineOption) => {
      const machine = machinery.find((m) => m.machineryId === machineOption.id);
      if (!machine) return false;

      return machine.shops.some((shopMachinery) => shopIds.includes(shopMachinery.shop.shopId));
    });
  }, [machinery, shops, shopIds]);

  // Initialize autocomplete states when data loads - runs only on mount or when dependencies change
  useEffect(() => {
    // Set autocomplete state for required members
    if (initialValues?.requiredMemberIds && users) {
      const reqMembers = users
        .filter((u) => initialValues.requiredMemberIds?.includes(u.userId))
        .map(userToAutocompleteOption);
      setRequiredMembers(reqMembers);
    }

    // Set autocomplete state for optional members
    if (initialValues?.optionalMemberIds && users) {
      const optMembers = users
        .filter((u) => initialValues.optionalMemberIds?.includes(u.userId))
        .map(userToAutocompleteOption);
      setOptionalMembers(optMembers);
    }

    // Set autocomplete state for teams
    if (initialValues?.teamIds && teams) {
      const teamOptions = teams
        .filter((t) => initialValues.teamIds?.includes(t.teamId))
        .map((t) => ({ id: t.teamId, label: t.teamName }));
      setSelectedTeams(teamOptions);
    }

    // Set recurring options visibility
    if (initialValues?.days && initialValues.days.length > 0) {
      setShowRecurringOptions(true);
    }
  }, [initialValues, users, teams]);

  const computedTitle = isEditMode ? 'Edit Event' : 'Add Event';

  // Handle recurring dropdown toggle
  const handleRecurringToggle = () => {
    if (showRecurringOptions) {
      // Closing the dropdown - reset to 0
      setValue('recurrenceNumber', 0);
      setValue('days', []);
    } else {
      // Opening the dropdown - set to 1
      setValue('recurrenceNumber', 1);
      const startDate = watch('scheduleDate') ?? new Date();
      setValue('days', [convertIntToDay(getDay(startDate))]);
    }
    setShowRecurringOptions(!showRecurringOptions);
  };

  // Handle event type change
  const handleEventTypeChange = (newEventTypeId: string) => {
    const newEventType = allowedEventTypes.find((et) => et.eventTypeId === newEventTypeId);

    const selectedDate = watch('scheduleDate');

    // If switching to a confirmation event type, clear time-related fields
    if (newEventType?.requiresConfirmation) {
      setValue('startTime', selectedDate);
      setValue('endTime', selectedDate);
      setValue('allDay', false);
      setValue('recurrenceNumber', 0);
      setValue('days', []);
      setShowRecurringOptions(false);
    }

    // Update the event type
    setValue('eventTypeId', newEventTypeId);
  };

  // Calculate the last occurrence date for recurring events
  const calculateLastOccurrenceDate = () => {
    const recurrenceNum = watch('recurrenceNumber');
    const startDate = watch('scheduleDate');
    const selectedDays = watch('days');

    if (!recurrenceNum || recurrenceNum === 0 || selectedDays.length === 0) return null;

    // Convert to day indices (0 = Sunday, 1 = Monday, etc.)
    const dayIndices: number[] = selectedDays.map(convertDayToInt).sort((a, b) => a - b);

    // Start from the initial date
    const currentDate = new Date(startDate);
    let occurrencesFound = 0;
    let lastOccurrenceDate = currentDate;

    // Find all occurrences
    const searchDate = new Date(currentDate);

    // Search for up to a year (52 weeks * 7 days = 364 days)
    const maxDaysToSearch = 365;
    let daysSearched = 0;

    while (occurrencesFound < recurrenceNum && daysSearched < maxDaysToSearch) {
      const currentDayIndex = searchDate.getDay();

      if (dayIndices.includes(currentDayIndex)) {
        occurrencesFound++;
        lastOccurrenceDate = new Date(searchDate);

        if (occurrencesFound >= recurrenceNum) {
          break;
        }
      }

      searchDate.setDate(searchDate.getDate() + 1);
      daysSearched++;
    }

    return lastOccurrenceDate;
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleDocumentRemove = (index: number) => {
    const currentFiles = watch('documentFiles');
    setValue(
      'documentFiles',
      currentFiles.filter((_, i) => i !== index)
    );
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const currentFiles = watch('documentFiles');
      [...e.target.files].forEach((file) => {
        if (file.size >= MAX_FILE_SIZE) {
          toast.error(`Error uploading ${file.name}; file must be less than ${MAX_FILE_SIZE / 1024 / 1024} MB`, 5000);
        } else {
          setValue('documentFiles', [
            ...currentFiles,
            {
              file,
              name: file.name,
              googleFileId: ''
            }
          ]);
        }
      });
      // Clear input so same file can be uploaded again if needed
      e.target.value = '';
    }
  };

  /**
   * Builds the payload from form data
   */
  const buildPayload = (data: EventFormValues, editAllInSeries: boolean = false): EventPayload => {
    const requiresConfirmation = selectedEventType?.requiresConfirmation ?? false;

    const payload: EventPayload = {
      title: data.title,
      eventTypeId: data.eventTypeId,
      requiredMemberIds: requiredMembers.map((m) => m.id),
      optionalMemberIds: optionalMembers.map((m) => m.id),
      teamIds: selectedTeams.map((t) => t.id),
      teamTypeId: data.teamTypeId,
      location: data.location,
      zoomLink: data.zoomLink,
      shopIds: data.shopIds,
      machineryIds: data.machineryIds,
      workPackageIds: data.workPackageIds,
      documentFiles: data.documentFiles,
      questionDocumentLink: data.questionDocumentLink,
      description: data.description
    };

    // If the event requires confirmation, only populate initialDateScheduled
    if (requiresConfirmation) {
      payload.initialDateScheduled = data.scheduleDate;
    } else if (isEditMode && data.selectedScheduleSlotId) {
      // For edit mode, populate editScheduleSlotArgs
      // Combine scheduleDate (date portion) with startTime/endTime (time portion)
      const combinedStartTime = new Date(data.scheduleDate);
      combinedStartTime.setHours(
        data.startTime.getHours(),
        data.startTime.getMinutes(),
        data.startTime.getSeconds(),
        data.startTime.getMilliseconds()
      );

      const combinedEndTime = new Date(data.scheduleDate);
      combinedEndTime.setHours(
        data.endTime.getHours(),
        data.endTime.getMinutes(),
        data.endTime.getSeconds(),
        data.endTime.getMilliseconds()
      );

      payload.editScheduleSlotArgs = {
        scheduleSlotId: data.selectedScheduleSlotId,
        newStartTime: combinedStartTime,
        newEndTime: combinedEndTime,
        newAllDay: data.allDay,
        editAllInSeries
      };
    } else if (!isEditMode) {
      // For create mode, populate createScheduleSlotArgs
      // Combine scheduleDate (date portion) with startTime/endTime (time portion)
      const combinedStartTime = new Date(data.scheduleDate);
      combinedStartTime.setHours(
        data.startTime.getHours(),
        data.startTime.getMinutes(),
        data.startTime.getSeconds(),
        data.startTime.getMilliseconds()
      );

      const combinedEndTime = new Date(data.scheduleDate);
      combinedEndTime.setHours(
        data.endTime.getHours(),
        data.endTime.getMinutes(),
        data.endTime.getSeconds(),
        data.endTime.getMilliseconds()
      );

      payload.createScheduleSlotArgs = {
        startTime: combinedStartTime,
        endTime: combinedEndTime,
        days: data.days.length > 0 ? data.days : [convertIntToDay(data.scheduleDate.getDay())],
        recurrenceNumber: data.recurrenceNumber > 0 ? data.recurrenceNumber : 1,
        allDay: data.allDay
      };
    }

    return payload;
  };

  const onFormSubmit = async (data: EventFormValues) => {
    // In edit mode, check if time has changed AND there are other affected slots
    // Only show the confirmation modal if there are other slots that would be affected
    if (isEditMode && data.selectedScheduleSlotId && hasTimeChanged(initialValues, data) && affectedSlots.length > 0) {
      const payload = buildPayload(data, false);
      setPendingPayload(payload);
      setPendingFormData(data);
      setShowSeriesConfirmModal(true);
      // Return early - form stays open, confirmation modal will handle submission
      return;
    }

    // No time change, not in edit mode, or no other affected slots - submit directly
    const payload = buildPayload(data, false);
    await onSubmit(payload);
    handleClose();
  };

  /**
   * Handles confirmation from the series confirmation modal
   */
  const handleSeriesConfirmation = async (editAllInSeries: boolean) => {
    if (!pendingPayload) return;

    // Update the payload with the user's choice
    const updatedPayload: EventPayload = {
      ...pendingPayload,
      editScheduleSlotArgs: pendingPayload.editScheduleSlotArgs
        ? {
            ...pendingPayload.editScheduleSlotArgs,
            editAllInSeries
          }
        : undefined
    };

    setShowSeriesConfirmModal(false);
    setPendingPayload(null);
    setPendingFormData(null);

    await onSubmit(updatedPayload);
    handleClose();
  };

  /**
   * Handles cancellation of the series confirmation modal
   */
  const handleSeriesCancelConfirmation = () => {
    setShowSeriesConfirmModal(false);
    setPendingPayload(null);
    setPendingFormData(null);
    // Form stays open with user's changes preserved
  };

  // When data loads from endpoint, update the options for the autocomplete fields
  const memberOptions = useMemo(() => {
    if (usersLoading || !users) return [{ id: 'loading', label: 'Loading users...' }];
    return users.map(userToAutocompleteOption);
  }, [users, usersLoading]);

  const teamOptions = useMemo(() => {
    if (teamsLoading || !teams) return [{ id: 'loading', label: 'Loading teams...' }];
    return teams.map((t) => ({ id: t.teamId, label: t.teamName }));
  }, [teams, teamsLoading]);

  const shopOptions = useMemo(() => {
    if (shopsLoading || !shops) return [{ id: 'loading', label: 'Loading shops...' }];
    return shops.map((s) => ({ id: s.shopId, label: s.name }));
  }, [shops, shopsLoading]);

  if (usersError) return <ErrorPage error={usersErrorMsg} message={usersErrorMsg?.message} />;
  if (workPackagesError) return <ErrorPage error={workPackagesErrorMsg} message={workPackagesErrorMsg?.message} />;
  if (teamsError) return <ErrorPage error={teamsErrorMsg} message={teamsErrorMsg?.message} />;
  if (teamTypesError) return <ErrorPage error={teamTypesErrorMsg} message={teamTypesErrorMsg?.message} />;
  if (shopsError) return <ErrorPage error={shopsErrorMsg} message={shopsErrorMsg?.message} />;
  if (machineryError) return <ErrorPage error={machineryErrorMsg} message={machineryErrorMsg?.message} />;

  const workPackageOptions = workPackagesLoading
    ? [{ id: 'loading', label: 'Loading work packages...' }]
    : (allWorkPackages || [])
        .filter((wp) => wp.status === WbsElementStatus.Active)
        .map((wp) => ({
          label: wbsNamePipe(wp),
          id: wp.id,
          wbsNum: wp.wbsNum
        }))
        .sort((a, b) => {
          if (a.wbsNum.carNumber !== b.wbsNum.carNumber) return b.wbsNum.carNumber - a.wbsNum.carNumber;
          if (a.wbsNum.projectNumber !== b.wbsNum.projectNumber) return b.wbsNum.projectNumber - a.wbsNum.projectNumber;
          return b.wbsNum.workPackageNumber - a.wbsNum.workPackageNumber;
        });

  return (
    <>
      <EditSeriesConfirmationModal
        open={showSeriesConfirmModal}
        onCancel={handleSeriesCancelConfirmation}
        onConfirm={handleSeriesConfirmation}
        affectedSlots={affectedSlots}
        originalStartTime={initialValues?.startTime}
        originalEndTime={initialValues?.endTime}
        newStartTime={pendingFormData?.startTime}
        newEndTime={pendingFormData?.endTime}
      />
      <NERFormModal
        open={open}
        onHide={handleClose}
        title={computedTitle}
        reset={() => {}}
        handleUseFormSubmit={handleSubmit}
        onFormSubmit={onFormSubmit}
        formId="event-form"
        showCloseButton
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 500, p: 2 }}>
          {/* Title Input with red placeholder styling */}
          <FormControl fullWidth>
            <Controller
              name="title"
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextField
                  value={value}
                  onChange={onChange}
                  placeholder="Add Title"
                  variant="standard"
                  fullWidth
                  error={!!errors.title}
                  sx={{
                    '& .MuiInput-input': {
                      fontSize: '2rem',
                      fontWeight: 500,
                      color: value ? 'text.primary' : '#ef5350',
                      '&::placeholder': {
                        color: '#ef5350',
                        opacity: 0.7
                      }
                    }
                  }}
                />
              )}
            />
            <FormHelperText error>{errors.title?.message}</FormHelperText>
          </FormControl>
          {/* Event Type Tabs */}
          <FormControl fullWidth>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              {allowedEventTypes.map((et) => {
                const isSelected = watch('eventTypeId') === et.eventTypeId;
                // In edit mode, disable all buttons except the selected one
                const isDisabled = isEditMode && !isSelected;
                return (
                  <Button
                    key={et.eventTypeId}
                    onClick={() => handleEventTypeChange(et.eventTypeId)}
                    disabled={isDisabled}
                    variant={isSelected ? 'contained' : 'outlined'}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      bgcolor: isSelected ? 'grey.600' : 'transparent',
                      color: isSelected ? 'white' : 'text.primary',
                      borderColor: 'grey.400',
                      '&:hover': {
                        bgcolor: isSelected ? 'grey.700' : 'grey.100'
                      },
                      '&.Mui-disabled': {
                        bgcolor: 'transparent',
                        color: 'text.disabled',
                        borderColor: 'grey.700',
                        opacity: 0.5
                      }
                    }}
                  >
                    {et.name}
                  </Button>
                );
              })}
            </Stack>
            <FormHelperText error>{errors.eventTypeId?.message}</FormHelperText>
          </FormControl>
          {/* Date and Time Section - Only show when event type is selected */}
          {selectedEventType && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {selectedEventType.requiresConfirmation ? (
                <Box>
                  {/* Header with info tooltip */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Tooltip
                      title="This event type requires confirmation, so users will provide their availability for the following week. Once confirmed, the event will be scheduled for a specific time within this date range."
                      arrow
                      placement="top"
                    >
                      <HelpOutlineIcon sx={{ fontSize: 18, color: 'grey.400', cursor: 'help' }} />
                    </Tooltip>
                    <Typography variant="body2" color="white" fontWeight={500}>
                      To be scheduled within:
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <CalendarTodayIcon sx={{ color: 'text.secondary' }} />
                    <Controller
                      name="scheduleDate"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <DatePicker
                          value={value}
                          disabled={!!initialValues?.selectedScheduleSlotId}
                          open={datePickerOpen}
                          onClose={() => setDatePickerOpen(false)}
                          onOpen={() => setDatePickerOpen(true)}
                          onChange={(newValue) => onChange(newValue ?? defaultDate)}
                          slotProps={{
                            textField: {
                              variant: 'standard',
                              error: !!errors.scheduleDate,
                              onClick: () => setDatePickerOpen(true),
                              sx: { minWidth: 150 }
                            },
                            day: {
                              sx: {
                                '&.Mui-selected': {
                                  backgroundColor: '#EF4345 !important',
                                  '&:hover': {
                                    backgroundColor: '#d32f2f !important'
                                  },
                                  '&:focus': {
                                    backgroundColor: '#EF4345 !important'
                                  }
                                }
                              }
                            }
                          }}
                        />
                      )}
                    />
                    <ArrowForwardIcon sx={{ color: 'text.secondary' }} />
                    <Controller
                      name="scheduleDate"
                      control={control}
                      render={({ field: { value } }) => {
                        const weekDates = getNextSevenDays(value);
                        const endDate = weekDates.at(-1);
                        return (
                          <DatePicker
                            value={endDate}
                            disabled
                            slotProps={{
                              textField: {
                                variant: 'standard',
                                sx: { minWidth: 150 }
                              },
                              day: {
                                sx: {
                                  '&.Mui-selected': {
                                    backgroundColor: '#EF4345 !important'
                                  }
                                }
                              }
                            }}
                          />
                        );
                      }}
                    />
                  </Box>
                </Box>
              ) : (
                /* Normal Event Type - Full date/time selection */
                <>
                  {/* Date and Time Row */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <CalendarTodayIcon sx={{ color: 'text.secondary' }} />
                    <Controller
                      name="scheduleDate"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <DatePicker
                          value={value}
                          open={datePickerOpen}
                          onClose={() => setDatePickerOpen(false)}
                          onOpen={() => setDatePickerOpen(true)}
                          onChange={(newValue) => onChange(newValue ?? defaultDate)}
                          slotProps={{
                            textField: {
                              variant: 'standard',
                              error: !!errors.scheduleDate,
                              onClick: () => setDatePickerOpen(true),
                              sx: { minWidth: 150 }
                            },
                            day: {
                              sx: {
                                '&.Mui-selected': {
                                  backgroundColor: '#EF4345 !important',
                                  '&:hover': {
                                    backgroundColor: '#d32f2f !important'
                                  },
                                  '&:focus': {
                                    backgroundColor: '#EF4345 !important'
                                  }
                                }
                              }
                            }
                          }}
                        />
                      )}
                    />

                    {!watch('allDay') && (
                      <>
                        <Controller
                          name="startTime"
                          control={control}
                          render={({ field: { onChange, value } }) => (
                            <TimePicker
                              value={value}
                              open={startTimePickerOpen}
                              onClose={() => setStartTimePickerOpen(false)}
                              onOpen={() => setStartTimePickerOpen(true)}
                              onChange={(newValue) => onChange(newValue)}
                              slotProps={{
                                textField: {
                                  variant: 'standard',
                                  error: !!errors.startTime,
                                  helperText: errors.startTime?.message,
                                  onClick: () => setStartTimePickerOpen(true),
                                  sx: { width: 100 }
                                },
                                layout: {
                                  sx: {
                                    '& .MuiPickersLayout-contentWrapper .MuiClock-pin': {
                                      backgroundColor: '#EF4345'
                                    },
                                    '& .MuiPickersLayout-contentWrapper .MuiClockPointer-root': {
                                      backgroundColor: '#EF4345'
                                    },
                                    '& .MuiPickersLayout-contentWrapper .MuiClockPointer-thumb': {
                                      backgroundColor: '#EF4345',
                                      borderColor: '#EF4345'
                                    },
                                    '& .MuiPickersLayout-contentWrapper .MuiClockNumber-root.Mui-selected': {
                                      backgroundColor: '#EF4345 !important'
                                    },
                                    '& .MuiPickersLayout-contentWrapper .MuiPickersArrowSwitcher-button.Mui-selected': {
                                      backgroundColor: '#EF4345 !important',
                                      color: 'white'
                                    },
                                    '& .MuiMultiSectionDigitalClock-root .MuiMenuItem-root.Mui-selected': {
                                      backgroundColor: '#EF4345 !important',
                                      color: 'white'
                                    }
                                  }
                                }
                              }}
                            />
                          )}
                        />
                        <Typography>-</Typography>
                        <Controller
                          name="endTime"
                          control={control}
                          render={({ field: { onChange, value } }) => (
                            <TimePicker
                              value={value}
                              open={endTimePickerOpen}
                              onClose={() => setEndTimePickerOpen(false)}
                              onOpen={() => setEndTimePickerOpen(true)}
                              onChange={(newValue) => onChange(newValue)}
                              slotProps={{
                                textField: {
                                  variant: 'standard',
                                  error: !!errors.endTime,
                                  helperText: errors.endTime?.message,
                                  onClick: () => setEndTimePickerOpen(true),
                                  sx: { width: 100 }
                                },
                                layout: {
                                  sx: {
                                    '& .MuiPickersLayout-contentWrapper .MuiClock-pin': {
                                      backgroundColor: '#EF4345'
                                    },
                                    '& .MuiPickersLayout-contentWrapper .MuiClockPointer-root': {
                                      backgroundColor: '#EF4345'
                                    },
                                    '& .MuiPickersLayout-contentWrapper .MuiClockPointer-thumb': {
                                      backgroundColor: '#EF4345',
                                      borderColor: '#EF4345'
                                    },
                                    '& .MuiPickersLayout-contentWrapper .MuiClockNumber-root.Mui-selected': {
                                      backgroundColor: '#EF4345 !important'
                                    },
                                    '& .MuiPickersLayout-contentWrapper .MuiPickersArrowSwitcher-button.Mui-selected': {
                                      backgroundColor: '#EF4345 !important',
                                      color: 'white'
                                    },
                                    '& .MuiMultiSectionDigitalClock-root .MuiMenuItem-root.Mui-selected': {
                                      backgroundColor: '#EF4345 !important',
                                      color: 'white'
                                    }
                                  }
                                }
                              }}
                            />
                          )}
                        />
                      </>
                    )}
                  </Box>

                  {/* All Day and Recurring Row */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 5 }}>
                    <Controller
                      name="allDay"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <FormControlLabel
                          control={<Checkbox checked={value} onChange={(e) => onChange(e.target.checked)} />}
                          label="All Day"
                        />
                      )}
                    />

                    {/* Hide recurring options when editing */}
                    {!isEditMode && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleRecurringToggle}
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          borderColor: 'grey.400',
                          color: 'text.primary',
                          bgcolor: showRecurringOptions || watch('days').length > 0 ? 'grey.400' : 'transparent'
                        }}
                      >
                        Recurring ▼
                      </Button>
                    )}
                  </Box>

                  {/* Recurring Options */}
                  {showRecurringOptions && (
                    <Box
                      sx={{
                        ml: 5,
                        p: 2,
                        bgcolor: 'rgba(0, 0, 0, 0.04)',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'grey.300'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Typography variant="body2" color="text.primary">
                          Repeat
                        </Typography>
                        <Controller
                          name="recurrenceNumber"
                          control={control}
                          render={({ field: { onChange, value } }) => (
                            <TextField
                              type="number"
                              value={value}
                              onChange={onChange}
                              size="small"
                              sx={{
                                width: 80,
                                '& .MuiInputBase-input': {
                                  color: 'text.primary'
                                },
                                '& .MuiOutlinedInput-root': {
                                  '& fieldset': {
                                    borderColor: 'grey.400'
                                  },
                                  '&:hover fieldset': {
                                    borderColor: 'grey.600'
                                  }
                                }
                              }}
                              inputProps={{ min: 1 }}
                            />
                          )}
                        />
                        <Typography variant="body2" color="text.primary">
                          more time(s)
                        </Typography>
                      </Box>

                      <Typography variant="body2" fontWeight={500} mb={1} color="text.primary">
                        Repeat on:
                      </Typography>
                      <Controller
                        name="days"
                        control={control}
                        render={({ field: { onChange, value } }) => {
                          const weekDays: DayOfWeek[] = [
                            DayOfWeek.SUNDAY,
                            DayOfWeek.MONDAY,
                            DayOfWeek.TUESDAY,
                            DayOfWeek.WEDNESDAY,
                            DayOfWeek.THURSDAY,
                            DayOfWeek.FRIDAY,
                            DayOfWeek.SATURDAY
                          ];
                          const dayLabels = ['S', 'M', 'T', 'W', 'TH', 'F', 'S'];

                          const toggleDay = (day: DayOfWeek) => {
                            const currentDays = value || [];
                            if (currentDays.includes(day)) {
                              onChange(currentDays.filter((d) => d !== day));
                            } else {
                              onChange([...currentDays, day]);
                            }
                          };

                          return (
                            <Stack direction="row" spacing={1} mb={2}>
                              {weekDays.map((day, index) => {
                                const isSelected = (value || []).includes(day);
                                return (
                                  <Button
                                    key={day}
                                    onClick={() => toggleDay(day)}
                                    variant={isSelected ? 'contained' : 'outlined'}
                                    sx={{
                                      minWidth: 40,
                                      width: 40,
                                      height: 40,
                                      borderRadius: '50%',
                                      p: 0,
                                      bgcolor: isSelected ? '#EF4345' : 'transparent',
                                      color: isSelected ? 'white' : 'text.primary',
                                      borderColor: 'grey.400',
                                      '&:hover': {
                                        bgcolor: isSelected ? '#d32f2f' : 'rgba(0, 0, 0, 0.08)'
                                      }
                                    }}
                                  >
                                    {dayLabels[index]}
                                  </Button>
                                );
                              })}
                            </Stack>
                          );
                        }}
                      />

                      {errors.days && (
                        <Typography variant="caption" color="error" sx={{ display: 'block', mb: 2 }}>
                          {errors.days.message}
                        </Typography>
                      )}

                      {/* Last Occurrence Info */}
                      {watch('recurrenceNumber') > 0 && watch('days').length > 0 ? (
                        <Box
                          sx={{
                            p: 1.5,
                            bgcolor: 'rgba(239, 67, 69, 0.08)',
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'rgba(239, 67, 69, 0.2)'
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            <strong>Last occurrence:</strong>{' '}
                            {calculateLastOccurrenceDate()?.toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          {watch('days').length === 0
                            ? 'Select at least one day to see the last occurrence date.'
                            : "Select the number of times you'd like this event to recur."}
                        </Typography>
                      )}
                    </Box>
                  )}
                </>
              )}
            </Box>
          )}
          {/* Required Members Section */}
          {selectedEventType?.requiredMembers && (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <PeopleIcon sx={{ color: 'text.secondary', mt: 1 }} />
              <Box sx={{ flex: 1, width: '100%' }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                    {requiredMembers.map((member) => (
                      <Chip
                        key={member.id}
                        label={member.label}
                        onDelete={() => setRequiredMembers((prev) => prev.filter((m) => m.id !== member.id))}
                        sx={{ bgcolor: 'grey.700' }}
                      />
                    ))}
                    <Autocomplete
                      options={memberOptions.filter((m) => !requiredMembers.find((rm) => rm.id === m.id))}
                      value={null}
                      inputValue={requiredMemberInput}
                      onInputChange={(_, newInputValue, reason) => {
                        setRequiredMemberInput(reason === 'input' ? newInputValue : '');
                      }}
                      onChange={(_, newValue) => {
                        if (newValue) {
                          setRequiredMembers((prev) => [...prev, newValue]);
                          setRequiredMemberInput('');
                        }
                      }}
                      getOptionLabel={(option) => option.label}
                      renderInput={(params) => (
                        <TextField {...params} variant="standard" placeholder="Add Required Member" sx={{ minWidth: 150 }} />
                      )}
                      sx={{ flex: 1, minWidth: 150 }}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
          {/* Optional Members Section */}
          {selectedEventType?.optionalMembers && (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <PeopleIcon sx={{ color: 'text.secondary', mt: 1, opacity: 0.7 }} />
              <Box sx={{ flex: 1, width: '100%' }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                    {optionalMembers.map((member) => (
                      <Chip
                        key={member.id}
                        label={member.label}
                        onDelete={() => setOptionalMembers((prev) => prev.filter((m) => m.id !== member.id))}
                        sx={{ bgcolor: 'grey.700', opacity: 0.7 }}
                      />
                    ))}
                    <Autocomplete
                      options={memberOptions.filter((m) => !optionalMembers.find((om) => om.id === m.id))}
                      value={null}
                      inputValue={optionalMemberInput}
                      onInputChange={(_, newInputValue, reason) => {
                        setOptionalMemberInput(reason === 'input' ? newInputValue : '');
                      }}
                      onChange={(_, newValue) => {
                        if (newValue) {
                          setOptionalMembers((prev) => [...prev, newValue]);
                          setOptionalMemberInput('');
                        }
                      }}
                      getOptionLabel={(option) => option.label}
                      renderInput={(params) => (
                        <TextField {...params} variant="standard" placeholder="Add Optional Member" sx={{ minWidth: 150 }} />
                      )}
                      sx={{ flex: 1, minWidth: 150 }}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
          {/* Teams Section */}
          {selectedEventType?.teams && (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <BusinessIcon sx={{ color: 'text.secondary', mt: 1 }} />
              <Box sx={{ flex: 1, width: '100%' }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                    {selectedTeams.map((team) => (
                      <Chip
                        key={team.id}
                        label={team.label}
                        onDelete={() => setSelectedTeams((prev) => prev.filter((t) => t.id !== team.id))}
                        sx={{ bgcolor: 'grey.700', opacity: 0.7 }}
                      />
                    ))}
                    <Autocomplete
                      options={teamOptions.filter((t) => !selectedTeams.find((st) => st.id === t.id))}
                      value={null}
                      inputValue={teamInput}
                      onInputChange={(_, newInputValue, reason) => {
                        setTeamInput(reason === 'input' ? newInputValue : '');
                      }}
                      onChange={(_, newValue) => {
                        if (newValue) {
                          setSelectedTeams((prev) => [...prev, newValue]);
                          setTeamInput('');
                        }
                      }}
                      getOptionLabel={(option) => option.label}
                      renderInput={(params) => (
                        <TextField {...params} variant="standard" placeholder="Add Team" sx={{ minWidth: 120 }} />
                      )}
                      sx={{ flex: 1, minWidth: 150 }}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
          {/* Team Type */}
          {selectedEventType?.teamType && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <BusinessIcon sx={{ color: 'text.secondary' }} />
              <Controller
                name="teamTypeId"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Select
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    variant="standard"
                    displayEmpty
                    sx={{ flex: 1 }}
                  >
                    <MenuItem value="">
                      <em>Select Team Type</em>
                    </MenuItem>
                    {teamTypes?.map((tt) => (
                      <MenuItem key={tt.teamTypeId} value={tt.teamTypeId}>
                        {tt.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </Box>
          )}
          {/* Location */}
          {selectedEventType?.location && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <LocationOnIcon sx={{ color: 'text.secondary' }} />
              <Controller
                name="location"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TextField
                    value={value || ''}
                    onChange={onChange}
                    placeholder="Location"
                    variant="standard"
                    fullWidth
                    sx={{ flex: 1 }}
                  />
                )}
              />
            </Box>
          )}
          {/* Zoom Link */}
          {selectedEventType?.zoomLink && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <VideocamIcon sx={{ color: 'text.secondary' }} />
              <FormControl fullWidth sx={{ flex: 1 }}>
                <Controller
                  name="zoomLink"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <TextField
                      value={value || ''}
                      onChange={onChange}
                      placeholder="Zoom Link"
                      variant="standard"
                      fullWidth
                      error={!!errors.zoomLink}
                    />
                  )}
                />
                <FormHelperText error>{errors.zoomLink?.message}</FormHelperText>
              </FormControl>
            </Box>
          )}
          {selectedEventType?.shop && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <StoreIcon sx={{ color: 'text.secondary' }} />
                <Controller
                  name="shopIds"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Autocomplete
                      options={shopOptions ? shopOptions : []}
                      value={shopOptions?.find((s) => value?.[0] === s.id) || null}
                      onChange={(_, newValue) => onChange(newValue ? [newValue.id] : [])}
                      getOptionLabel={(option) => option.label}
                      renderInput={(params) => <TextField {...params} variant="standard" placeholder="Select Shop" />}
                      sx={{ flex: 1 }}
                    />
                  )}
                />
              </Box>
              {shopIds.length > 0 && (
                <Box sx={{ ml: 5 }}>
                  {(() => {
                    const shop = shops?.find((s) => s.shopId === shopIds[0]);
                    if (!shop || !shop.description) return null;
                    return (
                      <Box
                        sx={{
                          p: 1.5,
                          bgcolor: 'rgba(239, 67, 69, 0.1)',
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'rgba(239, 67, 69, 0.3)'
                        }}
                      >
                        <Typography variant="caption" fontWeight={600} color="#EF4345">
                          Reserve on Robin:
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          {shop.description}
                        </Typography>
                      </Box>
                    );
                  })()}
                </Box>
              )}
            </Box>
          )}
          {selectedEventType?.machinery && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <PrecisionManufacturingIcon sx={{ color: 'text.secondary' }} />
              <Controller
                name="machineryIds"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Autocomplete
                    options={filteredMachineryOptions}
                    value={filteredMachineryOptions.find((m) => value?.[0] === m.id) || null}
                    onChange={(_, newValue) => onChange(newValue ? [newValue.id] : [])}
                    getOptionLabel={(option) => option.label}
                    renderInput={(params) => <TextField {...params} variant="standard" placeholder="Select Machinery" />}
                    sx={{ flex: 1 }}
                  />
                )}
              />
            </Box>
          )}
          {selectedEventType?.workPackage && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <WorkIcon sx={{ color: 'text.secondary' }} />
              <Controller
                name="workPackageIds"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Autocomplete
                    options={workPackageOptions}
                    value={workPackageOptions.find((wp) => value?.[0] === wp.id) || null}
                    onChange={(_, newValue) => {
                      if (newValue?.id !== 'loading') {
                        onChange(newValue ? [newValue.id] : []);
                      }
                    }}
                    getOptionLabel={(option) => option.label}
                    getOptionDisabled={(option) => option.id === 'loading'}
                    renderInput={(params) => <TextField {...params} variant="standard" placeholder="Select Work Package" />}
                    sx={{ flex: 1 }}
                  />
                )}
              />
            </Box>
          )}
          {/* Question Document Link */}
          {selectedEventType?.questionDocument && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <DescriptionIcon sx={{ color: 'text.secondary' }} />
              <Controller
                name="questionDocumentLink"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TextField
                    value={value || ''}
                    onChange={onChange}
                    placeholder="Question Document Link"
                    variant="standard"
                    fullWidth
                    error={!!errors.questionDocumentLink}
                    helperText={errors.questionDocumentLink?.message}
                    sx={{ flex: 1 }}
                  />
                )}
              />
            </Box>
          )}
          {/* Documents */}
          {selectedEventType?.documents && (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <DescriptionIcon sx={{ color: 'text.secondary', mt: 1 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" fontWeight={600} mb={1}>
                  Documents
                </Typography>
                <FormControl fullWidth>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {documentFiles.map((docFile, index) => (
                      <li key={index}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: '#4c4c4c',
                            borderRadius: '20px',
                            padding: '2px 0px 2px 10px',
                            marginBottom: '3px'
                          }}
                        >
                          <Typography
                            sx={{
                              marginBottom: '4px',
                              fontSize: 'medium'
                            }}
                          >
                            {docFile.name}
                          </Typography>
                          <IconButton
                            onClick={() => handleDocumentRemove(index)}
                            sx={{
                              padding: '0px',
                              marginLeft: '2px'
                            }}
                          >
                            <ClearIcon
                              sx={{
                                color: 'grey',
                                transform: 'scale(0.7)'
                              }}
                            />
                          </IconButton>
                        </Stack>
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant="contained"
                    color="success"
                    component="label"
                    sx={{
                      width: 'fit-content',
                      textTransform: 'none',
                      color: 'white',
                      marginTop: documentFiles.length > 0 ? '10px' : '0'
                    }}
                  >
                    Upload
                    <input
                      onChange={handleDocumentUpload}
                      type="file"
                      accept="image/png, image/jpeg, application/pdf"
                      name="documentFiles"
                      multiple
                      hidden
                    />
                  </Button>
                  <FormHelperText error>{errors.documentFiles?.message}</FormHelperText>
                </FormControl>
              </Box>
            </Box>
          )}
          {/* Description */}
          {selectedEventType?.description && (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <BusinessIcon sx={{ color: 'text.secondary', mt: 1 }} />
              <Controller
                name="description"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TextField
                    value={value || ''}
                    onChange={onChange}
                    placeholder="Add a description"
                    variant="standard"
                    fullWidth
                    multiline
                    rows={3}
                    sx={{ flex: 1 }}
                  />
                )}
              />
            </Box>
          )}
        </Box>
      </NERFormModal>
    </>
  );
};
export default EventModal;
