import React, { useRef, useState } from 'react';
import { Box, Grid } from '@mui/material';
import { Car, ProjectPreview, wbsPipe } from 'shared';
import NERModal from '../../../../../components/NERModal';
import NERAutocomplete from '../../../../../components/NERAutocomplete';
import CopyBOMProjectSection from './CopyBOMProjectSection';

interface CopyBOMViewProps {
  open: boolean;
  onHide: () => void;
  cars: Car[];
  projects: ProjectPreview[];
  onCopy: (materialIds: string[]) => Promise<void>;
}

const CopyBOMView: React.FC<CopyBOMViewProps> = ({ open, onHide, cars, projects, onCopy }) => {
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectPreview | null>(null);
  const [hasSelection, setHasSelection] = useState(false);
  const selectedMaterialIdsRef = useRef<string[]>([]);

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
    await onCopy(selectedMaterialIdsRef.current);
  };

  return (
    <NERModal
      open={open}
      onHide={onHide}
      title="Copy Existing BOM"
      submitText="Copy BOM"
      cancelText="Cancel"
      onSubmit={handleSubmit}
      disabled={!hasSelection}
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

        <Grid item xs={12}>
          {selectedProject ? (
            <CopyBOMProjectSection
              selectedProject={selectedProject}
              onSelectionChange={(ids) => {
                selectedMaterialIdsRef.current = ids;
                setHasSelection(ids.length > 0);
              }}
            />
          ) : (
            <Box
              sx={{
                height: '300px',
                border: '1px dashed',
                borderColor: 'grey.400',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'grey.500'
              }}
            >
              Select a project to view its materials
            </Box>
          )}
        </Grid>
      </Grid>
    </NERModal>
  );
};

export default CopyBOMView;
