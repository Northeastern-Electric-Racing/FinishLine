import React from 'react';
import { Box, FormControl, FormHelperText, FormLabel, Stack } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import ErrorPage from '../../ErrorPage';
import { useForm } from 'react-hook-form';
import { useToast } from '../../../hooks/toasts.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useCreateTaskLabel, useEditTaskLabel } from '../../../hooks/tasks.hooks';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { TaskLabel } from 'shared';
import NERFormModal from '../../../components/NERFormModal';

const COLOR_OPTIONS: { label: string; value: string }[] = [
  { label: 'Red', value: '#EF4444' },
  { label: 'Orange', value: '#F97316' },
  { label: 'Yellow', value: '#EAB308' },
  { label: 'Green', value: '#22C55E' },
  { label: 'Blue', value: '#3B82F6' },
  { label: 'Purple', value: '#A855F7' },
  { label: 'Pink', value: '#EC4899' },
  { label: 'Navy', value: '#1E3A8A' }
];

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  colorHexCode: yup.string().required('Color is required')
});

interface TaskLabelFormModalProps {
  showModal: boolean;
  handleClose: () => void;
  defaultValues?: TaskLabel;
}

const TaskLabelFormModal: React.FC<TaskLabelFormModalProps> = ({ showModal, handleClose, defaultValues }) => {
  const toast = useToast();
  const { isLoading: createLoading, isError: createIsError, error: createError, mutateAsync: createMutateAsync } =
    useCreateTaskLabel();
  const { isLoading: editLoading, isError: editIsError, error: editError, mutateAsync: editMutateAsync } =
    useEditTaskLabel();

  const isEditing = !!defaultValues;

  const emptyValues = { name: '', colorHexCode: '' };

  const {
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: emptyValues
  });

  React.useEffect(() => {
    if (showModal) {
      reset({
        name: defaultValues?.name ?? '',
        colorHexCode: defaultValues?.colorHexCode ?? ''
      });
    } else {
      reset(emptyValues);
    }
  }, [showModal, defaultValues, reset]);

  const selectedColor = watch('colorHexCode');

  const handleColorClick = (value: string) => {
    setValue('colorHexCode', value, { shouldValidate: true });
  };

  const onSubmit = async (data: { name: string; colorHexCode: string }) => {
    try {
      if (isEditing) {
        await editMutateAsync({ taskLabelId: defaultValues.taskLabelId, ...data });
      } else {
        await createMutateAsync(data);
      }
    } catch (error: unknown) {
      if (error instanceof Error) toast.error(error.message);
    }
    handleClose();
  };

  if (createIsError) return <ErrorPage message={createError?.message} />;
  if (editIsError) return <ErrorPage message={editError?.message} />;
  if (createLoading || editLoading) return <LoadingIndicator />;

  return (
    <NERFormModal
      open={showModal}
      onHide={handleClose}
      title={isEditing ? 'Edit Task Label' : 'New Task Label'}
      reset={() => reset({ name: defaultValues?.name ?? '', colorHexCode: defaultValues?.colorHexCode ?? '' })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      formId="task-label-form"
      showCloseButton
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <FormControl fullWidth>
          <FormLabel>Label Name</FormLabel>
          <ReactHookTextField name="name" control={control} sx={{ width: 1 }} />
          <FormHelperText error>{errors.name?.message}</FormHelperText>
        </FormControl>

        <FormControl fullWidth>
          <FormLabel>Color</FormLabel>
          <Stack direction="row" spacing={1.2} flexWrap="wrap" sx={{ mt: 0.5 }}>
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

export default TaskLabelFormModal;
