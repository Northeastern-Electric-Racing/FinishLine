import { TableRow, TableCell, Box } from '@mui/material';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { EditVendorPayload, useGetAllVendors } from '../../../hooks/finance.hooks';
import { datePipe } from '../../../utils/pipes';
import ErrorPage from '../../ErrorPage';
import { NERButton } from '../../../components/NERButton';
import { useState } from 'react';
import CreateVendorModal from './CreateVendorModal';
import AdminToolTable from '../AdminToolTable';
import { Vendor } from 'shared';
import DeleteIcon from '@mui/icons-material/Delete';
import EditVendorModal from './EditVendorModal';
import DeleteVendorModal from './DeleteVendorModal';
import { useToast } from '../../../hooks/toasts.hooks';

const VendorsTable = () => {
  const { data: vendors, isLoading: vendorIsLoading, isError: vendorIsError, error: vendorError } = useGetAllVendors();
  const [createModalShow, setCreateModalShow] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [clickedVendor, setClickedVendor] = useState<Vendor>();

  const toast = useToast();

  const handleDeleteVendor = async (data: EditVendorPayload) => {
    try {
      // TODO: set up deleteVendor hook
      //await deleteVendor(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  if (!vendors || vendorIsLoading) {
    return <LoadingIndicator />;
  }
  if (vendorIsError) {
    return <ErrorPage message={vendorError.message} />;
  }

  const vendorTableRows = vendors.map((vendor) => (
    <TableRow sx={{ cursor: 'pointer' }}>
      <TableCell
        align="left"
        sx={{ border: '2px solid black' }}
        onClick={() => {
          setClickedVendor(vendor);
          setShowEditModal(true);
        }}
      >
        {datePipe(vendor.dateCreated)}
      </TableCell>
      <TableCell
        sx={{ border: '2px solid black' }}
        onClick={() => {
          setClickedVendor(vendor);
          setShowEditModal(true);
        }}
      >
        {vendor.name}
      </TableCell>
      <TableCell
        align="center"
        sx={{ width: '20px', border: '2px solid black' }}
        onClick={() => {
          setClickedVendor(vendor);
          setShowDeleteModal(true);
        }}
      >
        <DeleteIcon />
      </TableCell>
    </TableRow>
  ));

  return (
    <Box>
      <CreateVendorModal showModal={createModalShow} handleClose={() => setCreateModalShow(false)} vendors={vendors} />
      {clickedVendor && (
        <EditVendorModal
          showModal={showEditModal}
          handleClose={() => {
            setShowEditModal(false);
            setClickedVendor(undefined);
          }}
          vendor={clickedVendor}
          vendors={vendors}
        />
      )}
      {clickedVendor && (
        <DeleteVendorModal
          showModal={showDeleteModal}
          handleClose={() => {
            setShowDeleteModal(false);
            setClickedVendor(undefined);
          }}
          vendor={clickedVendor}
          onSubmit={handleDeleteVendor}
        />
      )}
      <AdminToolTable
        columns={[{ name: 'Date Registered' }, { name: 'Vendor Name' }, { name: 'Delete' }]}
        rows={vendorTableRows}
      />
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
