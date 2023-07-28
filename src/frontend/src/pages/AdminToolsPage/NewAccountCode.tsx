import NewAccountCodeView from './NewAccountCodeView';

interface NewAccountCodeProps {
  showModal: boolean;
  handleClose: () => void;
}

const handleSubmit = async () => {};

const NewAccountCode: React.FC<NewAccountCodeProps> = ({ showModal, handleClose }: NewAccountCodeProps) => {
  return <NewAccountCodeView showModal onHide={handleClose} onSubmit={handleSubmit} />;
};

export default NewAccountCode;
