import { Typography } from '@mui/material';
import NERModal from '../../../components/NERModal';
import { Part } from 'shared';

interface PartTagErrorModalProps {
  name: string;
  partCount: number;
  onHide: () => void;
}

const PartTagErrorModal: React.FC<PartTagErrorModalProps> = ({ name, partCount, onHide }: PartTagErrorModalProps) => {
  return (
    <NERModal open={true} onHide={onHide} title="Warning!" cancelText="Exit">
      <Typography>You cannot delete {name} because it is still in use by ..... </Typography>
      <Typography> {partCount} </Typography>
    </NERModal>
  );
};

export default PartTagErrorModal;
