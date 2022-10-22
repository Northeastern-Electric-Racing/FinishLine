/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ProposedSolution } from 'shared';
import PageBlock from '../../layouts/PageBlock';
import { Badge, Button, Grid } from '@mui/material';
import { dollarsPipe, weeksPipe } from '../../utils/Pipes';
import styles from '../../stylesheets/pages/change-request-detail-page/proposed-solution-view.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

interface ProposedSolutionViewProps {
  proposedSolution: ProposedSolution;
  showDeleteButton?: boolean;
  onDelete?: (proposedSolution: ProposedSolution) => void;
}

const ProposedSolutionView: React.FC<ProposedSolutionViewProps> = ({ proposedSolution, showDeleteButton, onDelete }) => {
  const spacer = 'mb-2';
  return (
    <PageBlock title="" cardContainerStyle="mb-1" cardBodyStyle="pt-1 pb-2">
      <Grid container spacing={2}>
        <Grid className={spacer + ' ' + styles.descLabelContainer}>
          <b>Description</b>
          {proposedSolution.approved ? (
            <b>
              <Badge variant="standard">Approved</Badge>
            </b>
          ) : null}
          {showDeleteButton && onDelete !== undefined ? (
            <Button
              variant="outlined"
              onClick={() => {
                onDelete(proposedSolution);
              }}
            >
              <FontAwesomeIcon icon={faTrash} size="lg" data-testid={'deleteIcon'} />
            </Button>
          ) : null}
        </Grid>
        <Grid className={spacer}>{proposedSolution.description}</Grid>
        <Grid className={spacer}>
          <b>Impact</b>
        </Grid>
        <Grid>
          <Grid className={spacer} xs={7} sm={6} md={4} lg={3} xl={2}>
            <b>Budget Impact</b>
          </Grid>
          <Grid className={spacer}>{dollarsPipe(proposedSolution.budgetImpact)}</Grid>
        </Grid>
        <Grid>
          <Grid className={spacer} xs={7} sm={6} md={4} lg={3} xl={2}>
            <b>Timeline Impact</b>
          </Grid>
          <Grid className={spacer}>{weeksPipe(proposedSolution.timelineImpact)}</Grid>
        </Grid>
        <Grid>
          <Grid className={spacer} md={4} lg={3} xl={2}>
            <b>Scope Impact</b>
          </Grid>
          <Grid className={spacer}>{proposedSolution.scopeImpact}</Grid>
        </Grid>
      </Grid>
    </PageBlock>
  );
};

export default ProposedSolutionView;
