/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import React, { useState } from 'react';
import { Box, Typography, Chip, Collapse, IconButton } from '@mui/material';
import { ExpandMore as ExpandMoreIcon, DirectionsCar as CarIcon } from '@mui/icons-material';
import { Car } from 'shared';
import { useGlobalCarFilter } from '../app/AppGlobalCarFilterContext';
import LoadingIndicator from './LoadingIndicator';

interface GlobalCarFilterDropdownProps {
  compact?: boolean;
  sx?: object;
}

const GlobalCarFilterDropdown: React.FC<GlobalCarFilterDropdownProps> = ({ compact = false, sx = {} }) => {
  const { selectedCar, allCars, setSelectedCar, isLoading, error } = useGlobalCarFilter();
  const [expanded, setExpanded] = useState(true);

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  const handleCarSelect = (car: Car | null) => {
    setSelectedCar(car);
    setExpanded(false);
  };

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

  if (compact) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ...sx }}>
        <Box
          onClick={handleToggle}
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
          <IconButton size="small" sx={{ color: 'white' }}>
            <ExpandMoreIcon
              sx={{
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s'
              }}
            />
          </IconButton>
        </Box>
        <Collapse in={expanded}>
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
              onClick={() => handleCarSelect(null)}
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
              const isSelected = selectedCar ? car.id === selectedCar.id : false;
              return (
                <Chip
                  key={car.id}
                  label={car.name}
                  onClick={() => handleCarSelect(car)}
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
        </Collapse>
      </Box>
    );
  }

  // Non-compact mode (not used in current implementation)
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ...sx }}>
      <Typography variant="caption" sx={{ fontWeight: 500 }}>
        Working with:
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CarIcon fontSize="small" />
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
          {currentCarLabel}
        </Typography>
      </Box>
    </Box>
  );
};

export default GlobalCarFilterDropdown;
