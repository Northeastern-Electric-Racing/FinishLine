import React, { useState } from 'react';
import { TableRow, TableCell, Box, Table as MuiTable, TableHead, TableBody, Typography, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useGetAllVendors } from '../../hooks/finance.hooks';
import { datePipe } from '../../utils/pipes';
import ErrorPage from '../ErrorPage';
import { NERButton } from '../../components/NERButton';
import CreateVendorModal from '../AdminToolsPage/FinanceConfig/CreateVendorModal';
import { Vendor } from 'shared';
import EditVendorModal from '../AdminToolsPage/FinanceConfig/EditVendorModal';
import Footer from '../../components/Footer';

const MemberCompaniesPage = () => {
  const { data: vendors, isLoading: vendorIsLoading, isError: vendorIsError, error: vendorError } = useGetAllVendors();
  const [createModalShow, setCreateModalShow] = useState<boolean>(false);
  const [clickedVendor, setClickedVendor] = useState<Vendor | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 15;

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
        <Typography sx={{ maxWidth: 300, textAlign: 'center', fontSize: '1.5rem' }}>{vendor.name}</Typography>
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
        <Typography sx={{ fontSize: '1.5rem' }}>{datePipe(vendor.dateCreated)}</Typography>
      </TableCell>
      <TableCell
        align="center"
        sx={{
          alignItems: 'center',
          borderBottom: 'none'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
          <Typography sx={{ maxWidth: 300, textAlign: 'center', fontSize: '1.5rem' }}>
            {vendor.addedBy?.firstName}
          </Typography>
          {/* <Button sx={{ p: 0.5, minWidth: 'auto', color: 'white' }} onClick={() => {}}>
            <EditIcon />
          </Button>
          <Button sx={{ p: 0.5, minWidth: 'auto', color: 'white' }} onClick={() => {}}>
            <DeleteIcon />
          </Button> */}
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

      <MuiTable sx={{ maxWidth: '800px' }}>
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
              Company Name
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
              Date Added
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
              Added By
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{vendorTableRows}</TableBody>
        <Footer
          // footerButton={
          //   <NERButton
          //     variant="contained"
          //     onClick={() => {
          //       setCreateModalShow(true);
          //     }}
          //   >
          //     Add Company
          //   </NERButton>
          // }
          totalPages={totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </MuiTable>
    </Box>
  );
};

export default MemberCompaniesPage;
