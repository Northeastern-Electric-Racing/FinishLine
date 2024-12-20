import { useUpdateApplicationLink } from '../../../hooks/organizations.hooks';
import { useToast } from '../../../hooks/toasts.hooks';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect } from 'react';
import LoadingIndicator from '../../../components/LoadingIndicator';
import NERFormModal from '../../../components/NERFormModal';
import { Box, TextField } from '@mui/material';

const schema = yup.object().shape({
  applicationLink: yup.string().required('Application Link is Required').url('Please Enter a Valid URL')
});

interface UpdateApplicatioinLinkModalProps {
  open: boolean;
  onHide: () => void;
  currentApplicationLink?: string;
}

interface ApplicationLinkFormData {
  applicationLink: string;
}

const UpdateApplicationLinkModal: React.FC<UpdateApplicatioinLinkModalProps> = ({
  open,
  onHide,
  currentApplicationLink
}) => {
  const toast = useToast();
  const { mutateAsync, isLoading } = useUpdateApplicationLink();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ApplicationLinkFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      applicationLink: currentApplicationLink
    }
  });

  useEffect(() => {
    reset({ applicationLink: currentApplicationLink });
  }, [currentApplicationLink, open, reset]);

  const onSubmit = async (data: ApplicationLinkFormData) => {
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
      formId="application-link-form"
      title="Update Application Link"
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
          placeholder="Enter application link"
          margin="normal"
          error={!!errors.applicationLink}
          helperText={errors.applicationLink?.message}
        />
      </Box>
    </NERFormModal>
  );
};

export default UpdateApplicationLinkModal;
