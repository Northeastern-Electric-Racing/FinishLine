import React, { useEffect, useMemo, useState } from 'react';
import { Autocomplete, Box, CircularProgress, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useQuery } from 'react-query';
import { Assembly, Car, Material, ProjectPreview, WbsNumber } from 'shared';

import NERFormModal from '../../../../../components/NERFormModal';
import NERAutocomplete from '../../../../../components/NERAutocomplete';

import { useGetAllCars } from '../../../../../hooks/cars.hooks';
import { useAllProjects } from '../../../../../hooks/projects.hooks';
import { getMaterialsForWbsElement } from '../../../../../apis/bom.api';
import SearchIcon from '@mui/icons-material/Search';

type AutocompleteOption = { label: string; id: string };

type SearchResult = {
  material: Material;
  project: ProjectPreview;
};

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

const searchResultToOption = ({ material, project }: SearchResult): AutocompleteOption => ({
  label: `${material.name} – ${project.wbsNum.carNumber}.${project.wbsNum.projectNumber} - ${project.name}`,
  id: material.materialId
});

const projectToProjectWbs = (project: ProjectPreview): WbsNumber => ({
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
  const [searchText, setSearchText] = useState<string>('');

  const carsQuery = useGetAllCars();
  const projectsQuery = useAllProjects();

  const cars = useMemo(() => carsQuery.data ?? [], [carsQuery.data]);
  const projects = useMemo(() => projectsQuery.data ?? [], [projectsQuery.data]);

  const latestCar = useMemo(() => getLatestCar(cars), [cars]);

  const projectsForSelectedCar = useMemo(() => {
    if (!selectedCar) return [];
    const {
      wbsNum: { carNumber }
    } = selectedCar;
    return projects.filter((p) => p.wbsNum.carNumber === carNumber);
  }, [projects, selectedCar]);

  const selectedProjectWbsNum = useMemo(() => {
    if (!selectedProject) return null;
    return projectToProjectWbs(selectedProject);
  }, [selectedProject]);

  const assemblyNameById = useMemo(
    () => new Map(assemblies.map((assembly) => [assembly.assemblyId, assembly.name])),
    [assemblies]
  );

  const materialToOption = (material: Material): AutocompleteOption => ({
    label: [
      material.name,
      material.manufacturerName,
      material.materialTypeName,
      material.assemblyId ? `Assembly: ${assemblyNameById.get(material.assemblyId) ?? material.assemblyId}` : undefined
    ]
      .filter(Boolean)
      .join(' – '),
    id: material.materialId
  });

  const projectMaterialsQuery = useQuery<Material[], Error>(
    ['materials', 'project', selectedProject?.wbsElementId ?? 'none'],
    async () => {
      if (!selectedProjectWbsNum) return [];
      const { data } = await getMaterialsForWbsElement(selectedProjectWbsNum);
      return data;
    },
    { enabled: !!selectedProjectWbsNum && open }
  );

  const carMaterialsQuery = useQuery<SearchResult[], Error>(
    ['materials', 'car', selectedCar?.wbsNum.carNumber ?? 'none'],
    async () => {
      if (!selectedCar) return [];
      const {
        wbsNum: { carNumber }
      } = selectedCar;
      const projectsInCar = projects.filter((p) => p.wbsNum.carNumber === carNumber);
      const results = await Promise.all(
        projectsInCar.map(async (p) => {
          const { data } = await getMaterialsForWbsElement(projectToProjectWbs(p));
          return data.map((material) => ({
            material,
            project: p
          }));
        })
      );

      const flattened = results.flat();
      const seen = new Set<string>();

      return flattened.filter(({ material, project }) => {
        const key = `${material.name.toLowerCase()}-${project.name.toLowerCase()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    },
    { enabled: !!selectedCar && open }
  );

  const projectMaterials = useMemo(() => projectMaterialsQuery.data ?? [], [projectMaterialsQuery.data]);
  const carSearchResults = useMemo(() => carMaterialsQuery.data ?? [], [carMaterialsQuery.data]);

  const carOptions = useMemo(() => cars.map(carToOption), [cars]);
  const projectOptions = useMemo(() => projectsForSelectedCar.map(projectToOption), [projectsForSelectedCar]);
  const projectMaterialOptions = useMemo(() => projectMaterials.map(materialToOption), [projectMaterials]);

  const searchOptions = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    const filtered =
      q.length === 0 ? carSearchResults : carSearchResults.filter(({ material }) => material.name.toLowerCase().includes(q));

    return filtered.map(searchResultToOption);
  }, [carSearchResults, searchText]);

  useEffect(() => {
    if (open && !selectedCar && latestCar) {
      setSelectedCar(latestCar);
    }
  }, [open, selectedCar, latestCar]);

  useEffect(() => {
    setSelectedProject(null);
    setSelectedMaterial(null);
    setSearchText('');
  }, [selectedCar?.wbsElementId]);

  useEffect(() => {
    setSelectedMaterial(null);
  }, [selectedProject?.wbsElementId]);

  useEffect(() => {
    if (!open) {
      setSelectedCar(null);
      setSelectedProject(null);
      setSelectedMaterial(null);
      setSearchText('');
      reset();
    }
  }, [open, reset]);

  const anyLoading =
    carsQuery.isLoading || projectsQuery.isLoading || projectMaterialsQuery.isLoading || carMaterialsQuery.isLoading;

  const anyError =
    (carsQuery.error as Error | undefined) ||
    (projectsQuery.error as Error | undefined) ||
    projectMaterialsQuery.error ||
    carMaterialsQuery.error ||
    null;

  const selectedCarOption = selectedCar ? carToOption(selectedCar) : null;
  const selectedProjectOption = selectedProject ? projectToOption(selectedProject) : null;
  const selectedMaterialOption = selectedMaterial ? materialToOption(selectedMaterial) : null;

  const canSubmit = !!selectedMaterial;

  const handleCopy = () => {
    if (!selectedMaterial) return;
    onSelect(selectedMaterial);
    onHide();
  };

  return (
    <NERFormModal
      open={open}
      onHide={onHide}
      title="Select Material to Copy"
      formId="select-material-to-copy-form"
      reset={reset}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={handleCopy}
      submitText="Copy"
      cancelText="Cancel"
      disabled={!canSubmit}
      showCloseButton
      paperProps={{ width: '500px', maxWidth: '95vw' }}
    >
      <Stack spacing={2} sx={{ p: 1 }}>
        {anyLoading && (
          <Stack direction="row" spacing={1} alignItems="center">
            <CircularProgress size={18} />
            <Typography variant="body2">Loading…</Typography>
          </Stack>
        )}

        {anyError && (
          <Typography variant="body2" color="error">
            {anyError.message}
          </Typography>
        )}

        <Box>
          <Autocomplete
            id="search-material"
            options={searchOptions}
            value={null}
            getOptionLabel={(option) => option.label}
            onInputChange={(_, value) => {
              setSearchText(value);
            }}
            onChange={async (_, value) => {
              if (!value) return;

              const match =
                carSearchResults.find(({ material, project }) => {
                  return (
                    material.materialId === value.id &&
                    `${material.name} – ${project.wbsNum.carNumber}.${project.wbsNum.projectNumber} - ${project.name}` ===
                      value.label
                  );
                }) ?? null;

              if (!match) return;

              setSelectedProject(match.project);
              setSearchText(match.material.name);

              const { data } = await getMaterialsForWbsElement(projectToProjectWbs(match.project));
              const selected = data.find((m) => m.materialId === match.material.materialId) ?? null;

              setSelectedMaterial(selected);
            }}
            disabled={!selectedCar || carMaterialsQuery.isLoading}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={selectedCar ? 'Search materials by name…' : 'Select a car first'}
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
        </Box>

        <NERAutocomplete
          id="select-car"
          size="medium"
          placeholder="Select a car"
          options={carOptions}
          value={selectedCarOption}
          onChange={(_, value) => {
            const next = value ? (cars.find((c) => c.wbsElementId === value.id) ?? null) : null;
            setSelectedCar(next);
          }}
          required={true}
          disabled={carsQuery.isLoading}
        />

        <NERAutocomplete
          id="select-project"
          size="medium"
          placeholder={selectedCar ? 'Select a project' : 'Select a car first'}
          options={projectOptions}
          value={selectedProjectOption}
          onChange={(_, value) => {
            const next = value ? (projectsForSelectedCar.find((p) => p.wbsElementId === value.id) ?? null) : null;
            setSelectedProject(next);
          }}
          required={true}
          disabled={!selectedCar || projectsQuery.isLoading}
        />

        <NERAutocomplete
          id="select-material"
          size="medium"
          placeholder={selectedProject ? 'Select a material' : 'Select a project first'}
          options={projectMaterialOptions}
          value={selectedMaterialOption}
          onChange={(_, value) => {
            const next = value ? (projectMaterials.find((m) => m.materialId === value.id) ?? null) : null;
            setSelectedMaterial(next);
          }}
          required={true}
          disabled={!selectedProject || projectMaterialsQuery.isLoading}
        />

        {!canSubmit && (
          <Typography variant="caption" color="text.secondary">
            Pick a material to enable “Copy”.
          </Typography>
        )}
      </Stack>
    </NERFormModal>
  );
};

export default SelectMaterialToCopyModal;
