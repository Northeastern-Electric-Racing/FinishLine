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
  isOnGuestHomePage?: boolean;
  isOnNewMemberDashboard?: boolean;
  isOnOnboardingDashboard?: boolean;
}

const EditUsefulLinkModal = ({
  open,
  handleClose,
  linkType,
  linkTypes,
  currentLinks,
  isOnGuestHomePage,
  isOnNewMemberDashboard,
  isOnOnboardingDashboard
}: EditUsefulLinkModalProps) => {
  const { isLoading, isError, error, mutateAsync } = useSetUsefulLinks();

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return (
    <UsefulLinkFormModal
      open={open}
      handleClose={handleClose}
      onSubmit={mutateAsync}
      defaulValues={linkType}
      linkTypes={linkTypes}
      currentLinks={currentLinks}
      isOnGuestHomePage={isOnGuestHomePage}
      isOnNewMemberDashboard={isOnNewMemberDashboard}
      isOnOnboardingDashboard={isOnOnboardingDashboard}
    />
  );
};

export default EditUsefulLinkModal;
