import { TableRow, TableCell, Paper, Table, TableBody, TableContainer, TableHead, Typography, Box } from '@mui/material';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useGetAllVendors } from '../../../hooks/finance.hooks';
import { datePipe } from '../../../utils/pipes';
import ErrorPage from '../../ErrorPage';
import { NERButton } from '../../../components/NERButton';
import { useState } from 'react';
import CreateVendorModal from './CreateVendorModal';

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
      <TableCell align="center" sx={{ border: '2px solid black' }}>
        {datePipe(vendor.dateCreated)}
      </TableCell>
      <TableCell sx={{ border: '2px solid black' }}>{vendor.name}</TableCell>
    </TableRow>
  ));

  return (
    <Box>
      <CreateVendorModal showModal={createModalShow} handleClose={() => setCreateModalShow(false)} />
      <Typography variant="subtitle1">Registered Vendors</Typography>
      <TableContainer component={Paper}>
        <Table sx={{ border: '2px solid black' }}>
          <TableHead>
            <TableRow>
              <TableCell
                align="center"
                sx={{
                  fontSize: '16px',
                  fontWeight: 600,
                  width: '25%',
                  border: '2px solid black'
                }}
                itemType="date"
              >
                Date Registered
              </TableCell>
              <TableCell align="left" sx={{ fontSize: '16px', fontWeight: 600 }}>
                Vendor Name
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{vendorTableRows}</TableBody>
        </Table>
      </TableContainer>
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
