/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import React, { useState } from 'react';
import { Box, Typography, Menu, MenuItem, Chip, Tooltip, Paper, useTheme } from '@mui/material';
import { ExpandMore as ExpandMoreIcon, DirectionsCar as CarIcon, HelpOutline as HelpIcon } from '@mui/icons-material';
import { useGlobalCarFilter } from '../app/AppGlobalCarFilterContext';
import LoadingIndicator from './LoadingIndicator';

interface GlobalCarFilterDropdownProps {
  compact?: boolean;
  sx?: object;
}

const GlobalCarFilterDropdown: React.FC<GlobalCarFilterDropdownProps> = ({ compact = false, sx = {} }) => {
  const theme = useTheme();
  const { selectedCar, allCars, setSelectedCar, isLoading, error } = useGlobalCarFilter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCarSelect = (car: any) => {
    setSelectedCar(car);
    handleClose();
  };

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (error || !selectedCar) {
    return (
      <Box sx={{ p: 1, ...sx }}>
        <Typography variant="body2" color="error">
          {error?.message || 'No car selected'}
        </Typography>
      </Box>
    );
  }

  const sortedCars = [...allCars].sort((a, b) => b.wbsNum.carNumber - a.wbsNum.carNumber);

  const currentCarLabel = selectedCar.wbsNum.carNumber === 0 ? selectedCar.name : `Car ${selectedCar.wbsNum.carNumber}`;

  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ...sx }}>
        <CarIcon fontSize="small" />
        <Chip
          label={currentCarLabel}
          onClick={handleClick}
          onDelete={handleClick}
          deleteIcon={<ExpandMoreIcon />}
          variant="outlined"
          size="small"
          sx={{
            borderColor: theme.palette.primary.main,
            color: theme.palette.primary.main,
            '& .MuiChip-deleteIcon': {
              color: theme.palette.primary.main
            }
          }}
        />
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{
            style: {
              maxHeight: 300,
              minWidth: 200
            }
          }}
        >
          {sortedCars.map((car) => (
            <MenuItem key={car.id} selected={car.id === selectedCar.id} onClick={() => handleCarSelect(car)}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Typography variant="body2" fontWeight="bold">
                  {car.wbsNum.carNumber === 0 ? car.name : `Car ${car.wbsNum.carNumber}`}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {car.name}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Menu>
      </Box>
    );
  }

  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...sx
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CarIcon color="primary" />
        <Box>
          <Typography variant="subtitle2" fontWeight="bold">
            Global Car Filter
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedCar.name}
          </Typography>
        </Box>
        <Tooltip
          title="Filter data across all pages by selecting a car. This will only last for your current session."
          placement="top"
        >
          <HelpIcon fontSize="small" color="action" />
        </Tooltip>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip
          label={currentCarLabel}
          onClick={handleClick}
          onDelete={handleClick}
          deleteIcon={<ExpandMoreIcon />}
          color="primary"
          variant="outlined"
        />

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{
            style: {
              maxHeight: 400,
              minWidth: 250
            }
          }}
        >
          {sortedCars.map((car) => (
            <MenuItem
              key={car.id}
              selected={car.id === selectedCar.id}
              onClick={() => handleCarSelect(car)}
              sx={{ py: 1.5 }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
                <Typography variant="body1" fontWeight="bold">
                  {car.wbsNum.carNumber === 0 ? car.name : `Car ${car.wbsNum.carNumber}`}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {car.name}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  Created: {car.dateCreated.toLocaleDateString()}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Menu>
      </Box>
    </Paper>
  );
};

export default GlobalCarFilterDropdown;
