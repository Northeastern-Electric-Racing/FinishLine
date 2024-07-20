/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Typography } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import { AuthenticatedUser } from 'shared';

interface GuestHomePageProps {
  user: AuthenticatedUser;
}

const GuestHomePage = ({ user }: GuestHomePageProps) => {
  return (
    <PageLayout title="Home" hidePageTitle>
      <Typography variant="h3" marginLeft="auto" sx={{ marginTop: 2, textAlign: 'center', pt: 3, padding: 0 }}>
        Welcome, {user.firstName}!
      </Typography>
    </PageLayout>
  );
};

export default GuestHomePage;
