import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useAllCommonMistakes } from '../hooks/part-review.hooks';

const CommonMistakes = () => {
  const { data: commonMistakes, isLoading, error } = useAllCommonMistakes();

  if (isLoading) {
    return <Typography>Loading common mistakes...</Typography>;
  }
  if (error) {
    return <Typography>Error loading common mistakes.</Typography>;
  }

  return (
    <Paper
      elevation={3}
      sx={{
        backgroundColor: '#1a1a1a',
        padding: 3,
        maxHeight: 300,
        overflowY: 'auto',
        color: '#e0e0e0',

        '&::-webkit-scrollbar': {
          width: '8px'
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#e53935',
          borderRadius: '4px'
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: '#333'
        }
      }}
    >
      <Typography
        variant="h5"
        component="h2"
        gutterBottom
        sx={{
          fontWeight: 'bold',
          color: 'white'
        }}
      >
        Common Mistakes
      </Typography>

      <Box>
        {commonMistakes?.map((mistake, index) => (
          <Box key={index} sx={{ mb: 3 }}>
            <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 'medium', color: 'white' }}>
              {mistake.title}
            </Typography>
            <Typography variant="body2" sx={{ color: '#c0c0c0' }}>
              {mistake.description}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default CommonMistakes;
