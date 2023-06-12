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

const renderAddress = (settings: UserSettings) => {
  return (
    <>
      <div style={{ display: 'flex' }}>
        <Typography sx={{ fontWeight: 'bold' }}>Address: </Typography>
        {settings.address}
      </div>
    </>
  );
};

const renderPhone = (settings: UserSettings) => {
  return (
    <>
      <div style={{ display: 'flex' }}>
        <Typography sx={{ fontWeight: 'bold' }}>Phone #: </Typography>
        {settings.phone}
      </div>
    </>
  );
};

const renderNUID = (settings: UserSettings) => {
  return (
    <>
      <div style={{ display: 'flex' }}>
        <Typography sx={{ fontWeight: 'bold' }}>NUID: </Typography>
        {settings.nuid}
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
      <Grid item xs={6}>
        {renderAddress(settings)}
      </Grid>
      <Grid item xs={6}>
        {renderPhone(settings)}
      </Grid>
      <Grid item xs={6}>
        {renderNUID(settings)}
      </Grid>
    </>
  );
};

export default UserSettingsView;
