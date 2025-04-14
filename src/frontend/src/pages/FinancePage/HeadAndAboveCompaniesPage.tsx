import React, { useState } from 'react';
import { TableRow, TableCell, Box, Table as MuiTable, TableHead, TableBody, Typography, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useGetAllVendors } from '../../hooks/finance.hooks';
import ErrorPage from '../ErrorPage';
import { NERButton } from '../../components/NERButton';
import CreateVendorModal from '../AdminToolsPage/FinanceConfig/CreateVendorModal';
import { Vendor } from 'shared';
import EditVendorModal from '../AdminToolsPage/FinanceConfig/EditVendorModal';
import Footer from '../../components/Footer';

const HeadAndAboveCompaniesPage = () => {
  const { data: vendors, isLoading: vendorIsLoading, isError: vendorIsError, error: vendorError } = useGetAllVendors();
  const [createModalShow, setCreateModalShow] = useState<boolean>(false);
  const [clickedVendor, setClickedVendor] = useState<Vendor | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 16;

  if (!vendors || vendorIsLoading) {
    return <LoadingIndicator />;
  }
  if (vendorIsError) {
    return <ErrorPage message={vendorError.message} />;
  }

  const totalPages = Math.ceil(vendors.length / itemsPerPage);
  const lastVendorIdx = currentPage * itemsPerPage;
  const firstVendorIdx = lastVendorIdx - itemsPerPage;
  const currentVendors = vendors.slice(firstVendorIdx, lastVendorIdx);

  const vendorTableRows = currentVendors.map((vendor, index) => (
    <TableRow key={vendor.vendorId || index}>
      <TableCell
        align="center"
        sx={{
          alignItems: 'center',
          borderBottom: 'none'
        }}
      >
        <Typography sx={{ maxWidth: 300, textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
          {vendor.name}
        </Typography>
      </TableCell>
      <TableCell
        align="center"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderBottom: 'none',
          minHeight: '50px'
        }}
      >
        <Typography sx={{ fontSize: '1.5rem' }}>{vendor.username}</Typography>
      </TableCell>
      <TableCell
        align="center"
        sx={{
          alignItems: 'center',
          borderBottom: 'none'
        }}
      >
        <Typography sx={{ maxWidth: 300, textAlign: 'center', fontSize: '1.5rem' }}>{vendor.password}</Typography>
      </TableCell>

      <TableCell
        align="center"
        sx={{
          alignItems: 'center',
          borderBottom: 'none'
        }}
      >
        <Typography sx={{ maxWidth: 300, textAlign: 'center', fontSize: '1.5rem' }}>{vendor.discountCode}</Typography>
      </TableCell>
      <TableCell
        align="center"
        sx={{
          alignItems: 'center',
          borderBottom: 'none'
        }}
      >
        <Typography sx={{ maxWidth: 300, textAlign: 'center', fontSize: '1.5rem' }}>
          {`${vendor.twoFactorContact?.firstName} ${vendor.twoFactorContact?.lastName.charAt(0)}.`}
        </Typography>
      </TableCell>
      <TableCell
        align="center"
        sx={{
          alignItems: 'center',
          borderBottom: 'none',
          borderLeft: '4px solid white'
        }}
      >
        <Box sx={{ display: 'flex' }}>
          <Typography sx={{ maxWidth: 300, textAlign: 'center', fontSize: '1.5rem' }}>{vendor.notes}</Typography>
          <Box
            sx={{
              display: 'flex',
              marginLeft: 'auto'
            }}
          >
            <Button sx={{ p: 0.5, color: 'white' }} onClick={() => {}}>
              <EditIcon />
            </Button>
            <Button sx={{ p: 0.5, color: 'white' }} onClick={() => {}}>
              <DeleteIcon />
            </Button>
          </Box>
        </Box>
      </TableCell>
    </TableRow>
  ));

  return (
    <Box>
      {/*TODO: Replace with header */}
      <Box>Companies and Sponsoring Vendors</Box>
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
              align="center"
              sx={{
                fontWeight: 'bold',
                fontSize: '1.5em',
                backgroundColor: '#ef4345',
                color: 'white',
                borderRadius: '10px 0px 0px 0px',
                height: '60px'
              }}
            >
              Company
            </TableCell>
            <TableCell
              align="center"
              sx={{
                fontWeight: 'bold',
                fontSize: '1.5em',
                backgroundColor: '#ef4345',
                color: 'white'
              }}
            >
              Username
            </TableCell>
            <TableCell
              align="center"
              sx={{
                fontWeight: 'bold',
                fontSize: '1.5em',
                backgroundColor: '#ef4345',
                color: 'white'
              }}
            >
              Password
            </TableCell>
            <TableCell
              align="center"
              sx={{
                fontWeight: 'bold',
                fontSize: '1.5em',
                backgroundColor: '#ef4345',
                color: 'white'
              }}
            >
              Discount
            </TableCell>
            <TableCell
              align="center"
              sx={{
                fontWeight: 'bold',
                fontSize: '1.5em',
                backgroundColor: '#ef4345',
                color: 'white'
              }}
            >
              2FA Contacts
            </TableCell>
            <TableCell
              align="center"
              sx={{
                fontWeight: 'bold',
                fontSize: '1.5em',
                backgroundColor: '#ef4345',
                color: 'white',
                borderRadius: '0px 10px 0px 0px'
              }}
            >
              Notes
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{vendorTableRows}</TableBody>
        <Footer
          footerButton={
            <NERButton
              variant="contained"
              onClick={() => {
                setCreateModalShow(true);
              }}
            >
              Add Company
            </NERButton>
          }
          totalPages={totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </MuiTable>
    </Box>
  );
};

export default HeadAndAboveCompaniesPage;
