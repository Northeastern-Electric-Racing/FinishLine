/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Button, Typography } from '@mui/material';
import { useCurrentUser, useSingleUserSettings } from '../../hooks/users.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import PageLayout from '../../components/PageLayout';

const Apply = () => {
  const user = useCurrentUser();
  const { isLoading, isError, error, data: userSettingsData } = useSingleUserSettings(user.userId);

  if (isLoading || !userSettingsData) return <LoadingIndicator />;
  if (isError) return <ErrorPage error={error} message={error.message} />;

  return (
    <PageLayout title="Home" hidePageTitle>
      <Typography variant="h3" marginLeft="auto" sx={{ marginTop: 2, textAlign: 'center', pt: 3, padding: 0 }}>
        Welcome, {user.firstName}!
      </Typography>
      <Button>
        <a href="/apps" target="_blank" rel="noreferrer">
          View Submissions
        </a>
      </Button>

      <iframe
        src="https://docs.google.com/forms/d/e/1FAIpQLSd-1SLqkmflb5SJtg1QRPS-PkrzcdpDCsF04ZjBjCI3KIpjWQ/viewform?embedded=true"
        width="100%"
        height="991"
        title="Apply"
        style={{ border: 'none' }}
      >
        Loading…
      </iframe>
    </PageLayout>
  );
};

export default Apply;
