import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import type { MapRowResult } from '../../components/NERDataGrid';
import type { MouseEvent } from 'react';
import { useGetAllVendors, useSetTaxExemptStatus } from '../../hooks/finance.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { Box, Checkbox, IconButton } from '@mui/material';
import NERDataGrid from '../../components/NERDataGrid';
import { fullNamePipe } from '../../utils/pipes';
import { useMemo, useState } from 'react';
import { Delete } from '@mui/icons-material';
import DeleteVendorModal from './FinanceComponents/DeleteVendorModal';
import EditVendorModal from './FinanceComponents/EditVendorModal';
import { isAtLeastRank, RoleEnum, Vendor } from 'shared';
import CreateVendorModal from './FinanceComponents/CreateVendorModal';
import { useCurrentUser } from '../../hooks/users.hooks';

const VendorsTable: React.FC = () => {
  const { data: vendors, isLoading: vendorsLoading, isError: vendorsIsError, error: vendorsError } = useGetAllVendors();
  const { mutateAsync: taxExemptMutateAsync } = useSetTaxExemptStatus();
  const [vendorToDelete, setVendorToDelete] = useState<Vendor>();
  const [vendorToEdit, setVendorToEdit] = useState<Vendor>();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const currentUser = useCurrentUser();

  const canEditAllVendors = useMemo(() => {
    return isAtLeastRank(RoleEnum.HEAD, currentUser.role) || currentUser.isFinance;
  }, [currentUser.isFinance, currentUser.role]);

  const mapRow = (v: Vendor) => ({
    ...v,
    id: v.vendorId,
    name: v.name,
    username: v.username,
    password: v.password,
    discountCode: v.discountCode,
    taxExempt: v.taxExempt,
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
        const vendor = (params.row as MapRowResult<Vendor>).raw as Vendor;
        return (
          <Checkbox
            checked={!!params.value}
            disabled={
              !canEditAllVendors && (vendor as unknown as { addedByUserId?: string }).addedByUserId !== currentUser.userId
            }
            onClick={async (e: MouseEvent<HTMLElement>) => {
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
        const vendor = (params.row as MapRowResult<Vendor>).raw as Vendor;
        return (
          <IconButton
            onClick={(e: MouseEvent<HTMLElement>) => {
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

      <NERDataGrid
        items={vendors}
        mapRow={mapRow}
        columns={columns}
        onAdd={() => setShowCreateModal(true)}
        onRowClick={(vendor) => setVendorToEdit(vendor)}
        // allow if the current user can edit all vendors or if they added this vendor
        canEditRow={(row) => {
          const v = (row as MapRowResult<Vendor>).raw as Vendor;
          const addedBy = (v as unknown as { addedByUserId?: string }).addedByUserId;
          return Boolean(canEditAllVendors || addedBy === currentUser.userId);
        }}
        initialSortModel={[{ field: 'name', sort: 'asc' }]}
        headerHeight={56}
        rowHeight={52}
        pageSizeDefault={10}
        searchFields={['name' as keyof MapRowResult<Vendor>]}
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
