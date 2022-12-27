/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { UserSettings } from 'shared';

interface UserSettingsViewProps {
  settings: UserSettings;
}

const renderSlackId = (settings: UserSettings) => {
  return (
    <>
      <b>Slack ID: </b>
      <Link target="_blank" rel="noopener noreferrer" href={'https://nu-electric-racing.slack.com/team/' + settings.slackId}>
        {settings.slackId}
      </Link>
    </>
  );
};

/** Component to display user settings */
const UserSettingsView: React.FC<UserSettingsViewProps> = ({ settings }) => {
  return (
    <>
      <Grid item md={4} lg={2}>
        <Typography display="inline" sx={{ fontWeight: 'bold' }}>
          Default Theme:
        </Typography>
        <Typography display="inline"> {settings.defaultTheme}</Typography>
      </Grid>
      <Grid item md={6} lg={4}>
        <Typography>{renderSlackId(settings)}</Typography>
      </Grid>
    </>
  );
};

export default UserSettingsView;
