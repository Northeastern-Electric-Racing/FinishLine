import { useEditLinkType } from '../../../hooks/projects.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import LinkTypeFormModal from './LinkTypeFormModal';
import { LinkType } from 'shared';

interface EditLinkTypeModalProps {
  showModal: boolean;
  handleClose: () => void;
  linkType: LinkType;
  linkTypes: LinkType[];
}

const EditLinkTypeModal = ({ showModal, handleClose, linkType, linkTypes }: EditLinkTypeModalProps) => {
  const { isLoading, isError, error, mutateAsync } = useEditLinkType(linkType.name);

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return (
    <LinkTypeFormModal
      showModal={showModal}
      handleClose={handleClose}
      onSubmit={mutateAsync}
      defaultValues={linkType}
      linkTypes={linkTypes}
      creatingNew={false}
    />
  );
};

export default EditLinkTypeModal;
