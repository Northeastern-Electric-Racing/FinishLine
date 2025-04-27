import React, { useState } from 'react';
import { TableRow, TableCell, Box, Table as MuiTable, TableHead, TableBody, Typography } from '@mui/material';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useGetAllVendors } from '../../hooks/finance.hooks';
import { datePipe } from '../../utils/pipes';
import ErrorPage from '../ErrorPage';
import Footer from '../../components/Footer';
import PageLayout from '../../components/PageLayout';

const MembersCompanies = () => {
  const { data: vendors, isLoading: vendorIsLoading, isError: vendorIsError, error: vendorError } = useGetAllVendors();
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(15);

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
        </Box>
      </TableCell>
    </TableRow>
  ));

  return (
    <Box>
      <PageLayout title="Vendors">
        <Box sx={{ paddingBottom: '100px' }}>
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
          </MuiTable>
        </Box>
        <Footer
          footerInfoBoxes={[<Box># of Vendors: {vendors.length}</Box>]}
          totalItems={vendors.length}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 15, 25, 50, 100]}
        />
      </PageLayout>
    </Box>
  );
};

export default MembersCompanies;
