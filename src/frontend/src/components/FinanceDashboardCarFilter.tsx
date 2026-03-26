/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import React from 'react';
import { Box, Tooltip, Typography, FormControl, FormLabel } from '@mui/material';
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

const ALL_CARS_ID = '__ALL_CARS__';
const ALL_CARS_OPTION = { label: 'All Cars', id: ALL_CARS_ID, carNumber: -1 };

const inputStyle = {
  '.MuiInputBase-root': {
    height: '36px',
    padding: '0 8px',
    backgroundColor: '#ef4345',
    color: 'white',
    fontSize: '13px',
    borderRadius: '4px',
    '&:hover': { backgroundColor: '#ef4345' },
    '&.Mui-focused': { backgroundColor: '#ef4345', color: 'white' }
  },
  '& .MuiInputBase-input': {
    color: 'white',
    paddingTop: '8px',
    cursor: 'pointer',
    '&:focus': { color: 'white' }
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: '1px solid #fff',
    '&:hover': { borderColor: '#fff' },
    '&.Mui-focused': { borderColor: '#fff' }
  },
  '& .MuiSvgIcon-root': {
    color: 'white',
    '&:hover': { color: 'white' },
    '&.Mui-focused': { color: 'white' }
  }
};

const labelStyle = { display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5, color: 'white' };

const FinanceDashboardCarFilterComponent: React.FC<FinanceDashboardCarFilterProps> = ({
  filter,
  sx = {},
  size = 'small',
  controlSx = {}
}) => {
  const {
    selectedCar,
    allCars,
    startDate,
    endDate,
    setSelectedCar,
    clearLocalSelection,
    setStartDate,
    setEndDate,
    isLoading
  } = filter;

  const sortedCars = [...allCars].sort((a, b) => b.wbsNum.carNumber - a.wbsNum.carNumber);

  const carOptions = sortedCars.map((car) => ({
    label: car.wbsNum.carNumber === 0 ? car.name : `${car.name} (Car ${car.wbsNum.carNumber})`,
    id: car.id,
    carNumber: car.wbsNum.carNumber
  }));

  const carAutocompleteOptions = [ALL_CARS_OPTION, ...carOptions];

  const handleCarChange = (_event: any, newValue: any) => {
    if (newValue === null) {
      // User cleared the input (X button), re-mirror global
      clearLocalSelection();
    } else if (newValue.id === ALL_CARS_ID) {
      // Explicit "All Cars" override, bypass global filter entirely
      setSelectedCar(null);
    } else {
      const car = allCars.find((c) => c.id === newValue.id);
      if (car) setSelectedCar(car);
    }
  };

  const selectedCarOption = !selectedCar
    ? ALL_CARS_OPTION
    : (carOptions.find((option) => option.id === selectedCar.id) ?? null);

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
        gap: 1,
        flexWrap: 'wrap',
        ...sx
      }}
    >
      <FormControl>
        <FormLabel sx={labelStyle}>
          Car Filter
          <Tooltip
            title="Select a car to filter finance data. When you select a car, the start and end dates will automatically populate based on that car's timeline. Select 'All Cars' to show data for all cars."
            placement="top"
          >
            <HelpIcon fontSize="small" sx={{ color: 'white' }} />
          </Tooltip>
        </FormLabel>
        <NERAutocomplete
          id="finance-car-filter"
          onChange={handleCarChange}
          options={carAutocompleteOptions}
          size={size}
          placeholder="Select A Car"
          value={selectedCarOption}
          sx={{ width: 160, ...inputStyle, ...controlSx }}
        />
      </FormControl>

      <FormControl>
        <FormLabel sx={labelStyle}>
          Start Date
          <Tooltip
            title="Start date filters for car-specific data and non-car/category data (e.g., competitions, food, etc.). Auto-populated when you select a car."
            placement="top"
          >
            <HelpIcon fontSize="small" sx={{ color: 'white' }} />
          </Tooltip>
        </FormLabel>
        <DatePicker
          value={startDate}
          maxDate={endDate || undefined}
          shouldDisableDate={(date) => (endDate ? date > endDate : false)}
          slotProps={{
            textField: { size, sx: { width: 180, ...inputStyle, ...controlSx } },
            field: { clearable: true }
          }}
          onChange={(newValue: Date | null) => setStartDate(newValue ?? undefined)}
        />
      </FormControl>

      <FormControl>
        <FormLabel sx={labelStyle}>
          End Date
          <Tooltip
            title="End date filters for car-specific data and non-car/category data. Auto-populated as today's date for current car, or the next car's start date for previous cars."
            placement="top"
          >
            <HelpIcon fontSize="small" sx={{ color: 'white' }} />
          </Tooltip>
        </FormLabel>
        <DatePicker
          value={endDate}
          minDate={startDate || undefined}
          shouldDisableDate={(date) => (startDate ? date < startDate : false)}
          slotProps={{
            textField: { size, sx: { width: 180, ...inputStyle, ...controlSx } },
            field: { clearable: true }
          }}
          onChange={(newValue: Date | null) => setEndDate(newValue ?? undefined)}
        />
      </FormControl>
    </Box>
  );
};

export default FinanceDashboardCarFilterComponent;
