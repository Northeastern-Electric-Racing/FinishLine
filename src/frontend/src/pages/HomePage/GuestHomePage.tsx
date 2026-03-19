/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Grid, Stack, Typography } from '@mui/material';
import PageLayout, { PAGE_GRID_HEIGHT } from '../../components/PageLayout';
import { AuthenticatedUser } from 'shared';
import MemberEncouragement from './components/MemberEncouragement';
import GuestOrganizationInfo from './components/GuestOrganizationInfo';
import FeaturedProjects from './components/FeaturedProjects';
import OrganizationLogo from './components/OrganizationLogo';
import NERModal from '../../components/NERModal';
import { useEffect, useState } from 'react';

interface GuestHomePageProps {
  user: AuthenticatedUser;
}

const GuestHomePage = ({ user }: GuestHomePageProps) => {
  const [showModal, setShowModal] = useState(false);

  // shows modal only once per session
  useEffect(() => {
    const hasSeenModal = sessionStorage.getItem('hasSeenModal');
    if (!hasSeenModal) {
      setShowModal(true);
      sessionStorage.setItem('hasSeenModal', 'true');
    }
  }, []);

  return (
    <PageLayout title="Home" hidePageTitle>
      <Typography variant="h3" marginLeft="auto" sx={{ marginTop: 2, textAlign: 'center', pt: 3, padding: 0 }}>
        Welcome, {user.firstName}!
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          minHeight: `${PAGE_GRID_HEIGHT}vh`,
          mt: 2,
          overflow: 'auto' // Ensures content remains accessible on zoom
        }}
      >
        <Grid container sx={{ flexGrow: 1 }} spacing={2}>
          <Grid item xs={8.5} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Stack sx={{ flexGrow: 1, gap: 1.5 }}>
              <Box sx={{ flexGrow: 1, minHeight: 0, overflow: 'auto' }}>
                <GuestOrganizationInfo />
              </Box>
              <Box sx={{ flexGrow: 1, minHeight: 0, overflow: 'auto' }}>
                <MemberEncouragement />
              </Box>
            </Stack>
          </Grid>
          <Grid item xs={3.5} sx={{ display: 'flex', alignItems: 'center' }}>
            <OrganizationLogo />
          </Grid>
        </Grid>
        <Box sx={{ flexShrink: 0, overflow: 'auto' }}>
          <FeaturedProjects />
        </Box>
      </Box>
      <NERModal
        open={showModal}
        title={'Want to become a member?'}
        onHide={() => setShowModal(false)}
        showCloseButton
        hideFormButtons
      >
        Ask your head to upgrade you to a member to gain full access
      </NERModal>
    </PageLayout>
  );
};

export default GuestHomePage;
