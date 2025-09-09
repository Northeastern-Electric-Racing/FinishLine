import { Box, Grid, Typography } from '@mui/material';
import { groupChecklists } from '../../../utils/onboarding.utils';
import Checklist from './Checklist';
import { Checklist as ChecklistType } from 'shared';
import { useCurrentOrganization } from '../../../hooks/organizations.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import ExternalLink from '../../../components/ExternalLink';

interface ChecklistSectionProps {
  usersChecklists: ChecklistType[];
  checkedChecklists: ChecklistType[];
}

const ChecklistSection: React.FC<ChecklistSectionProps> = ({ usersChecklists, checkedChecklists }) => {
  const groupedChecklists = groupChecklists(usersChecklists);

  const { data: organization, isLoading, error, isError } = useCurrentOrganization();

  if (!organization || isLoading) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

  return (
    <Box>
      <Grid container>
        {organization.applicationLink && (
          <Grid item xs={12} padding={2}>
            <Typography variant="h3" gutterBottom>
              APPLY <ExternalLink link={organization.applicationLink} description="HERE" /> THEN CONTINUE
            </Typography>
          </Grid>
        )}
        {Object.entries(groupedChecklists).map(([checklistName, checklists]) => (
          <Grid item xs={12} padding={2} key={checklistName}>
            <Checklist parentChecklists={checklists} checkedChecklists={checkedChecklists} checklistName={checklistName} />
          </Grid>
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
