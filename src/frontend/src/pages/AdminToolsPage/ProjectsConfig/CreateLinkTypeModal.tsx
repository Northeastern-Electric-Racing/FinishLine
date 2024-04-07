import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import LinkTypeFormModal from './LinkTypeFormModal';
import { LinkType } from 'shared';
import { useCreateLinkType } from '../../../hooks/projects.hooks';

interface CreateLinkTypeModalProps {
  showModal: boolean;
  handleClose: () => void;
  linkTypes: LinkType[];
}

const CreateLinkTypeModal = ({ showModal, handleClose, linkTypes }: CreateLinkTypeModalProps) => {
  const { isLoading, isError, error, mutateAsync } = useCreateLinkType();

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return (
    <LinkTypeFormModal
      showModal={showModal}
      handleClose={handleClose}
      onSubmit={mutateAsync}
      linkTypes={linkTypes}
      creatingNew={true}
    />
  );
};

export default CreateLinkTypeModal;
