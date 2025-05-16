import { useForm } from 'react-hook-form';
import LoadingIndicator from '../../../components/LoadingIndicator';
import NERFormModal from '../../../components/NERFormModal';
import { SponsorPayload, useCreateSponsor } from '../../../hooks/finance.hooks';
import ErrorPage from '../../ErrorPage';
import sponsorSchema, { SponsorForm } from './SponsorForm';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box } from '@mui/system';

interface CreateSponsorModalProps {
  showModal: boolean;
  handleClose: () => void;
}

const CreateSponsorModal = ({ showModal, handleClose }: CreateSponsorModalProps) => {
  const { isLoading, isError, error, mutateAsync } = useCreateSponsor();

  const {
    reset,
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
      taxExempt: undefined,
      discountCode: '',
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
    <Box>
      <NERFormModal
        open={showModal}
        onHide={handleClose}
        title={'Create Sponsor'}
        reset={() => reset()}
        handleUseFormSubmit={handleSubmit}
        onFormSubmit={onFormSubmit}
        formId={'create-sponsor-form'}
        showCloseButton
      >
        <SponsorForm control={control} errors={errors} />
      </NERFormModal>
    </Box>
  );
};

export default CreateSponsorModal;
