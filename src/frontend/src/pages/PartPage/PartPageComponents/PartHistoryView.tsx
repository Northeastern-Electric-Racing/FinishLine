import { Box, Grid, useTheme } from '@mui/system';
import { Part } from 'shared';
import { completePartHistory } from '../../../utils/part.utils';
import { Typography } from '@mui/material';

interface PartHistoryViewProps {
  part: Part;
}

const PartHistoryView: React.FC<PartHistoryViewProps> = ({ part }: PartHistoryViewProps) => {
  const historyEntries: string[] = completePartHistory(part);
  const theme = useTheme();

  return (
    <Box
      sx={{
        mt: 2,
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'wrap',
        overflowX: 'hidden',
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
          width: '20px'
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'transparent'
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: theme.palette.primary.main,
          borderRadius: '20px',
          border: '6px solid transparent',
          backgroundClip: 'content-box'
        },
        scrollbarWidth: 'auto',
        scrollbarColor: `${theme.palette.primary.main} transparent`
      }}
    >
      <Typography variant="h4" mb={1}>
        History
      </Typography>
      {historyEntries.map((entry, index) => (
        <Grid key={index}>{entry}</Grid>
      ))}
    </Box>
  );
};

export default PartHistoryView;
