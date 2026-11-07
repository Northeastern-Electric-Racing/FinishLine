import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import React from 'react';
import { WidgetSize, WidgetProps } from 'shared/src/types/bay-dashboard-types';

const NERWidget: React.FC<WidgetProps> = ({ title, size, children }) => {
  //scaled variable(s) for box, default is medium
  const WidgetWidth = '46vw';

  const WidgetHeight =
    size === WidgetSize.SMALL ? '15vh' : size === WidgetSize.MEDIUM ? '30vh' : size === WidgetSize.LARGE ? '75vh' : '30vh';

  const WidgetPadding = size === WidgetSize.SMALL ? 2 : size === WidgetSize.MEDIUM ? 3 : size === WidgetSize.LARGE ? 4 : 3;

  const TitleFontSize = '20px';
  return (
    <Box
      sx={{
        width: WidgetWidth,
        height: WidgetHeight,
        borderRadius: '8px',
        bgcolor: 'rgba(255, 255, 255, 0.2)', //bg color and opacity
        opacity: '1', //text opacity
        padding: WidgetPadding, //scales with the widget size
        border: '1.5px solid rgba(255,255,255,0.15)',
        overflow: 'hidden'
      }}
    >
      <Typography
        sx={{
          fontSize: TitleFontSize,
          fontWeight: 'bold',
          color: 'white'
        }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
};

export default NERWidget;
