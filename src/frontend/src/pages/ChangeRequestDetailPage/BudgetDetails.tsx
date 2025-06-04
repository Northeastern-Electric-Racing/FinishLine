import { Box, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { BudgetChangeRequest } from 'shared';
import { centsToDollar } from '../../utils/pipes';

interface BudgetDetailsProps {
  cr: BudgetChangeRequest;
}

const BudgetDetails: React.FC<BudgetDetailsProps> = ({ cr }) => {
  return (
    <Grid container rowSpacing="10px" mb="40px">
      <Grid item xs={12} md={7}>
        {cr.category && (
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography fontSize={18}>Current Budget: {`$${centsToDollar(cr.category.budget)}`}</Typography>
            <Typography fontSize={18}>Proposed Budget: {`$${centsToDollar(cr.proposedBudget)}`}</Typography>
          </Box>
        )}
        {cr.accountCode && (
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography fontSize={18}>Current Budget: {`$${centsToDollar(cr.accountCode.amount ?? 0)}`}</Typography>
            <Typography fontSize={18}>Proposed Budget: {`$${centsToDollar(cr.proposedBudget)}`}</Typography>
          </Box>
        )}
      </Grid>
    </Grid>
  );
};

export default BudgetDetails;
