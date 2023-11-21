import { Box } from '@mui/system';
import { Project } from 'shared';
import BOMTable from './BOM/BOMTable';
import { NERButton } from '../../../components/NERButton';
import WarningIcon from '@mui/icons-material/Warning';
import { Tooltip } from '@mui/material';
import { useState } from 'react';
import CreateMaterialModal from '../../BOMsPage/MaterialForm/CreateMaterialModal';

const BOM_TABLE_ROW_COUNT = 'tl-table-row-count';

const BOMTab = ({ project }: { project: Project }) => {
  const [showAddMaterial, setShowAddMaterial] = useState(false);

  const totalCost = project.materials.reduce((accumulator, currentMaterial) => currentMaterial.subtotal + accumulator, 0);

  if (!localStorage.getItem(BOM_TABLE_ROW_COUNT)) {
    localStorage.setItem(BOM_TABLE_ROW_COUNT, '25');
  }

  return (
    <Box>
      <CreateMaterialModal open={showAddMaterial} onHide={() => setShowAddMaterial(false)} wbsElement={project} />
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 'calc(100vh - 220px)' }}>
        <BOMTable project={project} tableRowCount={BOM_TABLE_ROW_COUNT} />
        <Box justifyContent="space-between" display="flex" flexDirection="row">
          <Box display="flex" gap="20px">
            <NERButton variant="contained" onClick={() => setShowAddMaterial(true)}>
              New Entry
            </NERButton>
            <NERButton variant="contained">New Assembly</NERButton>
          </Box>
          <Box display="flex" gap="20px" alignItems="center">
            <NERButton variant="contained" disabled>
              Budget: ${project.budget}
            </NERButton>
            <NERButton variant="contained" disabled>
              Total
            </NERButton>
            <NERButton variant="contained" disabled>
              ${totalCost}
            </NERButton>
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
