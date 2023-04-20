/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ProposedSolution } from 'shared';
import PageBlock from '../../layouts/PageBlock';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { dollarsPipe, weeksPipe } from '../../utils/pipes';
import DeleteIcon from '@mui/icons-material/Delete';
import DetailDisplay from '../../components/DetailDisplay';

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

  return (
    <PageBlock title="" style={{ opacity: faded ? 0.5 : 1 }}>
      {showDeleteButton && onDelete !== undefined ? (
        <Button
          color="error"
          variant="outlined"
          onClick={() => {
            onDelete(proposedSolution);
          }}
          sx={{ position: 'absolute', right: 75 }}
        >
          <DeleteIcon />
        </Button>
      ) : null}
      <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        <Grid item xs={7}>
          <DetailDisplay label="Description" content={proposedSolution.description} />
        </Grid>
        <Grid item xs={3}>
          <DetailDisplay label="Budget Impact" content={dollarsPipe(proposedSolution.budgetImpact)} />
        </Grid>
        <Grid item xs={2}>
          {proposedSolution.approved ? <Chip label="Approved" color="success" /> : null}
        </Grid>
        <Grid item xs={7}>
          <DetailDisplay label="Scope Impact" content={proposedSolution.scopeImpact} />
        </Grid>
        <Grid item xs={5}>
          <DetailDisplay label="Timeline Impact" content={weeksPipe(proposedSolution.timelineImpact)} />
        </Grid>
      </Grid>
    </PageBlock>
  );
};

export default ProposedSolutionView;
