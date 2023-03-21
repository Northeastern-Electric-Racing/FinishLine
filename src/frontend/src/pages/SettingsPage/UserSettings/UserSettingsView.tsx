/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Grid, Typography } from '@mui/material';
import { UserSettings } from 'shared';
import ExternalLink from '../../../components/ExternalLink';
import DetailDisplay from '../../../components/DetailDisplay';

interface UserSettingsViewProps {
  settings: UserSettings;
}
const renderSlackId = (settings: UserSettings) => {
  return (
    <>
      <div style={{ display: 'flex' }}>
        <Typography sx={{ fontWeight: 'bold' }}>Slack ID:</Typography>
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
      <Grid item xs={6}>
        <DetailDisplay label="Default Theme" content={settings.defaultTheme} />
      </Grid>
      <Grid item xs={6}>
        {renderSlackId(settings)}
      </Grid>
    </>
  );
};

export default UserSettingsView;
