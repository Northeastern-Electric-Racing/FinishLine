/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Collapse, Col, Container, Row } from 'react-bootstrap';
import { Team } from 'shared';
import { useTheme } from '../../hooks/Theme.hooks';
import { routes } from '../../utils/Routes';
import { fullNamePipe, listPipe, wbsPipe } from '../../utils/Pipes';
import styles from '../../stylesheets/pages/ProjectDetailPage/WorkPackageSummary.module.scss';

interface TeamSummaryHeaderProps {
  team: Team;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const TeamSummaryHeader: React.FC<TeamSummaryHeaderProps> = ({ team, open, setOpen }) => {
  return (
    <Card.Header
      className={styles.header + ' pt-2 pb-2'}
      onClick={() => setOpen(!open)}
      aria-expanded={open}
    >
      <div className={'d-flex justify-content-between'}>
        <div className={'h5 mb-0 d-flex align-items-center'}>
          <Link to={`${routes.TEAMS}/${team.teamId}`}>{team.teamName}</Link>
        </div>
        <div className={'d-flex align-items-center'}>
          <div className={'mr-3'}>
            {team.projects.length} Project{team.projects.length === 1 ? '' : 's'}
          </div>
          <div>
            {team.members.length} Member{team.members.length === 1 ? '' : 's'}
          </div>
        </div>
      </div>
    </Card.Header>
  );
};

interface TeamSummaryProps {
  team: Team;
}

const TeamSummary: React.FC<TeamSummaryProps> = ({ team }) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const spacer = 'mb-2';
  const membersList = listPipe(team.members, (t) => fullNamePipe(t));

  const projectsList = team.projects.map((project, idx) => (
    <>
      <Link to={`${routes.PROJECTS}/${wbsPipe(project.wbsNum)}`}>{project.name}</Link>
      {idx + 1 !== team.projects.length ? ', ' : ''}
    </>
  ));

  return (
    <Card bg={theme.cardBg} border={theme.cardBorder}>
      <TeamSummaryHeader team={team} open={open} setOpen={setOpen} />
      <Collapse in={open}>
        <div>
          <Card.Body className="pt-3 pb-3">
            <Container fluid>
              <Row className={spacer}>
                <Col xs={12} md={6}>
                  <b>Lead:</b> {fullNamePipe(team.leader)}
                </Col>
              </Row>
              <Row className={spacer}>
                <Col xs={12} md={6}>
                  <b>Members:</b> {membersList}
                </Col>
              </Row>
              <Row>
                <Col xs={12} md={6}>
                  <b>Projects:</b> {projectsList}
                </Col>
              </Row>
            </Container>
          </Card.Body>
        </div>
      </Collapse>
    </Card>
  );
};

export default TeamSummary;
