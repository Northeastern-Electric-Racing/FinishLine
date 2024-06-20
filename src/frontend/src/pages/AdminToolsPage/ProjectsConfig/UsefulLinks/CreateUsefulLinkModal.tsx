import ErrorPage from '../../../ErrorPage';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import { LinkCreateArgs, LinkType } from 'shared';
import { useSetUsefulLinks } from '../../../../hooks/projects.hooks';
import UsefulLinkFormModal from './UsefulLinkFormModal';

interface CreateUsefulLinkModalProps {
  open: boolean;
  handleClose: () => void;
  linkTypes: LinkType[];
  currentLinks: LinkCreateArgs[];
}

const CreateUsefulLinkModal = ({ open, handleClose, linkTypes, currentLinks }: CreateUsefulLinkModalProps) => {
  const { isLoading, isError, error, mutateAsync } = useSetUsefulLinks();

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return (
    <UsefulLinkFormModal
      open={open}
      handleClose={handleClose}
      onSubmit={mutateAsync}
      linkTypes={linkTypes}
      currentLinks={currentLinks}
    />
  );
};

export default CreateUsefulLinkModal;
