import { Typography } from '@mui/material';
import NERModal from '../../../components/NERModal';

interface PartTagDeleteModalProps {
  name: string;
  onDelete: () => void;
  onHide: () => void;
}

const PartTagDeleteModal: React.FC<PartTagDeleteModalProps> = ({ name, onDelete, onHide }: PartTagDeleteModalProps) => {
  return (
    <NERModal open={true} onHide={onHide} title="Warning!" cancelText="Cancel" submitText="Delete" onSubmit={onDelete}>
      <Typography>Are you sure you want to delete this part tag: {name}</Typography>
    </NERModal>
  );
};

export default PartTagDeleteModal;
