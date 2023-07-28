import { TableRow, TableCell, Grid, Paper, Table, TableBody, TableContainer, TableHead, Typography } from '@mui/material';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useGetAllVendors } from '../../hooks/finance.hooks';
import { datePipe } from '../../utils/pipes';
import ErrorPage from '../ErrorPage';
import { NERButton } from '../../components/NERButton';

const VendorsTable = () => {
  const { data: vendors, isLoading: vendorIsLoading, isError: vendorIsError, error: vendorError } = useGetAllVendors();

  if (!vendors || vendorIsLoading) {
    return <LoadingIndicator />;
  }
  if (vendorIsError) {
    return <ErrorPage message={vendorError.message} />;
  }

  const vendorTableRows = vendors.map((vendor) => (
    <TableRow>
      <TableCell align="center" sx={{ border: '1px solid black' }}>
        {datePipe(vendor.dateCreated)}
      </TableCell>
      <TableCell sx={{ border: '1px solid black' }}>{vendor.name}</TableCell>
    </TableRow>
  ));

  return (
    <Grid item direction="column" xs={6}>
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
          <TableBody>{vendorTableRows}</TableBody>
        </Table>
      </TableContainer>
      <NERButton variant="contained">New Vendor</NERButton>
    </Grid>
  );
};

export default VendorsTable;
