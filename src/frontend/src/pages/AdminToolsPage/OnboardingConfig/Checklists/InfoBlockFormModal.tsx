import { FormControl, FormLabel, TextField, useTheme, Typography, Box } from '@mui/material';
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import NERFormModal from '../../../../components/NERFormModal';
import { ChecklistCreateArgs } from '../../../../hooks/onboarding.hook';
import { useToast } from '../../../../hooks/toasts.hooks';
import { Checklist, ChecklistItemType, ChecklistPreview } from 'shared';
import NERMarkdown from '../../../../components/NERMarkdown';

interface InfoBlockFormModalProps {
  open: boolean;
  handleClose: () => void;
  onSubmit: (data: ChecklistCreateArgs) => Promise<Checklist>;
  parentChecklist: Checklist;
  defaultValues?: ChecklistPreview;
}

interface InfoBlockFormValues {
  content: string;
}

const schema = yup.object().shape({
  content: yup.string().required('Content is required')
});

const InfoBlockFormModal: React.FC<InfoBlockFormModalProps> = ({
  open,
  handleClose,
  onSubmit,
  parentChecklist,
  defaultValues
}) => {
  const theme = useTheme();
  const toast = useToast();

  const {
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors }
  } = useForm<InfoBlockFormValues>({
    resolver: yupResolver(schema),
    defaultValues: { content: defaultValues?.content ?? '' }
  });

  const contentValue = watch('content');

  const onFormSubmit = async (data: InfoBlockFormValues) => {
    try {
      const formattedData = {
        content: data.content,
        isOptional: true, // INFO blocks are always optional
        parentChecklistId: parentChecklist.checklistId,
        teamId: parentChecklist.team?.teamId,
        teamTypeId: parentChecklist.teamType?.teamTypeId,
        itemType: ChecklistItemType.INFO
      };

      await onSubmit(formattedData);
      handleClose();
    } catch (error) {
      toast.error('Failed to save information block');
      console.error('Error in onFormSubmit:', error);
    }
  };

  return (
    <NERFormModal
      open={open}
      onHide={handleClose}
      title={defaultValues ? 'Edit Information Block' : 'Create Information Block'}
      reset={() => reset({ content: defaultValues?.content ?? '' })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      formId={defaultValues ? 'edit-info-block-form' : 'create-info-block-form'}
      showCloseButton
      paperProps={{ maxWidth: '90vw', minWidth: '80vw' }}
    >
      <Box sx={{ display: 'flex', gap: 3, width: '75vw' }}>
        <FormControl sx={{ flex: 1, minWidth: 0 }}>
          <FormLabel
            sx={{
              color: theme.palette.error.main,
              fontWeight: 'bold',
              fontSize: '1.5rem',
              textDecoration: 'underline',
              mb: 1
            }}
          >
            Content (Markdown)*
          </FormLabel>
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                placeholder="Enter markdown content..."
                fullWidth
                multiline
                variant="outlined"
                minRows={15}
                maxRows={25}
                InputProps={{
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
                  borderRadius: 3
                }}
                error={!!errors.content}
                helperText={errors.content?.message}
              />
            )}
          />
        </FormControl>
        <Box
          sx={{
            flex: 1,
            backgroundColor: theme.palette.background.paper,
            borderRadius: 3,
            padding: 2,
            border: `1px solid ${theme.palette.divider}`,
            maxHeight: '60vh',
            overflow: 'auto'
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.secondary,
              mb: 1,
              fontStyle: 'italic',
              display: 'block'
            }}
          >
            Preview:
          </Typography>
          {contentValue ? (
            <NERMarkdown markdown={contentValue} />
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
    </NERFormModal>
  );
};

export default InfoBlockFormModal;
