import { WbsElement } from 'shared';
import LoadingIndicator from '../../../../../components/LoadingIndicator';
import { useToast } from '../../../../../hooks/toasts.hooks';
import ErrorPage from '../../../../ErrorPage';
import AssemblyForm, { AssemblyFormInput } from './AssemblyForm';
import { useCreateAssembly } from '../../../../../hooks/bom.hooks';

export interface CreateAssemblyModalProps {
  open: boolean;
  onHide: () => void;
  wbsElement: WbsElement;
}

const CreateAssemblyModal: React.FC<CreateAssemblyModalProps> = ({ open, onHide, wbsElement }) => {
  const { mutateAsync: createAssembly, isLoading, isError, error } = useCreateAssembly(wbsElement.wbsNum);
  const toast = useToast();

  if (isLoading) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

  const onSubmit = async (data: AssemblyFormInput): Promise<void> => {
    try {
      await createAssembly(data);
      toast.success('Assembly Created Successfully');
      onHide();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  return <AssemblyForm submitText="Add" onSubmit={onSubmit} wbsElement={wbsElement} onHide={onHide} open={open} />;
};

export default CreateAssemblyModal;
