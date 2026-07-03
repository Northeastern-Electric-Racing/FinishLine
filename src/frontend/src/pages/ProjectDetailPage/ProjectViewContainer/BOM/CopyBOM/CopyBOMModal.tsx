import { WbsNumber, wbsPipe } from 'shared';
import CopyBOMView from './CopyBOMView';
import { useGetAllCars } from '../../../../../hooks/cars.hooks';
import { useAllProjectsCopyBOM } from '../../../../../hooks/projects.hooks';
import React, { useState } from 'react';
import ErrorPage from '../../../../ErrorPage';
import LoadingIndicator from '../../../../../components/LoadingIndicator';
import BOMCopyConfirmModal from './BOMCopyConfirmModal';

export interface CopyBOMModalProps {
  open: boolean;
  onHide: () => void;
  destinationWbsNum: WbsNumber;
  currentProjectName: string;
}

const CopyBOMModal: React.FC<CopyBOMModalProps> = ({ open, onHide, destinationWbsNum, currentProjectName }) => {
  const { data: cars, isLoading: isLoadingCars, isError: carsIsError, error: carsError } = useGetAllCars();
  const {
    data: projects,
    isLoading: isLoadingProjects,
    isError: projectsIsError,
    error: projectsError
  } = useAllProjectsCopyBOM();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmedMaterialIds, setConfirmedMaterialIds] = useState<string[]>([]);
  const [confirmedSourceProjectName, setConfirmedSourceProjectName] = useState('');

  if (carsIsError) return <ErrorPage message={carsError?.message} />;
  if (projectsIsError) return <ErrorPage message={projectsError?.message} />;
  if (isLoadingCars || !cars || isLoadingProjects || !projects) return <LoadingIndicator />;

  const destinationWbs = wbsPipe(destinationWbsNum);

  return (
    <>
      <CopyBOMView
        open={open}
        onHide={onHide}
        cars={cars}
        projects={projects}
        onCopy={(materialIds, sourceProjectName) => {
          setConfirmedMaterialIds(materialIds);
          setConfirmedSourceProjectName(sourceProjectName);
          setConfirmOpen(true);
        }}
      />
      <BOMCopyConfirmModal
        open={confirmOpen}
        onHide={() => setConfirmOpen(false)}
        onSuccess={() => {
          onHide();
          setConfirmOpen(false);
        }}
        materialIds={confirmedMaterialIds}
        sourceProjectName={confirmedSourceProjectName}
        currentProjectName={`${wbsPipe(destinationWbsNum)} - ${currentProjectName}`}
        destinationWbsNum={destinationWbs}
      />
    </>
  );
};

export default CopyBOMModal;
