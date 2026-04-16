import { CreateSponsorTask, Sponsor } from 'shared';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { SponsorPayload, useEditSponsor, useUploadSponsorLogo } from '../../../hooks/finance.hooks';
import SidePage from './SidePagePopup';
import sponsorSchema, { SponsorForm } from './SponsorForm';

import { Box } from '@mui/system';
import NERFailButton from '../../../components/NERFailButton';
import NERSuccessButton from '../../../components/NERSuccessButton';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { useToast } from '../../../hooks/toasts.hooks';

interface EditSponsorPageProps {
  showPage: boolean;
  handleClose: () => void;
  sponsor: Sponsor;
}

const EditSponsorPage = ({ showPage, handleClose, sponsor }: EditSponsorPageProps) => {
  const toast = useToast();
  const { isLoading, mutateAsync } = useEditSponsor();
  const { mutateAsync: uploadLogo } = useUploadSponsorLogo();

  const defaultSponsorTasks: CreateSponsorTask[] = (
    sponsor.sponsorTasks?.map((task) => ({
      sponsorTaskId: task.sponsorTaskId,
      dueDate: new Date(task.dueDate),
      notifyDate: task.notifyDate ? new Date(task.notifyDate) : undefined,
      assigneeUserId: task.assignee?.userId ?? undefined,
      notes: task.notes,
      done: task.done
    })) ?? []
  ).sort((a, b) => Number(a.done) - Number(b.done));

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors }
  } = useForm<SponsorPayload>({
    resolver: yupResolver(sponsorSchema),
    defaultValues: {
      name: sponsor.name,
      activeStatus: sponsor.activeStatus,
      valueTypes: sponsor.valueTypes ?? ['MONETARY'],
      sponsorValue: sponsor.sponsorValue,
      joinDate: sponsor.joinDate,
      activeYears: sponsor.activeYears,
      sponsorTierId: sponsor.tier?.sponsorTierId ?? '',
      contactName: sponsor.contact.name,
      contactEmail: sponsor.contact.email ?? undefined,
      contactPhone: sponsor.contact.phone ?? undefined,
      contactPosition: sponsor.contact.position ?? undefined,
      taxExempt: sponsor.taxExempt,
      discountCode: sponsor.discountCode ?? undefined,
      sponsorNotes: sponsor.sponsorNotes ?? undefined,
      stockDescription: sponsor.stockDescription ?? undefined,
      discountDescription: sponsor.discountDescription ?? undefined,
      sponsorTasks: defaultSponsorTasks
    }
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [logoImage, setLogoImage] = useState<File | null>(null);

  if (isLoading) return <LoadingIndicator />;

  const onSubmit = async (formData: SponsorPayload) => {
    try {
      setSubmitError(null);
      await mutateAsync({ sponsorId: sponsor.sponsorId, ...formData });
      if (logoImage) {
        await uploadLogo({ sponsorId: sponsor.sponsorId, logoImage });
      }
      toast.success('Sponsor updated successfully!');
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
      title="Edit Sponsor"
      component={
        <Box display="flex" flexDirection="column" alignItems="flex-end">
          <SponsorForm control={control} errors={errors} setValue={setValue} defaultValues={sponsor} onLogoImageChange={setLogoImage} />
          {submitError && (
            <Box color="error.main" mb={2} fontWeight="bold">
              {submitError}
            </Box>
          )}
          <Box mt={2}>
            <NERFailButton sx={{ mx: 1 }} onClick={handleClose}>
              CLOSE
            </NERFailButton>
            <NERSuccessButton sx={{ mx: 1 }} onClick={handleSubmit(onSubmit)}>
              SUBMIT
            </NERSuccessButton>
          </Box>
        </Box>
      }
    />
  );
};

export default EditSponsorPage;
