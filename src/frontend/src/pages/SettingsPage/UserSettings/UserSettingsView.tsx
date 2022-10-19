/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Col, Row } from 'react-bootstrap';
import { UserSettings } from 'shared';

interface UserSettingsViewProps {
  settings: UserSettings;
}

const renderSlackId = (settings: UserSettings) => {
  return (
    <div>
      <b>Slack ID: </b>
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={'https://nu-electric-racing.slack.com/team/' + settings.slackId}
      >
        {settings.slackId}
      </a>
    </div>
  );
};

/** Component to display user settings */
const UserSettingsView: React.FC<UserSettingsViewProps> = ({ settings }) => {
  return (
    <Row>
      <Col md={4} lg={2}>
        <b>Default Theme:</b> {settings.defaultTheme}
      </Col>
      <Col md={6} lg={4}>
        {renderSlackId(settings)}
      </Col>
    </Row>
  );
};

export default UserSettingsView;
