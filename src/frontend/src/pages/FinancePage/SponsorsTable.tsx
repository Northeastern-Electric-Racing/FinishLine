import React, { useState } from 'react';
import { GridRenderCellParams } from '@mui/x-data-grid';
import type { MapRowResult } from '../../components/NERDataGrid';
import type { MouseEvent } from 'react';
import { Box, IconButton, Checkbox, Tooltip, Popover, Typography, Link } from '@mui/material';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useEditSponsor, useGetAllSponsors } from '../../hooks/finance.hooks';
import ErrorPage from '../ErrorPage';
import { NERButton } from '../../components/NERButton';
import { datePipe } from '../../utils/pipes';
import SponsorTierPill from '../../components/SponsorTierPill';
import CreateSponsorPage from './FinanceComponents/CreateSponsorPage';
import DeleteIcon from '@mui/icons-material/Delete';
import EditSponsorModal from './FinanceComponents/EditSponsorPage';
import DeleteSponsorModal from './FinanceComponents/DeleteSponsor';
import SidePage from './FinanceComponents/SidePagePopup';
import { isAtLeastRank, RoleEnum, Sponsor, ContactInfo } from 'shared';
import SponsorTasksModalWrapper from './FinanceComponents/SponsorTasksModalWrapper';
import SidePagePopup from './FinanceComponents/SidePagePopup';
import NERDataGrid from '../../components/NERDataGrid';
import { useCurrentUser } from '../../hooks/users.hooks';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const SponsorsTable = () => {
  const { data: sponsors, isLoading: sponsorIsLoading, isError: sponsorIsError, error: sponsorError } = useGetAllSponsors();
  const [showAddSponsor, setShowAddSponsor] = useState(false);
  const [sponsorToEdit, setSponsorToEdit] = useState<Sponsor | undefined>(undefined);
  const [sponsorToDelete, setSponsorToDelete] = useState<Sponsor | undefined>(undefined);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
  const [isTasksModalOpen, setIsTasksModalOpen] = useState(false);
  const [contactAnchorEl, setContactAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedContact, setSelectedContact] = useState<ContactInfo | null>(null);
  const currentUser = useCurrentUser();
  const { mutateAsync: editSponsorMutateAsync } = useEditSponsor();

  const canEditSponsors = isAtLeastRank(RoleEnum.HEAD, currentUser.role) || !!currentUser.isFinance;

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

  const sponsorToInlinePayload = (sponsor: Sponsor, overrides: Partial<Sponsor>) => ({
    sponsorId: sponsor.sponsorId,
    name: sponsor.name,
    activeStatus: sponsor.activeStatus,
    valueTypes: sponsor.valueTypes,
    sponsorValue: sponsor.sponsorValue,
    joinDate: sponsor.joinDate,
    activeYears: sponsor.activeYears,
    sponsorTierId: sponsor.tier?.sponsorTierId,
    taxExempt: sponsor.taxExempt,
    contactName: sponsor.contact.name,
    contactEmail: sponsor.contact.email,
    contactPhone: sponsor.contact.phone,
    contactPosition: sponsor.contact.position,
    sponsorTasks: sponsor.sponsorTasks.map((t) => ({
      sponsorTaskId: t.sponsorTaskId,
      dueDate: t.dueDate,
      notifyDate: t.notifyDate,
      assigneeUserId: t.assignee?.userId,
      notes: t.notes,
      done: t.done
    })),
    discountCode: sponsor.discountCode,
    sponsorNotes: sponsor.sponsorNotes,
    stockDescription: sponsor.stockDescription,
    discountDescription: sponsor.discountDescription,
    ...overrides
  });

  const columns = [
    { field: 'name', headerName: 'Sponsor', flex: 1, minWidth: 50 },
    {
      field: 'activeStatus',
      headerName: 'Active?',
      flex: 1,
      minWidth: 50,
      maxWidth: 100,
      renderCell: (p: GridRenderCellParams<boolean, MapRowResult<Sponsor>>) => (
        <Checkbox
          disabled={!canEditSponsors}
          checked={!!p.value}
          onClick={async (e: MouseEvent<HTMLElement>) => {
            e.stopPropagation();
            const sponsor = (p.row as MapRowResult<Sponsor>).raw;
            if (!sponsor) return;
            await editSponsorMutateAsync(sponsorToInlinePayload(sponsor, { activeStatus: !p.value }));
          }}
        />
      )
    },
    {
      field: 'contact',
      headerName: 'Contact',
      flex: 1,
      minWidth: 50,
      renderCell: (p: GridRenderCellParams<any, MapRowResult<Sponsor>>) => {
        const contact = (p.row as MapRowResult<Sponsor>).raw?.contact;
        if (!contact) return null;
        const hasDetails = !!(contact.email || contact.phone || contact.position);
        return (
          <span
            onClick={
              hasDetails
                ? (e: React.MouseEvent<HTMLElement>) => {
                    e.stopPropagation();
                    setContactAnchorEl(e.currentTarget);
                    setSelectedContact(contact);
                  }
                : undefined
            }
            style={{ cursor: hasDetails ? 'pointer' : 'default', textDecoration: hasDetails ? 'underline' : 'none' }}
          >
            {contact.name}
          </span>
        );
      }
    },
    {
      field: 'tier',
      headerName: 'Sponsor Tier',
      flex: 1,
      minWidth: 100,
      renderCell: (params: GridRenderCellParams<string, MapRowResult<Sponsor>>) => {
        const tier = (params.row as MapRowResult<Sponsor>).raw?.tier;
        return tier ? <SponsorTierPill tier={tier} /> : <Typography variant="body2">—</Typography>;
      }
    },
    {
      field: 'valueTypes',
      headerName: 'Type',
      flex: 1,
      minWidth: 80,
      renderCell: (p: GridRenderCellParams<string[], MapRowResult<Sponsor>>) => {
        const types = (p.row as MapRowResult<Sponsor>).raw?.valueTypes ?? [];
        return types.map((t: string) => t.charAt(0) + t.slice(1).toLowerCase()).join(', ');
      }
    },
    {
      field: 'sponsorValue',
      headerName: 'Sponsor Value',
      flex: 1,
      minWidth: 50,
      renderCell: (p: GridRenderCellParams<number | undefined, MapRowResult<Sponsor>>) =>
        p.value != null ? `$${p.value}` : '\u2014'
    },
    {
      field: 'joinDate',
      headerName: 'Sponsor Join Date',
      flex: 1,
      minWidth: 100,
      renderCell: (p: GridRenderCellParams<string | null, MapRowResult<Sponsor>>) =>
        datePipe(new Date(String(p.value ?? '')))
    },
    { field: 'discountCode', headerName: 'Discount Code', flex: 1, minWidth: 50 },
    {
      field: 'taxExempt',
      headerName: 'Tax Exempt?',
      flex: 1,
      minWidth: 50,
      maxWidth: 100,
      renderCell: (p: GridRenderCellParams<boolean, MapRowResult<Sponsor>>) => {
        return (
          <Checkbox
            disabled={!canEditSponsors}
            checked={!!p.value}
            onClick={(e: MouseEvent<HTMLElement>) => {
              e.stopPropagation();
              const sponsor = (p.row as MapRowResult<Sponsor>).raw;
              if (!sponsor) return;
              editSponsorMutateAsync(sponsorToInlinePayload(sponsor, { taxExempt: !p.value }));
            }}
          />
        );
      }
    },
    {
      field: 'sponsorNotes',
      headerName: 'Notes',
      flex: 1,
      minWidth: 40,
      maxWidth: 80,
      sortable: false,
      filterable: false,
      renderCell: (p: GridRenderCellParams<string | null, MapRowResult<Sponsor>>) => {
        const notes = (p.row as MapRowResult<Sponsor>).raw?.sponsorNotes;

        if (!notes || notes.trim() === '') {
          return null;
        }

        return (
          <Tooltip title={notes} arrow placement="left">
            <IconButton size="small" sx={{ p: 0.5, color: 'white' }}>
              <InfoOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        );
      }
    },
    {
      field: 'tasks',
      headerName: 'Sponsor Tasks',
      flex: 1,
      minWidth: 100,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<any, MapRowResult<Sponsor>>) => {
        const sponsor = (params.row as MapRowResult<Sponsor>).raw as Sponsor;
        return (
          <NERButton
            variant="contained"
            onClick={(e: MouseEvent<HTMLElement>) => {
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
      flex: 1,
      minWidth: 50,
      maxWidth: 80,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<any, MapRowResult<Sponsor>>) => {
        const sponsor = (params.row as MapRowResult<Sponsor>).raw as Sponsor;
        return (
          <IconButton
            size="small"
            sx={{ p: 0.5, color: 'white' }}
            onClick={(e: MouseEvent<HTMLElement>) => {
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

      <NERDataGrid
        items={sponsors}
        mapRow={mapRow}
        columns={columns}
        pageSizeDefault={10}
        initialSortModel={[{ field: 'name', sort: 'asc' }]}
        headerHeight={56}
        rowHeight={52}
        onRowClick={(s) => setSponsorToEdit(s)}
        onAdd={() => setShowAddSponsor(true)}
        searchFields={['name' as keyof MapRowResult<Sponsor>]}
        paperSx={{
          borderRadius: '10px 10px 0 0',
          overflow: 'hidden',
          height: 'calc(100vh - 120px)',
          display: 'flex',
          flexDirection: 'column'
        }}
        canEditRow={() => canEditSponsors}
      />
      <CreateSponsorPage showPage={showAddSponsor} handleClose={() => setShowAddSponsor(false)} />
      <SidePagePopup
        showPage={isTasksModalOpen && !!selectedSponsor}
        handleClose={closeTasksModal}
        title={selectedSponsor ? `Tasks for ${selectedSponsor.name}` : ''}
        component={
          selectedSponsor ? <SponsorTasksModalWrapper onClose={closeTasksModal} sponsor={selectedSponsor} /> : <></>
        }
      />

      <Popover
        open={!!contactAnchorEl}
        anchorEl={contactAnchorEl}
        onClose={() => {
          setContactAnchorEl(null);
          setSelectedContact(null);
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        {selectedContact && (
          <Box sx={{ p: 2, minWidth: 200 }}>
            <Typography fontWeight="bold">{selectedContact.name}</Typography>
            {selectedContact.position && (
              <Typography variant="body2" color="text.secondary">
                {selectedContact.position}
              </Typography>
            )}
            {selectedContact.email && (
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                <Link href={`mailto:${selectedContact.email}`}>{selectedContact.email}</Link>
              </Typography>
            )}
            {selectedContact.phone && (
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                <Link href={`tel:${selectedContact.phone}`}>{selectedContact.phone}</Link>
              </Typography>
            )}
          </Box>
        )}
      </Popover>
    </Box>
  );
};

export default SponsorsTable;
