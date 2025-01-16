import ErrorPage from '../../../ErrorPage';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import { ChecklistCreateArgs, useCreateChecklist } from '../../../../hooks/onboarding.hook';
import { useToast } from '../../../../hooks/toasts.hooks';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormControl, FormLabel, TextField, InputAdornment, Checkbox, IconButton, useTheme } from '@mui/material';
import { Box } from '@mui/system';
import React, { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { CreateChecklistPreview } from 'shared';
import NERFormModal from '../../../../components/NERFormModal';
import * as yup from 'yup';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

interface CreateChecklistModalProps {
  open: boolean;
  handleClose: () => void;
  teamId?: string;
  teamTypeId?: string;
}

interface ChecklistFormValues {
  name: string;
  descriptions: { name: string }[];
  subtasks: CreateChecklistPreview[];
}

const schema = yup.object().shape({
  name: yup.string().required('Name is Required'),
  descriptions: yup
    .array()
    .of(
      yup.object().shape({
        name: yup.string().required('Description is Required')
      })
    )
    .required()
    .min(1, 'At least one description is required'),
  subtasks: yup
    .array()
    .of(
      yup.object().shape({
        name: yup.string().required('Subtask Name is Required'),
        isOptional: yup.boolean().required('Is Optional is Required'),
      })
    )
    .required()
});

const CreateChecklistModal = ({ open, handleClose, teamId, teamTypeId }: CreateChecklistModalProps) => {
  const theme = useTheme();
  const toast = useToast();
  const { mutateAsync: createChecklist, isLoading, isError, error } = useCreateChecklist();

  const [subtasks, setSubtasks] = useState<ChecklistCreateArgs[]>([{ name: '', isOptional: false, descriptions: [] }]);

  const defaultValues = {
    name: '',
    descriptions: [{ name: '' }],
    subtasks: []
  };

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<ChecklistFormValues>({
    resolver: yupResolver(schema),
    defaultValues
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'descriptions'
  });

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  const onFormSubmit = async (data: ChecklistCreateArgs) => {
    try {
      const formattedData = {
        ...data,
        teamId,
        teamTypeId,
        descriptions: (data.descriptions as unknown as { name: string }[]).map((desc) => desc.name)
      };

      const parentChecklist = await createChecklist(formattedData);

      // Handle subtasks
      const filteredSubtasks = subtasks.filter((subtask) => subtask.name !== '');
      await Promise.all(
        filteredSubtasks.map((subtask) =>
          createChecklist({
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
    setSubtasks([...subtasks, { name: '', isOptional: false, descriptions: [] }]);
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
      title={'Create Checklist'}
      reset={() => reset({ name: '', descriptions: [] })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      formId={'create-UsefulLink-form'}
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
              width: '39vw'
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
            <FormLabel
              sx={{
                color: theme.palette.text.primary,
                fontSize: '1rem',
                mr: 4.5
              }}
            >
              Optional?
            </FormLabel>
          </Box>
          <Box>
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
          <IconButton
            onClick={addSubtask}
            sx={{
              backgroundColor: theme.palette.background.paper,
              borderRadius: 5,
              mt: 1,
              fontSize: '1rem',
              padding: 1.5,
              width: '100%',
              justifyContent: 'flex-start'
            }}
          >
            <AddCircleOutlineIcon sx={{ color: theme.palette.text.primary, mr: 1 }} />
            Add Subtask
          </IconButton>
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
              <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Controller
                  name={`descriptions.${index}.name`}
                  control={control}
                  defaultValue={item.name || ''}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      placeholder="Enter description..."
                      fullWidth
                      multiline
                      variant="outlined"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            {index !== 0 && (
                              <IconButton onClick={() => remove(index)}>
                                <RemoveCircleOutlineIcon sx={{ color: 'white' }} />
                              </IconButton>
                            )}
                          </InputAdornment>
                        ),
                        disableUnderline: true,
                        sx: { '& fieldset': { border: 'none' } }
                      }}
                      sx={{
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: 5,
                        mt: 1,
                        width: '100%',
                        ...(index === 0 && {
                          minHeight: '150px',
                          fontSize: '1.25rem'
                        })
                      }}
                      error={!!errors.descriptions?.[index]?.name}
                      helperText={errors.descriptions?.[index]?.name?.message}
                    />
                  )}
                />
              </Box>
            ))}

            <IconButton
              onClick={() => append({ name: '' })}
              sx={{
                backgroundColor: theme.palette.background.paper,
                borderRadius: 5,
                mt: 1,
                fontSize: '1rem',
                padding: 1.5,
                width: '100%',
                justifyContent: 'flex-start'
              }}
            >
              <AddCircleOutlineIcon sx={{ color: theme.palette.text.primary, mr: 1 }} />
              Add Additional Information
            </IconButton>
          </Box>
        </FormControl>
      </Box>
    </NERFormModal>
  );
};

export default CreateChecklistModal;
