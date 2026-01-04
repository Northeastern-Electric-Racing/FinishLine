import { Typography } from '@mui/material';
import NERModal from '../../../components/NERModal';

interface RulesetDeleteModalProps {
  rulesetName: string;
  onDelete: () => void;
  onHide: () => void;
}

const RulesetDeleteModal: React.FC<RulesetDeleteModalProps> = ({ rulesetName, onDelete, onHide }) => {
  return (
    <NERModal
      open={true}
      onHide={onHide}
      title="Warning!"
      cancelText="Cancel"
      submitText="Delete"
      onSubmit={onDelete}
      formId="ruleset-delete"
    >
      <Typography>Are you sure you want to delete this ruleset?</Typography>
      <Typography sx={{ mt: 1.5, fontWeight: 600 }}>{rulesetName}</Typography>
    </NERModal>
  );
};

export default RulesetDeleteModal;
