/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Grid, Typography } from '@mui/material';
import { UserSettings } from 'shared';
import ExternalLink from '../../../components/ExternalLink';
import DetailDisplay from '../../../components/DetailDisplay';
import { Box } from '@mui/system';
import { displayEnum } from '../../../utils/pipes';

export interface UserSettingsViewProps {
  settings: UserSettings;
}
const SlackId: React.FC<UserSettingsViewProps> = ({ settings }) => {
  return (
    <Box style={{ display: 'flex' }}>
      <Typography sx={{ fontWeight: 'bold' }}>Slack ID:</Typography>
      <ExternalLink link={'https://nu-electric-racing.slack.com/team/' + settings.slackId} description={settings.slackId} />
    </Box>
  );
};

/** Component to display user settings */
const UserSettingsView: React.FC<UserSettingsViewProps> = ({ settings }) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <DetailDisplay label="Default Theme" content={displayEnum(settings.defaultTheme)} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <SlackId settings={settings} />
      </Grid>
    </Grid>
  );
};

export default UserSettingsView;
