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

  // Box Styles
  const customSx = {
    overflow: 'auto',
    whiteSpace: 'nowrap',
    backgroundColor: backgroundColor,
    justifyContent: 'center',
    boxShadow: 1,
    borderRadius: '10px'
  };

  // Custom Scrollbar Styles
  const hoverSx = {
    '&::-webkit-scrollbar': {
      height: '0.6rem' // Adjust the the thickness of the scrollbar
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: '#EF4345', //FinishLine 'red'
      borderRadius: '0.5rem'
    },
    '&::-webkit-scrollbar-thumb:hover': {
      backgroundColor: '#b0191a' // Change to a darker shade of red on hover
    }
  };

  return (
    <Box overflow={'auto'} whiteSpace={'nowrap'} sx={{ ...customSx, ...hoverSx }}>
      <Typography textOverflow={'ellipsis'} textAlign={'center'} fontSize={'2.5rem'} margin={'0px 10px'}>
        {content}
      </Typography>
      <Typography textAlign={'center'} fontWeight={'bold'}>
        {label}
      </Typography>
    </Box>
  );
};

export default VerticalDetailDisplay;
