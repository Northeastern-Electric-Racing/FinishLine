import { PartPreview, WbsNumber } from 'shared';
import { useCreatePart } from '../../../../../../hooks/part-review.hooks';
import ErrorPage from '../../../../../ErrorPage';
import LoadingIndicator from '../../../../../../components/LoadingIndicator';
import PartFormModal from './PartFormModal';

interface CreatePartModalProps {
  open: boolean;
  handleClose: () => void;
  partsInProject: PartPreview[];
  wbsNum: WbsNumber;
}

const CreatePartModal = ({ open, handleClose, partsInProject, wbsNum }: CreatePartModalProps) => {
  const { isLoading, isError, error, mutateAsync } = useCreatePart();

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return (
    <PartFormModal
      open={open}
      handleClose={handleClose}
      onSubmit={mutateAsync}
      partsInProject={partsInProject}
      wbsNum={wbsNum}
    />
  );
};

export default CreatePartModal;
