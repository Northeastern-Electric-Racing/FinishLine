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
import { useEditProspectiveSponsor } from '../../../hooks/finance.hooks';
import SidePage from './SidePagePopup';
import NERFailButton from '../../../components/NERFailButton';
import NERSuccessButton from '../../../components/NERSuccessButton';
import {
  ProspectiveSponsorForm,
  ProspectiveSponsorFormInputs,
  prospectiveSponsorSchema
} from './ProspectiveSponsorForm';
import { ProspectiveSponsor } from 'shared';

interface EditProspectiveSponsorPageProps {
  showPage: boolean;
  handleClose: () => void;
  prospectiveSponsor: ProspectiveSponsor;
}

const EditProspectiveSponsorPage = ({
  showPage,
  handleClose,
  prospectiveSponsor
}: EditProspectiveSponsorPageProps) => {
  const toast = useToast();
  const { isLoading, mutateAsync } = useEditProspectiveSponsor();

  const defaultTasks = prospectiveSponsor.tasks?.map((task) => ({
    sponsorTaskId: task.sponsorTaskId,
    dueDate: new Date(task.dueDate),
    notifyDate: task.notifyDate ? new Date(task.notifyDate) : undefined,
    assigneeUserId: task.assignee?.userId,
    notes: task.notes
  })) ?? [];

  const {
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<ProspectiveSponsorFormInputs>({
    resolver: yupResolver(prospectiveSponsorSchema),
    defaultValues: {
      organizationName: prospectiveSponsor.organizationName,
      lastContactDate: prospectiveSponsor.lastContactDate,
      firstContactMethod: prospectiveSponsor.firstContactMethod,
      contactName: prospectiveSponsor.contact.name,
      contactorUserId: prospectiveSponsor.contactor.userId,
      highlightThresholdDays: prospectiveSponsor.highlightThresholdDays,
      contactEmail: prospectiveSponsor.contact.email ?? '',
      contactPhone: prospectiveSponsor.contact.phone ?? '',
      contactPosition: prospectiveSponsor.contact.position ?? '',
      notes: prospectiveSponsor.notes ?? '',
      status: prospectiveSponsor.status,
      tasks: defaultTasks
    }
  });

  const [submitError, setSubmitError] = useState<string | null>(null);

  if (isLoading) return <LoadingIndicator />;

  const onFormSubmit = async (formData: ProspectiveSponsorFormInputs) => {
    try {
      setSubmitError(null);
      await mutateAsync({
        prospectiveSponsorId: prospectiveSponsor.prospectiveSponsorId,
        organizationName: formData.organizationName,
        lastContactDate: formData.lastContactDate,
        status: formData.status!,
        firstContactMethod: formData.firstContactMethod,
        contactName: formData.contactName,
        contactorUserId: formData.contactorUserId,
        highlightThresholdDays: formData.highlightThresholdDays,
        contactEmail: formData.contactEmail || undefined,
        contactPhone: formData.contactPhone || undefined,
        contactPosition: formData.contactPosition || undefined,
        notes: formData.notes || undefined
      });
      toast.success('Prospective sponsor updated successfully!');
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
      title="Edit Prospective Sponsor"
      component={
        <Box display="flex" flexDirection="column" alignItems="flex-end">
          <ProspectiveSponsorForm
            control={control}
            errors={errors}
            defaultValues={prospectiveSponsor}
            isEditMode
          />
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
              SUBMIT
            </NERSuccessButton>
          </Box>
        </Box>
      }
    />
  );
};

export default EditProspectiveSponsorPage;
