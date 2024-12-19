import React, { useEffect } from 'react';
import { Box, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';
import NERFormModal from '../../../components/NERFormModal';
import { useSetApplicationLink } from '../../../hooks/organizations.hooks';
import { useToast } from '../../../hooks/toasts.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object().shape({
  applicationLink: yup.string().required('URL is required!').url('Invalid URL')
});

interface LinkModalProps {
  open: boolean;
  onHide: () => void;
  currentApplicationLink?: string;
}

interface LinkFormData {
  applicationLink: string;
}

const EditLinkModal: React.FC<LinkModalProps> = ({ open, onHide, currentApplicationLink }) => {
  const toast = useToast();
  const { mutateAsync, isLoading } = useSetApplicationLink();

  const { register, handleSubmit, reset } = useForm<LinkFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      applicationLink: currentApplicationLink
    }
  });

  useEffect(() => {
    reset({ applicationLink: currentApplicationLink });
  }, [currentApplicationLink, reset, open]);

  const onSubmit = async (data: LinkFormData) => {
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
      formId="application=link-form"
      title="Edit Application Link"
      reset={reset}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
    >
      <Box sx={{ width: '500px' }}>
        <TextField
          {...register('applicationLink')}
          fullWidth
          multiline
          minRows={3}
          maxRows={4}
          label="Application Link"
          placeholder="Enter link"
          margin="normal"
        />
      </Box>
    </NERFormModal>
  );
};

export default EditLinkModal;
