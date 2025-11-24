import { Box, IconButton, TableCell, TableRow, Typography } from '@mui/material';
import { NERButton } from '../../../components/NERButton';
import NERTable from '../../../components/NERTable';
import { useState } from 'react';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { useDeleteSponsorTier } from '../../../hooks/finance.hooks';
import { Delete } from '@mui/icons-material';
import SponsorTierDeleteModal from './SponsorTierDeleteModal';
import { useToast } from '../../../hooks/toasts.hooks';
import { useGetAllSponsorTiers } from '../../../hooks/finance.hooks';
import CreateSponsorTierModal from './CreateSponsorTierModal';
import { SponsorTier } from 'shared';
import EditSponsorTierModal from './EditSponsorTierModal';

interface SponsorTierDeleteButtonProps {
  sponsorTierId: string;
  name: string;
  colorHexCode: string;
  onDelete: (sponsorTierId: string, name: string) => void;
}

const SponsorTierTable: React.FC = () => {
  const {
    data: sponsorTiers,
    isLoading: sponsorTiersIsLoading,
    isError: sponsorTiersIsError,
    error: sponsorTiersError
  } = useGetAllSponsorTiers();
  const toast = useToast();
  const { mutateAsync } = useDeleteSponsorTier();

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [tierToEdit, setTierToEdit] = useState<SponsorTier | null>(null);

  if (!sponsorTiers || sponsorTiersIsLoading) {
    return <LoadingIndicator />;
  }
  if (sponsorTiersIsError) {
    return <ErrorPage message={sponsorTiersError?.message} />;
  }

  const handleDeleteSponsorTier = async (sponsorTierId: string, name: string) => {
    try {
      await mutateAsync(sponsorTierId);
      toast.success(`Sponsor Tier: ${name} Deleted Successfully!`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const SponsorTierDeleteButton: React.FC<SponsorTierDeleteButtonProps> = ({
    sponsorTierId,
    name,
    colorHexCode,
    onDelete
  }) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleDeleteSubmit = () => {
      onDelete(sponsorTierId, name);
      setShowDeleteModal(false);
    };
    return (
      <>
        <IconButton
          type="button"
          sx={{
            mx: 1
          }}
          onClick={() => {
            setShowDeleteModal(true);
          }}
        >
          <Delete />
        </IconButton>
        {showDeleteModal && (
          <SponsorTierDeleteModal
            name={name}
            colorHexCode={colorHexCode}
            onDelete={handleDeleteSubmit}
            onHide={() => setShowDeleteModal(false)}
          />
        )}
      </>
    );
  };

  const sponsorTierTableRows = sponsorTiers.map((sponsorTier, index) => (
    <TableRow key={sponsorTier.sponsorTierId} hover sx={{ cursor: 'pointer' }}>
      <TableCell
        sx={{ borderBottom: index === sponsorTiers.length - 1 ? 'none' : 'default' }}
        onClick={() => {
          setTierToEdit(sponsorTier);
        }}
      >
        <Box
          sx={{
            display: 'inline-block',
            padding: '4px 8px',
            alignItems: 'center',
            height: '100%',
            background: sponsorTier.colorHexCode,
            borderRadius: '8px'
          }}
        >
          {sponsorTier.name}
        </Box>
      </TableCell>
      <TableCell
        sx={{ borderBottom: index === sponsorTiers.length - 1 ? 'none' : 'default' }}
        onClick={() => {
          setTierToEdit(sponsorTier);
        }}
      >
        <Typography>{`$${sponsorTier.minSupportValue.toLocaleString()}`}</Typography>
      </TableCell>
      <TableCell sx={{ borderBottom: index === sponsorTiers.length - 1 ? 'none' : 'default' }}>
        <SponsorTierDeleteButton
          sponsorTierId={sponsorTier.sponsorTierId}
          name={sponsorTier.name}
          colorHexCode={sponsorTier.colorHexCode}
          onDelete={handleDeleteSponsorTier}
        />
      </TableCell>
    </TableRow>
  ));

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'left', marginTop: '20px', paddingBottom: '20px' }}>
        <Typography variant="h5" gutterBottom color="white" paddingRight={'20px'}>
          Sponsor Tiers
        </Typography>
        <NERButton
          style={{ color: 'white' }}
          variant="contained"
          onClick={() => {
            setShowCreateModal(true);
          }}
        >
          Add Tier
        </NERButton>
      </Box>
      <CreateSponsorTierModal showModal={showCreateModal} handleClose={() => setShowCreateModal(false)} />
      {tierToEdit && (
        <EditSponsorTierModal showModal={!!tierToEdit} handleClose={() => setTierToEdit(null)} sponsorTier={tierToEdit} />
      )}
      <NERTable
        columns={[
          { name: 'Tier Name', width: '40%' },
          { name: 'Minimum Support Value', width: '40%' },
          { name: 'Actions', width: '20%' }
        ]}
        rows={sponsorTierTableRows}
      />
    </Box>
  );
};

export default SponsorTierTable;
