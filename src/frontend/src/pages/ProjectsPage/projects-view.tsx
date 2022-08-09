/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { Project, User } from 'shared';
import { useAllProjects } from '../../services/projects.hooks';
import { fullNamePipe, wbsPipe, weeksPipe } from '../../pipes';
import PrjsTable, { DisplayProject } from './projects-table/projects-table'; // Directly rename the default import
import LoadingIndicator from '../../components/loading-indicator/loading-indicator';
import ProjectsTableFilter from './projects-table-filter/projects-table-filter';
import PageTitle from '../../layouts/page-title/page-title';
import ErrorPage from '../../pages/ErrorPage/error-page';

/***
 * Returns a list of projects that has been filtered according to the given params.
 * @param projects The list of projects to filter.
 * @param carNumber The car the project is focused on.
 * @param status The status of the project.
 * @param projectLeadID The id of the user leading the project.
 * @param projectManagerID The id of the user managing the project.
 * @return The filtered list of projects.
 */
export function filterProjects(
  projects: Project[],
  carNumber: number,
  status: string,
  projectLeadID: number,
  projectManagerID: number
): Project[] {
  const carNumCheck = (project: Project) => {
    return carNumber === project.wbsNum.carNumber;
  };
  const statusCheck = (project: Project) => {
    return project.status === status;
  };
  const leadCheck = (project: Project) => {
    return project.projectLead?.userId === projectLeadID;
  };
  const managerCheck = (project: Project) => {
    return project.projectManager?.userId === projectManagerID;
  };
  if (carNumber !== -1) {
    projects = projects.filter(carNumCheck);
  }
  if (status !== '') {
    projects = projects.filter(statusCheck);
  }
  if (projectLeadID !== -1) {
    projects = projects.filter(leadCheck);
  }
  if (projectManagerID !== -1) {
    projects = projects.filter(managerCheck);
  }
  return projects;
}

/**
 * Parent component for the projects page housing the filter table and projects table.
 */
const ProjectsView: React.FC = () => {
  const [status, setStatus] = useState('');
  const [projectLeadID, setProjectLeadID] = useState(-1);
  const [projectManagerID, setProjectManagerID] = useState(-1);
  const [carNumber, setCarNumber] = useState(-1);
  const { isLoading, isError, data, error } = useAllProjects();

  if (isLoading) return <LoadingIndicator />;

  if (isError) return <ErrorPage message={error?.message} />;

  const transformToDisplayProjects = (projects: Project[]) => {
    return projects.map((prj) => {
      return {
        ...prj,
        wbsNum: wbsPipe(prj.wbsNum),
        name: prj.name,
        projectLead: fullNamePipe(prj.projectLead),
        projectManager: fullNamePipe(prj.projectManager),
        duration: weeksPipe(prj.duration)
      };
    }) as DisplayProject[];
  };

  /**
   * Updates state with data from input parameters.
   * @param status The status of the project.
   * @param projectLeadID The project lead of the project.
   * @param projectManagerID The project manager of the project.
   * @param carNumber The carNumber of the project.
   */
  const sendDataToParent = (
    status: string,
    projectLeadID: number,
    projectManagerID: number,
    carNumber: number
  ) => {
    setStatus(status);
    setProjectLeadID(projectLeadID);
    setProjectManagerID(projectManagerID);
    setCarNumber(carNumber);
  };

  /**
   * Returns an array of Users who are listed as a project's lead.
   */
  const getLeads = (): User[] => {
    const projects = data!;
    const leads: User[] = [];
    const seenList: number[] = [];
    for (const project of projects) {
      if (project.projectLead && !seenList.includes(project.projectLead.userId)) {
        seenList.push(project.projectLead.userId);
        leads.push(project.projectLead);
      }
    }
    return leads;
  };

  /**
   * Returns an array of Users who are listed as a project's managers.
   */
  const getManagers = (): User[] => {
    const projects = data!;
    const managers: User[] = [];
    const seenList: number[] = [];
    for (const project of projects) {
      if (project.projectManager && !seenList.includes(project.projectManager.userId)) {
        seenList.push(project.projectManager.userId);
        managers.push(project.projectManager);
      }
    }
    return managers;
  };

  return (
    <Container fluid>
      <PageTitle title={'Projects'} previousPages={[]} />
      <Row>
        <Col sm={4} md={3} lg={3} xl={2}>
          <ProjectsTableFilter
            onClick={sendDataToParent}
            leads={getLeads()}
            managers={getManagers()}
          />
        </Col>
        <Col>
          <PrjsTable
            allProjects={transformToDisplayProjects(
              filterProjects(data!, carNumber, status, projectLeadID, projectManagerID)
            )}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default ProjectsView;
