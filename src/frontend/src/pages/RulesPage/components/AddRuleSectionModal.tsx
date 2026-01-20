import { useState } from 'react';
import { Box, Typography, useTheme, TextField } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import NERFormModal from '../../../components/NERFormModal';
import { useToast } from '../../../hooks/toasts.hooks';
import { useCreateRule } from '../../../hooks/rules.hooks';

interface AddRuleSectionModalProps {
  open: boolean;
  onClose: () => void;
  rulesetId: string;
}

interface FormData {
  name: string;
}

const schema = yup.object().shape({
  name: yup.string().required('Name is required')
});

const AddRuleSectionModal: React.FC<AddRuleSectionModalProps> = ({ open, onClose, rulesetId }) => {
  const theme = useTheme();
  const toast = useToast();
  const { mutateAsync: createRule } = useCreateRule();

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: ''
    }
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createRule({
        ruleCode: data.name,
        ruleContent: '_',
        rulesetId,
        referencedRules: [],
        imageFileIds: []
      });

      toast.success('Rule section created successfully');
      handleClose();
    } catch (error) {
      toast.error('Failed to create rule section');
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const textFieldStyles = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: theme.palette.action.hover,
      borderRadius: '8px',
      '& fieldset': {
        border: 'none'
      },
      '&:hover fieldset': {
        border: 'none'
      },
      '&.Mui-focused fieldset': {
        border: 'none'
      }
    },
    '& .MuiInputBase-input': {
      color: theme.palette.text.primary,
      py: 1.5,
      px: 2.5
    }
  };

  return (
    <NERFormModal
      open={open}
      onHide={handleClose}
      reset={reset}
      title="Add Rule Section"
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      formId="add-rule-section-form"
      showCloseButton
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 2, minWidth: '500px' }}>
        {/* Name Rule Section */}
        <Box>
          <Typography
            variant="h4"
            sx={{ color: theme.palette.primary.main, textDecoration: 'underline', fontSize: 30, mb: 2 }}
          >
            Name Rule Section:
          </Typography>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                placeholder="Name Rule Section"
                error={!!errors.name}
                helperText={errors.name?.message}
                sx={textFieldStyles}
              />
            )}
          />
        </Box>
      </Box>
    </NERFormModal>
  );
};

export default AddRuleSectionModal;
