import { Typography } from '@mui/material';
import NERModal from '../../../components/NERModal';

interface ManufacturerDeleteModalProps {
  name: string;
  onDelete: () => void;
  onHide: () => void;
}

const ManufacturerDeleteModal: React.FC<ManufacturerDeleteModalProps> = ({
  name,
  onDelete,
  onHide
}: ManufacturerDeleteModalProps) => {
  return (
    <>
      <NERModal open={true} onHide={onHide} title="Warning!" cancelText="Cancel" submitText="Delete" onSubmit={onDelete}>
        <Typography>Are you sure you want to delete this manufacturer: {name}</Typography>
      </NERModal>
    </>
  );
};

export default ManufacturerDeleteModal;
