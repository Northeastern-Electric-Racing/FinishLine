import { Material, WbsElement } from 'shared';
import LoadingIndicator from '../../../../../components/LoadingIndicator';
import { useEditMaterial } from '../../../../../hooks/bom.hooks';
import { useToast } from '../../../../../hooks/toasts.hooks';
import ErrorPage from '../../../../ErrorPage';
import MaterialForm, { MaterialDataSubmission } from './MaterialForm';
import React from 'react';

export interface EditMaterialModalProps {
  open: boolean;
  onHide: () => void;
  material: Material;
  wbsElement: WbsElement;
}

const EditMaterialModal: React.FC<EditMaterialModalProps> = ({ open, onHide, material, wbsElement }) => {
  const { mutateAsync: editMaterial, isLoading, isError, error } = useEditMaterial(material.materialId);
  const toast = useToast();

  if (isLoading) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

  const onSubmit = async (data: MaterialDataSubmission): Promise<void> => {
    try {
      await editMaterial(data);
      toast.success('Material edited successfully');
      onHide();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <MaterialForm
      submitText="Edit"
      onSubmit={onSubmit}
      defaultValues={{ ...material, pdmFileName: material.pdmFileName, price: material.price / 100 }}
      wbsElement={wbsElement}
      onHide={onHide}
      open={open}
    />
  );
};

export default EditMaterialModal;
