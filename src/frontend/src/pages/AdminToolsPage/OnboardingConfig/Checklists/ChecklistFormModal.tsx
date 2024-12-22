import React, { useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
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
import { Checklist, ChecklistPreview } from 'shared';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { ChecklistCreateArgs } from '../../../../hooks/onboarding.hook';
import { useToast } from '../../../../hooks/toasts.hooks';

interface ChecklistFormModalProps {
  open: boolean;
  handleClose: () => void;
  onSubmit: (data: ChecklistCreateArgs) => Promise<Checklist>;
  defaulValues?: Checklist;
  teamId?: string;
  teamTypeId?: string;
}

interface ChecklistFormValues {
  name: string;
  descriptions: { name: string }[];
  subtasks: ChecklistPreview[];
}

const ChecklistFormModal = ({ open, handleClose, onSubmit, defaulValues, teamId, teamTypeId }: ChecklistFormModalProps) => {
  const theme = useTheme();
  const toast = useToast();
  const [subtasks, setSubtasks] = useState<ChecklistPreview[]>(defaulValues?.subtasks || []);
  const schema = yup.object().shape({
    name: yup.string().required('Name is Required'),
    descriptions: yup
      .array()
      .of(
        yup.object().shape({
          name: yup.string().required('Description is Required')
        })
      )
      .min(1, 'At least one description is required'),
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
  } = useForm<ChecklistFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: defaulValues?.name ?? '',
      descriptions: defaulValues?.descriptions?.length
        ? defaulValues?.descriptions?.map((desc) => ({ name: desc }))
        : [{ name: '' }],
      subtasks: defaulValues?.subtasks ?? []
    }
  });

  const onFormSubmit = async (data: ChecklistCreateArgs) => {
    try {
      const formattedData = {
        ...data,
        teamId,
        teamTypeId,
        descriptions: (data.descriptions as unknown as { name: string }[]).map((desc) => desc.name)
      };

      const parentChecklist = await onSubmit(formattedData);
            
      // Handle subtasks
      await Promise.all(
        subtasks.map((subtask) =>
          onSubmit({
            name: subtask.name,
            descriptions: [],
            teamId,
            teamTypeId,
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
    setSubtasks([...subtasks, { name: '', isOptional: false, dateCreated: new Date(), checklistId: '' }]);
  };

  const deleteSubtask = (index: number) => {
    const updatedSubtasks = subtasks.filter((_, i) => i !== index);
    setSubtasks(updatedSubtasks);
  };

  const handleSubtaskChange = (index: number, key: string, value: any) => {
    const updatedSubtasks = subtasks.map((subtask, i) => (i === index ? { ...subtask, [key]: value } : subtask));
    setSubtasks(updatedSubtasks);
  };

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'descriptions'
  });

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
                placeholder="Task Name"
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
          <Box>
            <FormLabel
              sx={{
                color: theme.palette.error.main,
                fontWeight: 'bold',
                fontSize: '1.5rem',
                textDecoration: 'underline'
              }}
            >
              Descriptions*
            </FormLabel>
            {fields.map((item, index) => (
              <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                <Controller
                  name={`descriptions.${index}.name`}
                  control={control}
                  defaultValue={item.name || ''}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      placeholder="Description"
                      fullWidth
                      variant="outlined"
                      InputProps={{
                        disableUnderline: true,
                        sx: { '& fieldset': { border: 'none' } }
                      }}
                      sx={{
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: 5,
                        mt: 1,
                        width: '100%'
                      }}
                      error={!!errors.descriptions?.[index]?.name}
                      helperText={errors.descriptions?.[index]?.name?.message}
                    />
                  )}
                />
                <IconButton onClick={() => remove(index)}>
                  <RemoveCircleOutlineIcon sx={{ color: 'white' }} />
                </IconButton>
              </Box>
            ))}
            <Button variant="outlined" onClick={() => append({ name: '' })} sx={{ mt: 2 }}>
              Add Description
            </Button>
          </Box>
        </FormControl>
      </Box>
    </NERFormModal>
  );
};

export default ChecklistFormModal;
