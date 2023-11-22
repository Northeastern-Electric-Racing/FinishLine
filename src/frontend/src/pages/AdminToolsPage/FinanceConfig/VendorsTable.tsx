import { TableRow, TableCell, Typography, Box } from '@mui/material';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useGetAllVendors } from '../../../hooks/finance.hooks';
import { datePipe } from '../../../utils/pipes';
import ErrorPage from '../../ErrorPage';
import { NERButton } from '../../../components/NERButton';
import { useState } from 'react';
import CreateVendorModal from './CreateVendorModal';
import AdminToolTable from '../AdminToolTable';

const VendorsTable = () => {
  const { data: vendors, isLoading: vendorIsLoading, isError: vendorIsError, error: vendorError } = useGetAllVendors();
  const [createModalShow, setCreateModalShow] = useState<boolean>(false);

  if (!vendors || vendorIsLoading) {
    return <LoadingIndicator />;
  }
  if (vendorIsError) {
    return <ErrorPage message={vendorError.message} />;
  }

  const vendorTableRows = vendors.map((vendor) => (
    <TableRow>
      <TableCell align="left" sx={{ border: '2px solid black' }}>
        {datePipe(vendor.dateCreated)}
      </TableCell>
      <TableCell sx={{ border: '2px solid black' }}>{vendor.name}</TableCell>
    </TableRow>
  ));

  return (
    <Box>
      <CreateVendorModal showModal={createModalShow} handleClose={() => setCreateModalShow(false)} />
      <Typography variant="subtitle1">Registered Vendors</Typography>
      <AdminToolTable columns={[{ name: 'Date Registered' }, { name: 'Vendor Name' }]} rows={vendorTableRows} />
      <Box sx={{ display: 'flex', justifyContent: 'right', marginTop: '10px' }}>
        <NERButton
          variant="contained"
          onClick={() => {
            setCreateModalShow(true);
          }}
        >
          New Vendor
        </NERButton>
      </Box>
    </Box>
  );
};

export default VendorsTable;
