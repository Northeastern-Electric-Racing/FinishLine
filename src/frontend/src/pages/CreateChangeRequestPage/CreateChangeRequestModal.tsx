import { FormInput } from './CreateChangeRequestView';
import CreateChangeRequestsView from './CreateChangeRequestView';
import NERModal from '../../components/NERModal';
import { ChangeRequestFormReturn } from './CreateChangeRequestView';

interface CreateChangeRequestModalProps {
  onConfirm: (data: FormInput) => Promise<void>;
  onHide: () => void;
  wbsNum: string;
  open: boolean;
  changeRequestFormReturn: ChangeRequestFormReturn;
}

const CreateChangeRequestModal: React.FC<CreateChangeRequestModalProps> = ({
  onConfirm,
  onHide,
  wbsNum,
  open,
  changeRequestFormReturn
}) => {
  return (
    <NERModal open={open} onHide={onHide} title="" hideFormButtons showCloseButton>
      <CreateChangeRequestsView
        wbsNum={wbsNum}
        setWbsNum={() => {}}
        onSubmit={onConfirm}
        proposedSolutions={[]}
        setProposedSolutions={() => {}}
        modalView
        handleCancel={onHide}
        changeRequestFormReturn={changeRequestFormReturn}
      />
    </NERModal>
  );
};

export default CreateChangeRequestModal;
