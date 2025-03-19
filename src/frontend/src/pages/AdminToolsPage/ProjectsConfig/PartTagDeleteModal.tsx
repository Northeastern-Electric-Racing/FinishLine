import { Typography } from '@mui/material';
import NERModal from '../../../components/NERModal';
import { Box } from '@mui/system';

interface PartTagDeleteModalProps {
  name: string;
  colorHexCode: string;
  onDelete: () => void;
  onHide: () => void;
}

const PartTagDeleteModal: React.FC<PartTagDeleteModalProps> = ({
  name,
  colorHexCode,
  onDelete,
  onHide
}: PartTagDeleteModalProps) => {
  return (
    <NERModal open={true} onHide={onHide} title="Warning!" cancelText="Cancel" submitText="Delete" onSubmit={onDelete}>
      <Typography>Are you sure you want to delete this part tag:</Typography>
      {
        <Box
          sx={{
            display: 'inline-block',
            padding: '4px 8px',
            alignItems: 'center',
            height: '100%',
            background: colorHexCode,
            borderRadius: '8px',
            mt: 1
          }}
        >
          {name}
        </Box>
      }
    </NERModal>
  );
};

export default PartTagDeleteModal;
