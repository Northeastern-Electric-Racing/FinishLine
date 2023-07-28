/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Grid, Typography } from '@mui/material';
import { UserSettings } from 'shared';
import ExternalLink from '../../../components/ExternalLink';
import DetailDisplay from '../../../components/DetailDisplay';
import { Box } from '@mui/system';
import { emDashPipe } from '../../../utils/pipes';

interface UserSettingsViewProps {
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

const Address: React.FC<UserSettingsViewProps> = ({ settings }) => {
  const content =
    settings.street.length > 0
      ? settings.street + ', ' + settings.city + ', ' + settings.state + ', ' + settings.zipcode
      : '—';
  return <DetailDisplay label="fAddress" content={content} />;
};

const PhoneNumber: React.FC<UserSettingsViewProps> = ({ settings }) => {
  return <DetailDisplay label="Phone #" content={emDashPipe(settings.phoneNumber)} />;
};

const NUID: React.FC<UserSettingsViewProps> = ({ settings }) => {
  return <DetailDisplay label="NUID" content={emDashPipe(settings.nuid)} />;
};

/** Component to display user settings */
const UserSettingsView: React.FC<UserSettingsViewProps> = ({ settings }) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <DetailDisplay label="Default Theme" content={settings.defaultTheme} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <SlackId settings={settings} />
      </Grid>
      <Grid item xs={12} md={6}>
        <Address settings={settings} />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <PhoneNumber settings={settings} />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <NUID settings={settings} />
      </Grid>
    </Grid>
  );
};

export default UserSettingsView;
