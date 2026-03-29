/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Typography, Chip } from '@mui/material';
import { DirectionsCar as CarIcon } from '@mui/icons-material';
import { Car } from 'shared';
import { useGlobalCarFilter } from '../app/AppGlobalCarFilterContext';
import LoadingIndicator from './LoadingIndicator';

interface GlobalCarFilterDropdownProps {
  sx?: object;
}

const GlobalCarFilterDropdown: React.FC<GlobalCarFilterDropdownProps> = ({ sx = {} }) => {
  const { selectedCar, allCars, setSelectedCar, isLoading, error } = useGlobalCarFilter();

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return (
      <Box sx={{ p: 1, ...sx }}>
        <Typography variant="body2" color="error">
          {error.message}
        </Typography>
      </Box>
    );
  }

  if (allCars.length === 0) {
    return (
      <Box sx={{ p: 1, ...sx }}>
        <Typography variant="body2" color="text.secondary">
          No cars available
        </Typography>
      </Box>
    );
  }

  const sortedCars = [...allCars].sort((a, b) => b.wbsNum.carNumber - a.wbsNum.carNumber);

  const currentCarLabel = selectedCar ? selectedCar.name : 'All Cars';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ...sx }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          cursor: 'pointer',
          '&:hover': { opacity: 0.8 }
        }}
      >
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
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          py: 1,
          '&::-webkit-scrollbar': {
            height: 6
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(255,255,255,0.3)',
            borderRadius: 3
          }
        }}
      >
        <Chip
          label="All Cars"
          onClick={() => setSelectedCar(null)}
          variant="outlined"
          sx={{
            borderColor: 'white',
            color: 'white',
            backgroundColor: 'transparent',
            fontWeight: !selectedCar ? 'bold' : 'normal',
            borderWidth: !selectedCar ? 2 : 1,
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
            whiteSpace: 'nowrap'
          }}
        />
        {sortedCars.map((car) => {
          const isSelected = selectedCar?.id === car.id;
          return (
            <Chip
              key={car.id}
              label={car.name}
              onClick={() => setSelectedCar(car)}
              variant="outlined"
              sx={{
                borderColor: 'white',
                color: 'white',
                backgroundColor: 'transparent',
                fontWeight: isSelected ? 'bold' : 'normal',
                borderWidth: isSelected ? 2 : 1,
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                whiteSpace: 'nowrap'
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
};

export default GlobalCarFilterDropdown;
