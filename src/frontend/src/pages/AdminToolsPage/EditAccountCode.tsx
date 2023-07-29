import { ExpenseType } from 'shared';
import EditAccountCodeView from './EditAccountCodeView';

interface EditAccountCodeProps {
  showModal: boolean;
  handleClose: () => void;
  accountCode: ExpenseType;
}

const EditAccountCode: React.FC<EditAccountCodeProps> = ({ showModal, handleClose, accountCode }: EditAccountCodeProps) => {
  const handleSubmit = async () => {
    handleClose();
  };

  return (
    <EditAccountCodeView showModal={showModal} onHide={handleClose} onSubmit={handleSubmit} accountCode={accountCode} />
  );
};

export default EditAccountCode;
