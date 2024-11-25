import { Card, CardContent, Stack, Typography, useTheme } from '@mui/material';
import React from 'react';
import { PAGE_GRID_HEIGHT } from '../../../components/PageLayout';
import { Stack } from '@mui/system';

interface ScrollablePageBlockProps {
  children: React.ReactNode;
  title?: String;
  horizontal?: boolean;
}

const ScrollablePageBlock: React.FC<ScrollablePageBlockProps> = ({ children, title, horizontal }) => {
  const theme = useTheme();
  return (
    <Card
      sx={{
        height: horizontal ? 'auto' : '100%',
        my: 2,
        background: theme.palette.background.paper
      }}
      variant="outlined"
    >
      {title && (
        <Typography ml={2} mt={2} variant="h4">
          {title}
        </Typography>
      )}
      <CardContent
        sx={{
          marginTop: 1,
          maxHeight: `calc(${PAGE_GRID_HEIGHT}vh - 100px)`,
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
