import IndexCodeFormModal from './IndexCodeFormModal';
import { useEditIndexCode } from '../../../hooks/finance.hooks';
import { IndexCode } from 'shared';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';

interface EditIndexCodeModalProps {
  showModal: boolean;
  handleClose: () => void;
  indexCode: IndexCode;
}

const EditIndexCodeModal: React.FC<EditIndexCodeModalProps> = ({ showModal, handleClose, indexCode }) => {
  const { isLoading, isError, error, mutateAsync } = useEditIndexCode(indexCode.indexCodeId);

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return (
    <IndexCodeFormModal
      defaultValues={indexCode}
      showModal={showModal}
      handleClose={handleClose}
      mutateAsync={mutateAsync}
    />
  );
};

export default EditIndexCodeModal;
