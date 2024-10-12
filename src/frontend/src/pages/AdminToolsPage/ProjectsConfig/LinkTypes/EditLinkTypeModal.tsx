import { useEditLinkType } from '../../../../hooks/projects.hooks';
import ErrorPage from '../../../ErrorPage';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import LinkTypeFormModal from './LinkTypeFormModal';
import { LinkType } from 'shared';

interface EditLinkTypeModalProps {
  open: boolean;
  handleClose: () => void;
  linkType: LinkType;
  linkTypes: LinkType[];
}

const EditLinkTypeModal = ({ open, handleClose, linkType, linkTypes }: EditLinkTypeModalProps) => {
  const { isLoading, isError, error, mutateAsync } = useEditLinkType(linkType.name);

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return (
    <LinkTypeFormModal
      open={open}
      handleClose={handleClose}
      onSubmit={mutateAsync}
      defaultValues={linkType}
      linkTypes={linkTypes}
    />
  );
};

export default EditLinkTypeModal;
