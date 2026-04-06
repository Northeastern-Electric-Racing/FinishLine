/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box } from '@mui/material';
import GlobalCarFilterHeader from './GlobalCarFilterHeader';
import GlobalCarFilterChips from './GlobalCarFilterChips';

interface GlobalCarFilterDropdownProps {
  sx?: object;
}

const GlobalCarFilterDropdown: React.FC<GlobalCarFilterDropdownProps> = ({ sx = {} }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', ...sx }}>
      <GlobalCarFilterHeader />
      <GlobalCarFilterChips />
    </Box>
  );
};

export default GlobalCarFilterDropdown;
