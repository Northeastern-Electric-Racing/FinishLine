import React, { useEffect } from 'react';
import { Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useState } from 'react';
import { ProjectPreview } from 'shared';
import LoadingIndicator from '../../../../../components/LoadingIndicator';
import { useGetAssembliesForWbsElement, useGetMaterialsForWbsElement } from '../../../../../hooks/bom.hooks';
import ErrorPage from '../../../../ErrorPage';

interface CopyBOMProjectSectionProps {
  selectedProject: ProjectPreview;
  onSelectionChange: (materialIds: string[]) => void;
}

const columns: GridColDef[] = [
  { field: 'materialName', headerName: 'Material Name', flex: 1 },
  { field: 'manufacturer', headerName: 'Manufacturer', flex: 1 },
  { field: 'materialType', headerName: 'Material Type', flex: 1 },
  { field: 'assembly', headerName: 'Assembly Name', flex: 1 }
];

const CopyBOMProjectSection: React.FC<CopyBOMProjectSectionProps> = ({ selectedProject, onSelectionChange }) => {
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<string[]>([]);
  const {
    data: materials,
    isLoading: isLoadingMaterials,
    isError: isErrorMaterials,
    error: materialsError
  } = useGetMaterialsForWbsElement(selectedProject.wbsNum);

  const {
    data: assemblies,
    isLoading: isLoadingAssemblies,
    isError: isErrorAssemblies,
    error: assembliesError
  } = useGetAssembliesForWbsElement(selectedProject.wbsNum);

  useEffect(() => {
    if (materials) {
      const allIds = materials.map((m) => m.materialId);
      setSelectedMaterialIds(allIds);
      onSelectionChange(allIds);
    }
  }, [materials, onSelectionChange]);

  if (isErrorMaterials) return <ErrorPage message={materialsError?.message} />;
  if (isErrorAssemblies) return <ErrorPage message={assembliesError?.message} />;
  if (isLoadingMaterials || isLoadingAssemblies || !materials || !assemblies) return <LoadingIndicator />;

  const rows = materials.map((m) => ({
    id: m.materialId,
    materialName: m.name,
    manufacturer: m.manufacturer?.name ?? '-',
    materialType: m.materialType.name,
    assembly: assemblies.find((a) => a.assemblyId === m.assemblyId)?.name ?? '-'
  }));

  return (
    <>
      <Typography sx={{ mb: 1 }} variant="body2">
        {selectedMaterialIds.length} material{selectedMaterialIds.length !== 1 ? 's' : ''} selected
      </Typography>
      <DataGrid
        rows={rows}
        columns={columns}
        checkboxSelection
        autoHeight
        selectionModel={selectedMaterialIds}
        onSelectionModelChange={(newModel) => {
          const ids = newModel as string[];
          setSelectedMaterialIds(ids);
          onSelectionChange(ids);
        }}
        rowsPerPageOptions={[100]}
        hideFooterPagination
        sx={{
          '& .MuiDataGrid-columnHeaders': { backgroundColor: '#ef4345', color: 'white' },
          '& .MuiDataGrid-columnHeaders .MuiCheckbox-root': { color: 'white' }
        }}
      />
    </>
  );
};

export default CopyBOMProjectSection;
