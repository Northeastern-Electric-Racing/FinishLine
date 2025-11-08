import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useDeleteVendor, useEditVendor, useGetAllVendors, useSetTaxExemptStatus } from '../../hooks/finance.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { Box, Checkbox, IconButton, TextField } from '@mui/material';
import { Button } from '@mui/material';
import CompanyDataGrid from '../../components/CompanyDataGrid';
import { fullNamePipe } from '../../utils/pipes';
import { useMemo, useState } from 'react';
import { Add, Delete } from '@mui/icons-material';
import DeleteVendorModal from './FinanceComponents/DeleteVendorModal';
import EditVendorModal from './FinanceComponents/EditVendorModal';
import { Vendor } from 'shared';
import CreateVendorModal from './FinanceComponents/CreateVendorModal';

const VendorsTable: React.FC = () => {
  const { data: vendors, isLoading: vendorsLoading, isError: vendorsIsError, error: vendorsError } = useGetAllVendors();
  const [searchTerm, setSearchTerm] = useState('');

  const { mutateAsync: taxExemptMutateAsync } = useSetTaxExemptStatus();
  const [vendorToDelete, setVendorToDelete] = useState<Vendor>();
  const [vendorToEdit, setVendorToEdit] = useState<Vendor>();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const mapRow = (v: Vendor) => ({
    ...v,
    id: v.vendorId,
    name: v.name,
    username: v.username,
    password: v.password,
    discountCode: v.discountCode,
    taxExempt: v.taxExempt,
    // keep the original twoFactorContacts array so the mapped result still matches Vendor,
    // add a separate display field for the grid text.
    twoFactorContactsDisplay: v.twoFactorContacts.map(fullNamePipe).join(', '),
    raw: v
  });

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Vendor', flex: 1 },
    { field: 'username', headerName: 'Username', flex: 1 },
    { field: 'password', headerName: 'Password', flex: 1 },
    { field: 'discountCode', headerName: 'Discount', flex: 1 },
    {
      field: 'taxExempt',
      headerName: 'Tax Exempt',
      width: 140,
      renderCell: (params: GridRenderCellParams<boolean>) => {
        const vendor = (params.row as any).raw as any;
        return (
          <Checkbox
            checked={!!params.value}
            onClick={async (e: any) => {
              // prevent the DataGrid row click from firing
              e.stopPropagation();
              await taxExemptMutateAsync({ vendorId: vendor.vendorId, taxExempt: !params.value });
            }}
          />
        );
      }
    },
    { field: 'twoFactorContactsDisplay', headerName: '2FA Contacts', flex: 1 },
    {
      field: 'actions',
      headerName: 'Delete',
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => {
        const vendor = (params.row as any).raw as any;
        return (
          <IconButton
            onClick={(e: any) => {
              // prevent the DataGrid row click from firing
              e.stopPropagation();
              setVendorToDelete(vendor);
            }}
          >
            <Delete />
          </IconButton>
        );
      }
    }
  ];

  if (vendorsLoading || !vendors) return <LoadingIndicator />;
  if (vendorsIsError) return <ErrorPage message={vendorsError.message} />;

  return (
    <Box>
      <CreateVendorModal showModal={showCreateModal} handleClose={() => setShowCreateModal(false)} />
      {vendorToDelete && <DeleteVendorModal handleClose={() => setVendorToDelete(undefined)} vendor={vendorToDelete} />}

      <CompanyDataGrid
        items={vendors}
        mapRow={mapRow}
        columns={columns}
        onAdd={() => setShowCreateModal(true)}
        onRowClick={(vendor) => setVendorToEdit(vendor)}
        initialSortModel={[{ field: 'name', sort: 'asc' }]}
        headerHeight={56}
        rowHeight={52}
        pageSizeDefault={10}
        searchFields={['name' as any]}
        paperSx={{
          borderRadius: '10px 10px 0 0',
          overflow: 'hidden',
          height: 'calc(100vh - 120px)',
          display: 'flex',
          flexDirection: 'column'
        }}
      />

      {vendorToEdit && (
        <EditVendorModal showModal={true} handleClose={() => setVendorToEdit(undefined)} vendor={vendorToEdit} />
      )}
    </Box>
  );
};

export default VendorsTable;
