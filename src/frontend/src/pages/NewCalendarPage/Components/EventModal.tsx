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
  wbsNumComparator,
  wbsPipe,
  EventType
} from 'shared';
import { useToast } from '../../../hooks/toasts.hooks';
import { useAllUsers } from '../../../hooks/users.hooks';
import { useAllWorkPackages } from '../../../hooks/work-packages.hooks';
import { useAllTeams } from '../../../hooks/teams.hooks';
import { userToAutocompleteOption } from '../../../utils/teams.utils';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
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
  startTime?: Date;
  endTime?: Date;
  allDay: boolean;
  recurrenceNumber: number;
  days: DayOfWeek[];
}

export interface EventRoutePayload {
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
  scheduleSlot: Array<{
    days: DayOfWeek[];
    startTime?: Date;
    endTime?: Date;
    recurrenceNumber: number;
    initialDateScheduled: Date;
    allDay: boolean;
  }>;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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
  startTime: yup.date().when('allDay', {
    is: false,
    then: (schema) => schema.required('Start time is required'),
    otherwise: (schema) => schema.optional()
  }),
  endTime: yup.date().when('allDay', {
    is: false,
    then: (schema) => schema.required('End time is required').min(yup.ref('startTime'), 'End time must be after start time'),
    otherwise: (schema) => schema.optional()
  }),
  allDay: yup.boolean().required(),
  recurrenceNumber: yup.number().min(1, 'Must be at least 1').required('Recurrence is required'),
  days: yup.array().of(yup.mixed<DayOfWeek>().required()).default([])
});

export interface BaseEventModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EventRoutePayload) => Promise<unknown> | unknown;
  initialValues?: Partial<EventFormValues>;
  eventTypes: EventType[];
  defaultDate?: Date;
}

const EventModal: React.FC<BaseEventModalProps> = ({
  open,
  onClose,
  onSubmit,
  initialValues,
  eventTypes,
  defaultDate = new Date()
}) => {
  const toast = useToast();
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [startTimePickerOpen, setStartTimePickerOpen] = useState(false);
  const [endTimePickerOpen, setEndTimePickerOpen] = useState(false);
  const [showRecurringOptions, setShowRecurringOptions] = useState(false);
  const [requiredMembers, setRequiredMembers] = useState<Array<{ id: string; label: string }>>([]);
  const [optionalMembers, setOptionalMembers] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedTeams, setSelectedTeams] = useState<Array<{ id: string; label: string }>>([]);

  const { isLoading: usersLoading, isError: usersError, error: usersErrorMsg, data: users } = useAllUsers();
  const {
    isLoading: workPackagesLoading,
    isError: workPackagesError,
    error: workPackagesErrorMsg,
    data: allWorkPackages
  } = useAllWorkPackages();
  const { isLoading: teamsLoading, isError: teamsError, error: teamsErrorMsg, data: teams } = useAllTeams();
  const {
    isLoading: teamTypesLoading,
    isError: teamTypesError,
    error: teamTypesErrorMsg,
    data: teamTypes
  } = useAllTeamTypes();

  const defaultFormData = useMemo(
    () => ({
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
      startTime: initialValues?.startTime,
      endTime: initialValues?.endTime,
      allDay: initialValues?.allDay ?? false,
      recurrenceNumber: initialValues?.recurrenceNumber ?? 1,
      days: initialValues?.days ?? []
    }),
    [initialValues, defaultDate]
  );

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

  const frozenValuesRef = React.useRef<Partial<EventFormValues>>(defaultFormData);

  useEffect(() => {
    if (open) {
      frozenValuesRef.current = defaultFormData;
      reset(defaultFormData);

      if (initialValues?.requiredMemberIds && users) {
        const reqMembers = users
          .filter((u) => initialValues.requiredMemberIds?.includes(u.userId))
          .map(userToAutocompleteOption);
        setRequiredMembers(reqMembers);
      }

      if (initialValues?.optionalMemberIds && users) {
        const optMembers = users
          .filter((u) => initialValues.optionalMemberIds?.includes(u.userId))
          .map(userToAutocompleteOption);
        setOptionalMembers(optMembers);
      }

      if (initialValues?.teamIds && teams) {
        const teamOptions = teams
          .filter((t) => initialValues.teamIds?.includes(t.teamId))
          .map((t) => ({ id: t.teamId, label: t.teamName }));
        setSelectedTeams(teamOptions);
      }
    } else {
      reset(defaultFormData);
      setRequiredMembers([]);
      setOptionalMembers([]);
      setSelectedTeams([]);
    }
  }, [open, defaultFormData, reset, initialValues, users, teams]);

  const selectedEventTypeId = watch('eventTypeId');
  const selectedEventType = useMemo(
    () => eventTypes.find((et) => et.eventTypeId === selectedEventTypeId),
    [eventTypes, selectedEventTypeId]
  );

  const documentFiles = watch('documentFiles');

  const isEditMode = !!frozenValuesRef.current.eventTypeId;
  const computedTitle = isEditMode ? 'Edit Event' : 'Add Event';

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

  const onFormSubmit = async (data: EventFormValues) => {
    try {
      const submitData: EventRoutePayload = {
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
        description: data.description,
        scheduleSlot: [
          {
            days: data.days,
            startTime: data.startTime,
            endTime: data.endTime,
            recurrenceNumber: data.recurrenceNumber,
            initialDateScheduled: data.scheduleDate,
            allDay: data.allDay
          }
        ]
      };

      await onSubmit(submitData);
      onClose();
      reset(defaultFormData);
      setRequiredMembers([]);
      setOptionalMembers([]);
      setSelectedTeams([]);
    } catch (e: unknown) {
      if (e instanceof Error) toast.error(e.message);
    }
  };

  if (usersError) return <ErrorPage error={usersErrorMsg} message={usersErrorMsg?.message} />;
  if (workPackagesError) return <ErrorPage error={workPackagesErrorMsg} message={workPackagesErrorMsg?.message} />;
  if (teamsError) return <ErrorPage error={teamsErrorMsg} message={teamsErrorMsg?.message} />;
  if (teamTypesError) return <ErrorPage error={teamTypesErrorMsg} message={teamTypesErrorMsg?.message} />;
  if (
    usersLoading ||
    workPackagesLoading ||
    teamsLoading ||
    teamTypesLoading ||
    !users ||
    !allWorkPackages ||
    !teams ||
    !teamTypes
  ) {
    return <LoadingIndicator />;
  }

  const memberOptions = users.map(userToAutocompleteOption);
  const teamOptions = teams.map((t) => ({ id: t.teamId, label: t.teamName }));

  const workPackageOptions = allWorkPackages
    .filter((wp) => wp.status === WbsElementStatus.Active)
    .map((wp) => ({
      label: wbsNamePipe(wp),
      id: wbsPipe(wp.wbsNum)
    }))
    .sort((a, b) => wbsNumComparator(b.id, a.id));

  return (
    <NERFormModal
      open={open}
      onHide={() => {
        onClose();
        reset(defaultFormData);
      }}
      title={computedTitle}
      reset={() => reset(defaultFormData)}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      formId="event-form"
      showCloseButton
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 500, p: 2 }}>
        {/* Title Input with red placeholder styling */}
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

        {/* Event Type Tabs */}
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          {eventTypes.map((et) => (
            <Controller
              key={et.eventTypeId}
              name="eventTypeId"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Button
                  onClick={() => onChange(et.eventTypeId)}
                  variant={value === et.eventTypeId ? 'contained' : 'outlined'}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    bgcolor: value === et.eventTypeId ? 'grey.600' : 'transparent',
                    color: value === et.eventTypeId ? 'white' : 'text.primary',
                    borderColor: 'grey.400',
                    '&:hover': {
                      bgcolor: value === et.eventTypeId ? 'grey.700' : 'grey.100'
                    }
                  }}
                >
                  {et.name}
                </Button>
              )}
            />
          ))}
        </Stack>

        {/* Date and Time Section */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                          onClick: () => setStartTimePickerOpen(true),
                          sx: { width: 100 }
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
                          onClick: () => setEndTimePickerOpen(true),
                          sx: { width: 100 }
                        }
                      }}
                    />
                  )}
                />
              </>
            )}

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

            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowRecurringOptions(!showRecurringOptions)}
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
          </Box>

          {/* Recurring Options */}
          {showRecurringOptions && (
            <Box sx={{ ml: 5, p: 2, bgcolor: 'grey.50', borderRadius: 2, border: '1px solid', borderColor: 'grey.300' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="body2" color="#000">
                  Repeat every
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
                          color: '#424242'
                        },
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: '#9e9e9e'
                          },
                          '&:hover fieldset': {
                            borderColor: '#757575'
                          }
                        }
                      }}
                      inputProps={{ min: 1 }}
                    />
                  )}
                />
                <Typography variant="body2" color="#000">
                  week(s)
                </Typography>
              </Box>

              <Typography variant="body2" fontWeight={500} mb={1} color="#000">
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
                    <Stack direction="row" spacing={1}>
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
                              bgcolor: isSelected ? 'primary.main' : 'transparent',
                              color: isSelected ? 'white' : '#000',
                              borderColor: '#9e9e9e',
                              '&:hover': {
                                bgcolor: isSelected ? 'primary.dark' : '#e0e0e0'
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
                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                  {errors.days.message}
                </Typography>
              )}

              <Box sx={{ mt: 2, p: 1.5, bgcolor: '#EF4345', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  <strong>Note:</strong> This event will repeat {watch('recurrenceNumber')} time(s){' '}
                  {watch('days').length > 0 && `on ${watch('days').join(', ')}`}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        {/* Required/Optional Members Section */}
        {(selectedEventType?.requiredMembers || selectedEventType?.optionalMembers) && (
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <PeopleIcon sx={{ color: 'text.secondary', mt: 1 }} />
            <Box sx={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
              {requiredMembers.map((member) => (
                <Chip
                  key={member.id}
                  label={member.label}
                  onDelete={() => setRequiredMembers((prev) => prev.filter((m) => m.id !== member.id))}
                  sx={{ bgcolor: 'grey.300' }}
                />
              ))}
              {optionalMembers.map((member) => (
                <Chip
                  key={member.id}
                  label={member.label}
                  onDelete={() => setOptionalMembers((prev) => prev.filter((m) => m.id !== member.id))}
                  sx={{ bgcolor: 'grey.200', opacity: 0.7 }}
                />
              ))}

              {selectedEventType?.requiredMembers && (
                <Autocomplete
                  options={memberOptions.filter((m) => !requiredMembers.find((rm) => rm.id === m.id))}
                  onChange={(_, newValue) => {
                    if (newValue) setRequiredMembers((prev) => [...prev, newValue]);
                  }}
                  getOptionLabel={(option) => option.label}
                  renderInput={(params) => (
                    <TextField {...params} variant="standard" placeholder="Add Member" sx={{ minWidth: 120 }} />
                  )}
                  sx={{ display: 'inline-flex', minWidth: 120 }}
                />
              )}

              {selectedEventType?.teams && (
                <Autocomplete
                  options={teamOptions.filter((t) => !selectedTeams.find((st) => st.id === t.id))}
                  onChange={(_, newValue) => {
                    if (newValue) setSelectedTeams((prev) => [...prev, newValue]);
                  }}
                  getOptionLabel={(option) => option.label}
                  renderInput={(params) => (
                    <TextField {...params} variant="standard" placeholder="Add Team" sx={{ minWidth: 120 }} />
                  )}
                  sx={{ display: 'inline-flex', minWidth: 120 }}
                />
              )}
            </Box>
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
                  helperText={errors.zoomLink?.message}
                  sx={{ flex: 1 }}
                />
              )}
            />
          </Box>
        )}

        {/* Work Packages */}
        {selectedEventType?.workPackage && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <WorkIcon sx={{ color: 'text.secondary' }} />
            <Controller
              name="workPackageIds"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Autocomplete
                  multiple
                  options={workPackageOptions}
                  value={workPackageOptions.filter((wp) => value?.includes(wp.id))}
                  onChange={(_, newValue) => onChange(newValue.map((v) => v.id))}
                  getOptionLabel={(option) => option.label}
                  renderInput={(params) => <TextField {...params} variant="standard" placeholder="Select Work Package" />}
                  sx={{ flex: 1 }}
                />
              )}
            />
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
                  {teamTypes.map((tt) => (
                    <MenuItem key={tt.teamTypeId} value={tt.teamTypeId}>
                      {tt.name}
                    </MenuItem>
                  ))}
                </Select>
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
                  placeholder="Add a description or attachment"
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
  );
};
export default EventModal;
