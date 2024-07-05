import ErrorPage from '../../../ErrorPage';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import { DescriptionBulletType } from 'shared';
import DescriptionBulletTypeFormModal from './DescriptionBulletTypeFormModal';
import { useEditDescriptionBulletType } from '../../../../hooks/description-bullets.hooks';

interface EditdescriptionBulletTypeModalProps {
  open: boolean;
  handleClose: () => void;
  descriptionBulletType: DescriptionBulletType;
  descriptionBulletTypes: DescriptionBulletType[];
}

const EditDescriptionBulletTypeModal = ({
  open,
  handleClose,
  descriptionBulletType,
  descriptionBulletTypes
}: EditdescriptionBulletTypeModalProps) => {
  const { isLoading, isError, error, mutateAsync } = useEditDescriptionBulletType();

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return (
    <DescriptionBulletTypeFormModal
      open={open}
      handleClose={handleClose}
      onSubmit={mutateAsync}
      defaultValues={descriptionBulletType}
      descriptionBulletTypes={descriptionBulletTypes}
    />
  );
};

export default EditDescriptionBulletTypeModal;
