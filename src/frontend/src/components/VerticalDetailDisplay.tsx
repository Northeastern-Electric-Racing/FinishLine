/*
 * This file is part of FinishLine by NER and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/system';

interface VerticalDetailDisplayProps {
  label: string;
  content: string;
  paddingRight?: number;
}

const VerticalDetailDisplay: React.FC<VerticalDetailDisplayProps> = ({ label, content, paddingRight = 0 }) => {
  const theme = useTheme();
  const backgroundColor = theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200];
  return (
    <Box
      paddingRight={paddingRight}
      overflow={'hidden'}
      whiteSpace={'nowrap'}
      sx={{ backgroundColor: backgroundColor, borderRadius: '10px', justifyContent: 'center' }}
    >
      <Typography textOverflow={'ellipsis'} textAlign={'center'} fontSize={50}>
        {content}
      </Typography>
      <Typography textAlign={'center'} fontWeight={'bold'}>
        {label}
      </Typography>
    </Box>
  );
};

export default VerticalDetailDisplay;
