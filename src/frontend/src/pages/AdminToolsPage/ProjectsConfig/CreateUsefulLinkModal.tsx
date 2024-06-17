import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { LinkType } from 'shared';
import { useSetUsefulLinks } from '../../../hooks/projects.hooks';
import UsefulLinkFormModal from './UsefulLinkFormModal';

interface CreateUsefulLinkModalProps {
  open: boolean;
  handleClose: () => void;
  linkTypes: LinkType[];
}

const CreateUsefulLinkModal = ({ open, handleClose, linkTypes }: CreateUsefulLinkModalProps) => {
  const { isLoading, isError, error, mutateAsync } = useSetUsefulLinks();

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return <UsefulLinkFormModal open={open} handleClose={handleClose} onSubmit={mutateAsync} linkTypes={linkTypes} />;
};

export default CreateUsefulLinkModal;
