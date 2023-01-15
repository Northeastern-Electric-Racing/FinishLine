/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ProposedSolution } from 'shared';
import { dollarsPipe, weeksPipe } from '../../utils/pipes';
import { Box, Card, CardContent, Chip, Grid } from '@mui/material';

interface ProposedSolutionSelectItemProps {
  proposedSolution: ProposedSolution;
  selected: boolean;
  onClick: () => void;
}

const ProposedSolutionSelectItem: React.FC<ProposedSolutionSelectItemProps> = ({
  proposedSolution,
  selected,
  onClick: setter
}) => {
  const component = (
    <Box
      sx={{
        marginTop: 1,
        marginBottom: 1,
        p: 1
      }}
    >
      <Card onClick={setter}>
        <CardContent>
          <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
            <Grid item xs={6}>
              <b>Description: </b>
              {proposedSolution.description}
            </Grid>
            <Grid item xs={6}>
              <Box display="flex" justifyContent="flex-end" sx={{ maxHeight: 32 }}>
                {selected ? (
                  <Chip size="small" label="Selected" color="success" />
                ) : (
                  <Chip size="small" label="Unselected" color="error" />
                )}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <b>Budget Impact: </b>
              {dollarsPipe(proposedSolution.budgetImpact)}
            </Grid>
            <Grid item xs={12}>
              <b>Timeline Impact: </b>
              {weeksPipe(proposedSolution.timelineImpact)}
            </Grid>
            <Grid item xs={12}>
              <b>Scope Impact: </b>
              {proposedSolution.scopeImpact}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );

  return selected ? component : <div style={{ opacity: 0.5 }}>{component}</div>;
};

export default ProposedSolutionSelectItem;
