/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Grid } from '@mui/material';
import { UserSettings } from 'shared';
import ExternalLink from '../../../components/ExternalLink';

interface UserSettingsViewProps {
  settings: UserSettings;
}
const renderSlackId = (settings: UserSettings) => {
  return (
    <>
      <div style={{display: 'flex'}}>
        <b>Slack ID: </b>
        <ExternalLink
          link={'https://nu-electric-racing.slack.com/team/' + settings.slackId}
          description={settings.slackId}
        />
      </div>
    </>
  );
};

/** Component to display user settings */
const UserSettingsView: React.FC<UserSettingsViewProps> = ({ settings }) => {
  return (
    <>
      <Grid item md={4} lg={2}>
        <b>Default Theme:</b> {settings.defaultTheme}
      </Grid>
      <Grid item md={6} lg={4}>
        {renderSlackId(settings)}
      </Grid>
    </>
  );
};

export default UserSettingsView;
