/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ProposedSolution } from 'shared';
import PageBlock from '../../layouts/PageBlock';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { dollarsPipe, weeksPipe } from '../../utils/pipes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { formatKeyValue } from '../../styling/keyValueSameLine';

interface ProposedSolutionViewProps {
  proposedSolution: ProposedSolution;
  showDeleteButton?: boolean;
  onDelete?: (proposedSolution: ProposedSolution) => void;
}

const ProposedSolutionView: React.FC<ProposedSolutionViewProps> = ({ proposedSolution, showDeleteButton, onDelete }) => {
  return (
    <PageBlock title="">
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
        <Grid item xs={7}>
          {formatKeyValue('Description', proposedSolution.description)}
        </Grid>
        <Grid item xs={3}>
          {formatKeyValue('Budget Impact', dollarsPipe(proposedSolution.budgetImpact))}
        </Grid>
        <Grid item xs={2}>
          <Typography sx={{ fontWeight: 'bold' }}>
            {proposedSolution.approved ? <Chip label="Approved" color="success" /> : null}{' '}
          </Typography>
        </Grid>
        <Grid item xs={7}>
          {formatKeyValue('Scope Impact', proposedSolution.scopeImpact)}
        </Grid>
        <Grid item xs={5}>
          {formatKeyValue('Timeline Impact', weeksPipe(proposedSolution.timelineImpact))}
        </Grid>
      </Grid>
    </PageBlock>
  );
};

export default ProposedSolutionView;
