/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Chip, Typography } from '@mui/material';
import { useGlobalCarFilter } from '../app/AppGlobalCarFilterContext';

interface GlobalCarFilterChipsProps {
  sx?: object;
}

const GlobalCarFilterChips: React.FC<GlobalCarFilterChipsProps> = ({ sx = {} }) => {
  const { selectedCar, allCars, setSelectedCar, isLoading, error } = useGlobalCarFilter();

  if (isLoading || error) return null;

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

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        overflowX: 'auto',
        py: 1,
        '&::-webkit-scrollbar': { height: 6 },
        '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3 },
        ...sx
      }}
    >
      <Chip
        label="All Cars"
        onClick={() => setSelectedCar('all-cars')}
        variant="outlined"
        sx={{
          borderColor: 'white',
          color: 'white',
          backgroundColor: 'transparent',
          fontWeight: selectedCar === 'all-cars' ? 'bold' : 'normal',
          borderWidth: selectedCar === 'all-cars' ? 2 : 1,
          '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
          whiteSpace: 'nowrap'
        }}
      />
      {sortedCars.map((car) => {
        const isSelected = selectedCar !== 'all-cars' && selectedCar.id === car.id;
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
  );
};

export default GlobalCarFilterChips;
