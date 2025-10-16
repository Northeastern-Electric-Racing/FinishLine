/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import React from 'react';
import { Box, Typography, Tooltip, FormControl, FormLabel } from '@mui/material';
import { HelpOutline as HelpIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import NERAutocomplete from './NERAutocomplete';
import type { FinanceDashboardCarFilter as FinanceDashboardCarFilterType } from '../hooks/finance-car-filter.hooks';

interface FinanceDashboardCarFilterProps {
  filter: FinanceDashboardCarFilterType;
  sx?: object;
  size?: 'small' | 'medium';
  controlSx?: object;
}

const FinanceDashboardCarFilterComponent: React.FC<FinanceDashboardCarFilterProps> = ({
  filter,
  sx = {},
  size = 'small',
  controlSx = {}
}) => {
  const { selectedCar, allCars, startDate, endDate, setSelectedCar, setStartDate, setEndDate, isLoading } = filter;

  const sortedCars = [...allCars].sort((a, b) => b.wbsNum.carNumber - a.wbsNum.carNumber);

  const carAutocompleteOptions = sortedCars.map((car) => ({
    label: car.wbsNum.carNumber === 0 ? car.name : `${car.name} (Car ${car.wbsNum.carNumber})`,
    id: car.id,
    carNumber: car.wbsNum.carNumber
  }));

  const handleCarChange = (_event: any, newValue: any) => {
    if (newValue) {
      const car = allCars.find((c) => c.id === newValue.id);
      setSelectedCar(car || null);
    } else {
      setSelectedCar(null);
    }
  };

  const selectedCarOption = selectedCar ? carAutocompleteOptions.find((option) => option.id === selectedCar.id) : null;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ...sx }}>
        <Typography variant="body2">Loading car data...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 2,
        flexWrap: 'wrap',
        ...sx
      }}
    >
      <FormControl>
        <FormLabel sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
          Car Filter
          <Tooltip
            title="Select a car to filter finance data. When you select a car, the start and end dates will automatically populate based on that car's timeline."
            placement="top"
          >
            <HelpIcon fontSize="small" color="action" />
          </Tooltip>
        </FormLabel>
        <NERAutocomplete
          id="finance-car-filter"
          onChange={handleCarChange}
          options={carAutocompleteOptions}
          size={size}
          placeholder="Select A Car"
          value={selectedCarOption}
          sx={{ minWidth: 200, ...controlSx }}
        />
      </FormControl>

      <FormControl>
        <FormLabel sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
          Start Date
          <Tooltip
            title="Start date filters for car-specific data and non-car/category data (e.g., competitions, food, etc.). Auto-populated when you select a car."
            placement="top"
          >
            <HelpIcon fontSize="small" color="action" />
          </Tooltip>
        </FormLabel>
        <DatePicker
          label="Start Date"
          value={startDate}
          maxDate={endDate || undefined}
          shouldDisableDate={(date) => (endDate ? date > endDate : false)}
          slotProps={{
            textField: {
              size,
              sx: { minWidth: 150, ...controlSx }
            },
            field: { clearable: true }
          }}
          onChange={(newValue: Date | null) => setStartDate(newValue ?? undefined)}
        />
      </FormControl>

      <FormControl>
        <FormLabel sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
          End Date
          <Tooltip
            title="End date filters for car-specific data and non-car/category data. Auto-populated as today's date for current car, or the next car's start date for previous cars."
            placement="top"
          >
            <HelpIcon fontSize="small" color="action" />
          </Tooltip>
        </FormLabel>
        <DatePicker
          label="End Date"
          value={endDate}
          minDate={startDate || undefined}
          shouldDisableDate={(date) => (startDate ? date < startDate : false)}
          slotProps={{
            textField: {
              size,
              sx: { minWidth: 150, ...controlSx }
            },
            field: { clearable: true }
          }}
          onChange={(newValue: Date | null) => setEndDate(newValue ?? undefined)}
        />
      </FormControl>

      {selectedCar && (
        <Box sx={{ ml: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            Filtering by: {selectedCar.name}
          </Typography>
          {startDate && endDate && (
            <Typography variant="caption" color="primary">
              {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default FinanceDashboardCarFilterComponent;
