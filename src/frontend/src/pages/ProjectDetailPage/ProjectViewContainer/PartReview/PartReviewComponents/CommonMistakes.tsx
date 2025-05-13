import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { useAllCommonMistakes } from '../../../../../hooks/part-review.hooks';
import LoadingIndicator from '../../../../../components/LoadingIndicator';
import ErrorPage from '../../../../ErrorPage';

const CommonMistakes = () => {
  const { data: commonMistakes, isLoading, error } = useAllCommonMistakes();

  const filteredCommonMistakes = useMemo(() => {
    return commonMistakes?.filter((mistake) => mistake.starred);
  }, [commonMistakes]);

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
          maxHeight: '25vh',
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px'
          },
          '&::-webkit-scrollbar-track': {
            background: '#2a2a2a',
            borderRadius: '4px'
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#e57373',
            borderRadius: '4px',
            '&:hover': {
              background: '#ef5350'
            }
          }
        }}
      >
        {filteredCommonMistakes?.map((mistake, index) => (
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
