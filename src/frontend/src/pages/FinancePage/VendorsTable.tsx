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
import DeleteVendorModal from './FinanceComponents/DeleteVendorModal';
import CreateVendorModal from './FinanceComponents/CreateVendorModal';
import EditVendorModal from './FinanceComponents/EditVendorModal';
import { datePipe, fullNamePipe } from '../../utils/pipes';
import PaginationFooter from '../../components/PaginationFooter';

interface VendorTableProps {
  isHeadAndAbove?: boolean;
}

interface ScrollableCellProps {
  children: React.ReactNode;
  maxWidth?: number;
}

const VendorTable = ({ isHeadAndAbove = false }: VendorTableProps) => {
  const { data: vendors, isLoading: vendorIsLoading, isError: vendorIsError, error: vendorError } = useGetAllVendors();
  const [createModalShow, setCreateModalShow] = useState<boolean>(false);
  const [vendorToEdit, setVendorToEdit] = useState<Vendor | undefined>(undefined);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(14);
  const theme = useTheme();

  if (!vendors || vendorIsLoading) {
    return <LoadingIndicator />;
  }
  if (vendorIsError) {
    return <ErrorPage message={vendorError.message} />;
  }

  const ScrollableCell = ({ children, maxWidth = 150 }: ScrollableCellProps) => (
    <Box
      sx={{
        maxWidth,
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
          textAlign: 'center',
          fontSize: '1.5rem',
          height: '1.5em',
          whiteSpace: 'nowrap'
        }}
      >
        {children}
      </Typography>
    </Box>
  );

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
        <ScrollableCell children={vendor.name} />
      </TableCell>
      {isHeadAndAbove ? (
        <>
          <TableCell
            align="center"
            sx={{
              alignItems: 'center',
              borderBottom: 'none'
            }}
          >
            <ScrollableCell children={vendor.username} />
          </TableCell>
          <TableCell
            align="center"
            sx={{
              alignItems: 'center',
              borderBottom: 'none'
            }}
          >
            <ScrollableCell children={vendor.password} />
          </TableCell>

          <TableCell
            align="center"
            sx={{
              alignItems: 'center',
              borderBottom: 'none'
            }}
          >
            <ScrollableCell children={vendor.discountCode} />
          </TableCell>
          <TableCell
            align="center"
            sx={{
              alignItems: 'center',
              borderBottom: 'none'
            }}
          >
            <ScrollableCell children={vendor.twoFactorContacts.map(fullNamePipe).join(', ')} />
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
              <ScrollableCell children={vendor.notes} maxWidth={400} />
              <Box
                sx={{
                  display: 'flex'
                }}
              >
                <Button
                  sx={{ p: 0.5, color: 'white' }}
                  onClick={() => {
                    setVendorToEdit(vendor);
                  }}
                >
                  <EditIcon />
                </Button>
                <Button sx={{ p: 0.5, color: 'white' }} onClick={() => setVendorToDelete(vendor)}>
                  <DeleteIcon />
                </Button>
              </Box>
            </Box>
          </TableCell>
        </>
      ) : (
        <>
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
            <ScrollableCell children={datePipe(vendor.dateCreated)} />
          </TableCell>
          <TableCell
            align="center"
            sx={{
              alignItems: 'center',
              borderBottom: 'none'
            }}
          >
            <ScrollableCell children={fullNamePipe(vendor.addedBy)} />
          </TableCell>
        </>
      )}
    </TableRow>
  ));

  return (
    <Box sx={{ width: '100%', borderRadius: '8px 8px 0 0' }}>
      <CreateVendorModal showModal={createModalShow} handleClose={() => setCreateModalShow(false)} />
      {vendorToEdit && (
        <EditVendorModal
          showModal={!!vendorToEdit}
          handleClose={() => {
            setVendorToEdit(undefined);
          }}
          vendor={vendorToEdit}
        />
      )}
      {vendorToDelete && (
        <DeleteVendorModal
          handleClose={() => {
            setVendorToDelete(undefined);
          }}
          vendor={vendorToDelete}
        />
      )}
      <Box sx={{ paddingBottom: '100px' }}>
        <TableContainer
          {...(isHeadAndAbove ? { component: Paper } : {})}
          sx={{ borderRadius: '8px', overflow: 'auto', backgroundColor: theme.palette.background.default }}
        >
          <MuiTable sx={{ ...(!isHeadAndAbove && { maxWidth: '800px' }) }}>
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
                {isHeadAndAbove ? (
                  <>
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
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </TableRow>
            </TableHead>
            <TableBody sx={{ backgroundColor: '#121313' }}>{vendorTableRows}</TableBody>
          </MuiTable>
        </TableContainer>
      </Box>
      <PaginationFooter
        footerButton={
          isHeadAndAbove && (
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
                marginBottom: '7px',
                '&:hover': {
                  backgroundColor: '#c74340'
                }
              }}
            >
              Add Vendor
            </NERButton>
          )
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

export default VendorTable;
