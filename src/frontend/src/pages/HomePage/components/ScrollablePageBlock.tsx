import { Card, CardContent, Stack, Typography, useTheme } from '@mui/material';
import React from 'react';

interface ScrollablePageBlockProps {
  children: React.ReactNode;
  title?: String;
  horizontal?: boolean;
  height?: number;
}

const ScrollablePageBlock: React.FC<ScrollablePageBlockProps> = ({ children, title, horizontal, height }) => {
  const theme = useTheme();
  return (
    <Card
      sx={{
        height: horizontal ? 'auto' : `${height}vh`,
        my: 2,
        background: theme.palette.background.paper
      }}
      variant="outlined"
    >
      {title && (
        <Typography ml={2} mt={2} variant="h5">
          {title}
        </Typography>
      )}
      <CardContent
        sx={{
          marginTop: 1,
          maxHeight: height && `${height}vh`,
          flexWrap: 'nowrap',
          overflow: 'auto',
          justifyContent: 'flex-start',
          '&::-webkit-scrollbar': {
            height: '20px'
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.error.dark,
            borderRadius: '20px',
            border: '6px solid transparent',
            backgroundClip: 'content-box'
          }
        }}
      >
        <Stack direction={horizontal ? 'row' : 'column'} spacing={2}>
          {children}
        </Stack>
      </CardContent>
    </Card>
  );
};
export default ScrollablePageBlock;
