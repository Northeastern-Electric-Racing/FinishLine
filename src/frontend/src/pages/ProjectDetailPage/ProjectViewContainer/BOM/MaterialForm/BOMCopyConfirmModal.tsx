import NERModal from '../../../../../components/NERModal';

export interface BOMCopyConfirmModalProps {
  open: boolean;
  onHide: () => void;
  onSuccess?: () => void;
  materialsCount: number;
  sourceProjectName: string;
  currentProjectName: string;
}

const BOMCopyConfirmModal = ({
  open,
  onHide,
  onSuccess,
  materialsCount,
  sourceProjectName,
  currentProjectName
}: BOMCopyConfirmModalProps) => {
  const message = `Are you sure you want to copy ${materialsCount} materials from ${sourceProjectName} to ${currentProjectName}?`;
  return (
    <NERModal open={open} onHide={onHide} onSubmit={onSuccess} title="Confirm Copy">
      <p>{message}</p>
    </NERModal>
  );
};

export default BOMCopyConfirmModal;
