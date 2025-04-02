import React from 'react';
import { Box, Typography } from '@mui/material';
import { useAllCommonMistakes } from '../../../../hooks/part-review.hooks';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import ErrorPage from '../../../ErrorPage';

const CommonMistakes = () => {
  const { data: commonMistakes, isLoading, error } = useAllCommonMistakes();
  if (isLoading || !commonMistakes) {
    return <LoadingIndicator />;
  }

  if (error) {
    return <ErrorPage message="Error loading common mistakes." error={error} />;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
        Common Mistakes
      </Typography>

      <Box
        sx={{
          maxHeight: 300,
          overflowY: 'auto',
          pr: 1,
          '@media (min-width: 1024px)': {
            '&::-webkit-scrollbar': {
              width: '8px'
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#ff2e2e',
              borderRadius: '4px'
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'transparent'
            }
          }
        }}
      >
        {commonMistakes?.map((mistake, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="medium">
              {mistake.title}
            </Typography>
            <Typography variant="body2">{mistake.description}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default CommonMistakes;
