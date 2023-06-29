/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useEffect, useMemo, useState } from 'react';
import { Tab, Tabs } from '@mui/material';
import ProjectsTable from './ProjectsTable';
import { Link as RouterLink, useLocation, useRouteMatch } from 'react-router-dom';
import { routes } from '../../utils/routes';
import ProjectsOverview from './ProjectsOverview';
import PageLayout from '../../components/PageLayout';

/**
 * Cards of all projects that this user is in their team.
 */

const ProjectsPage: React.FC = () => {
  // Values that go in the URL depending on the tab value
  const viewUrlValues = useMemo(() => ['overview', 'all'], []);

  const match = useRouteMatch<{ tabValueString: string }>(`${routes.PROJECTS}/:tabValueString`);
  const tabValueString = match?.params?.tabValueString;

  // Default to the "overview" tab
  const initialValue: number = viewUrlValues.indexOf(tabValueString ?? 'overview');
  const [tabIndex, setTabIndex] = useState<number>(initialValue);

  // Change tab when the browser forward/back button is pressed
  const { pathname } = useLocation();
  useEffect(() => {
    const newTabValue: number = viewUrlValues.indexOf(tabValueString ?? 'overview');
    setTabIndex(newTabValue);
  }, [pathname, setTabIndex, viewUrlValues, tabValueString]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number): void => {
    setTabIndex(newValue);
  };

  const tabs = (
    <Tabs value={tabIndex} onChange={handleTabChange} variant="standard" aria-label="projects-tabs">
      <Tab label="Overview" aria-label="overview" value={0} component={RouterLink} to={`${routes.PROJECTS_OVERVIEW}`} />
      <Tab label="All Projects" aria-label="all-projects" value={1} component={RouterLink} to={`${routes.PROJECTS_ALL}`} />
    </Tabs>
  );

  return (
    <PageLayout title="Projects" tabs={tabs}>
      {tabIndex === 0 ? <ProjectsOverview /> : <ProjectsTable />}
    </PageLayout>
  );
};

export default ProjectsPage;
