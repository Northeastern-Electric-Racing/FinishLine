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
import { Grid, Select, MenuItem, TextField, FormControl, FormLabel } from '@mui/material';
import ExternalLink from '../../../components/ExternalLink';
import { Box } from '@mui/system';
import ReactHookTextField from '../../../components/ReactHookTextField';

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
  phoneNumber: yup.string().required('Phone number is required'),
  nuid: yup.string().required('NUID is required')
});
const UserSettingsEdit: React.FC<UserSettingsEditProps> = ({ currentSettings, onSubmit }) => {
  const {
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<FormInput>({
    defaultValues: currentSettings,
    resolver: yupResolver(schema)
  });

  return (
    <form id={'update-user-settings'} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        <Grid item sx={{ mb: 1 }} xs={12} sm={6}>
          <FormControl fullWidth>
            <Controller
              name="defaultTheme"
              control={control}
              rules={{ required: true }}
              defaultValue={currentSettings.defaultTheme}
              render={({ field: { onChange, value } }) => (
                <>
                  <FormLabel>Default Theme</FormLabel>
                  <Select
                    onChange={(event) => onChange(event.target.value as ThemeName)}
                    value={value}
                    error={!!errors.defaultTheme}
                  >
                    {themeChoices.map((t) => (
                      <MenuItem key={t} value={t}>
                        {t}
                      </MenuItem>
                    ))}
                  </Select>
                </>
              )}
            />
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <Controller
              name="slackId"
              control={control}
              rules={{ required: true }}
              defaultValue={currentSettings.slackId}
              render={({ field: { onChange, value } }) => (
                <>
                  <Box style={{ display: 'flex' }}>
                    <FormLabel>Slack ID</FormLabel>
                    <ExternalLink
                      link="https://www.workast.com/help/article/how-to-find-a-slack-user-id/"
                      description="(Find your Slack ID)"
                      sx={{ whiteSpace: 'nowrap' }}
                    />
                  </Box>
                  <TextField
                    required
                    id="slackid-input"
                    autoComplete="off"
                    onChange={onChange}
                    value={value}
                    error={!!errors.slackId}
                    helperText={errors.slackId?.message}
                  />
                </>
              )}
            />
          </FormControl>
        </Grid>

        <Grid item xs={12} md={8}>
          <FormControl fullWidth>
            <FormLabel>Address</FormLabel>
            <ReactHookTextField name="street" control={control} rules={{ required: true }} errorMessage={errors.street} />
          </FormControl>
        </Grid>

        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <FormLabel>City</FormLabel>
            <ReactHookTextField name="city" control={control} rules={{ required: true }} errorMessage={errors.city} />
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <FormLabel>State</FormLabel>
            <ReactHookTextField name="state" control={control} rules={{ required: true }} errorMessage={errors.state} />
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <FormLabel>Zipcode</FormLabel>
            <ReactHookTextField name="zipcode" control={control} rules={{ required: true }} errorMessage={errors.zipcode} />
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <FormLabel>Phone Number</FormLabel>
            <ReactHookTextField
              name="phoneNumber"
              control={control}
              rules={{ required: true }}
              errorMessage={errors.phoneNumber}
            />
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <FormLabel>NUID</FormLabel>
            <ReactHookTextField name="nuid" control={control} rules={{ required: true }} errorMessage={errors.nuid} />
          </FormControl>
        </Grid>
      </Grid>
    </form>
  );
};

export default UserSettingsEdit;
