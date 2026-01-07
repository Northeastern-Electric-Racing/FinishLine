import React from 'react';
import { Box, Grid, Link, Typography, useTheme } from '@mui/material';
import { groupChecklists } from '../../../utils/onboarding.utils';
import Checklist from './Checklist';
import { Checklist as ChecklistType } from 'shared';
import { useCurrentOrganization } from '../../../hooks/organizations.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { useGetImageUrl } from '../../../hooks/onboarding.hook';

interface ChecklistSectionProps {
  usersChecklists: ChecklistType[];
  checkedChecklists: ChecklistType[];
}

const ChecklistSection: React.FC<ChecklistSectionProps> = ({ usersChecklists, checkedChecklists }) => {
  const groupedChecklists = groupChecklists(usersChecklists);
  const theme = useTheme();

  const { data: organization, isLoading, error, isError } = useCurrentOrganization();
  const { data: newMemberImageUrl } = useGetImageUrl(organization?.newMemberImageId ?? null);

  if (!organization || isLoading) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

  return (
    <Box>
      <Grid container>
        {/* {organization.applicationLink && (
          <Grid item xs={12} padding={2}>
            <Typography variant="h5" gutterBottom>
              APPLY{' '}
              <Link target="_blank" rel="noopener noreferrer" href={organization.applicationLink}>
                HERE
              </Link>{' '}
              THEN CONTINUE
            </Typography>
          </Grid>
        )} */}
        {Object.entries(groupedChecklists).map(([checklistName, checklists]) => (
          <React.Fragment key={checklistName}>
            <Grid item xs={12} padding={2}>
              <Checklist parentChecklists={checklists} checkedChecklists={checkedChecklists} checklistName={checklistName} />
            </Grid>
            {checklistName === 'General' && newMemberImageUrl && (
              <Grid item xs={12} padding={2}>
                <Box
                  sx={{
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: '10px',
                    padding: 3,
                    width: '100%'
                  }}
                >
                  <Typography variant="h5" sx={{ mb: 2 }}>
                    New Member Events
                  </Typography>
                  <Box
                    component="img"
                    sx={{
                      display: 'block',
                      width: '100%',
                      maxHeight: '500px',
                      objectFit: 'contain',
                      borderRadius: '8px'
                    }}
                    alt="New Member Events"
                    src={newMemberImageUrl}
                  />
                </Box>
              </Grid>
            )}
          </React.Fragment>
        ))}
      </Grid>
      {!usersChecklists.length && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100px',
            marginTop: 6
          }}
        >
          <Typography variant="h2">No checklists found</Typography>
        </Box>
      )}
    </Box>
  );
};

export default ChecklistSection;
