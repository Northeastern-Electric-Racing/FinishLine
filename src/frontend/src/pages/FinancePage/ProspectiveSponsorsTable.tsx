/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import React, { useState } from 'react';
import { GridRenderCellParams } from '@mui/x-data-grid';
import type { MapRowResult } from '../../components/NERDataGrid';
import type { MouseEvent } from 'react';
import { Box, IconButton, Tooltip, Chip, Popover, Typography, Link } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useAllProspectiveSponsors } from '../../hooks/finance.hooks';
import ErrorPage from '../ErrorPage';
import { NERButton } from '../../components/NERButton';
import { datePipe } from '../../utils/pipes';
import { isAtLeastRank, RoleEnum, ProspectiveSponsor, ProspectiveSponsorStatus, ContactInfo } from 'shared';
import SidePagePopup from './FinanceComponents/SidePagePopup';
import NERDataGrid from '../../components/NERDataGrid';
import { useCurrentUser } from '../../hooks/users.hooks';
import CreateProspectiveSponsorPage from './FinanceComponents/CreateProspectiveSponsorPage';
import EditProspectiveSponsorPage from './FinanceComponents/EditProspectiveSponsorPage';
import DeleteProspectiveSponsorModal from './FinanceComponents/DeleteProspectiveSponsorModal';
import AcceptProspectiveSponsorModal from './FinanceComponents/AcceptProspectiveSponsorModal';
import ProspectiveSponsorTasksModal from './FinanceComponents/ProspectiveSponsorTasksModal';

const statusColors: Record<string, 'default' | 'info' | 'success' | 'error' | 'warning'> = {
  IN_PROGRESS: 'info',
  DECLINED: 'error',
  NOT_IN_CONTACT: 'warning',
  NO_RESPONSE: 'default',
  ACCEPTED: 'success'
};

const statusDisplayNames: Record<string, string> = {
  IN_PROGRESS: 'In Progress',
  DECLINED: 'Declined',
  NOT_IN_CONTACT: 'Not In Contact',
  NO_RESPONSE: 'No Response',
  ACCEPTED: 'Accepted'
};

const ProspectiveSponsorsTable = () => {
  const { data: prospectiveSponsors, isLoading, isError, error } = useAllProspectiveSponsors();
  const [showAddProspectiveSponsor, setShowAddProspectiveSponsor] = useState(false);
  const [prospectiveSponsorToEdit, setProspectiveSponsorToEdit] = useState<ProspectiveSponsor | undefined>(undefined);
  const [prospectiveSponsorToDelete, setProspectiveSponsorToDelete] = useState<ProspectiveSponsor | undefined>(undefined);
  const [prospectiveSponsorToAccept, setProspectiveSponsorToAccept] = useState<ProspectiveSponsor | undefined>(undefined);
  const [selectedProspectiveSponsor, setSelectedProspectiveSponsor] = useState<ProspectiveSponsor | null>(null);
  const [isTasksModalOpen, setIsTasksModalOpen] = useState(false);
  const [contactAnchorEl, setContactAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedContact, setSelectedContact] = useState<ContactInfo | null>(null);
  const currentUser = useCurrentUser();

  const canEditProspectiveSponsors = isAtLeastRank(RoleEnum.HEAD, currentUser.role) || !!currentUser.isFinance;

  if (!prospectiveSponsors || isLoading) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error.message} />;

  const isHighlighted = (ps: ProspectiveSponsor) => {
    if (!ps.lastContactDate) return false;
    const daysSinceContact = Math.floor(
      (new Date().getTime() - new Date(ps.lastContactDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceContact > ps.highlightThresholdDays;
  };

  // Filter out accepted sponsors, then sort highlighted rows to top, then alphabetical
  const sortedProspectiveSponsors = [...prospectiveSponsors]
    .filter((ps) => ps.status !== ProspectiveSponsorStatus.ACCEPTED)
    .sort((a, b) => {
      const aHighlighted = isHighlighted(a);
      const bHighlighted = isHighlighted(b);
      if (aHighlighted && !bHighlighted) return -1;
      if (!aHighlighted && bHighlighted) return 1;
      return a.organizationName.localeCompare(b.organizationName);
    });

  const openTasksModal = (ps: ProspectiveSponsor) => {
    setSelectedProspectiveSponsor(ps);
    setIsTasksModalOpen(true);
  };

  const closeTasksModal = () => {
    setSelectedProspectiveSponsor(null);
    setIsTasksModalOpen(false);
  };

  const columns = [
    { field: 'organizationName', headerName: 'Organization', flex: 1, minWidth: 120 },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.8,
      minWidth: 100,
      renderCell: (p: GridRenderCellParams<ProspectiveSponsorStatus, MapRowResult<ProspectiveSponsor>>) => {
        const status = p.value as string;
        return <Chip label={statusDisplayNames[status] || status} color={statusColors[status] || 'default'} size="small" />;
      }
    },
    {
      field: 'contact',
      headerName: 'Contact',
      flex: 0.8,
      minWidth: 100,
      renderCell: (p: GridRenderCellParams<any, MapRowResult<ProspectiveSponsor>>) => {
        const contact = (p.row as MapRowResult<ProspectiveSponsor>).raw?.contact;
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
      field: 'contactor',
      headerName: 'Contactor',
      flex: 0.8,
      minWidth: 100,
      renderCell: (p: GridRenderCellParams<any, MapRowResult<ProspectiveSponsor>>) => {
        const contactor = (p.row as MapRowResult<ProspectiveSponsor>).raw?.contactor;
        return contactor ? `${contactor.firstName} ${contactor.lastName}` : '';
      }
    },
    {
      field: 'lastContactDate',
      headerName: 'Last Contact',
      flex: 0.8,
      minWidth: 100,
      renderCell: (p: GridRenderCellParams<Date, MapRowResult<ProspectiveSponsor>>) =>
        p.value ? datePipe(new Date(String(p.value))) : '—'
    },
    {
      field: 'dateCreated',
      headerName: 'Created',
      flex: 0.7,
      minWidth: 90,
      renderCell: (p: GridRenderCellParams<Date, MapRowResult<ProspectiveSponsor>>) =>
        datePipe(new Date(String(p.value ?? '')))
    },
    {
      field: 'notes',
      headerName: 'Notes',
      flex: 0.5,
      minWidth: 40,
      maxWidth: 80,
      sortable: false,
      filterable: false,
      renderCell: (p: GridRenderCellParams<string | undefined, MapRowResult<ProspectiveSponsor>>) => {
        const notes = (p.row as MapRowResult<ProspectiveSponsor>).raw?.notes;
        if (!notes || notes.trim() === '') return null;
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
      headerName: 'Tasks',
      flex: 0.6,
      minWidth: 80,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<any, MapRowResult<ProspectiveSponsor>>) => {
        const ps = (params.row as MapRowResult<ProspectiveSponsor>).raw as ProspectiveSponsor;
        return (
          <NERButton
            variant="contained"
            onClick={(e: MouseEvent<HTMLElement>) => {
              e.stopPropagation();
              openTasksModal(ps);
            }}
            sx={{
              px: 1,
              py: 0.4,
              fontSize: 'inherit',
              minHeight: 0,
              height: 'auto',
              lineHeight: 1,
              textTransform: 'none'
            }}
          >
            Tasks
          </NERButton>
        );
      }
    },
    {
      field: 'accept',
      headerName: 'Accept',
      flex: 0.5,
      minWidth: 60,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<any, MapRowResult<ProspectiveSponsor>>) => {
        const ps = (params.row as MapRowResult<ProspectiveSponsor>).raw as ProspectiveSponsor;
        if (ps.status === ProspectiveSponsorStatus.ACCEPTED) return null;
        return (
          <Tooltip title="Accept as Sponsor">
            <IconButton
              size="small"
              sx={{ color: '#4caf50' }}
              disabled={!canEditProspectiveSponsors}
              onClick={(e: MouseEvent<HTMLElement>) => {
                e.stopPropagation();
                setProspectiveSponsorToAccept(ps);
              }}
            >
              <CheckCircleIcon />
            </IconButton>
          </Tooltip>
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Delete',
      flex: 0.5,
      minWidth: 60,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<any, MapRowResult<ProspectiveSponsor>>) => {
        const ps = (params.row as MapRowResult<ProspectiveSponsor>).raw as ProspectiveSponsor;
        return (
          <IconButton
            size="small"
            sx={{ color: 'white' }}
            disabled={!canEditProspectiveSponsors}
            onClick={(e: MouseEvent<HTMLElement>) => {
              e.stopPropagation();
              setProspectiveSponsorToDelete(ps);
            }}
          >
            <DeleteIcon />
          </IconButton>
        );
      }
    }
  ];

  const mapRow = (ps: ProspectiveSponsor) => ({
    ...ps,
    id: ps.prospectiveSponsorId,
    raw: ps
  });

  return (
    <Box>
      {prospectiveSponsorToEdit && (
        <SidePagePopup
          showPage={!!prospectiveSponsorToEdit}
          handleClose={() => setProspectiveSponsorToEdit(undefined)}
          title="Edit Prospective Sponsor"
          component={
            <EditProspectiveSponsorPage
              showPage={!!prospectiveSponsorToEdit}
              handleClose={() => setProspectiveSponsorToEdit(undefined)}
              prospectiveSponsor={prospectiveSponsorToEdit}
            />
          }
        />
      )}

      {prospectiveSponsorToDelete && (
        <DeleteProspectiveSponsorModal
          showModal={!!prospectiveSponsorToDelete}
          handleClose={() => setProspectiveSponsorToDelete(undefined)}
          prospectiveSponsor={prospectiveSponsorToDelete}
        />
      )}

      {prospectiveSponsorToAccept && (
        <AcceptProspectiveSponsorModal
          showModal={!!prospectiveSponsorToAccept}
          handleClose={() => setProspectiveSponsorToAccept(undefined)}
          prospectiveSponsor={prospectiveSponsorToAccept}
        />
      )}

      <NERDataGrid
        items={sortedProspectiveSponsors}
        mapRow={mapRow}
        columns={columns}
        pageSizeDefault={10}
        initialSortModel={[]}
        headerHeight={56}
        rowHeight={52}
        onRowClick={(ps) => setProspectiveSponsorToEdit(ps)}
        onAdd={() => setShowAddProspectiveSponsor(true)}
        searchFields={['organizationName' as keyof MapRowResult<ProspectiveSponsor>]}
        paperSx={{
          borderRadius: '10px 10px 0 0',
          overflow: 'hidden',
          height: 'calc(100vh - 120px)',
          display: 'flex',
          flexDirection: 'column'
        }}
        canEditRow={() => canEditProspectiveSponsors}
        getRowClassName={(row) => {
          const ps = row.raw;
          return ps && isHighlighted(ps) ? 'highlighted-row' : '';
        }}
        dataGridSx={{
          '& .highlighted-row': {
            backgroundColor: 'rgba(239, 67, 69, 0.15)'
          },
          '& .highlighted-row:hover': {
            backgroundColor: 'rgba(239, 67, 69, 0.25)'
          }
        }}
      />

      <CreateProspectiveSponsorPage
        showPage={showAddProspectiveSponsor}
        handleClose={() => setShowAddProspectiveSponsor(false)}
      />

      <SidePagePopup
        showPage={isTasksModalOpen && !!selectedProspectiveSponsor}
        handleClose={closeTasksModal}
        title={selectedProspectiveSponsor ? `Tasks for ${selectedProspectiveSponsor.organizationName}` : ''}
        component={
          selectedProspectiveSponsor ? (
            <ProspectiveSponsorTasksModal onClose={closeTasksModal} prospectiveSponsor={selectedProspectiveSponsor} />
          ) : (
            <></>
          )
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

export default ProspectiveSponsorsTable;
