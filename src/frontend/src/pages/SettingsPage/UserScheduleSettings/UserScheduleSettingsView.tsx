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
    <Grid container rowSpacing={1} columnSpacing={4}>
      <SingleAvailabilityModal
        open={availabilityOpen}
        onHide={() => setAvailabilityOpen(false)}
        header={'Availability'}
        availabilites={scheduleSettings.availability}
      />
      <Grid item xs={12} md={'auto'}>
        <DetailDisplay label="Personal Google Email" content={scheduleSettings.personalGmail} />
      </Grid>
      <Grid item xs={12} md={'auto'} pb={1}>
        <DetailDisplay label="Personal Zoom Link" content={scheduleSettings.personalZoomLink} />
      </Grid>
      <Grid item xs={12} md={'auto'} mt={-1}>
        <NERButton variant="contained" onClick={() => setAvailabilityOpen(true)}>
          View Availability
        </NERButton>
      </Grid>
    </Grid>
  );
};

export default UserScheduleSettingsView;
