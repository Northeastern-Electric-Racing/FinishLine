import React, { useCallback, useMemo, useState } from 'react';
import { Autocomplete, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useForm } from 'react-hook-form';
import { Assembly, Car, Material, ProjectPreview, WbsNumber } from 'shared';

import NERFormModal from '../../../../../components/NERFormModal';
import NERAutocomplete from '../../../../../components/NERAutocomplete';
import LoadingIndicator from '../../../../../components/LoadingIndicator';
import ErrorPage from '../../../../ErrorPage';

import { useGetAllCars } from '../../../../../hooks/cars.hooks';
import { useAllProjects } from '../../../../../hooks/projects.hooks';
import { useGetMaterialsForWbsElement, useGetMaterialsForCar } from '../../../../../hooks/bom.hooks';

type AutocompleteOption = { label: string; id: string };

interface SelectMaterialToCopyModalProps {
  open: boolean;
  onHide: () => void;
  onSelect: (material: Material) => void;
  assemblies: Assembly[];
}

type FormValues = Record<string, never>;

const carToOption = (car: Car): AutocompleteOption => ({
  label: `Car ${car.wbsNum.carNumber} - ${car.name}`,
  id: car.wbsElementId
});

const projectToOption = (project: ProjectPreview): AutocompleteOption => ({
  label: `${project.wbsNum.carNumber}.${project.wbsNum.projectNumber} - ${project.name}`,
  id: project.wbsElementId
});

const projectToWbsNumber = (project: ProjectPreview): WbsNumber => ({
  carNumber: project.wbsNum.carNumber,
  projectNumber: project.wbsNum.projectNumber,
  workPackageNumber: 0
});

const getLatestCar = (cars: Car[]): Car | null => {
  if (cars.length === 0) return null;
  return [...cars].sort((a, b) => b.wbsNum.carNumber - a.wbsNum.carNumber)[0];
};

const SelectMaterialToCopyModal: React.FC<SelectMaterialToCopyModalProps> = ({ open, onHide, onSelect, assemblies }) => {
  const { reset, handleSubmit } = useForm<FormValues>();

  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectPreview | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  const { data: cars, isLoading: carsIsLoading, isError: carsIsError, error: carsError } = useGetAllCars();

  const { data: projects, isLoading: projectsIsLoading, isError: projectsIsError, error: projectsError } = useAllProjects();

  const allCars = useMemo(() => cars ?? [], [cars]);
  const allProjects = useMemo(() => projects ?? [], [projects]);

  const latestCar = useMemo(() => getLatestCar(allCars), [allCars]);
  const effectiveCar = selectedCar ?? latestCar;

  const projectsForSelectedCar = useMemo(() => {
    if (!effectiveCar) return [];
    return allProjects.filter((p) => p.wbsNum.carNumber === effectiveCar.wbsNum.carNumber);
  }, [allProjects, effectiveCar]);

  const selectedProjectWbsNum = useMemo(
    () => (selectedProject ? projectToWbsNumber(selectedProject) : null),
    [selectedProject]
  );

  // Materials for the selected project for autocomplete
  const {
    data: projectMaterials,
    isLoading: projectMaterialsIsLoading,
    isError: projectMaterialsIsError,
    error: projectMaterialsError
  } = useGetMaterialsForWbsElement(selectedProjectWbsNum ?? { carNumber: 0, projectNumber: 0, workPackageNumber: 0 });

  // All materials across the selected car for search bar
  const {
    data: carMaterials,
    isLoading: carMaterialsIsLoading,
    isError: carMaterialsIsError,
    error: carMaterialsError
  } = useGetMaterialsForCar(effectiveCar?.wbsNum.carNumber ?? null, allProjects);

  const assemblyNameById = useMemo(() => new Map(assemblies.map((a) => [a.assemblyId, a.name])), [assemblies]);

  const materialToOption = useCallback(
    (material: Material): AutocompleteOption => ({
      label: [
        material.name,
        material.manufacturerName,
        material.materialTypeName,
        material.assemblyId ? `Assembly: ${assemblyNameById.get(material.assemblyId) ?? material.assemblyId}` : undefined
      ]
        .filter(Boolean)
        .join(' – '),
      id: material.materialId
    }),
    [assemblyNameById]
  );

  const materials = useMemo(() => (selectedProject ? (projectMaterials ?? []) : []), [selectedProject, projectMaterials]);

  const carOptions = useMemo(() => allCars.map(carToOption), [allCars]);
  const projectOptions = useMemo(() => projectsForSelectedCar.map(projectToOption), [projectsForSelectedCar]);
  const materialOptions = useMemo(() => materials.map(materialToOption), [materials, materialToOption]);
  const carMaterialOptions = useMemo(() => (carMaterials ?? []).map(materialToOption), [carMaterials, materialToOption]);

  const selectedCarOption = effectiveCar ? (carOptions.find((o) => o.id === effectiveCar.wbsElementId) ?? null) : null;
  const selectedProjectOption = selectedProject ? projectToOption(selectedProject) : null;
  const selectedMaterialOption = selectedMaterial ? materialToOption(selectedMaterial) : null;

  // Selecting from the search bar auto-populates the project and material dropdowns
  const handleSearchSelect = useCallback(
    (_: React.SyntheticEvent, value: AutocompleteOption | null) => {
      if (!value) return;
      const material = (carMaterials ?? []).find((m) => m.materialId === value.id) ?? null;
      if (!material) return;
      const project = allProjects.find((p) => p.wbsElementId === material.wbsElementId) ?? null;
      setSelectedProject(project);
      setSelectedMaterial(material);
    },
    [carMaterials, allProjects]
  );

  const handleCarChange = useCallback(
    (_: React.SyntheticEvent, value: AutocompleteOption | null) => {
      const next = value ? (allCars.find((c) => c.wbsElementId === value.id) ?? null) : null;
      setSelectedCar(next);
      setSelectedProject(null);
      setSelectedMaterial(null);
    },
    [allCars]
  );

  const handleProjectChange = useCallback(
    (_: React.SyntheticEvent, value: AutocompleteOption | null) => {
      const next = value ? (projectsForSelectedCar.find((p) => p.wbsElementId === value.id) ?? null) : null;
      setSelectedProject(next);
      setSelectedMaterial(null);
    },
    [projectsForSelectedCar]
  );

  const handleMaterialChange = useCallback(
    (_: React.SyntheticEvent, value: AutocompleteOption | null) => {
      const next = value ? (materials.find((m) => m.materialId === value.id) ?? null) : null;
      setSelectedMaterial(next);
    },
    [materials]
  );

  const handleCopy = () => {
    if (!selectedMaterial) return;
    onSelect(selectedMaterial);
    onHide();
    reset();
    setSelectedCar(null);
    setSelectedProject(null);
    setSelectedMaterial(null);
  };

  const handleHide = () => {
    onHide();
    reset();
    setSelectedCar(null);
    setSelectedProject(null);
    setSelectedMaterial(null);
  };

  const modalContent = () => {
    if (carsIsError) return <ErrorPage message={carsError?.message} />;
    if (projectsIsError) return <ErrorPage message={projectsError?.message} />;
    if (projectMaterialsIsError) return <ErrorPage message={projectMaterialsError?.message} />;
    if (carMaterialsIsError) return <ErrorPage message={carMaterialsError?.message} />;
    if (carsIsLoading || projectsIsLoading) return <LoadingIndicator />;

    return (
      <Stack spacing={2} sx={{ p: 1 }}>
        <Autocomplete
          id="search-material"
          options={carMaterialOptions}
          value={null}
          loading={carMaterialsIsLoading}
          getOptionLabel={(option) => option.label}
          onChange={handleSearchSelect}
          disabled={!effectiveCar || carMaterialsIsLoading}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={effectiveCar ? 'Search all materials in this car...' : 'Select a car first'}
              fullWidth
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <>
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                    {params.InputProps.startAdornment}
                  </>
                )
              }}
            />
          )}
        />

        <NERAutocomplete
          id="select-car"
          size="medium"
          placeholder="Select a car"
          options={carOptions}
          value={selectedCarOption}
          onChange={handleCarChange}
          required
        />

        <NERAutocomplete
          id="select-project"
          size="medium"
          placeholder={effectiveCar ? 'Select a project' : 'Select a car first'}
          options={projectOptions}
          value={selectedProjectOption}
          onChange={handleProjectChange}
          required
          disabled={!effectiveCar}
        />

        <NERAutocomplete
          id="select-material"
          size="medium"
          placeholder={selectedProject ? 'Select a material' : 'Select a project first'}
          options={materialOptions}
          value={selectedMaterialOption}
          onChange={handleMaterialChange}
          required
          disabled={!selectedProject || projectMaterialsIsLoading}
        />

        {!selectedMaterial && (
          <Typography variant="caption" color="text.secondary">
            Pick a material to enable "Copy".
          </Typography>
        )}
      </Stack>
    );
  };

  return (
    <NERFormModal
      open={open}
      onHide={handleHide}
      title="Select Material to Copy"
      formId="select-material-to-copy-form"
      reset={reset}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={handleCopy}
      submitText="Copy"
      cancelText="Cancel"
      disabled={!selectedMaterial}
      showCloseButton
      paperProps={{ width: '600px', minHeight: '500px' }}
    >
      {modalContent()}
    </NERFormModal>
  );
};

export default SelectMaterialToCopyModal;
