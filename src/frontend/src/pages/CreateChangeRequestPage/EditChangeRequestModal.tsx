import { FormInput } from './CreateChangeRequest';
import NERModal from '../../components/NERModal';
import EditChangeRequestsView from './EditChangeRequestsView';
import { Control, FormState, UseFormHandleSubmit, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { FormInput as ChangeRequestFormInput } from './CreateChangeRequest';

interface EditChangeRequestModalProps {
  onConfirm: (data: FormInput) => Promise<void>;
  onHide: () => void;
  wbsNum: string;
  open: boolean;
  changeRequestFormReturn: ChangeRequestFormReturn;
}

export interface ChangeRequestFormReturn {
  register: UseFormRegister<ChangeRequestFormInput>;
  handleSubmit: UseFormHandleSubmit<ChangeRequestFormInput, ChangeRequestFormInput>;
  control: Control<ChangeRequestFormInput, any, ChangeRequestFormInput>;
  watch: UseFormWatch<ChangeRequestFormInput>;
  formState: FormState<ChangeRequestFormInput>;
  setValue: UseFormSetValue<ChangeRequestFormInput>;
}

const EditChangeRequestModal: React.FC<EditChangeRequestModalProps> = ({
  onConfirm,
  onHide,
  wbsNum,
  open,
  changeRequestFormReturn
}) => {
  return (
    <>
      <NERModal open={open} onHide={onHide} title="" hideFormButtons showCloseButton>
        <EditChangeRequestsView
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
    </>
  );
};

export default EditChangeRequestModal;
