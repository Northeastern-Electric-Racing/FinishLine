/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { ThemeName } from 'shared';
import { FormInput } from './UserSettings';
import { themeChoices } from '../../../utils/types';
import { Grid, Select, MenuItem, TextField, Typography } from '@mui/material';
import ExternalLink from '../../../components/ExternalLink';

interface UserSettingsEditProps {
  currentSettings: {
    slackId: string;
    defaultTheme: ThemeName;
    city: string;
    street: string;
    state: string;
    zipcode: string;
    phoneNumber: string;
    nuid: string;
  };
  onSubmit: (data: FormInput) => Promise<void>;
}

const schema = yup.object().shape({
  defaultTheme: yup
    .mixed<ThemeName>()
    .oneOf(['DARK', 'LIGHT'], 'Invalid theme chosen')
    .required('Default theme is required'),
  slackId: yup.string().required('Slack ID is required'),
  street: yup.string().required('Street is required'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
  zipcode: yup.string().required('Zipcode is required'),
  phone: yup.string().required('Phone number is required'),
  nuid: yup.string().required('NUID is required')
});
const UserSettingsEdit: React.FC<UserSettingsEditProps> = ({ currentSettings, onSubmit }) => {
  const { handleSubmit, control } = useForm<FormInput>({
    defaultValues: currentSettings,
    resolver: yupResolver(schema)
  });

  return (
    <form id={'update-user-settings'} onSubmit={handleSubmit(async (data: FormInput) => await onSubmit(data))}>
      <Grid item sx={{ mb: 1 }}>
        <Controller
          name="defaultTheme"
          control={control}
          rules={{ required: true }}
          defaultValue={currentSettings.defaultTheme}
          render={({ field: { onChange, value } }) => (
            <>
              <Typography>Default Theme</Typography>
              <Select onChange={onChange} value={value}>
                {themeChoices.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </Select>
            </>
          )}
        />
      </Grid>

      <Grid item>
        <Controller
          name="slackId"
          control={control}
          rules={{ required: true }}
          defaultValue={currentSettings.slackId}
          render={({ field: { onChange, value } }) => (
            <>
              <div style={{ display: 'flex' }}>
                <Typography>Slack ID</Typography>
                <ExternalLink
                  link="https://www.workast.com/help/article/how-to-find-a-slack-user-id/"
                  description="(How to find your Slack ID)"
                />
              </div>
              <TextField required id="slackid-input" autoComplete="off" onChange={onChange} value={value} />
            </>
          )}
        />
      </Grid>

      <Grid item>
        <Controller
          name="street"
          control={control}
          rules={{ required: true }}
          defaultValue={currentSettings.street}
          render={({ field: { onChange, value } }) => (
            <>
              <div style={{ display: 'flex' }}>
                <Typography>Street</Typography>
              </div>
              <TextField required id="street-input" autoComplete="off" onChange={onChange} value={value} />
            </>
          )}
        />
      </Grid>

      <Grid item>
        <Controller
          name="city"
          control={control}
          rules={{ required: true }}
          defaultValue={currentSettings.city}
          render={({ field: { onChange, value } }) => (
            <>
              <div style={{ display: 'flex' }}>
                <Typography>City</Typography>
              </div>
              <TextField required id="city-input" autoComplete="off" onChange={onChange} value={value} />
            </>
          )}
        />
      </Grid>

      <Grid item>
        <Controller
          name="state"
          control={control}
          rules={{ required: true }}
          defaultValue={currentSettings.state}
          render={({ field: { onChange, value } }) => (
            <>
              <div style={{ display: 'flex' }}>
                <Typography>State</Typography>
              </div>
              <TextField required id="state-input" autoComplete="off" onChange={onChange} value={value} />
            </>
          )}
        />
      </Grid>

      <Grid item>
        <Controller
          name="zipcode"
          control={control}
          rules={{ required: true }}
          defaultValue={currentSettings.zipcode}
          render={({ field: { onChange, value } }) => (
            <>
              <div style={{ display: 'flex' }}>
                <Typography>Zipcode</Typography>
              </div>
              <TextField required id="zipcode-input" autoComplete="off" onChange={onChange} value={value} />
            </>
          )}
        />
      </Grid>

      <Grid item>
        <Controller
          name="phoneNumber"
          control={control}
          rules={{ required: true }}
          defaultValue={currentSettings.phoneNumber}
          render={({ field: { onChange, value } }) => (
            <>
              <div style={{ display: 'flex' }}>
                <Typography>Phone #</Typography>
              </div>
              <TextField required id="phoneNumber-input" autoComplete="off" onChange={onChange} value={value} />
            </>
          )}
        />
      </Grid>

      <Grid item>
        <Controller
          name="nuid"
          control={control}
          rules={{ required: true }}
          defaultValue={currentSettings.nuid}
          render={({ field: { onChange, value } }) => (
            <>
              <div style={{ display: 'flex' }}>
                <Typography>NUID</Typography>
              </div>
              <TextField required id="nuid-input" autoComplete="off" onChange={onChange} value={value} />
            </>
          )}
        />
      </Grid>
    </form>
  );
};

export default UserSettingsEdit;
