import { Grid, Box } from '@mui/material';
import { useAllChecklists } from '../../../hooks/onboarding.hook';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import Checklist from './Checklist';

const ChecklistSection: React.FC = () => {
  const { data: checklists, isError, error, isLoading } = useAllChecklists();

  if (!checklists || isLoading) {
    return <LoadingIndicator />;
  }

  if (isError) {
    return <ErrorPage error={error} />;
  }

  return (
    <Box>
      <Grid container>
        {checklists.map((checklist) => (
          <Grid item xs={12} padding={2}>
            <Checklist checklist={checklist} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ChecklistSection;
