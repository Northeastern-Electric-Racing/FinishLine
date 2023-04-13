/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Tab, Tabs } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useRouteMatch } from 'react-router-dom';
import { Project, wbsPipe } from 'shared';
import { routes } from '../../../../utils/routes';

interface ProjectDetailPageTabProps {
  project: Project;
}

// Page block containing task list view
const ProjectDetailTabs = ({ project }: ProjectDetailPageTabProps) => {
  // Values that go in the URL depending on the tab value, example /projects/0.0.0/in-progress
  const tabUrlValues = useMemo(() => ['Overview', 'Tasks', 'Scope', 'Gantt', 'Changes'], []);

  const match = useRouteMatch<{ wbsNum: string; tabValueString: string }>(`${routes.PROJECTS}/:wbsNum/:tabValueString`);
  const tabValueString = match?.params?.tabValueString;
  const wbsNum = wbsPipe(project.wbsNum);

  // Default to the "overview" tab
  const initialValue: number = tabUrlValues.indexOf(tabValueString ?? 'Overview');
  const [value, setValue] = useState<number>(initialValue);

  // Change tab when the browser forward/back button is pressed
  const { pathname } = useLocation();
  useEffect(() => {
    const newTabValue: number = tabUrlValues.indexOf(tabValueString ?? 'Overview');
    setValue(newTabValue);
  }, [pathname, setValue, tabUrlValues, tabValueString]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number): void => {
    setValue(newValue);
  };

  return (
    <Tabs value={value} onChange={handleTabChange} variant="fullWidth" aria-label="task-list-tabs">
      <Tab label="Overview" aria-label="Overview" value={0} component={Link} to={`${routes.PROJECTS}/${wbsNum}/Overview`} />
      <Tab label="Tasks" aria-label="Tasks" value={1} component={Link} to={`${routes.PROJECTS}/${wbsNum}/Tasks`} />
      <Tab label="Scope" aria-label="Scope" value={2} component={Link} to={`${routes.PROJECTS}/${wbsNum}/Scope`} />
      <Tab label="Gantt" aria-label="Gantt" value={3} component={Link} to={`${routes.PROJECTS}/${wbsNum}/Gantt`} />
      <Tab label="Changes" aria-label="Changes" value={4} component={Link} to={`${routes.PROJECTS}/${wbsNum}/Changes`} />
    </Tabs>
  );
};

export default ProjectDetailTabs;
