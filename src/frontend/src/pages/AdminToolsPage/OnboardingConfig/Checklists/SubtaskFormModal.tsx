import { useForm, Controller } from 'react-hook-form';
import NERFormModal from '../../../../components/NERFormModal';
import { FormControl, FormLabel, Box, TextField, useTheme, Checkbox, InputAdornment } from '@mui/material';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Checklist, ChecklistPreview } from 'shared';
import { ChecklistCreateArgs, SubtaskCreateArgs } from '../../../../hooks/onboarding.hook';
import { useToast } from '../../../../hooks/toasts.hooks';
import React from 'react';

interface SubtaskFormModalProps {
  open: boolean;
  handleClose: () => void;
  onSubmit: (data: ChecklistCreateArgs) => Promise<Checklist>;
  parentChecklist: Checklist;
  defaultValues?: ChecklistPreview;
}

const SubtaskFormModal = ({ open, handleClose, onSubmit, parentChecklist, defaultValues }: SubtaskFormModalProps) => {
  const theme = useTheme();
  const toast = useToast();
  const schema = yup.object().shape({
    name: yup.string().required('Name is Required'),
    isOptional: yup.boolean().required('Optional is Required')
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<SubtaskCreateArgs>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      isOptional: defaultValues?.isOptional ?? false
    }
  });

  const onFormSubmit = async (data: ChecklistCreateArgs) => {
    try {
      const formattedData = {
        ...data,
        descriptions: [],
        parentChecklistId: parentChecklist.checklistId,
        teamId: parentChecklist.team?.teamId,
        teamTypeId: parentChecklist.teamType?.teamTypeId
      };

      await onSubmit(formattedData);
      handleClose();
    } catch (error) {
      toast.error('Failed to create checklist');
      console.error('Error in onFormSubmit:', error);
    }
  };

  return (
    <NERFormModal
      open={open}
      onHide={handleClose}
      title={!!defaultValues ? 'Edit Subtask' : 'Create Subtask'}
      reset={() => reset({ name: '', isOptional: false })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      formId={!!defaultValues ? 'edit-UsefulLink-form' : 'create-UsefulLink-form'}
      showCloseButton
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <FormControl fullWidth>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormLabel
              sx={{
                color: theme.palette.error.main,
                fontWeight: 'bold',
                fontSize: '1.5rem',
                textDecoration: 'underline',
                width: '30vw'
              }}
            >
              Subtask Name*
            </FormLabel>
          </Box>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                placeholder="Subtask Name"
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end" sx={{ display: 'flex', alignItems: 'center' }}>
                      <FormLabel
                        sx={{
                          color: theme.palette.text.primary,
                          fontSize: '0.9rem',
                          mr: 1
                        }}
                      >
                        Optional?
                      </FormLabel>
                      <Controller
                        name="isOptional"
                        control={control}
                        render={({ field: checkboxField }) => (
                          <Checkbox
                            {...checkboxField}
                            checked={checkboxField.value}
                            onChange={(e) => checkboxField.onChange(e.target.checked)}
                          />
                        )}
                      />
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
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            )}
          />
        </FormControl>
      </Box>
    </NERFormModal>
  );
};

export default SubtaskFormModal;
