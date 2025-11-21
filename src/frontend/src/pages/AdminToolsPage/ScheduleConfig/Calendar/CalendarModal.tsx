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
  colorHexCode: string;
}

const schema = yup.object({
  name: yup.string().required('Calendar Name is required'),
  description: yup.string().required('Description is required'),
  colorHexCode: yup.string().required('Color is required')
});

export interface BaseCalendarModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CalendarFormValues) => Promise<Calendar | unknown> | Calendar | unknown;
  initialValues?: Partial<CalendarFormValues>;
}

const COLOR_OPTIONS: { label: string; value: string }[] = [
  { label: 'Red', value: '#EF4444' },
  { label: 'Orange', value: '#F97316' },
  { label: 'Green', value: '#22C55E' },
  { label: 'Blue', value: '#3B82F6' },
  { label: 'Purple', value: '#A855F7' },
  { label: 'Navy', value: '#1E3A8A' }
];

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
    defaultValues: { name: '', description: '', colorHexCode: '' }
  });

  const frozenValuesRef = React.useRef<CalendarFormValues>({ name: '', description: '', colorHexCode: '' });

  React.useEffect(() => {
    if (open) {
      frozenValuesRef.current = {
        name: initialValues?.name ?? '',
        description: initialValues?.description ?? '',
        colorHexCode: initialValues?.colorHexCode ?? ''
      };
      reset(frozenValuesRef.current);
    } else {
      frozenValuesRef.current = { name: '', description: '', colorHexCode: '' };
      reset(frozenValuesRef.current);
    }
  }, [open, initialValues, reset]);

  const computedTitle = frozenValuesRef.current.name !== '' ? 'Edit Calendar' : 'Create Calendar';

  const onFormSubmit = async (data: CalendarFormValues) => {
    try {
      await onSubmit(data);
      onClose();
      reset({ name: '', description: '', colorHexCode: '' });
    } catch (e: unknown) {
      if (e instanceof Error) toast.error(e.message);
    }
  };

  const selectedColor = watch('colorHexCode');

  const handleColorClick = (value: string) => {
    setValue('colorHexCode', value, { shouldValidate: true });
  };

  return (
    <NERFormModal
      open={open}
      onHide={() => {
        onClose();
        reset({ name: '', description: '', colorHexCode: '' });
      }}
      title={computedTitle}
      reset={() => reset({ name: '', description: '', colorHexCode: '' })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      formId="calendar-form"
      showCloseButton
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: 350 }}>
        <FormControl fullWidth>
          <Typography color="#ef4345" variant="h5" sx={{ fontWeight: 'bold', fontSize: 20 }}>
            Calendar:*
          </Typography>
          <ReactHookTextField name="name" control={control} placeholder="Calendar Name" fullWidth />
          <FormHelperText error>{errors.name?.message}</FormHelperText>
        </FormControl>

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

        <FormControl fullWidth>
          <Typography color="#ef4345" variant="h5" sx={{ fontWeight: 'bold', fontSize: 20 }}>
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
          </Stack>
          <FormHelperText error>{errors.colorHexCode?.message}</FormHelperText>
        </FormControl>
      </Box>
    </NERFormModal>
  );
};

export default CalendarModal;
