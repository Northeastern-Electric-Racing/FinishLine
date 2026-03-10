import NERModal from '../../../../../components/NERModal';
import { useCopyMaterialsToProject } from '../../../../../hooks/bom.hooks';

export interface BOMCopyConfirmModalProps {
  open: boolean;
  onHide: () => void;
  onSuccess: () => void;
  materialIds: string[];
  sourceProjectName: string;
  currentProjectName: string;
  destinationWbsNum: string;
}

const BOMCopyConfirmModal = ({
  open,
  onHide,
  onSuccess,
  materialIds,
  sourceProjectName,
  currentProjectName,
  destinationWbsNum
}: BOMCopyConfirmModalProps) => {
  const copyMaterials = useCopyMaterialsToProject();

  const handleConfirm = () => {
    copyMaterials.mutate(
      {
        materialIds,
        destinationWbsNum
      },
      {
        onSuccess: () => {
          onSuccess();
          onHide();
        }
      }
    );
  };

  const message = `Are you sure you want to copy ${materialIds.length} materials from ${sourceProjectName} to ${currentProjectName}?`;
  return (
    <NERModal open={open} onHide={onHide} onSubmit={handleConfirm} title="Confirm Copy">
      <p>{message}</p>
    </NERModal>
  );
};

export default BOMCopyConfirmModal;
