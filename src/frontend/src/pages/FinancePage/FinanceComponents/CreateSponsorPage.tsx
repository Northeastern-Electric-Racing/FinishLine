import { useForm } from 'react-hook-form';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { SponsorPayload, useCreateSponsor, useUploadSponsorLogo } from '../../../hooks/finance.hooks';
import sponsorSchema, { SponsorForm } from './SponsorForm';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box } from '@mui/system';
import SidePage from './SidePagePopup';
import NERFailButton from '../../../components/NERFailButton';
import NERSuccessButton from '../../../components/NERSuccessButton';
import { useState } from 'react';
import { useToast } from '../../../hooks/toasts.hooks';

interface CreateSponsorPageProps {
  showPage: boolean;
  handleClose: () => void;
}

const CreateSponsorPage = ({ showPage, handleClose }: CreateSponsorPageProps) => {
  const toast = useToast();
  const { isLoading, mutateAsync } = useCreateSponsor();
  const { mutateAsync: uploadLogo } = useUploadSponsorLogo();

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors }
  } = useForm<SponsorPayload>({
    resolver: yupResolver(sponsorSchema),
    defaultValues: {
      name: '',
      activeStatus: undefined,
      valueTypes: ['MONETARY'],
      sponsorValue: 0,
      joinDate: new Date(),
      activeYears: [],
      sponsorTierId: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      contactPosition: '',
      taxExempt: false,
      discountCode: '',
      sponsorNotes: '',
      stockDescription: '',
      discountDescription: '',
      sponsorTasks: []
    }
  });

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [logoImage, setLogoImage] = useState<File | null>(null);

  if (isLoading) return <LoadingIndicator />;

  const onFormSubmit = async (formData: SponsorPayload) => {
    try {
      setSubmitError(null);
      const sponsor = await mutateAsync(formData);
      if (logoImage) {
        await uploadLogo({ sponsorId: sponsor.sponsorId, logoImage });
      }
      toast.success('Sponsor created successfully!');
      handleClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
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
          <SponsorForm control={control} errors={errors} setValue={setValue} onLogoImageChange={setLogoImage} />
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
