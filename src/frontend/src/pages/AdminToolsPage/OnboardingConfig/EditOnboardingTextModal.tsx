import React, { useEffect } from 'react';
import { TextField } from '@mui/material';
import { useForm } from 'react-hook-form';
import NERFormModal from '../../../components/NERFormModal';
import { useSetOnboardingText } from '../../../hooks/organizations.hooks';
import { useToast } from '../../../hooks/toasts.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object().shape({
  onboardingText: yup.string().required('Onboarding Text is Required')
});

interface OnboardingTextModalProps {
  open: boolean;
  onHide: () => void;
  currentOnboardingText?: string;
}

interface OnboardingTextFormData {
  onboardingText: string;
}

const EditOnboardingTextModal: React.FC<OnboardingTextModalProps> = ({ open, onHide, currentOnboardingText }) => {
  const toast = useToast();
  const { mutateAsync, isLoading } = useSetOnboardingText();

  const { register, handleSubmit, reset } = useForm<OnboardingTextFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      onboardingText: currentOnboardingText
    }
  });

  useEffect(() => {
    reset({ onboardingText: currentOnboardingText });
  }, [currentOnboardingText, reset, open]);

  const onSubmit = async (data: OnboardingTextFormData) => {
    try {
      await mutateAsync(data);
      onHide();
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  if (isLoading) return <LoadingIndicator />;

  return (
    <NERFormModal
      open={open}
      onHide={onHide}
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
  );
};

export default EditOnboardingTextModal;
