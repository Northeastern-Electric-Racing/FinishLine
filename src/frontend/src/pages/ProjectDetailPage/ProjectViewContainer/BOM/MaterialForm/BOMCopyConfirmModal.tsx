import { Console } from 'console';
import NERModal from '../../../../../components/NERModal';

export interface BOMCopyConfirmModalProps {
  open: boolean;
  onHide: () => void;
  onSuccess?: () => void;
}

const BOMCopyConfirmModal = ({ open, onHide, onSuccess }: BOMCopyConfirmModalProps) => {
  // TODO: make the actual message
  return (
    <NERModal open={open} onHide={onHide} onSubmit={onSuccess} title="Confirm Copy">
      Are you sure you want to copy [X] materials from [Source Project Name] to [Current Project Name]?
    </NERModal>
  );
};

export default BOMCopyConfirmModal;
