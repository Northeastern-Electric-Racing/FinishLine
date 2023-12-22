/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ProposedSolution, isGuest } from 'shared';
import ProposedSolutionForm from './ProposedSolutionForm';
import { useState } from 'react';
import { useCreateProposeSolution } from '../../hooks/change-requests.hooks';
import ErrorPage from '../ErrorPage';
import LoadingIndicator from '../../components/LoadingIndicator';
import { Box, Button, Chip, Grid, Typography, useTheme } from '@mui/material';
import { useToast } from '../../hooks/toasts.hooks';
import DetailDisplay from '../../components/DetailDisplay';
import { weeksPipe } from '../../utils/pipes';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { useCurrentUser } from '../../hooks/users.hooks';

interface ProposedSolutionsListProps {
  proposedSolutions: ProposedSolution[];
  crReviewed?: boolean;
  crId: number;
}

const ProposedSolutionsList: React.FC<ProposedSolutionsListProps> = ({ proposedSolutions, crReviewed, crId }) => {
  const [showEditableForm, setShowEditableForm] = useState<boolean>(false);
  const user = useCurrentUser();
  const { isLoading, isError, error, mutateAsync } = useCreateProposeSolution();
  const toast = useToast();
  const theme = useTheme();

  if (isLoading) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

  const { userId } = user;

  const addProposedSolution = async (data: ProposedSolution) => {
    setShowEditableForm(false);
    const { description, timelineImpact, scopeImpact, budgetImpact } = data;
    try {
      // send the details of new proposed solution to the backend database
      await mutateAsync({
        submitterId: userId,
        crId,
        description,
        scopeImpact,
        timelineImpact,
        budgetImpact
      });
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  return (
    <Box>
      {showEditableForm ? (
        <ProposedSolutionForm
          onAdd={addProposedSolution}
          open={showEditableForm}
          onClose={() => setShowEditableForm(false)}
        />
      ) : null}
      <Box display="flex" justifyContent="space-between" mb="10px">
        <Typography variant="h5">Proposed Solutions</Typography>
        {crReviewed === undefined && !isGuest(user.role) && (
          <Button
            onClick={() => setShowEditableForm(true)}
            variant="contained"
            color="success"
            sx={{ maxHeight: { xs: 105, md: 35 }, height: {} }}
          >
            + Add Solution
          </Button>
        )}
      </Box>
      {proposedSolutions.map((proposedSolution) => (
        <Grid
          style={{ opacity: 1 }}
          sx={{
            minHeight: 300,
            p: 2,
            mb: 5,
            bgcolor: theme.palette.background.paper,
            width: '100%',
            borderRadius: '8px 8px 8px 8px',
            boxShadow: 1
          }}
        >
          <Grid container rowSpacing={1}>
            <Grid item xs={12} sx={{ p: 2, mt: 1, minHeight: 100, borderRadius: 1, bgcolor: '#474848' }}>
              <DetailDisplay label="Description" content={proposedSolution.description} />
            </Grid>
            <Grid item xs={12} sx={{ p: 2, mt: 2, minHeight: 100, borderRadius: 1, bgcolor: '#474848' }}>
              <DetailDisplay label="Scope Impact" content={proposedSolution.scopeImpact} />
            </Grid>
            <Grid item xs={7} display="flex" sx={{ marginTop: 0.5 }}>
              <AttachMoneyIcon sx={{ mr: 1 }} />
              <Typography>{proposedSolution.budgetImpact}</Typography>
            </Grid>
            <Grid item xs={12} display="flex" justifyContent="space-between">
              <Grid display="flex" sx={{ marginTop: 0.5 }}>
                <ScheduleIcon sx={{ mr: 1 }} />
                <Typography>{weeksPipe(proposedSolution.timelineImpact)}</Typography>
              </Grid>
              <Grid item>{proposedSolution.approved && <Chip label="Approved" color="success" />}</Grid>
            </Grid>
          </Grid>
        </Grid>
      ))}
    </Box>
  );
};

export default ProposedSolutionsList;
