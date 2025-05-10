import { Box, Typography, Grid, TextField, Button } from '@mui/material';
import { dollarsPipe } from '../../../utils/pipes';
import { useGetAllAccountCodes } from '../../../hooks/finance.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';

const ExtendedPieChart = () => {
  const {
    data: accountCodes,
    isLoading: accountCodesIsLoading,
    isError: accountCodesIsError,
    error: accountCodesError
  } = useGetAllAccountCodes();

  if (accountCodesIsError) {
    return <ErrorPage error={accountCodesError} />;
  }

  if (!accountCodes || accountCodesIsLoading) {
    return <LoadingIndicator />;
  }

  const showError = true; // Example: Trigger based on validation

  let availableToAllocate = 0.0;

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={3} mt={4}>
      <Box bgcolor="#111" px={4} py={2} borderRadius={2} textAlign="center" color="white">
        <Typography variant="subtitle2" sx={{ color: 'white', fontSize: 16 }}>
          Available to Allocate
        </Typography>
        <Typography variant="h5" sx={{ color: '#e53935' }}>
          {dollarsPipe(availableToAllocate)}
        </Typography>
      </Box>
      <Typography variant="subtitle2" sx={{ color: 'white', fontSize: 16 }}>
        Account Code
      </Typography>
      <Grid container spacing={2} maxWidth="400px">
        {accountCodes.map((accountCode, index) => (
          <Grid item xs={6} key={index}>
            <TextField
              fullWidth
              variant="filled"
              label={accountCode.code}
              value="$14,000.00"
              InputProps={{ disableUnderline: true }}
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiInputBase-root': {
                  backgroundColor: '#444',
                  color: 'white',
                  borderRadius: 1
                },
                '& .MuiInputLabel-root': {
                  color: '#ccc'
                }
              }}
            />
          </Grid>
        ))}
      </Grid>
      <Box display="flex" justifyContent="center" gap={2} mt={3}>
        <Button variant="contained" color="inherit" sx={{ bgcolor: '#666' }}>
          Cancel
        </Button>
        <Button variant="contained" color="error">
          Create Change Request
        </Button>
      </Box>
    </Box>
  );
};

export default ExtendedPieChart;
