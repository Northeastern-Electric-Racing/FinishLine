import React, { useState } from 'react';
import { Grid } from '@mui/material';
import { Car, ProjectPreview, wbsPipe } from 'shared';
import NERModal from '../../../../../components/NERModal';
import NERAutocomplete from '../../../../../components/NERAutocomplete';
import CopyBOMProjectSection from './CopyBOMProjectSection';

interface CopyBOMViewProps {
  open: boolean;
  onHide: () => void;
  cars: Car[];
  projects: ProjectPreview[];
  selectedProject: ProjectPreview | null;
  setSelectedProject: (project: ProjectPreview | null) => void;
  onCopy: (materialIds: string[]) => Promise<void>;
}

const CopyBOMView: React.FC<CopyBOMViewProps> = ({
  open,
  onHide,
  cars,
  projects,
  selectedProject,
  setSelectedProject,
  onCopy
}) => {
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<string[]>([]);

  const carOptions = cars.map((car) => ({
    label: `${car.wbsNum.carNumber} - ${car.name}`,
    id: car.id
  }));

  const filteredProjects = selectedCar
    ? projects.filter((p) => p.wbsNum.carNumber === selectedCar.wbsNum.carNumber)
    : projects;

  const projectOptions = filteredProjects.map((p) => ({
    label: `${wbsPipe(p.wbsNum)} - ${p.name}`,
    id: wbsPipe(p.wbsNum)
  }));

  const handleSubmit = async () => {
    await onCopy(selectedMaterialIds);
  };

  return (
    <NERModal
      open={open}
      onHide={onHide}
      title="Copy Existing BOM"
      submitText="Copy BOM"
      cancelText="Cancel"
      onSubmit={handleSubmit}
      disabled={selectedMaterialIds.length === 0}
      showCloseButton
      paperProps={{ minWidth: '700px' }}
    >
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <NERAutocomplete
            id="car-autocomplete"
            options={carOptions}
            onChange={(_event, newValue) => {
              const car = newValue ? (cars.find((c) => c.id === newValue.id) ?? null) : null;
              setSelectedCar(car);
              setSelectedProject(null);
            }}
            value={
              selectedCar ? { label: `${selectedCar.wbsNum.carNumber} - ${selectedCar.name}`, id: selectedCar.id } : null
            }
            placeholder="Select Car"
            size="medium"
          />
        </Grid>
        <Grid item xs={6}>
          <NERAutocomplete
            id="project-autocomplete"
            options={projectOptions}
            onChange={(_event, newValue) => {
              const project = newValue ? (filteredProjects.find((p) => wbsPipe(p.wbsNum) === newValue.id) ?? null) : null;
              setSelectedProject(project);
            }}
            value={
              selectedProject
                ? {
                    label: `${wbsPipe(selectedProject.wbsNum)} - ${selectedProject.name}`,
                    id: wbsPipe(selectedProject.wbsNum)
                  }
                : null
            }
            placeholder="Select Project"
            size="medium"
            disabled={!selectedCar}
          />
        </Grid>

        {selectedProject && (
          <Grid item xs={12}>
            <CopyBOMProjectSection
              selectedProject={selectedProject}
              onSelectionChange={setSelectedMaterialIds}
            />
          </Grid>
        )}
      </Grid>
    </NERModal>
  );
};

export default CopyBOMView;
