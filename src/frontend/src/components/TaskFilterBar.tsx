/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box } from '@mui/material';
import { WbsNumber } from 'shared';
import { TaskFilterFields } from '../hooks/task-filters.hooks';
import CarDropdown from './dropdowns/CarDropdown';
import ProjectDropdown from './dropdowns/ProjectDropdown';
import WorkPackageDropdown from './dropdowns/WorkPackageDropdown';
import AssigneeDropdown from './dropdowns/AssigneeDropdown';
import TeamDropdown from './dropdowns/TeamDropdown';
import LabelDropdown from './dropdowns/LabelDropdown';

export type TaskFilterContext = 'global' | 'project' | 'workPackage';

interface TaskFilterBarProps {
  context: TaskFilterContext;
  filters: TaskFilterFields;
  patch: (partial: Partial<TaskFilterFields>) => void;
  /** global only: show the car dropdown (hidden when a global car is already selected) */
  showCarDropdown?: boolean;
  /** project only: constrain the work package dropdown to this project's work packages */
  scopeProjectWbsNum?: WbsNumber;
}

// each control flexes to an equal share of the single filter row, shrinking so they all stay on one row
const fieldSx = { flex: '1 1 0', minWidth: 0 };

/**
 * Shared dropdown filter bar for every task board. Which controls appear depends on the context:
 *  - global: car (optional), project, work package, assignee, team, label
 *  - project: work package, assignee, team, label
 *  - workPackage: assignee, team, label
 * Each control OR's within its own selections; the backend AND's across the different controls. The
 * fuzzy text search is intentionally not here — it lives beside the board and filters loaded tasks.
 */
const TaskFilterBar: React.FC<TaskFilterBarProps> = ({
  context,
  filters,
  patch,
  showCarDropdown = false,
  scopeProjectWbsNum
}) => {
  const showCar = context === 'global' && showCarDropdown;
  const showProject = context === 'global';
  const showWorkPackage = context === 'global' || context === 'project';

  // constrain the work package options: to the selected projects on the global page, or to the page's
  // own project on a project board
  const workPackageScope = context === 'global' ? filters.projectWbsNums : scopeProjectWbsNum ? [scopeProjectWbsNum] : [];

  return (
    <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: 2, mb: 2 }}>
      {showCar && <CarDropdown value={filters.carNumbers} onChange={(carNumbers) => patch({ carNumbers })} sx={fieldSx} />}
      {showProject && (
        <ProjectDropdown
          value={filters.projectWbsNums}
          onChange={(projectWbsNums) => patch({ projectWbsNums })}
          carNumbers={filters.carNumbers}
          sx={fieldSx}
        />
      )}
      {showWorkPackage && (
        <WorkPackageDropdown
          value={filters.workPackageWbsNums}
          onChange={(workPackageWbsNums) => patch({ workPackageWbsNums })}
          projectWbsNums={workPackageScope}
          sx={fieldSx}
        />
      )}
      <AssigneeDropdown value={filters.memberIds} onChange={(memberIds) => patch({ memberIds })} sx={fieldSx} />
      <TeamDropdown value={filters.teamIds} onChange={(teamIds) => patch({ teamIds })} sx={fieldSx} />
      <LabelDropdown value={filters.labelIds} onChange={(labelIds) => patch({ labelIds })} sx={fieldSx} />
    </Box>
  );
};

export default TaskFilterBar;
