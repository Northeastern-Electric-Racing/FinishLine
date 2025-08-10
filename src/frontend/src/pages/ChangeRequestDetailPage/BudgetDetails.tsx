import { Box, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { BudgetChangeRequest } from 'shared';
import { centsToDollar } from '../../utils/pipes';

interface BudgetDetailsProps {
  budgetChangeRequest: BudgetChangeRequest;
}

const BudgetDetails: React.FC<BudgetDetailsProps> = ({ budgetChangeRequest }) => {
  return (
    <Grid container rowSpacing="10px" mb="40px">
      <Grid item xs={12} md={7}>
        {budgetChangeRequest.category && (
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography fontSize={18}>Current Budget: {`$${centsToDollar(budgetChangeRequest.category.budget)}`}</Typography>
            <Typography fontSize={18}>Proposed Budget: {`$${centsToDollar(budgetChangeRequest.proposedBudget)}`}</Typography>
          </Box>
        )}
        {budgetChangeRequest.accountCode && (
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography fontSize={18}>
              Current Budget: {`$${centsToDollar(budgetChangeRequest.accountCode.amount ?? 0)}`}
            </Typography>
            <Typography fontSize={18}>Proposed Budget: {`$${centsToDollar(budgetChangeRequest.proposedBudget)}`}</Typography>
          </Box>
        )}
      </Grid>
    </Grid>
  );
};

export default BudgetDetails;
