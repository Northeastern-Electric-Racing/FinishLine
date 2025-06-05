import { useForm } from 'react-hook-form';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { SponsorPayload, useCreateSponsor } from '../../../hooks/finance.hooks';
import ErrorPage from '../../ErrorPage';
import sponsorSchema, { SponsorForm } from './SponsorForm';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box } from '@mui/system';
import SidePage from './SidePagePopup';
import NERFailButton from '../../../components/NERFailButton';
import NERSuccessButton from '../../../components/NERSuccessButton';

interface CreateSponsorPageProps {
  showPage: boolean;
  handleClose: () => void;
}

const CreateSponsorPage = ({ showPage, handleClose }: CreateSponsorPageProps) => {
  const { isLoading, isError, error, mutateAsync } = useCreateSponsor();

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
      vendorContact: '',
      taxExempt: false,
      sponsorTasks: []
    }
  });

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  const onFormSubmit = async (formData: SponsorPayload) => {
    await mutateAsync({ ...formData });
    handleClose();
  };

  return (
    <SidePage
      showPage={showPage}
      handleClose={handleClose}
      title="Add Sponsor"
      component={
        <Box display="flex" flexDirection="column" alignItems="flex-end">
          <SponsorForm control={control} errors={errors} />
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
