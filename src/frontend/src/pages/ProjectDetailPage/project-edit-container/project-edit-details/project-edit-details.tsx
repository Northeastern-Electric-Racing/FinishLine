/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Project, User, WbsElementStatus } from 'shared';
import { Col, Container, Row, Form, InputGroup } from 'react-bootstrap';
import { fullNamePipe, emDashPipe } from '../../../../pipes';
import PageBlock from '../../../../layouts/page-block/page-block';

// new parts added at the bottom
interface projectDetailsProps {
  project: Project;
  users: User[];
  updateSlideDeck: (val: string) => void;
  updateTaskList: (val: string) => void;
  updateBom: (val: string) => void;
  updateGDrive: (val: string) => void;
  updateName: (val: string) => void;
  updateBudget: (val: string) => void;
  updateStatus: (val: WbsElementStatus) => void;
  updateProjectLead: (val: number) => void;
  updateProjectManager: (val: number) => void;
}

const ProjectEditDetails: React.FC<projectDetailsProps> = ({
  project,
  users,
  updateSlideDeck,
  updateTaskList,
  updateBom,
  updateGDrive,
  updateName,
  updateBudget,
  updateStatus,
  updateProjectLead,
  updateProjectManager
}) => {
  const statuses = Object.values(WbsElementStatus).filter((status) => status !== project.status);
  const editDetailsInputBuilder = (
    title: string,
    type: string,
    defaultValue: any,
    updateState: ((val: string) => void) | null,
    prefix = '',
    suffix = '',
    placeholder = '',
    readOnly = false
  ) => {
    return (
      <Form.Group>
        <Form.Label>{title}</Form.Label>
        <InputGroup>
          {prefix ? <InputGroup.Text>{prefix}</InputGroup.Text> : <></>}
          <Form.Control
            required
            type={type}
            min={0}
            defaultValue={defaultValue}
            placeholder={placeholder}
            readOnly={readOnly}
            onChange={(e) => {
              if (updateState !== null) {
                updateState(e.target.value);
              }
            }}
          />
          {suffix ? <InputGroup.Text>{suffix}</InputGroup.Text> : <></>}
        </InputGroup>
      </Form.Group>
    );
  };

  const statusSelect = (
    <Form.Control
      as="select"
      data-testid="status-select"
      onChange={(e) => updateStatus(e.target.value as WbsElementStatus)}
      custom
    >
      <option key={0} value={project.status}>
        {project.status}
      </option>
      {statuses.map((status, index) => (
        <option key={index + 1} value={status}>
          {status}
        </option>
      ))}
    </Form.Control>
  );

  const buildUsersSelect = (
    title: string,
    defaultUser: User | undefined,
    updateUser: (val: number) => void
  ) => {
    let otherUsers = users;
    if (defaultUser !== undefined) {
      otherUsers = users.filter((user) => user.userId !== defaultUser.userId);
    }
    return (
      <Form.Group>
        <Form.Label>{title}</Form.Label>
        <Form.Control
          as="select"
          data-testid={title}
          onChange={(e) => updateUser(parseInt(e.target.value))}
          custom
        >
          {defaultUser === undefined ? (
            <option key={-1} value={-1}>
              {emDashPipe('')}
            </option>
          ) : (
            <option key={defaultUser.userId} value={defaultUser.userId}>
              {fullNamePipe(defaultUser)}
            </option>
          )}
          {otherUsers.map((user) => (
            <option key={user.userId} value={user.userId}>
              {fullNamePipe(user)}
            </option>
          ))}
        </Form.Control>
      </Form.Group>
    );
  };

  return (
    <PageBlock title={'Project Details (EDIT)'} headerRight={statusSelect}>
      <Container fluid>
        <Row>
          <Col>
            {editDetailsInputBuilder('Project Name:', 'text', project.name, updateName, '', '', '')}
          </Col>
          <Col lg={3} xl={2}>
            {editDetailsInputBuilder('Budget:', 'number', project.budget, updateBudget, '$')}
          </Col>
        </Row>
        <Row>
          <Col>{buildUsersSelect('Project Lead:', project.projectLead, updateProjectLead)}</Col>
          <Col>
            {buildUsersSelect('Project Manager:', project.projectManager, updateProjectManager)}
          </Col>
        </Row>
        <Row>
          <Col>
            {editDetailsInputBuilder(
              'Slide Deck',
              'text',
              project.slideDeckLink!,
              updateSlideDeck,
              '',
              '',
              'Slide deck link'
            )}
            {editDetailsInputBuilder(
              'Task List',
              'text',
              project.taskListLink!,
              updateTaskList,
              '',
              '',
              'Task list link'
            )}
            {editDetailsInputBuilder(
              'BOM',
              'text',
              project.bomLink!,
              updateBom,
              '',
              '',
              'BOM link'
            )}
            {editDetailsInputBuilder(
              'Google Drive',
              'text',
              project.gDriveLink!,
              updateGDrive,
              '',
              '',
              'Google drive link'
            )}
          </Col>
        </Row>
      </Container>
    </PageBlock>
  );
};

export default ProjectEditDetails;
