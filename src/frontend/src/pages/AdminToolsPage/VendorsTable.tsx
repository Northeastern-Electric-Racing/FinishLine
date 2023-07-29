import { TableRow, TableCell, Grid, Paper, Table, TableBody, TableContainer, TableHead, Typography } from '@mui/material';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useGetAllVendors } from '../../hooks/finance.hooks';
import { datePipe } from '../../utils/pipes';
import ErrorPage from '../ErrorPage';
import { NERButton } from '../../components/NERButton';
import { useState } from 'react';
import NewVendor from './NewVendor';
import EditVendor from './EditVendor';
import { Vendor } from 'shared';

const VendorsTable = () => {
  const { data: vendors, isLoading: vendorIsLoading, isError: vendorIsError, error: vendorError } = useGetAllVendors();
  const [createModalShow, setCreateModalShow] = useState<boolean>(false);
  const handleCreateModalClose = () => setCreateModalShow(false);
  const [editModalShow, setEditModalShow] = useState<boolean>(false);
  const handleEditModalClose = () => setEditModalShow(false);
  const [clickedVendor, setClickedVendor] = useState<Vendor>();

  if (!vendors || vendorIsLoading) {
    return <LoadingIndicator />;
  }
  if (vendorIsError) {
    return <ErrorPage message={vendorError.message} />;
  }

  const vendorTableRows = vendors.map((vendor) => (
    <TableRow>
      <TableCell
        align="center"
        sx={{ border: '2px solid black' }}
        onClick={() => {
          setClickedVendor(vendor);
          setEditModalShow(true);
        }}
      >
        {datePipe(vendor.dateCreated)}
      </TableCell>
      <TableCell
        sx={{ border: '2px solid black' }}
        onClick={() => {
          setClickedVendor(vendor);
          setEditModalShow(true);
        }}
      >
        {vendor.name}
      </TableCell>
    </TableRow>
  ));

  return (
    <>
      <Grid item direction="column" xs={6}>
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
        <NERButton
          variant="contained"
          onClick={() => {
            setCreateModalShow(true);
          }}
        >
          New Vendor
        </NERButton>
      </Grid>

      {createModalShow && <NewVendor showModal={createModalShow} handleClose={handleCreateModalClose} />}
      {editModalShow && clickedVendor && (
        <EditVendor showModal={editModalShow} handleClose={handleEditModalClose} vendor={clickedVendor} />
      )}
    </>
  );
};

export default VendorsTable;
