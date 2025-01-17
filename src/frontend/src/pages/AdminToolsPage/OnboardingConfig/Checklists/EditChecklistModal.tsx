import ErrorPage from '../../../ErrorPage';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import { ChecklistCreateArgs, useEditChecklist } from '../../../../hooks/onboarding.hook';
import { useToast } from '../../../../hooks/toasts.hooks';
import { Checklist } from 'shared';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormControl, FormLabel, TextField, InputAdornment, IconButton, useTheme } from '@mui/material';
import { Box } from '@mui/system';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import NERFormModal from '../../../../components/NERFormModal';
import * as yup from 'yup';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

interface EditChecklistModalProps {
  open: boolean;
  handleClose: () => void;
  teamId?: string;
  teamTypeId?: string;
  defaultValues: Checklist;
}

interface ChecklistFormValues {
  name: string;
  descriptions: { name: string }[];
}

const schema = yup.object().shape({
  name: yup.string().required('Name is Required'),
  descriptions: yup
    .array()
    .of(
      yup.object().shape({
        name: yup.string().required('Description is Required').trim()
      })
    )
    .min(1, 'At least one description is required')
    .required()
});

const EditChecklistModal = ({ open, handleClose, defaultValues, teamId, teamTypeId }: EditChecklistModalProps) => {
  const theme = useTheme();
  const toast = useToast();
  const { mutateAsync: editChecklist, isLoading, isError, error } = useEditChecklist(defaultValues.checklistId);

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<ChecklistFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      descriptions: defaultValues?.descriptions?.length
        ? defaultValues?.descriptions?.map((desc) => ({ name: desc }))
        : [{ name: '' }]
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

      await editChecklist(formattedData);

      handleClose();
    } catch (error) {
      toast.error('Failed to create checklist');
      console.error('Error in onFormSubmit:', error);
    }
  };

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'descriptions'
  });

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return (
    <NERFormModal
      open={open}
      onHide={handleClose}
      title={'Edit Task'}
      reset={() => reset({ name: '', descriptions: [] })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      formId={'edit-task-form'}
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

export default EditChecklistModal;
