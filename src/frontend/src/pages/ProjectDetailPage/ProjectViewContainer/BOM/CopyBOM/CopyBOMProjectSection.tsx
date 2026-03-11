import React from 'react';
import { Typography } from '@mui/material';
import { DataGrid, GridColDef, GridSelectionModel } from '@mui/x-data-grid';
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

const CopyBOMProjectSection: React.FC<CopyBOMProjectSectionProps> = ({
  selectedProject,
  onSelectionChange
}) => {
  const [selectionModel, setSelectionModel] = useState<GridSelectionModel>([]);
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

  React.useEffect(() => {
    if (materials) {
      const allIds = materials.map((m) => m.materialId);
      setSelectionModel(allIds);
      onSelectionChange(allIds);
    }
  }, [materials]);

  if (isLoadingMaterials || isLoadingAssemblies || !materials || !assemblies) return <LoadingIndicator />;
  if (isErrorMaterials) return <ErrorPage message={materialsError?.message} />;
  if (isErrorAssemblies) return <ErrorPage message={assembliesError?.message} />;

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
        {selectionModel.length} material{selectionModel.length !== 1 ? 's' : ''} selected
      </Typography>
      <DataGrid
        rows={rows}
        columns={columns}
        checkboxSelection
        autoHeight
        selectionModel={selectionModel}
        onSelectionModelChange={(newModel) => {
          setSelectionModel(newModel);
          onSelectionChange(newModel as string[]);
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
