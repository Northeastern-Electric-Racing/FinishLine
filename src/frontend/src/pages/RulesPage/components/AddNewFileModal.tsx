import NERModal from '../../../components/NERModal';

interface AddNewFileModalProps {
  open: boolean;
  onHide: () => void;
  onConfirm: (data: { file: File; name: string; car: string; isActive: boolean }) => Promise<void>;

  isActive?: boolean;
}

const AddNewFileModal: React.FC<AddNewFileModalProps> = ({ open, onHide, onConfirm }) => {
  return (
    <NERModal open={open} onHide={onHide} title="Add New File" hideFormButtons showCloseButton>
      <text> basic modal visualization </text>
    </NERModal>
  );
};

export default AddNewFileModal;
