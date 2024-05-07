import { FormInput } from './CreateChangeRequest';
import CreateChangeRequestsView from './CreateChangeRequestView';
import NERModal from '../../components/NERModal';

interface CreateChangeRequestModalProps {
  onConfirm: (data: FormInput) => Promise<void>;
  onHide: () => void;
  wbsNum: string;
  open: boolean;
}

const CreateChangeRequestModal: React.FC<CreateChangeRequestModalProps> = ({ onConfirm, onHide, wbsNum, open }) => {
  return (
    <NERModal open={open} onHide={onHide} title="" hideFormButtons showCloseButton>
      <CreateChangeRequestsView
        wbsNum={wbsNum}
        setWbsNum={() => {}}
        crDesc={''}
        onSubmit={onConfirm}
        proposedSolutions={[]}
        setProposedSolutions={() => {}}
        modalView
        handleCancel={onHide}
      />
    </NERModal>
  );
};

export default CreateChangeRequestModal;
