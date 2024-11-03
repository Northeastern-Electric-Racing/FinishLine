import { Box, Card, CardContent, Stack, Typography, useTheme } from '@mui/material';
import React from 'react';
import { PAGE_GRID_HEIGHT } from '../../../components/PageLayout';

interface ScrollablePageBlockProps {
  children: React.ReactNode;
  title?: String;
  horizontal?: boolean;
  height?: number;
}

const HorizontalScrollablePageBlock: React.FC<ScrollablePageBlockProps> = ({ children }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
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
      {children}
    </Box>
  );
};

const ScrollablePageBlock: React.FC<ScrollablePageBlockProps> = ({ children, title, horizontal, height }) => {
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
        height: height ? `${height}%` : '100%',
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

        {horizontal ? (
          <HorizontalScrollablePageBlock>{children}</HorizontalScrollablePageBlock>
        ) : (
          <Stack spacing={2}>{children}</Stack>
        )}
      </CardContent>
    </Card>
  );
};
export default ScrollablePageBlock;
