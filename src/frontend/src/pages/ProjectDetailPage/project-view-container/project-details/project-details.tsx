/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Col, Container, Row } from 'react-bootstrap';
import {
  faFilePowerpoint,
  faFolderOpen,
  faList,
  faListOl
} from '@fortawesome/free-solid-svg-icons';
import { Project } from 'shared';
import {
  datePipe,
  dollarsPipe,
  emDashPipe,
  endDatePipe,
  fullNamePipe,
  weeksPipe
} from '../../../../pipes';
import ExternalLink from '../../../../components/external-link/external-link';
import WbsStatus from '../../../../components/wbs-status/wbs-status';
import PageBlock from '../../../../layouts/page-block/page-block';

interface ProjectDetailsProps {
  project: Project;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project }) => {
  const start =
    project.workPackages.length > 0
      ? datePipe(
          project.workPackages.reduce(
            (min, cur) => (cur.startDate < min ? cur.startDate : min),
            project.workPackages[0].startDate
          )
        )
      : 'n/a';
  const end =
    project.workPackages.length > 0
      ? endDatePipe(
          project.workPackages.reduce(
            (min, cur) => (cur.startDate < min ? cur.startDate : min),
            project.workPackages[0].startDate
          ),
          project.workPackages.reduce((tot, cur) => tot + cur.duration, 0)
        )
      : 'n/a';

  const allColsStyle = 'mb-2';
  return (
    <PageBlock title={'Project Details'} headerRight={<WbsStatus status={project.status} />}>
      <Container fluid>
        <Row>
          <Col className={allColsStyle} md={5} lg={4} xl={3}>
            <b>Project Lead:</b> {fullNamePipe(project.projectLead)}
          </Col>
          <Col className={allColsStyle} md={6} lg={4} xl={3}>
            <b>Project Manager:</b> {fullNamePipe(project.projectManager)}
          </Col>
          <Col className={allColsStyle} sm={4} md={4} lg={2} xl={2}>
            <b>Duration:</b> {weeksPipe(project.duration)}
          </Col>
          <Col className={allColsStyle} sm={4} md={4} lg={4} xl={2}>
            <b>Start Date:</b> {start}
          </Col>
          <Col className={allColsStyle} sm={4} md={4} lg={3} xl={2}>
            <b>End Date:</b> {end}
          </Col>
        </Row>
        <Row>
          <Col className={allColsStyle} sm={4} md={4} lg={4} xl={3}>
            <b>Budget:</b> {dollarsPipe(project.budget)}
          </Col>
          <Col className={allColsStyle} sm={4} md={4} lg={4} xl={3}>
            <b>Expected Progress:</b> {emDashPipe('')}
          </Col>
          <Col className={allColsStyle} sm={4} md={4} lg={4} xl={2}>
            <b>Timeline Status:</b> {emDashPipe('')}
          </Col>
        </Row>
        <Row className={`${allColsStyle} pl-3`}>
          <b>Links:</b>
          <ExternalLink
            icon={faFilePowerpoint}
            link={project.slideDeckLink!}
            description={'Slide Deck'}
          />
          <ExternalLink icon={faList} link={project.taskListLink!} description={'Task List'} />
          <ExternalLink icon={faListOl} link={project.bomLink!} description={'BOM'} />
          <ExternalLink
            icon={faFolderOpen}
            link={project.gDriveLink!}
            description={'Google Drive'}
          />
        </Row>
      </Container>
    </PageBlock>
  );
};

export default ProjectDetails;
