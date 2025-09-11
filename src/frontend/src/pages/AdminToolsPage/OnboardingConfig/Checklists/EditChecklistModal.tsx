import ErrorPage from '../../../ErrorPage';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import { ChecklistCreateArgs, useEditChecklist } from '../../../../hooks/onboarding.hook';
import { useToast } from '../../../../hooks/toasts.hooks';
import { Checklist } from 'shared';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormControl, FormLabel, TextField, InputAdornment, IconButton, useTheme, Stack, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import NERFormModal from '../../../../components/NERFormModal';
import * as yup from 'yup';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import NERMarkdown from '../../../../components/NERMarkdown';

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
    watch,
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
      title={!!defaultValues ? 'Edit Checklist' : 'Create Checklist'}
      reset={() => reset({ name: '', descriptions: [] })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      formId={!!defaultValues ? 'edit-UsefulLink-form' : 'create-UsefulLink-form'}
      showCloseButton
      paperProps={{ maxWidth: '80vw' }}
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
              <Stack key={item.id} direction={'row'} spacing={3} sx={{ mb: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    width: '30vw',
                    alignItems: 'stretch'
                  }}
                >
                  <Controller
                    name={`descriptions.${index}.name`}
                    control={control}
                    defaultValue={item.name || ''}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        placeholder="Enter description markdown..."
                        fullWidth
                        multiline
                        variant="outlined"
                        minRows={12}
                        maxRows={20}
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
                          sx: {
                            '& fieldset': { border: 'none' },
                            fontSize: '1.1rem',
                            lineHeight: 1.6,
                            padding: 2
                          }
                        }}
                        sx={{
                          backgroundColor: theme.palette.background.paper,
                          borderRadius: 3,
                          width: '100%',
                          '& .MuiInputBase-root': {
                            alignItems: 'flex-start'
                          }
                        }}
                        error={!!errors.descriptions?.[index]?.name}
                        helperText={errors.descriptions?.[index]?.name?.message}
                      />
                    )}
                  />
                </Box>
                <Box
                  sx={{
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: 3,
                    width: '30vw',
                    padding: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    wordWrap: 'break-word',
                    border: `1px solid ${theme.palette.divider}`,
                    '& *': {
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word'
                    }
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.secondary,
                      mb: 1,
                      fontStyle: 'italic'
                    }}
                  >
                    Preview:
                  </Typography>
                  <Box
                    sx={{
                      flex: 1,
                      overflow: 'auto'
                    }}
                  >
                    {watch(`descriptions.${index}.name`) ? (
                      <NERMarkdown markdown={watch(`descriptions.${index}.name`)} />
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.palette.text.disabled,
                          fontStyle: 'italic'
                        }}
                      >
                        Start typing to see formatted markdown...
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Stack>
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
