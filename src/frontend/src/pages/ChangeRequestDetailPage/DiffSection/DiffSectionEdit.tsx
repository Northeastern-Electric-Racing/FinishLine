import { Box, Grid } from '@mui/material';
import DiffPanel from './DiffPanel';
import { useTheme } from '@mui/material';
import { ComparableCollection } from '../../../utils/diff-page.utils';

interface DiffSectionEditProps {
  collections: ComparableCollection[];
}

const DiffSectionEdit = ({ collections }: DiffSectionEditProps) => {
  const theme = useTheme();

  return (
    <Grid container columnSpacing={4}>
      <Grid item xs={6}>
        <Box borderRadius="10px" p={1.4} mb={3} sx={{ backgroundColor: theme.palette.background.paper }}>
          <DiffPanel
            comparableObjects={collections.map((collection) => ({
              label: collection.label,
              objects: collection.lines.map((line) => line.original)
            }))}
            original
          />
        </Box>
      </Grid>
      <Grid item xs={6}>
        <Box borderRadius="10px" p={1.4} mb={3} sx={{ backgroundColor: theme.palette.background.paper }}>
          <DiffPanel
            comparableObjects={collections.map((collection) => ({
              label: collection.label,
              objects: collection.lines.map((line) => line.new)
            }))}
          />
        </Box>
      </Grid>
    </Grid>
  );
};

export default DiffSectionEdit;
