import { Box, Card, CardContent, Typography, useTheme } from '@mui/material';
import React from 'react';

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
        height: '100%',
        background: theme.palette.background.paper
      }}
      variant="outlined"
    >
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          flexWrap: 'nowrap'
        }}
      >
        {title && (
          <Typography ml={2} mt={2} variant="h5">
            {title}
          </Typography>
        )}
        <Box
          sx={{
            mt: 2,
            display: 'flex',
            flex: 1,
            flexDirection: horizontal ? 'row' : 'column',
            gap: 2,
            overflowX: horizontal ? 'auto' : 'hidden',
            overflowY: horizontal ? 'hidden' : 'auto',
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
          {React.Children.map(children, (child) => (
            <Box sx={{ flex: 1 }}>{child}</Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};
export default ScrollablePageBlock;
