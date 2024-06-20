import { useSetUsefulLinks } from '../../../../hooks/projects.hooks';
import ErrorPage from '../../../ErrorPage';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import { Link, LinkType } from 'shared';
import UsefulLinkFormModal from './UsefulLinkFormModal';

interface EditUsefulLinkModalProps {
  open: boolean;
  handleClose: () => void;
  linkType: Link;
  linkTypes: LinkType[];
  currentLinks: Link[];
}

const EditUsefulLinkModal = ({ open, handleClose, linkType, linkTypes, currentLinks }: EditUsefulLinkModalProps) => {
  const { isLoading, isError, error, mutateAsync } = useSetUsefulLinks();

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return (
    <UsefulLinkFormModal
      open={open}
      handleClose={handleClose}
      onSubmit={mutateAsync}
      clickedLink={linkType}
      linkTypes={linkTypes}
      currentLinks={currentLinks}
    />
  );
};

export default EditUsefulLinkModal;
