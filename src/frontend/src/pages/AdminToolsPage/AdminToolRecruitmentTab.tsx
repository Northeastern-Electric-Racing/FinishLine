import { Box, Grid, Typography } from '@mui/material';
import { NERButton } from '../../components/NERButton';
import { Milestone } from 'shared/src/types/milestone-types';
import { useHistoryState } from '../../hooks/misc.hooks';
import CreateMilestoneFormModal from './RecruitmentConfig/CreateMilestoneFormModal';
import EditMilestoneFormModal from './RecruitmentConfig/EditMilestoneFormModal';
import MilestoneTable from './RecruitmentConfig/MilestoneTable';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { useAllMilestones } from '../../hooks/recruitment.hooks';

const AdminToolsRecruitmentTab: React.FC = () => {
  const [createModalShow, setCreateModalShow] = useHistoryState<boolean>('', false);
  const [editingMilestone, setEditingMilestone] = useHistoryState<Milestone | undefined>('', undefined);
  const {
    isLoading: milestonesIsLoading,
    isError: milestonesIsError,
    error: milestonesError,
    data: milestones
  } = useAllMilestones();

  if (!milestones || milestonesIsLoading) return <LoadingIndicator />;
  if (milestonesIsError) return <ErrorPage message={milestonesError.message} />;

  return (
    <Box padding="5px">
      <CreateMilestoneFormModal open={createModalShow} handleClose={() => setCreateModalShow(false)} />
      {editingMilestone && (
        <EditMilestoneFormModal
          open={!!editingMilestone}
          handleClose={() => setEditingMilestone(undefined)}
          milestone={editingMilestone}
        />
      )}
      <Grid container spacing="3%">
        <Grid item direction="column" xs={12} md={6}>
          <Grid display={'flex'} sx={{ mb: '10px' }}>
            <Typography variant="h4" gutterBottom color="#fff">
              FAQs
            </Typography>
            <NERButton variant="contained" sx={{ ml: 3, mt: 0.5, height: '100%' }}>
              Add FAQ
            </NERButton>
          </Grid>
          {/* <FAQsTable faqs={testFAQs} /> */}
        </Grid>
        <Grid item direction="column" xs={12} md={6}>
          <Grid display={'flex'} sx={{ mb: '10px' }}>
            <Typography variant="h4" gutterBottom color="#fff">
              Timeline
            </Typography>
            <NERButton
              variant="contained"
              sx={{ ml: 3, mt: 0.5, height: '100%' }}
              onClick={() => {
                setCreateModalShow(true);
              }}
            >
              Add Milestone
            </NERButton>
          </Grid>
          <MilestoneTable milestones={milestones} setEditingMilestone={setEditingMilestone} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminToolsRecruitmentTab;
