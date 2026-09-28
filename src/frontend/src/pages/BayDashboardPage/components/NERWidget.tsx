import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import React from 'react';

interface WidgetProps {
  children?: React.ReactNode;
  size?: WidgetSize;
  title?: string;
}

export enum WidgetSize {
  SMALL,
  MEDIUM,
  LARGE
}

const NERWidget: React.FC<WidgetProps> = ({ title, size, children }) => {
  //scaled variable(s) for box, default is medium
  const WidgetWidth =
    size === WidgetSize.SMALL ? 500 : size === WidgetSize.MEDIUM ? 500 : size === WidgetSize.LARGE ? 700 : 500;
  const WidgetHeight =
    size === WidgetSize.SMALL ? 100 : size === WidgetSize.MEDIUM ? 200 : size === WidgetSize.LARGE ? 700 : 200;
  const WidgetPadding = size === WidgetSize.SMALL ? 2 : size === WidgetSize.MEDIUM ? 3 : size === WidgetSize.LARGE ? 4 : 3;
  //scaled variable(s) for text, default is 20 (medium)
  const TitleFontSize =
    size === WidgetSize.SMALL ? 16 : size === WidgetSize.MEDIUM ? 20 : size === WidgetSize.LARGE ? 28 : 20;
  return (
    <Box
      sx={{
        width: WidgetWidth,
        height: WidgetHeight,
        borderRadius: 8,
        bgcolor: 'rgba(255, 255, 255, 0.2)', //bg color and opacity
        opacity: '1', //text opacity
        padding: WidgetPadding, //scales with the widget size
        border: '1.5px solid rgba(255,255,255,0.15)'
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
