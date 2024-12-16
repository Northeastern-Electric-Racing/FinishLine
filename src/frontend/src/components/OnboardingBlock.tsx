import { useEffect, useState } from 'react';
import { Box, Grid, Typography, useTheme, TextField } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { Organization } from 'shared';
import NERFormModal from './NERFormModal';
import { useForm } from 'react-hook-form';
import { useSetOnboardingText } from '../hooks/organizations.hooks';
import { useToast } from '../hooks/toasts.hooks';

interface OnboardingBlockProps {
  organization: Organization;
  isAdmin?: boolean;
}

interface OnboardingTextFormData {
  onboardingText: string;
}

const OnboardingBlock: React.FC<OnboardingBlockProps> = ({ organization, isAdmin }) => {
  const theme = useTheme();
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const setOnboardingText = useSetOnboardingText();

  const { register, handleSubmit, reset } = useForm<OnboardingTextFormData>({
    defaultValues: {
      onboardingText: organization.onboardingText
    }
  });

  useEffect(() => {
    reset({ onboardingText: organization.onboardingText });
  }, [organization.onboardingText, reset, isModalOpen]);

  const handleEdit = () => {
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const onSubmit = async (data: OnboardingTextFormData) => {
    try {
      await setOnboardingText.mutateAsync(data);
      handleClose();
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  return (
    <Grid>
      <Box
        sx={{
          height: '25vh',
          borderRadius: '10px',
          width: '100%',
          background: theme.palette.background.paper
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h5" ml={2} pt={2}>
            Onboarding
          </Typography>
          {isAdmin && (
            <EditIcon
              onClick={handleEdit}
              sx={{
                marginRight: '15px',
                marginTop: '20px',
                cursor: 'pointer'
              }}
            />
          )}
        </Box>
        <Typography sx={{ mt: 1, mb: -1, ml: 2, fontSize: { xs: 16, sm: 16, md: 18 }, marginRight: '15px' }}>
          {organization.onboardingText}
        </Typography>
      </Box>
      <NERFormModal
        open={isModalOpen}
        onHide={handleClose}
        formId="onboarding-text-form"
        title="Edit Onboarding Text"
        reset={reset}
        handleUseFormSubmit={handleSubmit}
        onFormSubmit={onSubmit}
      >
        <TextField
          {...register('onboardingText')}
          fullWidth
          multiline
          minRows={4}
          label="Onboarding Text"
          placeholder="Enter onboarding text"
          margin="normal"
        />
      </NERFormModal>
    </Grid>
  );
};

export default OnboardingBlock;
