import { FormControl, Typography } from '@mui/material';
import NERModal from '../../../components/NERModal';
import { Box } from '@mui/system';

interface SponsorTierDeleteModalProps {
  name: string;
  colorHexCode: string;
  onDelete: () => void;
  onHide: () => void;
}

const SponsorTierDeleteModal: React.FC<SponsorTierDeleteModalProps> = ({
  name,
  colorHexCode,
  onDelete,
  onHide
}: SponsorTierDeleteModalProps) => {
  return (
    <NERModal
      open={true}
      onHide={onHide}
      title="Warning!"
      cancelText="Cancel"
      submitText="Delete"
      onSubmit={onDelete}
      formId="part-tag-delete"
    >
      <Typography>Are you sure you want to delete this sponsor tier?</Typography>
      <FormControl sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
        <Box
          sx={{
            display: 'inline-block',
            minWidth: '50px',
            padding: '4px 8px',
            alignItems: 'center',
            height: '100%',
            background: colorHexCode || 'gray',
            borderRadius: '8px',
            mt: 1.5
          }}
        >
          {name}
        </Box>
      </FormControl>
    </NERModal>
  );
};

export default SponsorTierDeleteModal;
