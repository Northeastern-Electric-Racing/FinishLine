/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Grid } from '@mui/material';
import DetailDisplay from '../../../components/DetailDisplay';
import { NERButton } from '../../../components/NERButton';
import { UserScheduleSettings } from 'shared';
import { useState } from 'react';
import SingleAvailabilityModal from './Availability/SingleAvailabilityModal';

const UserScheduleSettingsView = ({ scheduleSettings }: { scheduleSettings: UserScheduleSettings }) => {
  const [availabilityOpen, setAvailabilityOpen] = useState(false);

  return (
    <Grid container spacing={6} sx={{ pt: '10px' }}>
      <SingleAvailabilityModal
        open={availabilityOpen}
        onHide={() => setAvailabilityOpen(false)}
        header={'Availability'}
        availabilites={scheduleSettings.availability}
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
