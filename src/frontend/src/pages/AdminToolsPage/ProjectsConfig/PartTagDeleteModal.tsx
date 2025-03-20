import { FormControl, Typography } from '@mui/material';
import NERModal from '../../../components/NERModal';
import { Box } from '@mui/system';
import { Box } from '@mui/system';

interface PartTagDeleteModalProps {
  name: string;
  colorHexCode: string;
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
const PartTagDeleteModal: React.FC<PartTagDeleteModalProps> = ({
  name,
  colorHexCode,
  onDelete,
  onHide
}: PartTagDeleteModalProps) => {
  return (
    <NERModal
      open={true}
      onHide={onHide}
      title="Warning!"
      cancelText="Cancel"
      submitText="Delete"
      onSubmit={onDelete}
      formId="part-tag-delete"
      showCloseButton
    >
      <Typography>Are you sure you want to delete this part tag?</Typography>
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

export default PartTagDeleteModal;
