/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Grid } from '@mui/material';
import DetailDisplay from '../../../components/DetailDisplay';
import { NERButton } from '../../../components/NERButton';
import { DesignReview, UserScheduleSettings } from 'shared';
import { useState } from 'react';
import SingleAvailabilityModal from './Availability/SingleAvailabilityModal';
import { useCurrentUser } from '../../../hooks/users.hooks';
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
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const toast = useToast();
  const user = useCurrentUser();
  const defaultOpen = designReview && !designReview.confirmedMembers.map((user) => user.userId).includes(user.userId);
  const [confirmAvailabilityOpen, setConfirmAvailabilityOpen] = useState(defaultOpen || false);
  const [confirmedAvailabilities, setConfirmedAvailabilities] = useState(scheduleSettings.availability);
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
    <Grid container spacing={6} sx={{ pt: '10px' }}>
      <SingleAvailabilityModal
        open={availabilityOpen}
        onHide={() => setAvailabilityOpen(false)}
        header={'Availability'}
        availabilites={scheduleSettings.availability}
      />
      <AvailabilityEditModal
        open={confirmAvailabilityOpen}
        onHide={() => setConfirmAvailabilityOpen(false)}
        header={confirmModalTitle}
        availabilites={confirmedAvailabilities}
        setAvailabilities={setConfirmedAvailabilities}
        onSubmit={() => handleConfirm({ availability: confirmedAvailabilities })}
      />
      <Grid item xs={12} sm={6} lg={4}>
        <DetailDisplay label="Personal Google Email" content={scheduleSettings.personalGmail} />
      </Grid>
      <Grid item xs={12} sm={6} lg={5}>
        <DetailDisplay label="Personal Zoom Link" content={scheduleSettings.personalZoomLink} />
      </Grid>
      <Grid item xs={12} lg={3} display="flex" justifyContent={'flex-end'}>
        <NERButton variant="contained" onClick={() => setAvailabilityOpen(true)}>
          View Availability
        </NERButton>
      </Grid>
    </Grid>
  );
};

export default UserScheduleSettingsView;
