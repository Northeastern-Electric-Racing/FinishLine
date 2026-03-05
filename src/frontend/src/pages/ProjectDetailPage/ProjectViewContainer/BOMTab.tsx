import { Box } from '@mui/system';
import { MaterialPreview, Project, isGuest } from 'shared';
import { NERButton } from '../../../components/NERButton';
import WarningIcon from '@mui/icons-material/Warning';
import { Tooltip, useTheme } from '@mui/material';
import { useState } from 'react';
import BOMTableWrapper from './BOM/BOMTableWrapper';
import CreateMaterialModal from './BOM/MaterialForm/CreateMaterialModal';
import CreateAssemblyModal from './BOM/AssemblyForm/CreateAssemblyModal';
import NERSuccessButton from '../../../components/NERSuccessButton';
import { centsToDollar } from '../../../utils/pipes';
import { useCurrentUser } from '../../../hooks/users.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import {
  useGetAllMaterialTypes,
  useGetAllUnits,
  useGetAssembliesForWbsElement,
  useGetMaterialsForWbsElement
} from '../../../hooks/bom.hooks';
import ImportBOMModal from './BOM/ImportBOMModal';

export const addMaterialCosts = (accumulator: number, currentMaterial: MaterialPreview) =>
  (currentMaterial.subtotal ?? 0) + accumulator;

const BOMTab = ({ project }: { project: Project }) => {
  const initialHideColumn = new Array(12).fill(false);
  const [hideColumn, setHideColumn] = useState<boolean[]>(initialHideColumn);
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [showAddAssembly, setShowAddAssembly] = useState(false);
  const [showImportBOM, setShowImportBOM] = useState(false);
  const theme = useTheme();

  const user = useCurrentUser();

  const {
    data: assemblies,
    isLoading: assembliesIsLoading,
    isError: assembliesIsError,
    error: assembliesError,
    refetch: refetchAssemblies
  } = useGetAssembliesForWbsElement(project.wbsNum);
  const {
    data: materials,
    isLoading: materialsIsLoading,
    isError: materialsIsError,
    error: materialsError,
    refetch: refetchMaterials
  } = useGetMaterialsForWbsElement(project.wbsNum);

  const {
    data: materialTypes,
    isLoading: materialTypesIsLoading,
    isError: materialTypesIsError,
    error: materialTypesError
  } = useGetAllMaterialTypes();

  const { data: units, isLoading: unitsIsLoading, isError: unitsIsError, error: unitsError } = useGetAllUnits();

  if (assembliesIsError) return <ErrorPage message={assembliesError.message} />;
  if (materialsIsError) return <ErrorPage message={materialsError.message} />;
  if (materialTypesIsError) return <ErrorPage message={materialTypesError.message} />;
  if (unitsIsError) return <ErrorPage message={unitsError.message} />;

  if (
    assembliesIsLoading ||
    materialsIsLoading ||
    materialTypesIsLoading ||
    unitsIsLoading ||
    !materials ||
    !assemblies ||
    !materialTypes ||
    !units
  ) {
    return <LoadingIndicator />;
  }

  const totalCost = materials.reduce(addMaterialCosts, 0);

  const handleImportComplete = () => {
    refetchMaterials();
    refetchAssemblies();
  };

  return (
    <Box>
      <CreateMaterialModal
        open={showAddMaterial}
        onHide={() => setShowAddMaterial(false)}
        wbsElement={project}
        assemblies={assemblies}
      />
      <CreateAssemblyModal open={showAddAssembly} onHide={() => setShowAddAssembly(false)} wbsElement={project} />
      <ImportBOMModal
        open={showImportBOM}
        onHide={() => {
          setShowImportBOM(false);
          handleImportComplete();
        }}
        wbsNum={project.wbsNum}
        allMaterialTypes={materialTypes}
        allUnits={units}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <BOMTableWrapper
          project={project}
          materials={materials}
          assemblies={assemblies}
          hideColumn={hideColumn}
          setHideColumn={setHideColumn}
          refetch={() => {
            refetchMaterials();
            refetchAssemblies();
          }}
        />
        <Box justifyContent="space-between" display="flex" flexDirection="row">
          <Box display="flex" gap="20px" mb={1}>
            <NERSuccessButton
              variant="contained"
              onClick={() => setShowAddMaterial(true)}
              sx={{ textTransform: 'none' }}
              disabled={isGuest(user.role)}
            >
              New Entry
            </NERSuccessButton>
            <NERButton variant="contained" onClick={() => setShowAddAssembly(true)} disabled={isGuest(user.role)}>
              New Assembly
            </NERButton>
            <NERSuccessButton
              variant="contained"
              onClick={() => setShowImportBOM(true)}
              sx={{ textTransform: 'none' }}
              disabled={isGuest(user.role)}
            >
              Import BOM
            </NERSuccessButton>
            <NERButton
              variant="text"
              onClick={() => {
                const newHideColumn = new Array(12).fill(false);
                localStorage.setItem('hideColumn', JSON.stringify(newHideColumn));
                setHideColumn(newHideColumn);
              }}
              disabled={isGuest(user.role)}
            >
              Show All Columns
            </NERButton>
            {/*
            <NERButton variant="contained" onClick={() => {}} disabled={isGuest(user.role)}>
              Copy Existing BOM
            </NERButton>
            */}
          </Box>
          <Box display="flex" gap="20px" alignItems="center">
            <Box sx={{ backgroundColor: theme.palette.background.paper, padding: '8px 14px 8px 14px', borderRadius: '6px' }}>
              Budget: ${project.budget}
            </Box>

            <Box sx={{ backgroundColor: theme.palette.background.paper, padding: '8px 14px 8px 14px', borderRadius: '6px' }}>
              Total Cost: ${centsToDollar(totalCost)}
            </Box>
            {totalCost > project.budget * 100 && (
              <Tooltip title="Current Total Cost Exceeds Budget!" placement="top" arrow>
                <WarningIcon color="warning" fontSize="large" />
              </Tooltip>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default BOMTab;
