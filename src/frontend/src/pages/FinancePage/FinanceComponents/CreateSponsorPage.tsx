import { useForm } from 'react-hook-form';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { SponsorPayload, useCreateSponsor } from '../../../hooks/finance.hooks';
import sponsorSchema, { SponsorForm } from './SponsorForm';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box } from '@mui/system';
import SidePage from './SidePagePopup';
import NERFailButton from '../../../components/NERFailButton';
import NERSuccessButton from '../../../components/NERSuccessButton';
import { useState } from 'react';

interface CreateSponsorPageProps {
  showPage: boolean;
  handleClose: () => void;
}

const CreateSponsorPage = ({ showPage, handleClose }: CreateSponsorPageProps) => {
  const { isLoading, mutateAsync } = useCreateSponsor();

  const {
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<SponsorPayload>({
    resolver: yupResolver(sponsorSchema),
    defaultValues: {
      name: '',
      activeStatus: undefined,
      sponsorValue: 0,
      joinDate: undefined,
      activeYears: [],
      sponsorTierId: '',
      sponsorContact: '',
      taxExempt: false,
      sponsorTasks: []
    }
  });

  const [submitError, setSubmitError] = useState<string | null>(null);
  if (isLoading) return <LoadingIndicator />;

  const onFormSubmit = async (formData: SponsorPayload) => {
    try {
      setSubmitError(null);
      await mutateAsync({ ...formData });
      handleClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setSubmitError(err.message);
      }
    }
  };

  return (
    <SidePage
      showPage={showPage}
      handleClose={handleClose}
      title="Add Sponsor"
      component={
        <Box display="flex" flexDirection="column" alignItems="flex-end">
          <SponsorForm control={control} errors={errors} />
          {submitError && (
            <Box color="error.main" mb={2} fontWeight="bold">
              {submitError}
            </Box>
          )}
          <Box mt={2}>
            <NERFailButton sx={{ mx: 1 }} onClick={handleClose}>
              CLOSE
            </NERFailButton>
            <NERSuccessButton sx={{ mx: 1 }} onClick={handleSubmit(onFormSubmit)}>
              Submit
            </NERSuccessButton>
          </Box>
        </Box>
      }
    />
  );
};

export default CreateSponsorPage;
