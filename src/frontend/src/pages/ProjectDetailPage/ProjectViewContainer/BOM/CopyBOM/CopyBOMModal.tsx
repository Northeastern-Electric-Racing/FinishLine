import { WbsNumber, wbsPipe } from 'shared';
import CopyBOMView from './CopyBOMView';
import { useGetAllCars } from '../../../../../hooks/cars.hooks';
import { useAllProjects } from '../../../../../hooks/projects.hooks';
import { useCopyMaterialsToProject } from '../../../../../hooks/bom.hooks';
import React from 'react';
import ErrorPage from '../../../../ErrorPage';
import LoadingIndicator from '../../../../../components/LoadingIndicator';

export interface CopyBOMModalProps {
  open: boolean;
  onHide: () => void;
  destinationWbsNum: WbsNumber;
}

const CopyBOMModal: React.FC<CopyBOMModalProps> = ({ open, onHide, destinationWbsNum }) => {
  const { data: cars, isLoading: isLoadingCars, isError: carsIsError, error: carsError } = useGetAllCars();
  const { data: projects, isLoading: isLoadingProjects, isError: projectsIsError, error: projectsError } = useAllProjects();
  const { mutateAsync: copyMaterials } = useCopyMaterialsToProject();

  if (isLoadingCars || !cars || isLoadingProjects || !projects) return <LoadingIndicator />;
  if (carsIsError) return <ErrorPage message={carsError?.message} />;
  if (projectsIsError) return <ErrorPage message={projectsError?.message} />;

  const handleCopy = async (materialIds: string[]) => {
    await copyMaterials({
      materialIds,
      destinationWbsNum: wbsPipe(destinationWbsNum)
    });
    onHide();
  };

  return (
    <CopyBOMView
      open={open}
      onHide={onHide}
      cars={cars}
      projects={projects}
      onCopy={handleCopy}
    />
  );
};

export default CopyBOMModal;
