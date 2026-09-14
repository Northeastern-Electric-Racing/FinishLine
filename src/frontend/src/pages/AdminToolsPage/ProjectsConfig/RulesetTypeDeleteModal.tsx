import { Typography } from '@mui/material';
import NERModal from '../../../components/NERModal';

interface RulesetTypeDeleteModalProps {
  rulesetTypeName: string;
  onDelete: () => void;
  onHide: () => void;
}

const RulesetTypeDeleteModal: React.FC<RulesetTypeDeleteModalProps> = ({ rulesetTypeName, onDelete, onHide }) => {
  return (
    <NERModal
      open={true}
      onHide={onHide}
      title="Warning!"
      cancelText="Cancel"
      submitText="Delete"
      onSubmit={onDelete}
      formId="ruleset-type-delete"
    >
      <Typography>Are you sure you want to delete this ruleset type?</Typography>
      <Typography sx={{ mt: 1.5, fontWeight: 600 }}>{rulesetTypeName}</Typography>
    </NERModal>
  );
};

export default RulesetTypeDeleteModal;
