/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Typography } from '@mui/material';
import NERWidget from '../../../../components/NERWidget';
import { BayDashboardWidgetProps } from '../../../../utils/bay-dashboard.utils';

/**
 * Displays admin-entered text on the bay dashboard
 */
const TextFieldWidget: React.FC<BayDashboardWidgetProps> = ({ size, widget }) => {
  return (
    <NERWidget size={size}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          p: '4cqw'
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontSize: '5cqw',
            fontWeight: 700,
            textAlign: 'center',
            color: 'white',
            lineHeight: '1.2',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
        >
          {widget.text}
        </Typography>
      </Box>
    </NERWidget>
  );
};

export default TextFieldWidget;
