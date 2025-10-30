import React, { useState } from 'react';
import { TableRow, TableCell, Box, Table as MuiTable, TableHead, TableBody, Typography, Button } from '@mui/material';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useGetAllSponsors } from '../../hooks/finance.hooks';
import ErrorPage from '../ErrorPage';
import { NERButton } from '../../components/NERButton';
import { datePipe } from '../../utils/pipes';
import SponsorTierPill from '../../components/SponsorTierPill';
import PaginationFooter from '../../components/PaginationFooter';
import CreateSponsorPage from './FinanceComponents/CreateSponsorPage';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EditSponsorModal from './FinanceComponents/EditSponsorPage';
import DeleteSponsorModal from './FinanceComponents/DeleteSponsor';
import SidePage from './FinanceComponents/SidePagePopup';
import { Sponsor } from 'shared';
import SponsorTasksModal from './FinanceComponents/SponsorTasksModal';
import SidePagePopup from './FinanceComponents/SidePagePopup';

const SponsorsTable = () => {
  const { data: sponsors, isLoading: sponsorIsLoading, isError: sponsorIsError, error: sponsorError } = useGetAllSponsors();
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(14);
  const [showAddSponsor, setShowAddSponsor] = useState(false);
  const [sponsorToEdit, setSponsorToEdit] = useState<Sponsor | undefined>(undefined);
  const [sponsorToDelete, setSponsorToDelete] = useState<Sponsor | undefined>(undefined);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
  const [isTasksModalOpen, setIsTasksModalOpen] = useState(false);

  if (!sponsors || sponsorIsLoading) {
    return <LoadingIndicator />;
  }
  if (sponsorIsError) {
    return <ErrorPage message={sponsorError.message} />;
  }

  sponsors.sort((a, b) => a.name.localeCompare(b.name));
  const startIdx = currentPage * rowsPerPage;
  const currentSponsors = sponsors.slice(startIdx, startIdx + rowsPerPage);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  const openTasksModal = (sponsor: Sponsor) => {
    setSelectedSponsor(sponsor);
    setIsTasksModalOpen(true);
  };

  const closeTasksModal = () => {
    setSelectedSponsor(null);
    setIsTasksModalOpen(false);
  };

  const sponsorTableRows = currentSponsors.map((sponsor, index) => (
    <TableRow key={sponsor.sponsorId || index}>
      <TableCell
        align="center"
        sx={{
          alignItems: 'center',
          borderBottom: 'none'
        }}
      >
        <Typography sx={{ maxWidth: 300, textAlign: 'center', fontSize: '1.25rem', fontWeight: 'bold' }}>
          {sponsor.name}
        </Typography>
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
        <Typography sx={{ fontSize: '1.25rem' }}>{sponsor.activeStatus ? 'Active' : 'Inactive'}</Typography>
      </TableCell>
      <TableCell
        align="center"
        sx={{
          alignItems: 'center',
          borderBottom: 'none'
        }}
      >
        <Typography sx={{ maxWidth: 300, textAlign: 'center', fontSize: '1.25rem' }}>{sponsor.sponsorContact}</Typography>
      </TableCell>

      <TableCell
        align="center"
        sx={{
          alignItems: 'center',
          borderBottom: 'none'
        }}
      >
        <Box sx={{ maxWidth: 300, textAlign: 'center', fontSize: '1.25rem' }}>
          <SponsorTierPill tier={sponsor.tier} />
        </Box>
      </TableCell>
      <TableCell
        align="center"
        sx={{
          alignItems: 'center',
          borderBottom: 'none'
        }}
      >
        <Typography
          sx={{ maxWidth: 300, textAlign: 'center', fontSize: '1.25rem' }}
        >{`$${sponsor.sponsorValue}`}</Typography>
      </TableCell>
      <TableCell
        align="center"
        sx={{
          alignItems: 'center',
          borderBottom: 'none'
        }}
      >
        <Typography sx={{ maxWidth: 300, textAlign: 'center', fontSize: '1.25rem' }}>
          {datePipe(sponsor.joinDate)}
        </Typography>
      </TableCell>
      <TableCell
        align="center"
        sx={{
          alignItems: 'center',
          borderBottom: 'none'
        }}
      >
        <Typography sx={{ maxWidth: 300, textAlign: 'center', fontSize: '1.25rem' }}>{sponsor.discountCode}</Typography>
      </TableCell>
      <TableCell
        align="center"
        sx={{
          alignItems: 'center',
          borderBottom: 'none'
        }}
      >
        <Typography sx={{ maxWidth: 300, textAlign: 'center', fontSize: '1.25rem' }}>
          {sponsor.taxExempt ? 'Yes' : 'No'}
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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <NERButton variant="contained" onClick={() => openTasksModal(sponsor)}>
            View Tasks
          </NERButton>
        </Box>
      </TableCell>
      <TableCell
        align="center"
        sx={{
          alignItems: 'center',
          borderBottom: 'none'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            borderBottom: 'none'
          }}
        >
          <Button
            sx={{ p: 0.5, color: 'white' }}
            onClick={() => {
              setSponsorToEdit(sponsor);
            }}
          >
            <EditIcon />
          </Button>
          <Button
            sx={{ p: 0.5, color: 'white' }}
            onClick={() => {
              setSponsorToDelete(sponsor);
              setShowDeleteModal(true);
            }}
          >
            <DeleteIcon />
          </Button>
        </Box>
      </TableCell>
    </TableRow>
  ));

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
            ></EditSponsorModal>
          }
        ></SidePage>
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
      <Box sx={{ paddingBottom: '100px' }}>
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
                Sponsor
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
                Sponsor Status
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
                Contacts
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
                Sponsor Tier
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
                Sponsor Value
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
                Sponsor Join Date
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
                Tax Exempt
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
                Sponsor Tasks
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
                Tasks
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{sponsorTableRows}</TableBody>
        </MuiTable>
      </Box>
      <Box>
        <CreateSponsorPage showPage={showAddSponsor} handleClose={() => setShowAddSponsor(false)} />

        <PaginationFooter
          footerButton={
            <NERButton
              variant="contained"
              onClick={() => setShowAddSponsor(true)}
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
              {' '}
              Add Sponsor
            </NERButton>
          }
          footerInfoBoxes={[<Box># of Sponsors: {sponsors.length}</Box>]}
          totalItems={sponsors.length}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 14, 25, 50, 100]}
        />
      </Box>
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
