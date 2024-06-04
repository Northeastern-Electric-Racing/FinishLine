import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { DescriptionBulletType } from 'shared';
import DescriptionBulletTypeFormModal from './DescriptionBulletTypeFormModal';
import { useCreateDescriptionBulletType } from '../../../hooks/description-bullets.hooks';

interface CreateDescriptionBulletTypeModalProps {
  open: boolean;
  handleClose: () => void;
  descriptionBulletTypes: DescriptionBulletType[];
}

const CreateDescriptionBulletTypeModal = ({
  open,
  handleClose,
  descriptionBulletTypes
}: CreateDescriptionBulletTypeModalProps) => {
  const { isLoading, isError, error, mutateAsync } = useCreateDescriptionBulletType();

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return (
    <DescriptionBulletTypeFormModal
      open={open}
      handleClose={handleClose}
      onSubmit={mutateAsync}
      descriptionBulletTypes={descriptionBulletTypes}
    />
  );
};

export default CreateDescriptionBulletTypeModal;
