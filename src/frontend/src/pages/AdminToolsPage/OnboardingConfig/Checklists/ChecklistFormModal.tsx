import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import NERFormModal from '../../../../components/NERFormModal';
import {
  FormControl,
  FormLabel,
  Box,
  TextField,
  IconButton,
  Checkbox,
  Button,
  useTheme,
  InputAdornment
} from '@mui/material';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Checklist, Subtask } from 'shared';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { ChecklistCreateArgs } from '../../../../hooks/onboarding.hook';
import { useToast } from '../../../../hooks/toasts.hooks';

interface ChecklistFormModalProps {
  open: boolean;
  handleClose: () => void;
  onSubmit: (data: ChecklistCreateArgs) => Promise<Checklist>;
  defaulValues?: Checklist;
}

const ChecklistFormModal = ({ open, handleClose, onSubmit, defaulValues }: ChecklistFormModalProps) => {
  const theme = useTheme();
  const toast = useToast();
  const [subtasks, setSubtasks] = useState<Subtask[]>(defaulValues?.subtasks || []);
  const schema = yup.object().shape({
    name: yup.string().required('Name is Required'),
    descriptions: yup.array().of(yup.string().required('Description is Required')).nullable(),
    subtasks: yup.array().of(
      yup.object().shape({
        name: yup.string().required('Subtask Name is Required'),
        isOptional: yup.boolean().required('Is Optional is Required')
      })
    )
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: defaulValues?.name ?? '',
      descriptions: defaulValues?.descriptions ?? []
    }
  });

  const onFormSubmit = async (data: ChecklistCreateArgs) => {
    try {
      const formattedData = {
        ...data,
      };
      const parentChecklist = await onSubmit(formattedData);

      // Handle subtasks
      await Promise.all(
        subtasks.map((subtask) =>
          onSubmit({
            name: subtask.name,
            descriptions: [],
            teamId: data.teamId,
            teamTypeId: data.teamTypeId,
            parentChecklistId: parentChecklist.checklistId,
            isOptional: subtask.isOptional
          })
        )
      );

      handleClose();
    } catch (error) {
      toast.error('Failed to create checklist');
      console.error('Error in onFormSubmit:', error);
    }
  };

  const addSubtask = () => {
    setSubtasks([...subtasks, { name: '', isOptional: false, subtasks: [], usersChecked: [] }]);
  };

  const deleteSubtask = (index: number) => {
    const updatedSubtasks = subtasks.filter((_, i) => i !== index);
    setSubtasks(updatedSubtasks);
  };

  const handleSubtaskChange = (index: number, key: string, value: any) => {
    const updatedSubtasks = subtasks.map((subtask, i) => (i === index ? { ...subtask, [key]: value } : subtask));
    setSubtasks(updatedSubtasks);
  };

  return (
    <NERFormModal
      open={open}
      onHide={handleClose}
      title={!!defaulValues ? 'Edit Checklist' : 'Create Checklist'}
      reset={() => reset({ name: '', descriptions: [] })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      formId={!!defaulValues ? 'edit-UsefulLink-form' : 'create-UsefulLink-form'}
      showCloseButton
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <FormControl fullWidth>
          <FormLabel
            sx={{
              color: theme.palette.error.main,
              fontWeight: 'bold',
              fontSize: '1.5rem',
              textDecoration: 'underline',
              minWidth: '25vw'
            }}
          >
            Task Name*
          </FormLabel>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                variant="outlined"
                InputProps={{
                  disableUnderline: true,
                  sx: {
                    '& fieldset': { border: 'none' }
                  }
                }}
                sx={{
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: 5,
                  mt: 1,
                  width: '100%'
                }}
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            )}
          />
        </FormControl>
        <Box>
          <FormLabel
            sx={{
              color: theme.palette.error.main,
              fontWeight: 'bold',
              fontSize: '1.5rem',
              textDecoration: 'underline'
            }}
          >
            Subtasks
          </FormLabel>
          <Box sx={{ mt: 2 }}>
            {subtasks.map((subtask, index) => (
              <TextField
                key={index}
                value={subtask.name}
                onChange={(e) => handleSubtaskChange(index, 'name', e.target.value)}
                placeholder="Subtask Name"
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Checkbox
                        checked={subtask.isOptional}
                        onChange={(e) => handleSubtaskChange(index, 'isOptional', e.target.checked)}
                      />
                      <IconButton onClick={() => deleteSubtask(index)}>
                        <RemoveCircleOutlineIcon sx={{ color: 'white' }} />
                      </IconButton>
                    </InputAdornment>
                  ),
                  disableUnderline: true,
                  sx: {
                    '& fieldset': { border: 'none' }
                  }
                }}
                sx={{
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: 5,
                  mt: 1,
                  width: '100%'
                }}
              />
            ))}
          </Box>
          <Button variant="outlined" onClick={addSubtask} sx={{ mt: 2 }}>
            Add Subtask
          </Button>
        </Box>
        <FormControl fullWidth>
          <FormLabel
            sx={{
              color: theme.palette.error.main,
              fontWeight: 'bold',
              fontSize: '1.5rem',
              textDecoration: 'underline'
            }}
          >
            Description*
          </FormLabel>
          <Controller
            name="descriptions"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                variant="outlined"
                multiline
                rows={4}
                InputProps={{
                  disableUnderline: true,
                  sx: {
                    '& fieldset': { border: 'none' }
                  }
                }}
                sx={{
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: 5,
                  mt: 1,
                  width: '100%'
                }}
                error={!!errors.descriptions}
                helperText={errors.descriptions?.message}
              />
            )}
          />
        </FormControl>
      </Box>
    </NERFormModal>
  );
};

export default ChecklistFormModal;
