/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ProposedSolution } from 'shared';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { weeksPipe } from '../../utils/pipes';
import DeleteIcon from '@mui/icons-material/Delete';
import DetailDisplay from '../../components/DetailDisplay';
import { Typography, useTheme } from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ScheduleIcon from '@mui/icons-material/Schedule';

interface ProposedSolutionViewProps {
  proposedSolution: ProposedSolution;
  showDeleteButton?: boolean;
  onDelete?: (proposedSolution: ProposedSolution) => void;
  crReviewed?: boolean;
}

const ProposedSolutionView: React.FC<ProposedSolutionViewProps> = ({
  proposedSolution,
  showDeleteButton,
  onDelete,
  crReviewed
}) => {
  const faded = crReviewed != null && proposedSolution.approved === false;
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Grid
      style={{ opacity: faded ? 0.5 : 1 }}
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
        <Grid item xs={12} sx={{ p: 2, mt: 1, minHeight: 100, borderRadius: 1, bgcolor: isDark ? '#474848' : 'white' }}>
          <DetailDisplay label="Description" content={proposedSolution.description} />
        </Grid>
        <Grid item xs={12} sx={{ p: 2, mt: 2, minHeight: 100, borderRadius: 1, bgcolor: isDark ? '#474848' : 'white' }}>
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
          {showDeleteButton && onDelete !== undefined && (
            <Grid item>
              <Button
                color="error"
                variant="outlined"
                onClick={() => {
                  onDelete(proposedSolution);
                }}
              >
                <DeleteIcon />
              </Button>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default ProposedSolutionView;
