/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Typography } from '@mui/material';
import { DirectionsCar as CarIcon } from '@mui/icons-material';
import { useGlobalCarFilter } from '../app/AppGlobalCarFilterContext';
import LoadingIndicator from './LoadingIndicator';

interface GlobalCarFilterHeaderProps {
  sx?: object;
}

const GlobalCarFilterHeader: React.FC<GlobalCarFilterHeaderProps> = ({ sx = {} }) => {
  const { selectedCar, allCars, isLoading, error } = useGlobalCarFilter();

  if (isLoading) return <LoadingIndicator />;

  if (error) {
    return (
      <Box sx={{ p: 1, ...sx }}>
        <Typography variant="body2" color="error">
          {error.message}
        </Typography>
      </Box>
    );
  }

  if (allCars.length === 0) return null;

  const currentCarLabel = selectedCar ? selectedCar.name : 'All Cars';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pt: 1, ...sx }}>
      <CarIcon fontSize="small" sx={{ color: 'white' }} />
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 500, color: 'white' }}>
          Working with:
        </Typography>
        <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
          {currentCarLabel}
        </Typography>
      </Box>
    </Box>
  );
};

export default GlobalCarFilterHeader;
