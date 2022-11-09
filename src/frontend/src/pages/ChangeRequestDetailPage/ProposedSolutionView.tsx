/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ProposedSolution } from 'shared';
import PageBlock from '../../layouts/PageBlock';
import { Chip, Button, Grid } from '@mui/material';
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
        <b style={{ position: 'absolute', right: 50 }}>
          <Chip label="Approved" color="success" />
        </b>
      ) : null}
      <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        <Grid item xs={6}>
          <b>Description: </b>
          {showDeleteButton && onDelete !== undefined ? (
            <Button
              color="error"
              variant="outlined"
              onClick={() => {
                onDelete(proposedSolution);
              }}
            >
              <FontAwesomeIcon icon={faTrash} size="lg" data-testid={'deleteIcon'} />
            </Button>
          ) : null}
          {proposedSolution.description}
        </Grid>
        <Grid item xs={6}>
          <b>Budget Impact: </b>
          {dollarsPipe(proposedSolution.budgetImpact)}
        </Grid>
        <Grid item xs={6}>
          <b>Timeline Impact: </b>
          {weeksPipe(proposedSolution.timelineImpact)}
        </Grid>
        <Grid item xs={6}>
          <b>Scope Impact: </b>
          {proposedSolution.scopeImpact}
        </Grid>
      </Grid>
    </PageBlock>
  );
};

export default ProposedSolutionView;
