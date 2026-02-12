import React, { useEffect, useMemo, useState } from 'react';
import { Box, CircularProgress, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useQuery } from 'react-query';
import { Car, Material, ProjectPreview, WbsNumber } from 'shared';

import NERFormModal from '../../../../../components/NERFormModal';
import NERAutocomplete from '../../../../../components/NERAutocomplete';

import { useGetAllCars } from '../../../../../hooks/cars.hooks';
import { useAllProjects } from '../../../../../hooks/projects.hooks';
import { getMaterialsForWbsElement } from '../../../../../apis/bom.api';

type AutocompleteOption = { label: string; id: string };

interface SelectMaterialToCopyModalProps {
  open: boolean;
  onHide: () => void;
  onSelect: (material: Material) => void;
}

type FormValues = Record<string, never>;

const carToOption = (car: Car): AutocompleteOption => ({
  label: String(car.wbsNum.carNumber),
  id: car.wbsElementId
});

const projectToOption = (project: ProjectPreview): AutocompleteOption => ({
  label: `${project.wbsNum.carNumber}.${project.wbsNum.projectNumber} - ${project.name}`,
  id: project.wbsElementId
});

const materialToOption = (material: Material): AutocompleteOption => ({
  label: [
    material.name,
    material.manufacturerName,
    material.materialTypeName,
    material.assemblyId ? `Assembly: ${material.assemblyId}` : undefined
  ]
    .filter(Boolean)
    .join(' – '),
  id: material.materialId
});

const projectToProjectWbs = (project: ProjectPreview): WbsNumber => ({
  carNumber: project.wbsNum.carNumber,
  projectNumber: project.wbsNum.projectNumber,
  workPackageNumber: 0
});

const dedupeMaterials = (materials: Material[]): Material[] => {
  const seen = new Set<string>();
  const out: Material[] = [];
  for (const m of materials) {
    if (!seen.has(m.materialId)) {
      seen.add(m.materialId);
      out.push(m);
    }
  }
  return out;
};

const SelectMaterialToCopyModal: React.FC<SelectMaterialToCopyModalProps> = ({ open, onHide, onSelect }) => {
  const { reset, handleSubmit } = useForm<FormValues>();

  const [tab, setTab] = useState<'byProject' | 'search'>('byProject');

  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectPreview | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  const [searchText, setSearchText] = useState<string>('');

  const carsQuery = useGetAllCars();
  const projectsQuery = useAllProjects();

  const cars = carsQuery.data ?? [];
  const projects = projectsQuery.data ?? [];

  const projectsForSelectedCar = useMemo(() => {
    if (!selectedCar) return [];
    const carNumber = selectedCar.wbsNum.carNumber;
    return projects.filter((p) => p.wbsNum.carNumber === carNumber);
  }, [projects, selectedCar]);

  const selectedProjectWbsNum = useMemo(() => {
    if (!selectedProject) return null;
    return projectToProjectWbs(selectedProject);
  }, [selectedProject]);

  const projectMaterialsQuery = useQuery<Material[], Error>(
    ['materials', 'project', selectedProject?.wbsElementId ?? 'none'],
    async () => {
      if (!selectedProjectWbsNum) return [];
      const { data } = await getMaterialsForWbsElement(selectedProjectWbsNum);
      return data;
    },
    { enabled: !!selectedProjectWbsNum && open && tab === 'byProject' }
  );

  const carMaterialsQuery = useQuery<Material[], Error>(
    ['materials', 'car', selectedCar?.wbsNum.carNumber ?? 'none'],
    async () => {
      if (!selectedCar) return [];
      const carNumber = selectedCar.wbsNum.carNumber;

      const projectsInCar = projects.filter((p) => p.wbsNum.carNumber === carNumber);
      const results = await Promise.all(
        projectsInCar.map(async (p) => {
          const { data } = await getMaterialsForWbsElement(projectToProjectWbs(p));
          return data;
        })
      );

      return dedupeMaterials(results.flat());
    },
    { enabled: !!selectedCar && open && tab === 'search' }
  );

  const carOptions = useMemo(() => cars.map(carToOption), [cars]);
  const projectOptions = useMemo(() => projectsForSelectedCar.map(projectToOption), [projectsForSelectedCar]);
  

  const projectMaterials = projectMaterialsQuery.data ?? [];
  const carMaterials = carMaterialsQuery.data ?? [];

  const projectMaterialOptions = useMemo(() => projectMaterials.map(materialToOption), [projectMaterials]);

  const carSearchMaterialOptions = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    const filtered = q.length === 0 ? carMaterials : carMaterials.filter((m) => m.name.toLowerCase().includes(q));
    return filtered.map(materialToOption);
  }, [carMaterials, searchText]);

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
      setTab('byProject');
      setSelectedCar(null);
      setSelectedProject(null);
      setSelectedMaterial(null);
      setSearchText('');
      reset();
    }
  }, [open, reset]);

  const anyLoading =
    carsQuery.isLoading ||
    projectsQuery.isLoading ||
    (tab === 'byProject' ? projectMaterialsQuery.isLoading : false) ||
    (tab === 'search' ? carMaterialsQuery.isLoading : false);

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
      cancelText="Cancel"
      disabled={!canSubmit}
      showCloseButton
    >
      <Stack spacing={2} sx={{ p: 1 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => {
            const next = v as 'byProject' | 'search';
            setTab(next);
            setSelectedMaterial(null);
            setSearchText('');
          }}
        >
          <Tab value="byProject" label="By Project" />
          <Tab value="search" label="Search (by Car)" />
        </Tabs>

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

        <NERAutocomplete
          id="select-car"
          size="medium"
          placeholder="Select a car"
          options={carOptions}
          value={selectedCarOption}
          onChange={(_, value) => {
            const next = value ? cars.find((c) => c.wbsElementId === value.id) ?? null : null;
            setSelectedCar(next);
          }}
          required={true}
          disabled={carsQuery.isLoading}
        />

        {tab === 'byProject' && (
          <>
            <NERAutocomplete
              id="select-project"
              size="medium"
              placeholder={selectedCar ? 'Select a project' : 'Select a car first'}
              options={projectOptions}
              value={selectedProjectOption}
              onChange={(_, value) => {
                const next = value ? projectsForSelectedCar.find((p) => p.wbsElementId === value.id) ?? null : null;
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
                const next = value ? projectMaterials.find((m) => m.materialId === value.id) ?? null : null;
                setSelectedMaterial(next);
              }}
              required={true}
              disabled={!selectedProject || projectMaterialsQuery.isLoading}
            />
          </>
        )}

        {tab === 'search' && (
          <>
            <TextField
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder={selectedCar ? 'Search materials by name…' : 'Select a car first'}
              disabled={!selectedCar}
              fullWidth
            />

            <Box>
              <NERAutocomplete
                id="search-material"
                size="medium"
                placeholder={selectedCar ? 'Select a material' : 'Select a car first'}
                options={carSearchMaterialOptions}
                value={selectedMaterialOption}
                onChange={(_, value) => {
                  const next = value ? carMaterials.find((m) => m.materialId === value.id) ?? null : null;
                  setSelectedMaterial(next);
                }}
                required={true}
                disabled={!selectedCar || carMaterialsQuery.isLoading}
              />
            </Box>
          </>
        )}

        {!canSubmit && (
          <Typography variant="caption" color="text.secondary">
            Pick a material to enable “Select”.
          </Typography>
        )}
      </Stack>
    </NERFormModal>
  );
};

export default SelectMaterialToCopyModal;
