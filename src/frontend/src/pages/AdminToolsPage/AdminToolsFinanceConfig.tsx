import {
  Checkbox,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import PageBlock from '../../layouts/PageBlock';
import { useGetAllExpenseTypes, useGetAllVendors } from '../../hooks/finance.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { datePipe } from '../../utils/pipes';

const AdminToolsFinanceConfig: React.FC = () => {
  const { data: vendors, isLoading: vendorIsLoading, isError: vendorIsError, error: vendorError } = useGetAllVendors();
  const {
    data: expenseTypes,
    isLoading: expenseTypesIsLoading,
    isError: expenseTypesIsError,
    error: expenseTypesError
  } = useGetAllExpenseTypes();

  if (!vendors || !expenseTypes || expenseTypesIsLoading || vendorIsLoading) {
    return <LoadingIndicator />;
  }

  if (vendorIsError) {
    return <ErrorPage message={vendorError.message} />;
  }

  if (expenseTypesIsError) {
    return <ErrorPage message={expenseTypesError.message} />;
  }

  const vendorTableRows = vendors.map((vendor) => (
    <TableRow>
      <TableCell align="center" sx={{ border: '1px solid black' }}>
        {datePipe(vendor.dateCreated)}
      </TableCell>
      <TableCell sx={{ border: '1px solid black' }}>{vendor.name}</TableCell>
    </TableRow>
  ));

  const newVendorRow = (
    <TableRow>
      <TableCell sx={{ border: '1px solid black' }} align="center">
        {datePipe(new Date())}
      </TableCell>
      <TableCell sx={{ border: '1px solid black' }}>
        <TextField placeholder="Enter New Vendor Name" fullWidth size="small"></TextField>
      </TableCell>
    </TableRow>
  );

  const accountCodesTableRows = expenseTypes.map((expenseType) => (
    <TableRow>
      <TableCell sx={{ border: '1px solid black' }}>{expenseType.name}</TableCell>
      <TableCell sx={{ border: '1px solid black' }}>{expenseType.code}</TableCell>
      <TableCell align="center" sx={{ border: '1px solid black' }}>
        <Checkbox defaultChecked={expenseType.allowed} />
      </TableCell>
    </TableRow>
  ));

  const registeredVendors = (
    <Grid item direction="column" textAlign="left" xs={6}>
      <Typography variant="subtitle1">Registered Vendors</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                align="center"
                sx={{ fontSize: '16px', fontWeight: 600, border: '1px solid black', width: '25%' }}
                itemType="date"
              >
                Date Registered
              </TableCell>
              <TableCell align="left" sx={{ fontSize: '16px', fontWeight: 600, border: '1px solid black' }}>
                Vendor Name
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vendorTableRows}
            {newVendorRow}
          </TableBody>
        </Table>
      </TableContainer>
    </Grid>
  );

  const accountCodes = (
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
    </Grid>
  );

  return (
    <PageBlock title="Finance Config">
      <Grid container spacing="3%">
        {registeredVendors}
        {accountCodes}
      </Grid>
    </PageBlock>
  );
};

export default AdminToolsFinanceConfig;
