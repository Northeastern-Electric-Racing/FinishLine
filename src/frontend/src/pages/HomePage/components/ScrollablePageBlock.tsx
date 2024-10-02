import { Card, CardContent, Typography, useTheme } from '@mui/material';
import React from 'react';
import { PAGE_GRID_HEIGHT } from '../../../components/PageLayout';

interface ScrollablePageBlockProps {
  children: React.ReactNode;
  title?: String;
}

const ScrollablePageBlock: React.FC<ScrollablePageBlockProps> = ({ children, title }) => {
  const theme = useTheme();
  return (
    <Card
      sx={{
        overflowY: 'auto',
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
        },
        height: '100%',
        my: 2,
        background: theme.palette.background.paper
      }}
      variant="outlined"
    >
      <CardContent sx={{ height: `100%`, maxHeight: `calc(${PAGE_GRID_HEIGHT}vh - 200px)` }}>
        {title && (
          <Typography mb={1} variant="h5">
            {title}
          </Typography>
        )}
        {children}
      </CardContent>
    </Card>
  );
};

export default ScrollablePageBlock;
