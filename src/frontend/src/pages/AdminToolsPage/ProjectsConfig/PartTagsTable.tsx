import { Box, Typography } from '@mui/material';
import { NERButton } from '../../../components/NERButton';
import AdminToolTable from '../AdminToolTable';

const PartTagsTable: React.FC = () => {
  return (
    <Box>
      <Typography variant="subtitle1">Part Tags</Typography>
      <AdminToolTable columns={[{ name: 'Tag Name' }]} rows={[]} />
      <Box sx={{ display: 'flex', justifyContent: 'right', marginTop: '10px' }}>
        <NERButton variant="contained" onClick={() => {}}>
          New Tag
        </NERButton>
      </Box>
    </Box>
  );
};

export default PartTagsTable;
