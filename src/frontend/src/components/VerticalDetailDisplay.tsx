/*
 * This file is part of FinishLine by NER and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import { Box, SxProps, Theme } from '@mui/system';

interface VerticalDetailDisplayProps {
  label: string;
  content: string;
  boxStyle?: SxProps<Theme>;
}

const VerticalDetailDisplay: React.FC<VerticalDetailDisplayProps> = ({ label, content, boxStyle }) => {
  const theme = useTheme();
  const backgroundColor = theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200];

  return (
    <Box
      overflow={'auto'}
      whiteSpace={'nowrap'}
      bgcolor={backgroundColor}
      borderRadius={'10px'}
      justifyContent={'center'}
      boxShadow={1}
    >
      <Typography textOverflow={'ellipsis'} textAlign={'center'} fontSize={300 / content.length}>
        {content}
      </Typography>
      <Typography textAlign={'center'} fontWeight={'bold'} marginBottom={'5px'}>
        {label}
      </Typography>
    </Box>
  );
};

export default VerticalDetailDisplay;
