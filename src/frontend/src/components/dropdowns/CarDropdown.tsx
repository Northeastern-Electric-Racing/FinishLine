/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { SxProps, Theme } from '@mui/material';
import { useSlimCars } from '../../hooks/dropdowns.hooks';
import DropdownSelect from './DropdownSelect';

interface CarDropdownProps {
  /** selected car numbers */
  value: number[];
  onChange: (carNumbers: number[]) => void;
  sx?: SxProps<Theme>;
}

/** Reusable multi-select of cars. Selection is by car number (matches FilterTaskArgs.carNumbers). */
const CarDropdown: React.FC<CarDropdownProps> = ({ value, onChange, sx }) => {
  const { data: cars, isLoading } = useSlimCars();

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
