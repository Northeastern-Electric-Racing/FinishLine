import React from 'react';
import { Box, FormControl, FormHelperText, Typography, Stack } from '@mui/material';
import NERFormModal from '../../../../components/NERFormModal';
import ReactHookTextField from '../../../../components/ReactHookTextField';
import { useToast } from '../../../../hooks/toasts.hooks';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import type { Calendar } from 'shared';

export interface CalendarFormValues {
  name: string;
  description: string;
  color: string;
}

const schema = yup.object({
  name: yup.string().required('Calendar Name is required'),
  description: yup.string().required('Description is required'),
  color: yup.string().required('Color is required')
});

export interface BaseCalendarModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CalendarFormValues) => Promise<Calendar | unknown> | Calendar | unknown;
  initialValues?: Partial<CalendarFormValues>;
}

const COLOR_OPTIONS: { label: string; value: string }[] = [
  { label: 'Orange', value: '#F97316' },
  { label: 'Red', value: '#EF4444' },
  { label: 'Green', value: '#22C55E' },
  { label: 'Blue', value: '#3B82F6' },
  { label: 'Purple', value: '#A855F7' },
  { label: 'Navy', value: '#1E3A8A' }
];

const DEFAULT_COLOR = COLOR_OPTIONS[0].value;

const CalendarModal: React.FC<BaseCalendarModalProps> = ({ open, onClose, onSubmit, initialValues }) => {
  const toast = useToast();

  const {
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<CalendarFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      color: DEFAULT_COLOR
    }
  });

  const frozenValuesRef = React.useRef<CalendarFormValues>({
    name: '',
    description: '',
    color: DEFAULT_COLOR
  });

  React.useEffect(() => {
    if (open) {
      frozenValuesRef.current = {
        name: initialValues?.name ?? '',
        description: initialValues?.description ?? '',
        color: initialValues?.color ?? DEFAULT_COLOR
      };
      reset(frozenValuesRef.current);
    } else {
      frozenValuesRef.current = {
        name: '',
        description: '',
        color: DEFAULT_COLOR
      };
      reset(frozenValuesRef.current);
    }
  }, [open, initialValues, reset]);

  const computedTitle = frozenValuesRef.current.name !== '' ? 'Edit Calendar' : 'Add Calendar';

  const onFormSubmit = async (data: CalendarFormValues) => {
    try {
      await onSubmit(data);
      onClose();
      reset({
        name: '',
        description: '',
        color: DEFAULT_COLOR
      });
    } catch (e: unknown) {
      if (e instanceof Error) toast.error(e.message);
    }
  };

  const selectedColor = watch('color') || DEFAULT_COLOR;

  const handleColorClick = (value: string) => {
    setValue('color', value, { shouldValidate: true });
  };

  return (
    <NERFormModal
      open={open}
      onHide={() => {
        onClose();
        reset({
          name: '',
          description: '',
          color: DEFAULT_COLOR
        });
      }}
      title={computedTitle}
      reset={() =>
        reset({
          name: '',
          description: '',
          color: DEFAULT_COLOR
        })
      }
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      formId="calendar-form"
      showCloseButton
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: 350 }}>
        {/* Calendar Name */}
        <FormControl fullWidth>
          <Typography color="#ef4345" variant="h5" sx={{ fontWeight: 'bold', fontSize: 20 }}>
            Calendar:*
          </Typography>
          <ReactHookTextField name="name" control={control} placeholder="Calendar Name" fullWidth />
          <FormHelperText error>{errors.name?.message}</FormHelperText>
        </FormControl>

        {/* Description */}
        <FormControl fullWidth>
          <Typography color="#ef4345" variant="h5" sx={{ fontWeight: 'bold', fontSize: 20 }}>
            Description:*
          </Typography>
          <ReactHookTextField
            name="description"
            control={control}
            placeholder="Enter description"
            fullWidth
            multiline
            rows={4}
          />
          <FormHelperText error>{errors.description?.message}</FormHelperText>
        </FormControl>

        {/* Color pills */}
        <FormControl fullWidth sx={{ mt: 1 }}>
          <Typography color="#ef4345" variant="h5" sx={{ fontWeight: 'bold', fontSize: 20, mb: 0.5 }}>
            Color:*
          </Typography>

          <Stack direction="row" spacing={1.2} flexWrap="wrap">
            {COLOR_OPTIONS.map((c) => {
              const isSelected = c.value === selectedColor;
              return (
                <Box
                  key={c.value}
                  onClick={() => handleColorClick(c.value)}
                  sx={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    px: 1.5,
                    height: 28,
                    borderRadius: '999px',
                    backgroundColor: c.value,
                    border: isSelected ? '2px solid #ef4345' : '2px solid transparent',
                    boxSizing: 'border-box',
                    minWidth: 32
                  }}
                />
              );
            })}

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 1.5,
                height: 28,
                borderRadius: '999px',
                backgroundColor: '#E5E7EB',
                color: '#4B5563',
                fontSize: 12,
                cursor: 'default'
              }}
            >
              Add color
            </Box>
          </Stack>

          <FormHelperText error>{errors.color?.message}</FormHelperText>
        </FormControl>
      </Box>
    </NERFormModal>
  );
};

export default CalendarModal;
