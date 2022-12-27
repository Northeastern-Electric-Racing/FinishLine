/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ProposedSolution } from 'shared';
import PageBlock from '../../layouts/PageBlock';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { dollarsPipe, weeksPipe } from '../../utils/Pipes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

interface ProposedSolutionViewProps {
  proposedSolution: ProposedSolution;
  showDeleteButton?: boolean;
  onDelete?: (proposedSolution: ProposedSolution) => void;
}

const ProposedSolutionView: React.FC<ProposedSolutionViewProps> = ({ proposedSolution, showDeleteButton, onDelete }) => {
  return (
    <PageBlock title="">
      {proposedSolution.approved ? (
        <b style={{ position: 'absolute', right: 75 }}>
          <Chip label="Approved" color="success" />
        </b>
      ) : null}
      {showDeleteButton && onDelete !== undefined ? (
        <Button
          color="error"
          variant="outlined"
          onClick={() => {
            onDelete(proposedSolution);
          }}
          sx={{ position: 'absolute', right: 75 }}
        >
          <FontAwesomeIcon icon={faTrash} size="lg" data-testid={'deleteIcon'} />
        </Button>
      ) : null}
      <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        <Grid item xs={6}>
          <Typography sx={{ fontWeight: 'bold' }}>Description:</Typography>
          <Typography>{proposedSolution.description}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography sx={{ fontWeight: 'bold' }}>Budget Impact: </Typography>
          <Typography>{dollarsPipe(proposedSolution.budgetImpact)}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography sx={{ fontWeight: 'bold' }}>Timeline Impact: </Typography>
          <Typography>{weeksPipe(proposedSolution.timelineImpact)}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography sx={{ fontWeight: 'bold' }}>Scope Impact:</Typography>
          <Typography>{proposedSolution.scopeImpact}</Typography>
        </Grid>
      </Grid>
    </PageBlock>
  );
};

export default ProposedSolutionView;
