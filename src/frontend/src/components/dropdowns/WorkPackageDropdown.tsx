/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { SxProps, Theme } from '@mui/material';
import { WbsNumber, wbsPipe } from 'shared';
import { useWorkPackagesDropdown } from '../../hooks/dropdowns.hooks';
import DropdownSelect from './DropdownSelect';

interface WorkPackageDropdownProps {
  /** selected work package wbs numbers */
  value: WbsNumber[];
  onChange: (workPackageWbsNums: WbsNumber[]) => void;
  /** if provided, only show work packages belonging to these projects */
  projectWbsNums?: WbsNumber[];
  sx?: SxProps<Theme>;
}

/** Reusable multi-select of work packages (FilterTaskArgs.workPackageWbsNums). */
const WorkPackageDropdown: React.FC<WorkPackageDropdownProps> = ({ value, onChange, projectWbsNums, sx }) => {
  const { data: workPackages, isLoading } = useWorkPackagesDropdown();

  const projectKeys = (projectWbsNums ?? []).map((wbs) => `${wbs.carNumber}.${wbs.projectNumber}`);
  const selectedKeys = value.map(wbsPipe);
  // show every work package in the selected projects, plus any already-selected work package (so a
  // selection stays visible/removable even if its project isn't currently in the project filter)
  const visible = (workPackages ?? []).filter(
    (wp) =>
      projectKeys.length === 0 ||
      projectKeys.includes(`${wp.wbsNum.carNumber}.${wp.wbsNum.projectNumber}`) ||
      selectedKeys.includes(wbsPipe(wp.wbsNum))
  );
  const options = visible.map((wp) => ({ key: wbsPipe(wp.wbsNum), label: `${wbsPipe(wp.wbsNum)} - ${wp.name}` }));

  return (
    <DropdownSelect
      label="Work Package"
      placeholder="Filter by work package"
      options={options}
      selectedKeys={selectedKeys}
      onChange={(keys) => onChange(visible.filter((wp) => keys.includes(wbsPipe(wp.wbsNum))).map((wp) => wp.wbsNum))}
      loading={isLoading}
      sx={sx}
    />
  );
};

export default WorkPackageDropdown;
