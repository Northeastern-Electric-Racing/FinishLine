import React, { useEffect } from 'react';
import { Box, Checkbox, FormControl, FormControlLabel, FormHelperText, Typography } from '@mui/material';
import NERFormModal from '../../../../components/NERFormModal';
import ReactHookTextField from '../../../../components/ReactHookTextField';
import ColorPickerInput from '../../../../components/ColorPickerInput';
import { useToast } from '../../../../hooks/toasts.hooks';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import type { Calendar } from 'shared';

export interface CalendarFormValues {
  name: string;
  description: string;
  colorHexCode: string;
  isNewMemberCalendar: boolean;
}

const schema = yup.object({
  name: yup.string().required('Calendar Name is required'),
  description: yup.string().required('Description is required'),
  colorHexCode: yup.string().required('Color is required'),
  isNewMemberCalendar: yup.boolean().required()
});

export interface BaseCalendarModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CalendarFormValues) => Promise<Calendar | unknown> | Calendar | unknown;
  initialValues?: Partial<CalendarFormValues>;
}

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
    defaultValues: { name: '', description: '', colorHexCode: '', isNewMemberCalendar: false }
  });

  const frozenValuesRef = React.useRef<CalendarFormValues>({
    name: '',
    description: '',
    colorHexCode: '',
    isNewMemberCalendar: false
  });

  useEffect(() => {
    if (open) {
      frozenValuesRef.current = {
        name: initialValues?.name ?? '',
        description: initialValues?.description ?? '',
        colorHexCode: initialValues?.colorHexCode ?? '',
        isNewMemberCalendar: initialValues?.isNewMemberCalendar ?? false
      };
      reset(frozenValuesRef.current);
    } else {
      frozenValuesRef.current = { name: '', description: '', colorHexCode: '', isNewMemberCalendar: false };
      reset(frozenValuesRef.current);
    }
  }, [open, initialValues, reset]);

  const computedTitle = frozenValuesRef.current.name !== '' ? 'Edit Calendar' : 'Create Calendar';

  const onFormSubmit = async (data: CalendarFormValues) => {
    try {
      await onSubmit(data);
      onClose();
      reset({ name: '', description: '', colorHexCode: '', isNewMemberCalendar: false });
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
        reset({ name: '', description: '', colorHexCode: '', isNewMemberCalendar: false });
      }}
      title={computedTitle}
      reset={() => reset({ name: '', description: '', colorHexCode: '', isNewMemberCalendar: false })}
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
          <ColorPickerInput selectedColor={selectedColor} onColorClick={handleColorClick} />
          <FormHelperText error>{errors.colorHexCode?.message}</FormHelperText>
        </FormControl>

        <FormControl fullWidth>
          <Controller
            control={control}
            name="isNewMemberCalendar"
            render={({ field: { onChange, value } }) => (
              <FormControlLabel control={<Checkbox checked={value} onChange={onChange} />} label="New member calendar" />
            )}
          />
        </FormControl>
      </Box>
    </NERFormModal>
  );
};

export default CalendarModal;
