/*
 * This file is part of FinishLine by NER and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Typography from '@mui/material/Typography';
import { Box } from '@mui/system';

interface VerticalDetailDisplayProps {
  label: string;
  content: string;
  paddingRight?: number;
}

const VerticalDetailDisplay: React.FC<VerticalDetailDisplayProps> = ({ label, content, paddingRight = 0 }) => {
  return (
    <Box paddingRight={paddingRight}>
      <Typography fontSize={20}>{content}</Typography>
      <Typography fontWeight={'bold'}>
        {label}
      </Typography>
    </Box>
  );
};

export default VerticalDetailDisplay;
