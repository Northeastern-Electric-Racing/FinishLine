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

export const addMaterialCosts = (accumulator: number, currentMaterial: MaterialPreview) =>
  currentMaterial.subtotal + accumulator;

const BOMTab = ({ project }: { project: Project }) => {
  const initialHideColumn = new Array(12).fill(false);
  const [hideColumn, setHideColumn] = useState<boolean[]>(initialHideColumn);
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [showAddAssembly, setShowAddAssembly] = useState(false);
  const theme = useTheme();

  const totalCost = project.materials.reduce(addMaterialCosts, 0);

  const user = useCurrentUser();

  return (
    <Box>
      <CreateMaterialModal open={showAddMaterial} onHide={() => setShowAddMaterial(false)} wbsElement={project} />
      <CreateAssemblyModal open={showAddAssembly} onHide={() => setShowAddAssembly(false)} wbsElement={project} />
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 'calc(100vh - 220px)' }}>
        <BOMTableWrapper project={project} hideColumn={hideColumn} setHideColumn={setHideColumn} />
        <Box justifyContent="space-between" display="flex" flexDirection="row">
          <Box display="flex" gap="20px">
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
