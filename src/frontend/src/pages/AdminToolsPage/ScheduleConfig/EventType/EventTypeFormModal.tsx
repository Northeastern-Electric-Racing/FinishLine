import { Box, FormHelperText, Typography, Checkbox, FormControl, Select, MenuItem } from '@mui/material';
import NERFormModal from '../../../../components/NERFormModal';
import ReactHookTextField from '../../../../components/ReactHookTextField';
import { useToast } from '../../../../hooks/toasts.hooks';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { EventType } from 'shared';
import useFormPersist from 'react-hook-form-persist';
import { FormStorageKey } from '../../../../utils/form';
import { useAllCalendars } from '../../../../hooks/calendar.hooks';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VideocamIcon from '@mui/icons-material/Videocam';
import BuildIcon from '@mui/icons-material/Build';
import InventoryIcon from '@mui/icons-material/Inventory';
import DescriptionIcon from '@mui/icons-material/Description';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';

export interface EventTypeFormValues {
  name: string;
  calendarIds: string[];
  initialDateScheduled: boolean;
  allDay: boolean;
  recurring: boolean;
  requiredMembers: boolean;
  optionalMembers: boolean;
  teams: boolean;
  teamType: boolean;
  location: boolean;
  zoomLink: boolean;
  shop: boolean;
  machinery: boolean;
  workPackage: boolean;
  questionDocument: boolean;
  documents: boolean;
  description: boolean;
  onlyHeadsOrAbove: boolean;
  requiresConfirmation: boolean;
  sendSlackNotifications: boolean;
}

const eventTypeSchema = yup.object({
  name: yup.string().required('Event Type name is required'),
  calendarIds: yup.array().of(yup.string()).required(),
  initialDateScheduled: yup.boolean().required(),
  allDay: yup.boolean().required(),
  recurring: yup.boolean().required(),
  requiredMembers: yup.boolean().required(),
  optionalMembers: yup.boolean().required(),
  teams: yup.boolean().required(),
  teamType: yup.boolean().required(),
  location: yup.boolean().required(),
  zoomLink: yup.boolean().required(),
  shop: yup.boolean().required(),
  machinery: yup.boolean().required(),
  workPackage: yup.boolean().required(),
  questionDocument: yup.boolean().required(),
  documents: yup.boolean().required(),
  description: yup.boolean().required(),
  onlyHeadsOrAbove: yup.boolean().required(),
  requiresConfirmation: yup.boolean().required(),
  sendSlackNotifications: yup.boolean().required()
});

interface EventTypeFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EventTypeFormValues) => Promise<EventType>;
  initialValues?: EventTypeFormValues;
}

export const EventTypeFormModal: React.FC<EventTypeFormModalProps> = ({ open, onClose, onSubmit, initialValues }) => {
  const toast = useToast();
  const { data: calendars } = useAllCalendars();

  const defaultValues: EventTypeFormValues = {
    name: '',
    calendarIds: [],
    initialDateScheduled: true,
    allDay: false,
    recurring: false,
    requiredMembers: false,
    optionalMembers: true,
    teams: false,
    teamType: false,
    location: true,
    zoomLink: true,
    shop: false,
    machinery: false,
    workPackage: false,
    questionDocument: false,
    documents: false,
    description: true,
    onlyHeadsOrAbove: false,
    requiresConfirmation: false,
    sendSlackNotifications: false
  };

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
    watch,
    setValue
  } = useForm<EventTypeFormValues>({
    resolver: yupResolver(eventTypeSchema) as any,
    defaultValues: initialValues || defaultValues
  });

  const formStorageKey = initialValues ? FormStorageKey.EDIT_EVENT_TYPE : FormStorageKey.CREATE_EVENT_TYPE;

  useFormPersist(formStorageKey, {
    watch,
    setValue
  });

  const onFormSubmit = async (data: EventTypeFormValues) => {
    try {
      await onSubmit(data);
      onClose();
      if (!initialValues) {
        reset(defaultValues);
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message);
      } else {
        toast.error('An error occurred while saving the event type');
      }
    }
  };

  const handleCancel = () => {
    reset(defaultValues);
    sessionStorage.removeItem(formStorageKey);
    onClose();
  };

  return (
    <NERFormModal
      open={open}
      onHide={handleCancel}
      title={initialValues ? 'Edit Event Type' : 'Add Event Type'}
      reset={() => reset(initialValues || defaultValues)}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      formId={initialValues ? 'edit-event-type-form' : 'create-event-type-form'}
      showCloseButton
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: 600, p: 2 }}>
        {/* Add New Event Type Input */}
        <Box
          sx={{
            borderBottom: '1px solid white',
            pb: 0.5,
            mb: 1
          }}
        >
          <ReactHookTextField
            name="name"
            control={control}
            placeholder="Add New Event Type"
            fullWidth
            sx={{
              backgroundColor: 'transparent',
              '& .MuiInputBase-input': {
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                padding: 0,
                '&::placeholder': {
                  color: 'rgba(255, 255, 255, 0.5)',
                  opacity: 1
                }
              },
              '& .MuiInput-underline:before': {
                borderBottom: 'none'
              },
              '& .MuiInput-underline:after': {
                borderBottom: 'none'
              },
              '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
                borderBottom: 'none'
              },
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  border: 'none'
                },
                '&:hover fieldset': {
                  border: 'none'
                },
                '&.Mui-focused fieldset': {
                  border: 'none'
                }
              }
            }}
          />
        </Box>
        <FormHelperText error sx={{ mt: -1, mb: 1 }}>
          {errors.name?.message}
        </FormHelperText>

        {/* Calendar Selection */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarTodayIcon sx={{ color: 'white', mr: 1, ml: 1 }} />
          <FormControl fullWidth>
            <Controller
              name="calendarIds"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value?.[0] || ''}
                  onChange={(e) => field.onChange([e.target.value])}
                  displayEmpty
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.3)'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.5)'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'white'
                    },
                    '& .MuiSelect-icon': {
                      color: 'white'
                    }
                  }}
                  renderValue={(selected) => {
                    if (!selected || selected === '') {
                      return <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Select Calendar</span>;
                    }
                    const calendar = calendars?.find((c) => c.calendarId === selected);
                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.49 }}>
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: 1,
                            backgroundColor: calendar?.color || '#ef4345',
                            border: '1px solid rgba(255, 255, 255, 0.3)'
                          }}
                        />
                        <Typography>{calendar?.name || selected}</Typography>
                      </Box>
                    );
                  }}
                >
                  {calendars?.map((calendar) => (
                    <MenuItem key={calendar.calendarId} value={calendar.calendarId}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: 1,
                            backgroundColor: calendar.color || '#ef4345',
                            border: '1px solid rgba(255, 255, 255, 0.3)'
                          }}
                        />
                        <Typography>{calendar.name}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            <FormHelperText error>{errors.calendarIds?.message}</FormHelperText>
          </FormControl>
        </Box>

        <Typography color="red" variant="body2" sx={{ fontSize: 14, mt: -1 }}>
          Select the fields from this template to be included in the new event type.
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Controller
            control={control}
            name="initialDateScheduled"
            render={({ field: { onChange, value } }) => (
              <Checkbox checked={value} onChange={onChange} sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }} />
            )}
          />
          <AccessTimeIcon sx={{ color: 'white', mr: 1 }} />
          <Box sx={{ flex: 1, display: 'flex', gap: 2, alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: 'white' }}>
              Monday, March 17 2:00pm - 3:00pm
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Controller
                control={control}
                name="allDay"
                render={({ field: { onChange, value } }) => (
                  <Checkbox
                    checked={value}
                    onChange={onChange}
                    size="small"
                    sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }}
                  />
                )}
              />
              <Typography variant="body2" sx={{ fontSize: 12, color: 'white' }}>
                All Day
              </Typography>
            </Box>
            <Controller
              control={control}
              name="recurring"
              render={({ field: { onChange, value } }) => (
                <Select
                  value={value ? 'recurring' : 'not-recurring'}
                  onChange={(e) => onChange(e.target.value === 'recurring')}
                  sx={{
                    minWidth: 100,
                    height: 32,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '4px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '14px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      border: 'none'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      border: 'none'
                    },
                    '& .MuiSelect-icon': {
                      color: 'white'
                    },
                    '& .MuiSelect-select': {
                      padding: '4px 14px',
                      display: 'flex',
                      alignItems: 'center'
                    }
                  }}
                >
                  <MenuItem value="not-recurring">Not Recurring</MenuItem>
                  <MenuItem value="recurring">Recurring</MenuItem>
                </Select>
              )}
            />
          </Box>
        </Box>

        {/* Required Members Field */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Controller
            control={control}
            name="requiredMembers"
            render={({ field: { onChange, value } }) => (
              <Checkbox checked={value} onChange={onChange} sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }} />
            )}
          />
          <PersonAddIcon sx={{ color: 'white', mr: 1 }} />
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: 2,
                  px: 1.5,
                  py: 0.5
                }}
              >
                <Typography variant="body2" sx={{ fontSize: 14, color: 'white' }}>
                  Required Member
                </Typography>
                <Typography sx={{ fontSize: 16, color: 'white', lineHeight: 1 }}>×</Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: 2,
                  px: 1.5,
                  py: 0.5
                }}
              >
                <Typography variant="body2" sx={{ fontSize: 14, color: 'white' }}>
                  Add Required Member
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Optional Members Field */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Controller
            control={control}
            name="optionalMembers"
            render={({ field: { onChange, value } }) => (
              <Checkbox checked={value} onChange={onChange} sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }} />
            )}
          />
          <PeopleIcon sx={{ color: 'white', mr: 1 }} />
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: 2,
                  px: 1.5,
                  py: 0.5
                }}
              >
                <Typography variant="body2" sx={{ fontSize: 14, color: 'white' }}>
                  Ethan Herrell
                </Typography>
                <Typography sx={{ fontSize: 16, color: 'white', lineHeight: 1 }}>×</Typography>
              </Box>
              {/* Add Member button (visual only) */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: 2,
                  px: 1.5,
                  py: 0.5
                }}
              >
                <Typography variant="body2" sx={{ fontSize: 14, color: 'white' }}>
                  Add Member
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Teams Field */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Controller
            control={control}
            name="teams"
            render={({ field: { onChange, value } }) => (
              <Checkbox checked={value} onChange={onChange} sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }} />
            )}
          />
          <GroupsIcon sx={{ color: 'white', mr: 1 }} />
          <Box sx={{ flex: 1 }}>
            <Box
              sx={{
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '4px',
                padding: '8.5px 14px',
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.7)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>Select Team</span>
              <span style={{ fontSize: '8px', color: 'white', marginTop: '3px' }}>▼</span>
            </Box>
          </Box>
        </Box>

        {/* Location Field */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Controller
            control={control}
            name="location"
            render={({ field: { onChange, value } }) => (
              <Checkbox checked={value} onChange={onChange} sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }} />
            )}
          />
          <LocationOnIcon sx={{ color: 'white', mr: 1 }} />
          <Box sx={{ flex: 1 }}>
            <Box
              sx={{
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '4px',
                padding: '8.5px 14px',
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.7)'
              }}
            >
              Location
            </Box>
          </Box>
        </Box>

        {/* Zoom Link Field */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Controller
            control={control}
            name="zoomLink"
            render={({ field: { onChange, value } }) => (
              <Checkbox checked={value} onChange={onChange} sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }} />
            )}
          />
          <VideocamIcon sx={{ color: 'white', mr: 1 }} />
          <Box sx={{ flex: 1 }}>
            <Box
              sx={{
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '4px',
                padding: '8.5px 14px',
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.7)'
              }}
            >
              Zoom Link
            </Box>
          </Box>
        </Box>

        {/* Availability Field */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Controller
            control={control}
            name="requiresConfirmation"
            render={({ field: { onChange, value } }) => (
              <Checkbox checked={value} onChange={onChange} sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }} />
            )}
          />
          <PeopleIcon sx={{ color: 'white', mr: 1 }} />
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: 2,
                  px: 1.5,
                  py: 0.5
                }}
              >
                <Typography variant="body2" sx={{ fontSize: 14, color: 'white' }}>
                  Add Availability
                </Typography>
              </Box>
              {/* View Availability button (visual only) */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: 2,
                  px: 1.5,
                  py: 0.5
                }}
              >
                <Typography variant="body2" sx={{ fontSize: 14, color: 'white' }}>
                  View Availability
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Shop Field */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Controller
            control={control}
            name="shop"
            render={({ field: { onChange, value } }) => (
              <Checkbox checked={value} onChange={onChange} sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }} />
            )}
          />
          <LocationOnIcon sx={{ color: 'white', mr: 1 }} />
          <Box sx={{ flex: 1 }}>
            <Box
              sx={{
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '4px',
                padding: '8.5px 14px',
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.7)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>Select Shop</span>
              <span style={{ fontSize: '8px', color: 'white', marginTop: '3px' }}>▼</span>
            </Box>
          </Box>
        </Box>

        {/* Machinery Field */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Controller
            control={control}
            name="machinery"
            render={({ field: { onChange, value } }) => (
              <Checkbox checked={value} onChange={onChange} sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }} />
            )}
          />
          <BuildIcon sx={{ color: 'white', mr: 1 }} />
          <Box sx={{ flex: 1 }}>
            <Box
              sx={{
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '4px',
                padding: '8.5px 14px',
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.7)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>Select Machinery</span>
              <span style={{ fontSize: '8px', color: 'white', marginTop: '3px' }}>▼</span>
            </Box>
          </Box>
        </Box>

        {/* Work Package Field */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Controller
            control={control}
            name="workPackage"
            render={({ field: { onChange, value } }) => (
              <Checkbox checked={value} onChange={onChange} sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }} />
            )}
          />
          <InventoryIcon sx={{ color: 'white', mr: 1 }} />
          <Box sx={{ flex: 1 }}>
            <Box
              sx={{
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '4px',
                padding: '8.5px 14px',
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.7)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>Select Work Package</span>
              <span style={{ fontSize: '8px', color: 'white', marginTop: '3px' }}>▼</span>
            </Box>
          </Box>
        </Box>

        {/* Question Document Field */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Controller
            control={control}
            name="questionDocument"
            render={({ field: { onChange, value } }) => (
              <Checkbox checked={value} onChange={onChange} sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }} />
            )}
          />
          <HelpOutlineIcon sx={{ color: 'white', mr: 1 }} />
          <Box sx={{ flex: 1 }}>
            <Box
              sx={{
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '4px',
                padding: '8.5px 14px',
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.7)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>Select Question Document</span>
              <span style={{ fontSize: '8px', color: 'white', marginTop: '3px' }}>▼</span>
            </Box>
          </Box>
        </Box>

        {/* Documents Field */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Controller
            control={control}
            name="documents"
            render={({ field: { onChange, value } }) => (
              <Checkbox checked={value} onChange={onChange} sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }} />
            )}
          />
          <DescriptionIcon sx={{ color: 'white', mr: 1 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '16px', color: 'white', mb: 1 }}>
              Documents
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: 2,
                  px: 1.5,
                  py: 0.5
                }}
              >
                <Typography variant="body2" sx={{ fontSize: 14, color: 'white' }}>
                  Competitions.pdf
                </Typography>
                <Typography sx={{ fontSize: 16, color: 'white', lineHeight: 1 }}>×</Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'rgba(76, 175, 80, 0.8)',
                  borderRadius: 1,
                  px: 1.5,
                  py: 0.5
                }}
              >
                <Typography variant="body2" sx={{ fontSize: 14, color: 'white' }}>
                  Upload
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Description/Attachment Field */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <Checkbox checked={value} onChange={onChange} sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }} />
            )}
          />
          <WorkOutlineIcon sx={{ color: 'white', mr: 1 }} />
          <Box sx={{ flex: 1 }}>
            <Box
              sx={{
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '4px',
                padding: '8.5px 14px',
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.7)'
              }}
            >
              Add a description or attachment
            </Box>
          </Box>
        </Box>

        {/* Only Heads Or Above Field */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Controller
            control={control}
            name="onlyHeadsOrAbove"
            render={({ field: { onChange, value } }) => (
              <Checkbox checked={value} onChange={onChange} sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }} />
            )}
          />
          <SupervisorAccountIcon sx={{ color: 'white', mr: 1 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ color: 'white' }}>
              Only Heads Or Above
            </Typography>
          </Box>
        </Box>
      </Box>
    </NERFormModal>
  );
};

export default EventTypeFormModal;
