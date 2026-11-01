/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { GANTT_TIME_WINDOWS, GanttTimeWindow } from '../../../utils/gantt.utils';

interface GanttTimeWindowDropdownProps {
  timeWindow: GanttTimeWindow;
  onChange: (timeWindow: GanttTimeWindow) => void;
}

const GanttTimeWindowDropdown: React.FC<GanttTimeWindowDropdownProps> = ({ timeWindow, onChange }) => {
  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <InputLabel id="gantt-time-window">View</InputLabel>
      <Select
        label="View"
        labelId="gantt-time-window"
        value={timeWindow}
        onChange={(e) => onChange(e.target.value as GanttTimeWindow)}
      >
        {Object.values(GanttTimeWindow).map((window) => (
          <MenuItem key={window} value={window}>
            {GANTT_TIME_WINDOWS[window].label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default GanttTimeWindowDropdown;
