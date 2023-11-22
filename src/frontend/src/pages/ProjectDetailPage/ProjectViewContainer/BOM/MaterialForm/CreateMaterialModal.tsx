import { WbsElement } from 'shared';
import MaterialForm, { MaterialFormInput } from './MaterialForm';
import LoadingIndicator from '../../../../../components/LoadingIndicator';
import { useToast } from '../../../../../hooks/toasts.hooks';
import { useCreateMaterial } from '../../../../../hooks/bom.hooks';
import ErrorPage from '../../../../ErrorPage';

export interface CreateMaterialModalProps {
  open: boolean;
  onHide: () => void;
  wbsElement: WbsElement;
}

const CreateMaterialModal: React.FC<CreateMaterialModalProps> = ({ open, onHide, wbsElement }) => {
  const { mutateAsync: createMaterial, isLoading, isError, error } = useCreateMaterial(wbsElement.wbsNum);
  const toast = useToast();

  if (isLoading) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

  const onSubmit = async (data: MaterialFormInput): Promise<void> => {
    try {
      await createMaterial(data);
      toast.success('Material Created Successfully');
      onHide();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  return <MaterialForm submitText="Add" onSubmit={onSubmit} wbsElement={wbsElement} onHide={onHide} open={open} />;
};

export default CreateMaterialModal;
