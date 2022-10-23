/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { ThemeName } from 'shared';
import { FormInput } from './UserSettings';
import { themeChoices } from '../../../utils/Types';
import { Grid, Select, MenuItem, TextField, Link, Typography } from '@mui/material';

interface UserSettingsEditProps {
  currentSettings: { slackId: string; defaultTheme: ThemeName };
  onSubmit: (data: FormInput) => Promise<void>;
}

const schema = yup.object().shape({
  defaultTheme: yup
    .mixed<ThemeName>()
    .oneOf(['DARK', 'LIGHT'], 'Invalid theme chosen')
    .required('Default theme is required'),
  slackId: yup.string().optional()
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
              <Typography>
                {'Slack Id '}
                <Link href="https://www.workast.com/help/article/how-to-find-a-slack-user-id/">
                  (How to find your Slack ID)
                </Link>
              </Typography>
              <TextField
                required
                id="slackid-input"
                autoComplete="off"
                onChange={onChange}
                value={value}
                defaultValue={value}
              />
            </>
          )}
        />
      </Grid>
    </form>
  );
};

export default UserSettingsEdit;
