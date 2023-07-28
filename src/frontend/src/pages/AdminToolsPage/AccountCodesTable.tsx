import {
  TableRow,
  TableCell,
  Checkbox,
  Grid,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  Typography
} from '@mui/material';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useGetAllExpenseTypes } from '../../hooks/finance.hooks';
import ErrorPage from '../ErrorPage';
import { NERButton } from '../../components/NERButton';

const AccountCodesTable = () => {
  const {
    data: expenseTypes,
    isLoading: expenseTypesIsLoading,
    isError: expenseTypesIsError,
    error: expenseTypesError
  } = useGetAllExpenseTypes();

  if (!expenseTypes || expenseTypesIsLoading) {
    return <LoadingIndicator />;
  }

  if (expenseTypesIsError) {
    return <ErrorPage message={expenseTypesError.message} />;
  }

  const accountCodesTableRows = expenseTypes.map((expenseType) => (
    <TableRow>
      <TableCell sx={{ border: '1px solid black' }}>{expenseType.name}</TableCell>
      <TableCell sx={{ border: '1px solid black' }}>{expenseType.code}</TableCell>
      <TableCell align="center" sx={{ border: '1px solid black' }}>
        <Checkbox defaultChecked={expenseType.allowed} />
      </TableCell>
    </TableRow>
  ));

  return (
    <Grid item direction="column" alignSelf="right" xs={6}>
      <Typography variant="subtitle1" textAlign="left">
        Account Codes
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableCell
              align="left"
              sx={{ fontSize: '16px', fontWeight: 600, border: '1px solid black' }}
              itemType="date"
              width="50%"
            >
              Account Name
            </TableCell>
            <TableCell
              align="left"
              sx={{ fontSize: '16px', fontWeight: 600, border: '1px solid black' }}
              itemType="date"
              width="30%"
            >
              Account Code
            </TableCell>
            <TableCell
              align="center"
              sx={{ fontSize: '16px', fontWeight: 600, border: '1px solid black' }}
              itemType="date"
              width="20%"
            >
              Allowed
            </TableCell>
          </TableHead>
          <TableBody>{accountCodesTableRows}</TableBody>
        </Table>
      </TableContainer>
      <NERButton variant="contained">New Account Code</NERButton>
    </Grid>
  );
};

export default AccountCodesTable;
