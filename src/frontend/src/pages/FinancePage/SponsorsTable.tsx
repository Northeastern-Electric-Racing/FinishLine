import React, { useState } from 'react';
import { Box, Typography, Button, IconButton, Checkbox } from '@mui/material';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useGetAllSponsors } from '../../hooks/finance.hooks';
import ErrorPage from '../ErrorPage';
import { NERButton } from '../../components/NERButton';
import { datePipe } from '../../utils/pipes';
import SponsorTierPill from '../../components/SponsorTierPill';
import CreateSponsorPage from './FinanceComponents/CreateSponsorPage';
import DeleteIcon from '@mui/icons-material/Delete';
import EditSponsorModal from './FinanceComponents/EditSponsorPage';
import DeleteSponsorModal from './FinanceComponents/DeleteSponsor';
import SidePage from './FinanceComponents/SidePagePopup';
import { isAtLeastRank, RoleEnum, Sponsor } from 'shared';
import SponsorTasksModal from './FinanceComponents/SponsorTasksModal';
import SidePagePopup from './FinanceComponents/SidePagePopup';
import CompanyDataGrid from '../../components/CompanyDataGrid';
import { useCurrentUser } from '../../hooks/users.hooks';

const SponsorsTable = () => {
  const { data: sponsors, isLoading: sponsorIsLoading, isError: sponsorIsError, error: sponsorError } = useGetAllSponsors();
  const [showAddSponsor, setShowAddSponsor] = useState(false);
  const [sponsorToEdit, setSponsorToEdit] = useState<Sponsor | undefined>(undefined);
  const [sponsorToDelete, setSponsorToDelete] = useState<Sponsor | undefined>(undefined);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
  const [isTasksModalOpen, setIsTasksModalOpen] = useState(false);
  const currentUser = useCurrentUser();

  const canEditSponsors = isAtLeastRank(RoleEnum.HEAD, currentUser.role) || currentUser.isFinance;

  if (!sponsors || sponsorIsLoading) return <LoadingIndicator />;
  if (sponsorIsError) return <ErrorPage message={sponsorError.message} />;

  // ensure a predictable ordering
  sponsors.sort((a, b) => a.name.localeCompare(b.name));

  const openTasksModal = (sponsor: Sponsor) => {
    setSelectedSponsor(sponsor);
    setIsTasksModalOpen(true);
  };

  const closeTasksModal = () => {
    setSelectedSponsor(null);
    setIsTasksModalOpen(false);
  };

  const columns = [
    { field: 'name', headerName: 'Sponsor', flex: 1 },
    {
      field: 'activeStatus',
      headerName: 'Active?',
      width: 160,
      renderCell: (p: any) => (
        <Checkbox
          disabled={!canEditSponsors}
          checked={p.value}
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
      )
    },
    { field: 'sponsorContact', headerName: 'Contact', flex: 1 },
    {
      field: 'tier',
      headerName: 'Sponsor Tier',
      width: 140,
      renderCell: (params: any) => <SponsorTierPill tier={(params.row as any).raw.tier} />
    },
    { field: 'sponsorValue', headerName: 'Sponsor Value', width: 160, renderCell: (p: any) => `$${p.value}` },
    {
      field: 'joinDate',
      headerName: 'Sponsor Join Date',
      width: 180,
      renderCell: (p: any) => datePipe((p.value as any) || '')
    },
    { field: 'discountCode', headerName: 'Discount', flex: 1 },
    {
      field: 'taxExempt',
      headerName: 'Tax Exempt?',
      width: 120,
      renderCell: (p: any) => {
        return (
          <Checkbox
            disabled={!canEditSponsors}
            checked={p.value}
            onClick={(e) => {
              e.stopPropagation();
            }}
          />
        );
      }
    },
    {
      field: 'tasks',
      headerName: 'Sponsor Tasks',
      width: 180,
      sortable: false,
      filterable: false,
      renderCell: (params: any) => {
        const sponsor = (params.row as any).raw as Sponsor;
        return (
          <NERButton
            variant="contained"
            onClick={(e: any) => {
              // prevent the DataGrid row click from firing
              e.stopPropagation();
              openTasksModal(sponsor);
            }}
            sx={{
              px: 1,
              py: 0.4,
              fontSize: 'inherit',
              minHeight: 0,
              height: 'auto',
              lineHeight: 1,
              textTransform: 'none',
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            View Tasks
          </NERButton>
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Delete',
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params: any) => {
        const sponsor = (params.row as any).raw as Sponsor;
        return (
          <IconButton
            size="small"
            sx={{ p: 0.5, color: 'white' }}
            onClick={(e: any) => {
              // prevent the DataGrid row click from firing
              e.stopPropagation();
              setSponsorToDelete(sponsor);
              setShowDeleteModal(true);
            }}
          >
            <DeleteIcon />
          </IconButton>
        );
      }
    }
  ];

  const mapRow = (s: Sponsor) => ({
    ...s,
    id: s.sponsorId,
    raw: s
  });

  return (
    <Box>
      {sponsorToEdit && (
        <SidePage
          showPage={!!sponsorToEdit}
          handleClose={() => {
            setSponsorToEdit(undefined);
          }}
          title="Edit Sponsor"
          component={
            <EditSponsorModal
              showPage={!!sponsorToEdit}
              handleClose={() => {
                setSponsorToEdit(undefined);
              }}
              sponsor={sponsorToEdit}
            />
          }
        />
      )}

      {sponsorToDelete && (
        <DeleteSponsorModal
          showModal={showDeleteModal}
          handleClose={() => {
            setShowDeleteModal(false);
          }}
          sponsor={sponsorToDelete}
        />
      )}

      <CompanyDataGrid
        items={sponsors}
        mapRow={mapRow}
        columns={columns}
        pageSizeDefault={10}
        rowsPerPageOptions={[10, 14, 25, 50, 100]}
        initialSortModel={[{ field: 'name', sort: 'asc' }]}
        headerHeight={56}
        rowHeight={52}
        onRowClick={(s) => setSponsorToEdit(s)}
        onAdd={() => setShowAddSponsor(true)}
        searchFields={['name' as any]}
        paperSx={{
          borderRadius: '10px 10px 0 0',
          overflow: 'hidden',
          height: 'calc(100vh - 120px)',
          display: 'flex',
          flexDirection: 'column'
        }}
        canEdit={canEditSponsors}
      />
      <CreateSponsorPage showPage={showAddSponsor} handleClose={() => setShowAddSponsor(false)} />
      {selectedSponsor && (
        <SidePagePopup
          showPage={isTasksModalOpen}
          handleClose={closeTasksModal}
          title={`Tasks for ${selectedSponsor?.name}`}
          component={<SponsorTasksModal onClose={closeTasksModal} sponsor={selectedSponsor} />}
        />
      )}
    </Box>
  );
};

export default SponsorsTable;
