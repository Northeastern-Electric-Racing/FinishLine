import React, { useState } from 'react';
import { TableRow, TableCell, Box, Table as MuiTable, TableHead, TableBody, Typography, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useGetAllVendors } from '../../../hooks/finance.hooks';
import { datePipe } from '../../../utils/pipes';
import ErrorPage from '../../ErrorPage';
import { NERButton } from '../../../components/NERButton';
import CreateVendorModal from './CreateVendorModal';
import { Vendor } from 'shared';
import EditVendorModal from './EditVendorModal';

const VendorsTable = () => {
  const { data: vendors, isLoading: vendorIsLoading, isError: vendorIsError, error: vendorError } = useGetAllVendors();
  const [createModalShow, setCreateModalShow] = useState<boolean>(false);
  const [clickedVendor, setClickedVendor] = useState<Vendor | undefined>(undefined);

  if (!vendors || vendorIsLoading) {
    return <LoadingIndicator />;
  }
  if (vendorIsError) {
    return <ErrorPage message={vendorError.message} />;
  }

  const vendorTableRows = vendors.map((vendor, index) => (
    <TableRow key={vendor.vendorId || index}>
      <TableCell
        align="left"
        sx={{
          alignItems: 'center',
          borderBottom: 'none'
        }}
      >
        <Typography sx={{ maxWidth: 300 }}>{vendor.name}</Typography>
      </TableCell>
      <TableCell
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: 'none',
          minHeight: '50px'
        }}
      >
        <Typography>{datePipe(vendor.dateCreated)}</Typography>
        {/* <Box sx={{ display: 'flex' }}>
          <Button
            sx={{ p: 0.5, color: 'white' }}
            onClick={() => {
              setClickedVendor(vendor);
            }}
          >
            <EditIcon />
          </Button>
        </Box> */}
      </TableCell>
      <TableCell
        align="left"
        sx={{
          alignItems: 'center',
          borderBottom: 'none'
        }}
      >
        <Typography sx={{ maxWidth: 300 }}>{vendor.addedBy?.firstName}</Typography>
      </TableCell>
    </TableRow>
  ));

  return (
    <Box>
      <CreateVendorModal showModal={createModalShow} handleClose={() => setCreateModalShow(false)} vendors={vendors} />
      {clickedVendor && (
        <EditVendorModal
          showModal={!!clickedVendor}
          handleClose={() => {
            setClickedVendor(undefined);
          }}
          vendor={clickedVendor}
          vendors={vendors}
        />
      )}

      <MuiTable>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                fontWeight: 'bold',
                fontSize: '1em',
                backgroundColor: '#ef4345',
                color: 'white',
                borderRadius: '10px 0px 0px 0px'
              }}
            >
              Company Name
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 'bold',
                fontSize: '1em',
                backgroundColor: '#ef4345',
                color: 'white'
              }}
            >
              Date Added
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 'bold',
                fontSize: '1em',
                backgroundColor: '#ef4345',
                color: 'white',
                borderRadius: '0px 10px 0px 0px'
              }}
            >
              Added By
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{vendorTableRows}</TableBody>
      </MuiTable>
      <Box sx={{ display: 'flex', justifyContent: 'right', marginTop: '20px' }}>
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
