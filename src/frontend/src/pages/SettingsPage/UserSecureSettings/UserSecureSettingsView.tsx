import { Grid } from '@mui/material';
import DetailDisplay from '../../../components/DetailDisplay';
import { emDashPipe } from '../../../utils/pipes';
import { UserSecureSettings } from 'shared';

const Address: React.FC<UserSecureSettingsViewProps> = ({ settings }) => {
  const content =
    settings.street.length > 0
      ? settings.street + ', ' + settings.city + ', ' + settings.state + ', ' + settings.zipcode
      : '—';
  return <DetailDisplay label="Address" content={content} />;
};

const PhoneNumber: React.FC<UserSecureSettingsViewProps> = ({ settings }) => {
  return <DetailDisplay label="Phone #" content={emDashPipe(settings.phoneNumber)} />;
};

const NUID: React.FC<UserSecureSettingsViewProps> = ({ settings }) => {
  return <DetailDisplay label="NUID" content={emDashPipe(settings.nuid)} />;
};

interface UserSecureSettingsViewProps {
  settings: UserSecureSettings;
}

const UserSecureSettingsView: React.FC<UserSecureSettingsViewProps> = ({ settings }) => {
  return (
    <Grid container columnSpacing={4} rowSpacing={1}>
      <Grid item xs={12} md={'auto'} lg={'auto'}>
        <Address settings={settings} />
      </Grid>
      <Grid item xs={12} md={'auto'}>
        <PhoneNumber settings={settings} />
      </Grid>
      <Grid item xs={12} md={'auto'}>
        <NUID settings={settings} />
      </Grid>
    </Grid>
  );
};

export default UserSecureSettingsView;
