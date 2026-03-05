import { WbsElementPreview } from 'shared';
import MaterialForm, { MaterialDataSubmission } from './MaterialForm';
import LoadingIndicator from '../../../../../components/LoadingIndicator';
import { useToast } from '../../../../../hooks/toasts.hooks';
import { useCreateMaterial, useGetAssembliesForWbsElement } from '../../../../../hooks/bom.hooks';
import ErrorPage from '../../../../ErrorPage';

export interface CreateMaterialModalProps {
  open: boolean;
  onHide: () => void;
  wbsElement: WbsElementPreview;
  onSuccess?: (materialName: string) => void;
  fromRRForm?: boolean;
}

const CreateMaterialModal: React.FC<CreateMaterialModalProps> = ({
  open,
  onHide,
  wbsElement,
  onSuccess,
  fromRRForm = false
}) => {
  const { mutateAsync: createMaterial, isLoading, isError, error } = useCreateMaterial(wbsElement.wbsNum);
  const { data: assemblies, isLoading: assembliesLoading } = useGetAssembliesForWbsElement(wbsElement.wbsNum);
  const toast = useToast();

  if (isLoading) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

  const onSubmit = async (data: MaterialDataSubmission): Promise<void> => {
    try {
      await createMaterial(data);
      toast.success('Material Created Successfully');

      if (onSuccess) {
        onSuccess(data.name);
      }

      onHide();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <MaterialForm
      submitText="Add"
      onSubmit={onSubmit}
      assemblies={assemblies ?? []}
      assembliesLoading={assembliesLoading}
      onHide={onHide}
      open={open}
      fromRRForm={fromRRForm}
    />
  );
};

export default CreateMaterialModal;
