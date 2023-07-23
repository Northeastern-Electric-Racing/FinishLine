import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import PageBlock from '../../layouts/PageBlock';
import { useGetAllVendors } from '../../hooks/finance.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { datePipe } from '../../utils/pipes';
import { DataGrid, GridColDef, GridRowProps, GridRowsProp } from '@mui/x-data-grid';

const AdminToolsFinanceConfig: React.FC = () => {
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

  const accountCodesColumns: GridColDef[] = [
    { field: 'name', headerName: 'Account Name', flex: 0.5 },
    {
      field: 'code',
      headerName: 'Account Code',
      editable: true,
      type: 'number',
      flex: 0.3,
      headerAlign: 'left',
      align: 'left'
    },
    { field: 'allowed', headerName: 'Allowed', type: 'boolean', editable: true, flex: 0.2 }
  ];

  const accountCodesRows: GridRowsProp = [
    { id: 0, name: 'Subscriptions', code: 0, allowed: true },
    { id: 1, name: 'General Supplies / Small Tools', code: 1, allowed: true },
    { id: 2, name: 'Advertising Agencies', code: 2, allowed: true },
    { id: 3, name: 'Memberships and Dues', code: 3, allowed: true },
    { id: 4, name: 'Equipment > 1500', code: 4, allowed: true }
  ];

  const registeredVendors = (
    <Grid item direction="column" textAlign="left" xs={6}>
      <Typography variant="subtitle1">Registered Vendors</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center" sx={{ fontSize: '16px', fontWeight: 600, border: '1px solid black', width: '25%' }}>
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
    </Grid>
  );

  const accountCodes = (
    <Grid item direction="column" textAlign="right" xs={6}>
      <Typography variant="subtitle1">Account Codes</Typography>
      <DataGrid editMode="cell" rows={accountCodesRows} columns={accountCodesColumns} hideFooter autoHeight />
    </Grid>
  );

  return (
    <PageBlock title="Finance Config">
      <Grid container xs={12}>
        {registeredVendors}
        {accountCodes}
      </Grid>
    </PageBlock>
  );
};

export default AdminToolsFinanceConfig;
