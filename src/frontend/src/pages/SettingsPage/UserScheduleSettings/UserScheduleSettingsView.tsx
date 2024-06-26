/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Grid } from '@mui/material';
import DetailDisplay from '../../../components/DetailDisplay';
import { NERButton } from '../../../components/NERButton';
import { DesignReview, getAvailabilityForGivenWeekOfDateOrMostRecent, UserScheduleSettings } from 'shared';
import { useState } from 'react';
import SingleAvailabilityModal from './Availability/SingleAvailabilityModal';
import AvailabilityEditModal from './Availability/AvailabilityEditModal';
import { useMarkUserConfirmed } from '../../../hooks/design-reviews.hooks';
import { useToast } from '../../../hooks/toasts.hooks';

const UserScheduleSettingsView = ({
  scheduleSettings,
  designReview
}: {
  scheduleSettings: UserScheduleSettings;
  designReview?: DesignReview;
}) => {
  const availability = getAvailabilityForGivenWeekOfDateOrMostRecent(
    scheduleSettings.availabilities,
    designReview?.dateScheduled ?? new Date()
  );

  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const toast = useToast();
  const defaultOpen = designReview !== undefined;
  const [confirmAvailabilityOpen, setConfirmAvailabilityOpen] = useState(defaultOpen || false);
  const [confirmedAvailabilities, setConfirmedAvailabilities] = useState(availability.availability);
  const { mutateAsync } = useMarkUserConfirmed(designReview?.designReviewId || '');
  const confirmModalTitle = designReview
    ? `Update your availability for the ${designReview?.wbsName} Design Review on the week of ${new Date(
        designReview.dateScheduled.getTime() - designReview.dateScheduled.getTimezoneOffset() * -60000
      ).toLocaleDateString()}`
    : '';

  const handleConfirm = async (payload: { availability: number[] }) => {
    setConfirmAvailabilityOpen(false);
    try {
      await mutateAsync(payload);
      toast.success('Availability Confirmed!');
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  return (
    <Grid container rowSpacing={1} columnSpacing={4}>
      <SingleAvailabilityModal
        open={availabilityOpen}
        onHide={() => setAvailabilityOpen(false)}
        header={'Availability'}
        availabilites={availability.availability}
      />
      <AvailabilityEditModal
        open={confirmAvailabilityOpen}
        onHide={() => setConfirmAvailabilityOpen(false)}
        header={confirmModalTitle}
        availabilites={confirmedAvailabilities}
        setAvailabilities={setConfirmedAvailabilities}
        onSubmit={() => handleConfirm({ availability: confirmedAvailabilities })}
      />
      <Grid item xs={12} md={'auto'}>
        <DetailDisplay label="Personal Google Email" content={scheduleSettings.personalGmail} />
      </Grid>
      <Grid item xs={12} md={'auto'} pb={-1}>
        <DetailDisplay label="Personal Zoom Link" content={scheduleSettings.personalZoomLink} />
      </Grid>
      <Grid item xs={12} md={'auto'} mt={-1} display="flex" justifyContent={'flex-end'}>
        <NERButton variant="contained" onClick={() => setAvailabilityOpen(true)}>
          View Availability
        </NERButton>
      </Grid>
    </Grid>
  );
};

export default UserScheduleSettingsView;
