/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState } from 'react';
import ProjectsTable from './ProjectsTable';
import { routes } from '../../utils/routes';
import ProjectsOverview from './ProjectsOverview';
import PageLayout from '../../components/PageLayout';
import NERTabs from '../../components/Tabs';

/**
 * Cards of all projects that this user is in their team.
 */

const ProjectsPage: React.FC = () => {
  const [tabIndex, setTabIndex] = useState<number>(0);

  return (
    <PageLayout
      title="Projects"
      tabs={
        <NERTabs
          setTab={setTabIndex}
          tabsLabels={[
            { tabUrlValue: 'overview', tabName: 'Overview' },
            { tabUrlValue: 'all', tabName: 'All Projects' }
          ]}
          baseUrl={routes.PROJECTS}
          defaultTab="overview"
          id="project-tabs"
        />
      }
    >
      {tabIndex === 0 ? <ProjectsOverview /> : <ProjectsTable />}
    </PageLayout>
  );
};

export default ProjectsPage;
