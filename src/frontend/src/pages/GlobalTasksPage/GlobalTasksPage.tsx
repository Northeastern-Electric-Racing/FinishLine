/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { TextField } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import { useGlobalCarFilter } from '../../app/AppGlobalCarFilterContext';
import { TaskListContent } from '../ProjectDetailPage/ProjectViewContainer/TaskList/v2/TaskListContent';
import { useTaskFilters } from '../../hooks/task-filters.hooks';

/**
 * Top-level page showing every task across the organization, driven by a rich filter bar. Reuses the
 * same kanban board (drag-to-move, create, etc.) as the project and work package task views.
 */
const GlobalTasksPage: React.FC = () => {
  const { selectedCar, allCars } = useGlobalCarFilter();
  // filters are owned here so the search box can live in the page header while the dropdowns live on the board
  const { filters, patch } = useTaskFilters({ persistKey: 'globalTaskFilters' });

  const hasGlobalCar = selectedCar !== 'all-cars';
  // when a global car is selected we scope to it and hide the car dropdown; otherwise the user picks
  const forcedCarNumbers = hasGlobalCar ? [selectedCar.wbsNum.carNumber] : undefined;

  // the car a newly-created task should belong to: the selected car, or the most recent one
  const mostRecentCar =
    allCars.length > 0 ? allCars.reduce((a, b) => (a.wbsNum.carNumber > b.wbsNum.carNumber ? a : b)) : undefined;
  const createCar = hasGlobalCar ? selectedCar : mostRecentCar;
  const projectCarNumbers = createCar ? [createCar.wbsNum.carNumber] : undefined;

  return (
    <PageLayout
      title="Global Task Kanban"
      headerRight={
        <TextField
          size="small"
          placeholder="Search tasks"
          value={filters.search}
          onChange={(event) => patch({ search: event.target.value })}
          sx={{ minWidth: 260 }}
        />
      }
    >
      <TaskListContent
        context="global"
        showCarDropdown={!hasGlobalCar}
        forcedCarNumbers={forcedCarNumbers}
        projectCarNumbers={projectCarNumbers}
        filters={filters}
        patch={patch}
      />
    </PageLayout>
  );
};

export default GlobalTasksPage;
