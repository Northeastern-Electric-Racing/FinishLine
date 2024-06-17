import { useSetUsefulLinks } from '../../../hooks/projects.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { LinkCreateArgs, LinkType } from 'shared';
import UsefulLinkFormModal from './UsefulLinkFormModal';

interface EditUsefulLinkModalProps {
  open: boolean;
  handleClose: () => void;
  linkType: LinkCreateArgs;
  linkTypes: LinkType[];
}

const EditUsefulLinkModal = ({ open, handleClose, linkType, linkTypes }: EditUsefulLinkModalProps) => {
  const { isLoading, isError, error, mutateAsync } = useSetUsefulLinks();

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return (
    <UsefulLinkFormModal
      open={open}
      handleClose={handleClose}
      onSubmit={mutateAsync}
      defaultValues={linkType}
      linkTypes={linkTypes}
    />
  );
};

export default EditUsefulLinkModal;
