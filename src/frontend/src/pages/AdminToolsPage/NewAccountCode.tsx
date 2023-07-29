import NewAccountCodeView from './NewAccountCodeView';

interface NewAccountCodeProps {
  showModal: boolean;
  handleClose: () => void;
}

const NewAccountCode: React.FC<NewAccountCodeProps> = ({ showModal, handleClose }: NewAccountCodeProps) => {
  const handleSubmit = async () => {
    handleClose();
  };

  return <NewAccountCodeView showModal onHide={handleClose} onSubmit={handleSubmit} />;
};

export default NewAccountCode;
