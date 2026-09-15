import React from 'react';
import { Grid } from '@mui/material';
import NewMemberEventsWidget from './NewMemberEventsWidget';
import NewMemberUsefulLinksWidget from './NewMemberUsefulLinksWidget';
import NewMemberContactsWidget from './NewMemberContactsWidget';

interface NewMemberOnboardingInfoSectionProps {
  /** 'full' (default) shows every widget, for the new member dashboard. 'checklist' shows only
   * useful links and contacts, for the onboarding checklist page. */
  variant?: 'full' | 'checklist';
}

const NewMemberOnboardingInfoSection: React.FC<NewMemberOnboardingInfoSectionProps> = ({ variant = 'full' }) => {
  return (
    <Grid container item sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, width: '100%' }}>
      {variant === 'full' && (
        <Grid item sx={{ width: '100%' }}>
          <NewMemberEventsWidget />
        </Grid>
      )}
      {variant === 'checklist' && (
        <>
          <Grid item sx={{ width: '100%' }}>
            <NewMemberUsefulLinksWidget dashboardFlag="isOnOnboardingDashboard" />
          </Grid>
          <Grid item sx={{ width: '100%' }}>
            <NewMemberContactsWidget />
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default NewMemberOnboardingInfoSection;
