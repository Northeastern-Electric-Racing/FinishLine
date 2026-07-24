/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { SxProps, Theme } from '@mui/material';
import { useGetAllCars } from '../../hooks/cars.hooks';
import DropdownSelect from './DropdownSelect';

interface CarDropdownProps {
  /** selected car numbers */
  value: number[];
  onChange: (carNumbers: number[]) => void;
  sx?: SxProps<Theme>;
}

/**
 * Reusable multi-select of cars. Selection is by car number (matches FilterTaskArgs.carNumbers). There
 * are few cars, so this reuses the existing full cars endpoint rather than a dedicated dropdown one.
 */
const CarDropdown: React.FC<CarDropdownProps> = ({ value, onChange, sx }) => {
  const { data: cars, isLoading } = useGetAllCars();

  const options = (cars ?? []).map((car) => ({ key: String(car.wbsNum.carNumber), label: car.name }));

  return (
    <DropdownSelect
      label="Car"
      placeholder="Filter by car"
      options={options}
      selectedKeys={value.map(String)}
      onChange={(keys) => onChange(keys.map(Number))}
      loading={isLoading}
      sx={sx}
    />
  );
};

export default CarDropdown;
