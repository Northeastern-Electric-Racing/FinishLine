/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Tab, Tabs } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useLocation, useRouteMatch } from 'react-router-dom';
import { Project, wbsPipe } from 'shared';
import { routes } from '../../../utils/routes';

interface ProjectDetailPageTabProps {
  project: Project;
  setTab: (value: number) => void;
}

// Page block containing project detail tabs
const ProjectDetailTabs = ({ project, setTab }: ProjectDetailPageTabProps) => {
  // Values that go in the URL depending on the tab value, example /projects/0.0.0/scope
  const tabUrlValues = useMemo(() => ['overview', 'tasks', 'scope', 'gantt', 'changes'], []);

  const match = useRouteMatch<{ wbsNum: string; tabValueString: string }>(`${routes.PROJECTS}/:wbsNum/:tabValueString`);
  const tabValueString = match?.params?.tabValueString;
  const wbsNum = wbsPipe(project.wbsNum);

  // Default to the "overview" tab
  const initialTab: number = tabUrlValues.indexOf(tabValueString ?? 'overview');
  const [tabValue, setTabValue] = useState<number>(initialTab);

  // Change tab when the browser forward/back button is pressed
  const { pathname } = useLocation();
  useEffect(() => {
    const newTabValue: number = tabUrlValues.indexOf(tabValueString ?? 'overview');
    setTab(newTabValue);
    setTabValue(newTabValue);
  }, [pathname, setTab, setTabValue, tabUrlValues, tabValueString]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number): void => {
    setTab(newValue);
    setTabValue(newValue);
  };

  return (
    <Tabs
      sx={{ borderBottom: 1, borderColor: 'divider' }}
      value={tabValue}
      onChange={handleTabChange}
      variant="fullWidth"
      aria-label="task-list-tabs"
    >
      <Tab
        label="overview"
        aria-label="overview"
        value={0}
        component={RouterLink}
        to={`${routes.PROJECTS}/${wbsNum}/overview`}
      />
      <Tab
        label="tasks"
        aria-label="tasks"
        value={1}
        component={RouterLink}
        to={`${routes.PROJECTS}/${wbsNum}/tasks/in-progress`}
      />
      <Tab label="scope" aria-label="scope" value={2} component={RouterLink} to={`${routes.PROJECTS}/${wbsNum}/scope`} />
      <Tab label="gantt" aria-label="gantt" value={3} component={RouterLink} to={`${routes.PROJECTS}/${wbsNum}/gantt`} />
      <Tab
        label="changes"
        aria-label="changes"
        value={4}
        component={RouterLink}
        to={`${routes.PROJECTS}/${wbsNum}/changes`}
      />
    </Tabs>
  );
};

export default ProjectDetailTabs;
