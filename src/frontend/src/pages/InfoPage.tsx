/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Col, Container, Row } from 'react-bootstrap';
import {
  faScroll,
  faCode,
  faCommentAlt,
  faBolt,
  faCog,
  faDollarSign,
  faSearch
} from '@fortawesome/free-solid-svg-icons';
import ExternalLink from '../components/ExternalLink';
import PageTitle from '../layouts/PageTitle/PageTitle';
import PageBlock from '../layouts/PageBlock';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const InfoPage: React.FC = () => {
  return (
    <Container fluid>
      <PageTitle title="Information" previousPages={[]} />
      <PageBlock title="Resources">
        <Container fluid>
          <Row className="pb-2">Check out these helpful resources:</Row>
          <Row>
            <Col md={4} lg={3}>
              <ExternalLink
                icon={faScroll}
                description={'Glossary Document'}
                link={
                  'https://docs.google.com/document/d/1_kr7PQxjYKvBTmZc8cxeSv5xx0lE88v0wVXkVg3Mez8/edit?usp=sharing'
                }
              />
            </Col>
            <Col>Got any suggestions for additional resources? Drop a message in Slack!</Col>
          </Row>
        </Container>
      </PageBlock>
      <PageBlock title="Support">
        <Container fluid>
          <Row className="pb-2">
            Any and all questions, comments, suggestions, bugs, or other issues can be directed to
            the resources below:
          </Row>
          <Row>
            <Col sm={5} md={4} lg={3}>
              <ExternalLink
                icon={faCommentAlt}
                link={'slack://channel?team=T7MHAQ5TL&id=C02U5TKHLER'}
                description={'Message in Slack'}
              />
            </Col>
            <Col sm={6} md={4} lg={3}>
              <ExternalLink
                icon={faCode}
                description={'Submit a ticket on GitHub'}
                link={
                  'https://github.com/Northeastern-Electric-Racing/FinishLine/issues/new/choose'
                }
              />
            </Col>
          </Row>
        </Container>
      </PageBlock>
      <PageBlock title="Calendars">
        <Container fluid>
          <Row className="mb-3">
            <Col md={4} lg={3}>
              <Row className="mb-2">
                <FontAwesomeIcon icon={faScroll} className="mx-2" /> Club-Wide Meetings & Events
              </Row>
              <Col>
                <ExternalLink
                  description="Public URL"
                  link="https://calendar.google.com/calendar/embed?src=l2vtfdaeu2lisoip58tijijtvc%40group.calendar.google.com&ctz=America%2FNew_York"
                ></ExternalLink>
              </Col>
              <Col>
                <ExternalLink
                  description="iCal URL"
                  link="https://calendar.google.com/calendar/ical/l2vtfdaeu2lisoip58tijijtvc%40group.calendar.google.com/public/basic.ics"
                ></ExternalLink>
              </Col>
            </Col>
            <Col md={4} lg={3}>
              <Row className="mb-2">
                <FontAwesomeIcon icon={faBolt} className="mx-2" /> Electrical Meetings
              </Row>
              <Col>
                <ExternalLink
                  description="Public URL"
                  link="https://calendar.google.com/calendar/embed?src=npitbmnpkcnpcftfu259tthq6g%40group.calendar.google.com&ctz=America%2FNew_York"
                ></ExternalLink>
              </Col>
              <Col>
                <ExternalLink
                  description="iCal URL"
                  link="https://calendar.google.com/calendar/ical/npitbmnpkcnpcftfu259tthq6g%40group.calendar.google.com/public/basic.ics"
                ></ExternalLink>
              </Col>
            </Col>
            <Col md={4} lg={3}>
              <Row className="mb-2">
                <FontAwesomeIcon icon={faCog} className="mx-2" /> Mechanical Meetings
              </Row>
              <Col>
                <ExternalLink
                  description="Public URL"
                  link="https://calendar.google.com/calendar/embed?src=qrtikitnuchp43873l1h17mhe8%40group.calendar.google.com&ctz=America%2FNew_York"
                ></ExternalLink>
              </Col>
              <Col>
                <ExternalLink
                  description="iCal URL"
                  link="https://calendar.google.com/calendar/ical/qrtikitnuchp43873l1h17mhe8%40group.calendar.google.com/public/basic.ics"
                ></ExternalLink>
              </Col>
            </Col>
          </Row>
          <Row>
            <Col md={4} lg={3}>
              <Row className="mb-2">
                <FontAwesomeIcon icon={faDollarSign} className="mx-2" /> Business Meetings
              </Row>
              <Col>
                <ExternalLink
                  description="Public URL"
                  link="https://calendar.google.com/calendar/embed?src=j3hkd9o6onheu4fvhojno6qdf4%40group.calendar.google.com&ctz=America%2FNew_York"
                ></ExternalLink>
              </Col>
              <Col>
                <ExternalLink
                  description="iCal URL"
                  link="https://calendar.google.com/calendar/ical/j3hkd9o6onheu4fvhojno6qdf4%40group.calendar.google.com/public/basic.ics"
                ></ExternalLink>
              </Col>
            </Col>
            <Col md={4} lg={3}>
              <Row className="mb-2">
                <FontAwesomeIcon icon={faCode} className="mx-2" /> Software Meetings
              </Row>
              <Col>
                <ExternalLink
                  description="Public URL"
                  link="https://calendar.google.com/calendar/embed?src=55gqs0qvt4mjcmsqn8ln8a5njg%40group.calendar.google.com&ctz=America%2FNew_York"
                ></ExternalLink>
              </Col>
              <Col>
                <ExternalLink
                  description="iCal URL"
                  link="https://calendar.google.com/calendar/ical/55gqs0qvt4mjcmsqn8ln8a5njg%40group.calendar.google.com/public/basic.ics"
                ></ExternalLink>
              </Col>
            </Col>
            <Col md={4} lg={3}>
              <Row className="mb-2">
                <FontAwesomeIcon icon={faSearch} className="mx-2" /> Engineering Reviews
              </Row>
              <Col>
                <ExternalLink
                  description="Public URL"
                  link="https://calendar.google.com/calendar/embed?src=qqojrdj50ob1m79vt2h3blmn1s%40group.calendar.google.com&ctz=America%2FNew_York"
                ></ExternalLink>
              </Col>
              <Col>
                <ExternalLink
                  description="iCal URL"
                  link="https://calendar.google.com/calendar/ical/qqojrdj50ob1m79vt2h3blmn1s%40group.calendar.google.com/public/basic.ics"
                ></ExternalLink>
              </Col>
            </Col>
          </Row>
        </Container>
      </PageBlock>
    </Container>
  );
};

export default InfoPage;
