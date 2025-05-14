import { Sponsor } from 'shared';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useEditSponsor } from '../../../hooks/finance.hooks';
import ErrorPage from '../../ErrorPage';
import SidePage from './SidePagePopup';
import { SponsorForm } from './SponsorForm';
import { NERButton } from '../../../components/NERButton';
import { Box } from '@mui/system';
import { SubmitButton } from '../../../components/SubmitButton';

interface EditSponsorPageProps {
  showPage: boolean;
  handleClose: () => void;
  sponsor: Sponsor;
}

const EditSponsorPage = ({ showPage, handleClose, sponsor }: EditSponsorPageProps) => {
  const { isLoading, isError, error, mutateAsync } = useEditSponsor(sponsor.sponsorId);

  // const {
  //   handleSubmit,
  //   control,
  //   formState: { errors }
  // } = useForm<EditSponsorPayload>({
  //   resolver: yupResolver(sponsorSchema),
  //   defaultValues: {
  //     name: sponsor.name,
  //     activeStatus: sponsor.activeStatus,
  //     sponsorValue: sponsor.sponsorValue,
  //     joinDate: sponsor.joinDate,
  //     activeYears: sponsor.activeYears,
  //     sponsorTierId: sponsor.tier.sponsorTierId,
  //     vendorContact: sponsor.vendorContact,
  //     taxExempt: sponsor.taxExempt,
  //     discountCode: sponsor.discountCode ?? '',
  //     sponsorTasks: sponsor.sponsorTasks
  //   }
  // });
  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  // needs to submit the data

  return (
    <SidePage
      showPage={showPage}
      handleClose={handleClose}
      title="Edit Sponsor"
      component={
        <Box>
          <SponsorForm></SponsorForm>
          <NERButton onClick={handleClose}>CLOSE</NERButton>
          <SubmitButton onClick={() => {}}>Submit</SubmitButton>
        </Box>
      }
    />
  );
};

export default EditSponsorPage;
