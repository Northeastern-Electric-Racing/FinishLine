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
  fontSize?: number;
  boxHeight?: string;
}

const VerticalDetailDisplay: React.FC<VerticalDetailDisplayProps> = ({ label, content, boxStyle, fontSize = 50, boxHeight }) => {
  const theme = useTheme();
  const backgroundColor = theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200];

  return (
    <Box
      overflow={'auto'}
      whiteSpace={'nowrap'}
      bgcolor={backgroundColor}
      borderRadius={'10px'}
      boxShadow={1}
      display={'flex'}
      flexDirection={'column'}
      justifyContent={'space-between'}
      sx={{
        '&::-webkit-scrollbar': {
          height: '0.55rem' // Adjust the the thickness of the scrollbar
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#EF4345', //FinishLine 'red' color
          borderRadius: '10px' //make the scrollbar rounded
        },
        '&::-webkit-scrollbar-thumb:hover': {
          backgroundColor: '#b0191a' // Change to a darker shade of red on hover
        },
        height : boxHeight ? boxHeight : 'auto',
        ...boxStyle
      }}
    >
      <Typography textOverflow={'ellipsis'} textAlign={'center'} fontSize={fontSize}>
        {content}
      </Typography>
      <Typography textAlign={'center'} fontWeight={'bold'} marginTop={'5px'}>
        {label}
      </Typography>
    </Box>
  );
};

export default VerticalDetailDisplay;
