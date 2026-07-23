/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { SxProps, Theme } from '@mui/material';
import { WbsNumber, wbsPipe } from 'shared';
import { useSlimProjects } from '../../hooks/dropdowns.hooks';
import DropdownSelect from './DropdownSelect';

interface ProjectDropdownProps {
  /** selected project wbs numbers */
  value: WbsNumber[];
  onChange: (projectWbsNums: WbsNumber[]) => void;
  /** if provided, only show projects belonging to these car numbers */
  carNumbers?: number[];
  /** false renders a single-select (value holds 0 or 1 wbs number) */
  multiple?: boolean;
  sx?: SxProps<Theme>;
}

/** Reusable select of projects. Selection is by project WBS number (FilterTaskArgs.projectWbsNums). */
const ProjectDropdown: React.FC<ProjectDropdownProps> = ({ value, onChange, carNumbers, multiple = true, sx }) => {
  const { data: projects, isLoading } = useSlimProjects();

  const visible = (projects ?? []).filter(
    (project) => !carNumbers || carNumbers.length === 0 || carNumbers.includes(project.carNumber)
  );
  const options = visible.map((project) => ({ key: wbsPipe(project.wbsNum), label: project.name }));

  return (
    <DropdownSelect
      label="Project"
      placeholder="Filter by project"
      options={options}
      multiple={multiple}
      selectedKeys={value.map(wbsPipe)}
      onChange={(keys) => onChange(visible.filter((project) => keys.includes(wbsPipe(project.wbsNum))).map((p) => p.wbsNum))}
      loading={isLoading}
      sx={sx}
    />
  );
};

export default ProjectDropdown;
