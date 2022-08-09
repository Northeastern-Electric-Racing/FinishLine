/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Form, InputGroup, Container, Row, Col } from 'react-bootstrap';
import { WorkPackage, User, WbsElementStatus } from 'shared';
import { fullNamePipe, percentPipe, emDashPipe } from '../../../../pipes';
import PageBlock from '../../../../layouts/page-block/page-block';

interface Props {
  workPackage: WorkPackage;
  users: User[];
  setters: any;
}

const WorkPackageEditDetails: React.FC<Props> = ({ workPackage, users, setters }) => {
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

  const statuses = Object.values(WbsElementStatus).filter(
    (status) => status !== workPackage.status
  );

  const transformStatus = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return WbsElementStatus.Active;
      case 'INACTIVE':
        return WbsElementStatus.Inactive;
      default:
        return WbsElementStatus.Complete;
    }
  };

  const statusSelect = (
    <Form.Control
      as="select"
      onChange={(e) => setters.setStatus(transformStatus(e.target.value))}
      custom
    >
      <option key={0} value={workPackage.status}>
        {workPackage.status}
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

  const transformDate = (date: Date) => {
    const month =
      date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : (date.getMonth() + 1).toString();
    const day = date.getUTCDate() < 10 ? `0${date.getUTCDate()}` : date.getUTCDate().toString();
    return `${date.getFullYear().toString()}-${month}-${day}`;
  };

  return (
    <PageBlock title={'Work Package Details'} headerRight={<b>{statusSelect}</b>}>
      <Container fluid>
        <Row>
          <Col>
            {editDetailsInputBuilder(
              'Work Package Name:',
              'text',
              workPackage.name,
              setters.setName
            )}
          </Col>
          <Col md={3} lg={2} xl={2}>
            {editDetailsInputBuilder(
              'Start Date:',
              'date',
              transformDate(workPackage.startDate),
              (val) => setters.setStartDate(new Date(val.replace(/-/g, '/'))) // must use / for date format to prevent day being behind by 1
            )}
          </Col>
        </Row>
        <Row>
          <Col md={4}>
            {buildUsersSelect('Project Lead:', workPackage.projectLead, setters.setProjectLead)}
          </Col>
          <Col md={4}>
            {buildUsersSelect(
              'Project Manager:',
              workPackage.projectManager,
              setters.setProjectManager
            )}
          </Col>
          <Col md={4} lg={2} xl={2}>
            {editDetailsInputBuilder(
              'Duration:',
              'number',
              workPackage.duration,
              (val) => setters.setDuration(parseInt(val.trim())),
              '',
              'weeks'
            )}
          </Col>
          <Col sm={3} md={2} lg={2} xl={2}>
            <Form.Group>
              <Form.Label>Progress:</Form.Label>
              <Form.Control
                as="select"
                onChange={(e) => setters.setProgress(parseInt(e.target.value.trim()))}
                custom
              >
                <option key={workPackage.progress} value={workPackage.progress}>
                  {percentPipe(workPackage.progress)}
                </option>
                {[0, 25, 50, 75, 100]
                  .filter((p) => p !== workPackage.progress)
                  .map((progress, index) => (
                    <option key={progress} value={progress}>
                      {percentPipe(progress)}
                    </option>
                  ))}
              </Form.Control>
              <Form.Text>Expected: {percentPipe(workPackage.expectedProgress)}</Form.Text>
            </Form.Group>
          </Col>
        </Row>
      </Container>
    </PageBlock>
  );
};

export default WorkPackageEditDetails;
