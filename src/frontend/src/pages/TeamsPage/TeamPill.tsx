import { Typography, Box, Chip } from '@mui/material';
import { red } from '@mui/material/colors';

export const TeamPill: React.FC<{
  displayText: string;
}> = ({ displayText }) => {
  return (
    <Chip
      size="small"
      label={displayText}
      variant="filled"
      sx={{
        fontSize: 12,
        color: 'white',
        backgroundColor: red[600],
        width: 100
      }}
    />
  );
};
