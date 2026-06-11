import React, { useCallback } from 'react';
import { Box, FormControl, FormHelperText, FormLabel } from '@mui/material';
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
import ColorPickerInput from '../../../components/ColorPickerInput';

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  colorHexCode: yup.string().required('Color is required')
});

const emptyValues = { name: '', colorHexCode: '' };

interface TaskLabelFormModalProps {
  showModal: boolean;
  handleClose: () => void;
  defaultValues?: TaskLabel;
}

const TaskLabelFormModal: React.FC<TaskLabelFormModalProps> = ({ showModal, handleClose, defaultValues }) => {
  const toast = useToast();
  const {
    isLoading: createLoading,
    isError: createIsError,
    error: createError,
    mutateAsync: createMutateAsync
  } = useCreateTaskLabel();
  const {
    isLoading: editLoading,
    isError: editIsError,
    error: editError,
    mutateAsync: editMutateAsync
  } = useEditTaskLabel();

  const isEditing = !!defaultValues;

  const {
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: defaultValues
      ? {
          name: defaultValues.name,
          colorHexCode: defaultValues.colorHexCode
        }
      : emptyValues
  });

  const handleReset = useCallback(() => {
    reset({
      name: defaultValues?.name ?? '',
      colorHexCode: defaultValues?.colorHexCode ?? ''
    });
  }, [reset, defaultValues]);

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
      handleClose();
    } catch (error: unknown) {
      if (error instanceof Error) toast.error(error.message);
    }
  };

  if (createIsError) return <ErrorPage message={createError?.message} />;
  if (editIsError) return <ErrorPage message={editError?.message} />;
  if (createLoading || editLoading) return <LoadingIndicator />;

  return (
    <NERFormModal
      open={showModal}
      onHide={() => {
        handleReset();
        handleClose();
      }}
      title={isEditing ? 'Edit Task Label' : 'New Task Label'}
      reset={handleReset}
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
          <ColorPickerInput selectedColor={selectedColor} onColorClick={handleColorClick} />
          <FormHelperText error>{errors.colorHexCode?.message}</FormHelperText>
        </FormControl>
      </Box>
    </NERFormModal>
  );
};

export default TaskLabelFormModal;
