/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState } from 'react';
import { Alert, Col, Container, Form, Row } from 'react-bootstrap';
import { useAuth } from '../../services/auth.hooks';
import PageTitle from '../../layouts/page-title/page-title';
import PageBlock from '../../layouts/page-block/page-block';
import UserSettings from './user-settings/user-settings';

const Settings: React.FC = () => {
  const auth = useAuth();
  const [showAlert, setShowAlert] = useState(false);
  return (
    <Container fluid>
      <PageTitle title={'Settings'} previousPages={[]} />
      <Alert variant={'success'} show={showAlert}>
        Haha {auth.user?.firstName} bye bye!
      </Alert>
      <PageBlock title={'Organization Settings'}>
        <Container fluid>
          <Row>
            <Col md={6} lg={4}>
              <b>Name:</b> Northeastern Electric Racing
            </Col>
            <Col md={4} lg={2}>
              <Form.Switch
                id="trick-switch"
                label="Trickster Mode"
                onClick={() => {
                  setShowAlert(true);
                  setTimeout(() => {
                    auth.signout();
                  }, 2000);
                }}
              />
            </Col>
          </Row>
        </Container>
      </PageBlock>
      <PageBlock title="User Details">
        <Container fluid>
          <Row>
            <Col md={4} lg={2}>
              <b>First Name:</b> {auth.user?.firstName}
            </Col>
            <Col md={4} lg={2}>
              <b>Last Name:</b> {auth.user?.lastName}
            </Col>
            <Col md={4} lg={3}>
              <b>Email: </b> {auth.user?.email}
            </Col>
            <Col md={4} lg={2}>
              <b>Email ID:</b> {auth.user?.emailId}
            </Col>
            <Col md={4} lg={2}>
              <b>Role: </b> {auth.user?.role}
            </Col>
          </Row>
        </Container>
      </PageBlock>
      <UserSettings userId={auth.user?.userId!} />
    </Container>
  );
};

export default Settings;
