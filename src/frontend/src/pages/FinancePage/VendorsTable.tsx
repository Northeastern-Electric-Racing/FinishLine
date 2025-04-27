import React, { useState } from 'react';
import {
  TableRow,
  TableCell,
  Box,
  Table as MuiTable,
  TableHead,
  TableBody,
  Typography,
  Button,
  useTheme,
  TableContainer,
  Paper
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useGetAllVendors } from '../../hooks/finance.hooks';
import ErrorPage from '../ErrorPage';
import { NERButton } from '../../components/NERButton';
import { Vendor } from 'shared';
import Footer from '../../components/Footer';

import DeleteVendorModal from './FinanceComponents/DeleteVendorModal';
import CreateVendorModal from './FinanceComponents/CreateVendorModal';
import EditVendorModal from './FinanceComponents/EditVendorModal';

const VendorsTable = () => {
  const { data: vendors, isLoading: vendorIsLoading, isError: vendorIsError, error: vendorError } = useGetAllVendors();
  const [createModalShow, setCreateModalShow] = useState<boolean>(false);
  const [clickedEditVendor, setClickedEditVendor] = useState<Vendor | undefined>(undefined);
  const [clickedDeleteVendor, setClickedDeleteVendor] = useState<Vendor | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(14);
  const theme = useTheme();

  if (!vendors || vendorIsLoading) {
    return <LoadingIndicator />;
  }
  if (vendorIsError) {
    return <ErrorPage message={vendorError.message} />;
  }

  vendors.sort((a, b) => a.name.localeCompare(b.name));
  const startIdx = currentPage * rowsPerPage;
  const currentVendors = vendors.slice(startIdx, startIdx + rowsPerPage);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

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
          alignItems: 'center',
          borderBottom: 'none'
        }}
      >
        <Typography sx={{ maxWidth: 300, textAlign: 'center', fontSize: '1.5rem' }}>{vendor.username}</Typography>
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
          {`${vendor.twoFactorContact?.firstName} ${vendor.twoFactorContact?.lastName}`}
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box
            sx={{
              maxWidth: 400,
              width: '100%',
              overflow: 'hidden',
              '&:hover': {
                overflow: 'auto'
              },
              scrollbarColor: `#555 ${theme.palette.background.default}`,
              scrollbarWidth: 'thin'
            }}
          >
            <Typography
              sx={{
                textAlign: 'left',
                fontSize: '1.5rem',
                height: '1.5em',
                whiteSpace: 'nowrap'
              }}
            >
              {vendor.notes}
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex'
            }}
          >
            <Button
              sx={{ p: 0.5, color: 'white' }}
              onClick={() => {
                setClickedEditVendor(vendor);
              }}
            >
              <EditIcon />
            </Button>
            <Button sx={{ p: 0.5, color: 'white' }} onClick={() => setClickedDeleteVendor(vendor)}>
              <DeleteIcon />
            </Button>
          </Box>
        </Box>
      </TableCell>
    </TableRow>
  ));

  return (
    <Box sx={{ width: '100%', borderRadius: '8px 8px 0 0' }}>
      <CreateVendorModal showModal={createModalShow} handleClose={() => setCreateModalShow(false)} vendors={vendors} />
      {clickedEditVendor && (
        <EditVendorModal
          showModal={!!clickedEditVendor}
          handleClose={() => {
            setClickedEditVendor(undefined);
          }}
          vendor={clickedEditVendor}
          vendors={vendors}
        />
      )}
      {clickedDeleteVendor && (
        <DeleteVendorModal
          handleClose={() => {
            setClickedDeleteVendor(undefined);
          }}
          vendor={clickedDeleteVendor}
        />
      )}
      <Box sx={{ paddingBottom: '100px' }}>
        <TableContainer component={Paper} sx={{ borderRadius: '8px', overflow: 'hidden' }}>
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
                  Vendor
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
            <TableBody sx={{ backgroundColor: '#121313' }}>{vendorTableRows}</TableBody>
          </MuiTable>
        </TableContainer>
      </Box>
      <Footer
        footerButton={
          <NERButton
            variant="contained"
            onClick={() => {
              setCreateModalShow(true);
            }}
            sx={{
              borderRadius: '8px',
              color: '#ededed',
              backgroundColor: '#ef4345',
              padding: '2px 20px',
              display: 'inline-flex',
              fontSize: '20px',
              fontWeight: 700,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#c74340'
              }
            }}
          >
            Add Vendor
          </NERButton>
        }
        footerInfoBoxes={[<Box># of Vendors: {vendors.length}</Box>]}
        totalItems={vendors.length}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 14, 25, 50, 100]}
      />
    </Box>
  );
};

export default VendorsTable;
