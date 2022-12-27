/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ProposedSolution } from 'shared';
import { dollarsPipe, weeksPipe } from '../../utils/Pipes';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

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
              <Typography sx={{ fontWeight: 'bold' }}>Description:</Typography>
              <Typography>{proposedSolution.description}</Typography>
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
              <Typography sx={{ fontWeight: 'bold' }}>Budget Impact:</Typography>
              <Typography>{dollarsPipe(proposedSolution.budgetImpact)}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography sx={{ fontWeight: 'bold' }}>Timeline Impact: </Typography>
              <Typography>{weeksPipe(proposedSolution.timelineImpact)}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography sx={{ fontWeight: 'bold' }}>Scope Impact: </Typography>
              <Typography>{proposedSolution.scopeImpact}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );

  return selected ? component : <div style={{ opacity: 0.5 }}>{component}</div>;
};

export default ProposedSolutionSelectItem;
