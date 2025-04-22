import { WbsElement } from 'shared';
import LoadingIndicator from '../../../../../components/LoadingIndicator';
import { useToast } from '../../../../../hooks/toasts.hooks';
import ErrorPage from '../../../../ErrorPage';
import { useCreateAssembly } from '../../../../../hooks/bom.hooks';
import { PartFormInput } from './PartForm';
import PartFormView from './PartFormView';

export interface CreatePartModalProps {
  open: boolean;
  onHide: () => void;
  wbsElement: WbsElement;
}

const CreatePartModal: React.FC<CreatePartModalProps> = ({ open, onHide, wbsElement }) => {
  const { mutateAsync: createAssembly, isLoading, isError, error } = useCreateAssembly(wbsElement.wbsNum);
  const toast = useToast();

  if (isLoading) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

  const onSubmit = async (data: PartFormInput): Promise<void> => {
    try {
      await createAssembly(data);
      toast.success('Part Created Successfully');
      onHide();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  return <PartFormView submitText="Add" onSubmit={onSubmit} onHide={onHide} open={open} />;
};

export default CreatePartModal;
