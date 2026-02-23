/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box } from '@mui/system';
import { useState } from 'react';
import { useToast } from '../../../hooks/toasts.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useCreateProspectiveSponsor } from '../../../hooks/finance.hooks';
import SidePage from './SidePagePopup';
import NERFailButton from '../../../components/NERFailButton';
import NERSuccessButton from '../../../components/NERSuccessButton';
import { ProspectiveSponsorForm, ProspectiveSponsorFormInputs, prospectiveSponsorSchema } from './ProspectiveSponsorForm';
import { FirstContactMethod } from 'shared';

interface CreateProspectiveSponsorPageProps {
  showPage: boolean;
  handleClose: () => void;
}

const CreateProspectiveSponsorPage = ({ showPage, handleClose }: CreateProspectiveSponsorPageProps) => {
  const toast = useToast();
  const { isLoading, mutateAsync } = useCreateProspectiveSponsor();

  const {
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<ProspectiveSponsorFormInputs>({
    resolver: yupResolver(prospectiveSponsorSchema),
    defaultValues: {
      organizationName: '',
      lastContactDate: new Date(),
      firstContactMethod: '' as FirstContactMethod,
      contactName: '',
      contactorUserId: '',
      highlightThresholdDays: 10,
      contactEmail: '',
      contactPhone: '',
      contactPosition: '',
      notes: '',
      tasks: []
    }
  });

  const [submitError, setSubmitError] = useState<string | null>(null);

  if (isLoading) return <LoadingIndicator />;

  const onFormSubmit = async (formData: ProspectiveSponsorFormInputs) => {
    try {
      setSubmitError(null);
      await mutateAsync({
        organizationName: formData.organizationName,
        lastContactDate: formData.lastContactDate,
        firstContactMethod: formData.firstContactMethod,
        contactName: formData.contactName,
        contactorUserId: formData.contactorUserId,
        highlightThresholdDays: formData.highlightThresholdDays,
        contactEmail: formData.contactEmail || undefined,
        contactPhone: formData.contactPhone || undefined,
        contactPosition: formData.contactPosition || undefined,
        notes: formData.notes || undefined,
        tasks: formData.tasks
      });
      toast.success('Prospective sponsor created successfully!');
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
      title="Add Prospective Sponsor"
      component={
        <Box display="flex" flexDirection="column" alignItems="flex-end">
          <ProspectiveSponsorForm control={control} errors={errors} />
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

export default CreateProspectiveSponsorPage;
