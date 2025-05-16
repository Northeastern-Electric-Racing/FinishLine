import { CreateSponsorTask, Sponsor } from 'shared';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { SponsorPayload, useEditSponsor } from '../../../hooks/finance.hooks';
import ErrorPage from '../../ErrorPage';
import SidePage from './SidePagePopup';
import sponsorSchema, { SponsorForm } from './SponsorForm';

import { Box } from '@mui/system';
import NERFailButton from '../../../components/NERFailButton';
import NERSuccessButton from '../../../components/NERSuccessButton';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

interface EditSponsorPageProps {
  showPage: boolean;
  handleClose: () => void;
  sponsor: Sponsor;
}

const EditSponsorPage = ({ showPage, handleClose, sponsor }: EditSponsorPageProps) => {
  const { isLoading, isError, error, mutateAsync } = useEditSponsor(sponsor.sponsorId);

  const defaultSponsorTasks: CreateSponsorTask[] =
    sponsor.sponsorTasks?.map((task) => ({
      sponsorTaskId: task.sponsorTaskId,
      dueDate: new Date(task.dueDate),
      notifyDate: task.notifyDate ? new Date(task.notifyDate) : undefined,
      assigneeUserId: task.assignee?.userId ?? undefined,
      notes: task.notes
    })) ?? [];

  const {
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<SponsorPayload>({
    resolver: yupResolver(sponsorSchema),
    defaultValues: {
      name: sponsor.name,
      activeStatus: sponsor.activeStatus,
      sponsorValue: sponsor.sponsorValue,
      joinDate: sponsor.joinDate,
      activeYears: sponsor.activeYears,
      sponsorTierId: sponsor.tier.sponsorTierId,
      vendorContact: sponsor.vendorContact,
      taxExempt: sponsor.taxExempt,
      discountCode: sponsor.discountCode ?? '',
      sponsorTasks: defaultSponsorTasks
    }
  });
  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  const onSubmit = async (formData: SponsorPayload) => {
    await mutateAsync({ sponsorId: sponsor.sponsorId, ...formData });
    handleClose();
  };

  return (
    <SidePage
      showPage={showPage}
      handleClose={handleClose}
      title="Edit Sponsor"
      component={
        <Box>
          <SponsorForm control={control} errors={errors} defaultValues={sponsor}></SponsorForm>
          <NERFailButton sx={{ mx: 1 }} onClick={handleClose}>
            CLOSE
          </NERFailButton>
          <NERSuccessButton sx={{ mx: 1 }} onClick={handleSubmit(onSubmit)}>
            Submit
          </NERSuccessButton>
        </Box>
      }
    />
  );
};

export default EditSponsorPage;
