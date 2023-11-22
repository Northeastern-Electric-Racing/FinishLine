import { Box } from '@mui/system';
import { MaterialPreview, Project } from 'shared';
import { NERButton } from '../../../components/NERButton';
import WarningIcon from '@mui/icons-material/Warning';
import { MenuItem, Select, SelectChangeEvent, Tooltip, useTheme } from '@mui/material';
import { useState } from 'react';
import BOMTableWrapper from './BOM/BOMTableWrapper';
import CreateMaterialModal from './BOM/MaterialForm/CreateMaterialModal';
import CreateAssemblyModal from './BOM/AssemblyForm/CreateAssemblyModal';
import NERSuccessButton from '../../../components/NERSuccessButton';

const addMaterialCosts = (accumulator: number, currentMaterial: MaterialPreview) => currentMaterial.subtotal + accumulator;

const BOMTab = ({ project }: { project: Project }) => {
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [showAddAssembly, setShowAddAssembly] = useState(false);
  const [assembly, setAssembly] = useState('Total');
  const theme = useTheme();

  const costOptions = project.assemblies.map((assembly) => assembly.name);
  costOptions.push('Total');

  const totalCost = project.materials.reduce(addMaterialCosts, 0);
  const selectedAssemblyMaterials = project.assemblies.find((a) => a.name === assembly)?.materials;
  const displayedCost = selectedAssemblyMaterials ? selectedAssemblyMaterials.reduce(addMaterialCosts, 0) : totalCost;

  return (
    <Box>
      <CreateMaterialModal open={showAddMaterial} onHide={() => setShowAddMaterial(false)} wbsElement={project} />
      <CreateAssemblyModal open={showAddAssembly} onHide={() => setShowAddAssembly(false)} wbsElement={project} />
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 'calc(100vh - 220px)' }}>
        <BOMTableWrapper project={project} />
        <Box justifyContent="space-between" display="flex" flexDirection="row">
          <Box display="flex" gap="20px">
            <NERSuccessButton variant="contained" onClick={() => setShowAddMaterial(true)} sx={{ textTransform: 'none' }}>
              New Entry
            </NERSuccessButton>
            <NERButton variant="contained" onClick={() => setShowAddAssembly(true)}>
              New Assembly
            </NERButton>
          </Box>
          <Box display="flex" gap="20px" alignItems="center">
            <Box sx={{ backgroundColor: theme.palette.background.paper, padding: '8px 14px 8px 14px', borderRadius: '6px' }}>
              Budget: ${project.budget}
            </Box>
            <Select
              id="cr-autocomplete"
              value={assembly}
              onChange={(event: SelectChangeEvent<string>) => setAssembly(event.target.value)}
              size={'small'}
              placeholder={'Change Request Id'}
              sx={{ width: 200, textAlign: 'left' }}
              MenuProps={{
                anchorOrigin: {
                  vertical: 'top',
                  horizontal: 'left'
                },
                transformOrigin: {
                  vertical: 'bottom',
                  horizontal: 'left'
                }
              }}
            >
              {costOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option === 'Total' ? option : `Assembly: ${option}`}
                </MenuItem>
              ))}
            </Select>

            <Box sx={{ backgroundColor: theme.palette.background.paper, padding: '8px 14px 8px 14px', borderRadius: '6px' }}>
              ${displayedCost}
            </Box>
            {totalCost > project.budget && (
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
