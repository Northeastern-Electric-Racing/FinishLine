/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';
import PageLayout from '../../components/PageLayout';
import { useGlobalCarFilter } from '../../app/AppGlobalCarFilterContext';
import { TaskListContent } from '../ProjectDetailPage/ProjectViewContainer/TaskList/v2/TaskListContent';
import { useTaskFilters } from '../../hooks/task-filters.hooks';
import { useUserDashboards } from '../../hooks/dashboards.hooks';
import DashboardCard from './DashboardCard';
import DashboardFormModal from './DashboardFormModal';

/**
 * Top-level page showing every task across the organization, driven by a rich filter bar. Reuses the
 * same kanban board (drag-to-move, create, etc.) as the project and work package task views.
 */
const GlobalTasksPage: React.FC = () => {
  const { selectedCar, allCars } = useGlobalCarFilter();
  // filters are owned here so the search box can live in the page header while the dropdowns live on the board
  const { filters, patch } = useTaskFilters({ persistKey: 'globalTaskFilters' });

  // the current filters are fully encoded in the URL, so a dashboard just saves this relative path
  const location = useLocation();
  const currentLink = location.pathname + location.search;
  const { data: dashboards } = useUserDashboards();
  const [showSaveDashboardModal, setShowSaveDashboardModal] = useState(false);

  const hasGlobalCar = selectedCar !== 'all-cars';
  // when a global car is selected we scope to it and hide the car dropdown; otherwise the user picks
  const forcedCarNumbers = hasGlobalCar ? [selectedCar.wbsNum.carNumber] : undefined;

  // the car a newly-created task should belong to: the selected car, or the most recent one
  const mostRecentCar =
    allCars.length > 0 ? allCars.reduce((a, b) => (a.wbsNum.carNumber > b.wbsNum.carNumber ? a : b)) : undefined;
  const createCar = hasGlobalCar ? selectedCar : mostRecentCar;
  const projectCarNumbers = createCar ? [createCar.wbsNum.carNumber] : undefined;

  return (
    <PageLayout title="Global Task Kanban" hidePageTitle>
      {/* header: title flexes to its text on the left, dashboards scroll in the middle, save button on the right */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 2, mb: 2 }}>
        <Typography variant="h4" fontSize={30} sx={{ flexShrink: 0 }}>
          Global Task Kanban
        </Typography>
        <Stack direction="row" spacing={1} sx={{ flex: 1, minWidth: 0, overflowX: 'auto', px: 2, py: 1.5 }}>
          {dashboards?.map((dashboard) => (
            <DashboardCard
              key={dashboard.dashboardId}
              dashboard={dashboard}
              currentLink={currentLink}
              selected={dashboard.link === currentLink}
            />
          ))}
        </Stack>
        <Button variant="contained" sx={{ flexShrink: 0 }} onClick={() => setShowSaveDashboardModal(true)}>
          Save Dashboard
        </Button>
      </Stack>
      <Box>
        <TaskListContent
          context="global"
          showCarDropdown={!hasGlobalCar}
          forcedCarNumbers={forcedCarNumbers}
          projectCarNumbers={projectCarNumbers}
          filters={filters}
          patch={patch}
        />
        <DashboardFormModal
          showModal={showSaveDashboardModal}
          handleClose={() => setShowSaveDashboardModal(false)}
          currentLink={currentLink}
        />
      </Box>
    </PageLayout>
  );
};

export default GlobalTasksPage;
