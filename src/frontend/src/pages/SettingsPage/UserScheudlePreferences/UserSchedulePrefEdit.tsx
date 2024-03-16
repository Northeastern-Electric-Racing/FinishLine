/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import * as yup from 'yup';
import { FormControl, FormLabel, Grid, TextField, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ThemeName } from 'shared';
import { SchedulePrefFormInput } from './UserSchedulePref';
import { NERButton } from '../../../components/NERButton';
import { useState } from 'react';

interface UserPreferencesEditProps {
  onSubmit: (data: SchedulePrefFormInput) => Promise<void>;
}

const schema = yup.object().shape({
  defaultTheme: yup
    .mixed<ThemeName>()
    .oneOf(['DARK', 'LIGHT'], 'Invalid theme chosen')
    .required('Default theme is required'),
  slackId: yup.string().required('Slack ID is required')
});

const UserSchedulePrefEdit: React.FC<UserPreferencesEditProps> = ({ onSubmit }) => {
  const [chooseModalShow, setChooseModalShow] = useState<boolean>(false);

  const {
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<SchedulePrefFormInput>({
    resolver: yupResolver(schema)
  });

  return (
    <form id={'update-user-preferences'} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        <Grid item sx={{ mb: 1 }} xs={12} sm={6}>
          <FormControl fullWidth>
            <FormLabel sx={{ display: 'flex' }}>
              <Typography sx={{ whiteSpace: 'nowrap' }}>Personal Google Email</Typography>
            </FormLabel>
            <Controller
              name="email"
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <TextField
                  required
                  id="email-input"
                  autoComplete="off"
                  onChange={onChange}
                  value={value}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              )}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <FormLabel sx={{ display: 'flex' }}>
              <Typography sx={{ whiteSpace: 'nowrap' }}>Personal Zoom Link</Typography>
            </FormLabel>
            <Controller
              name="zoomLink"
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <TextField
                  required
                  id="zoom-link-input"
                  autoComplete="off"
                  onChange={onChange}
                  value={value}
                  error={!!errors.zoomLink}
                  helperText={errors.zoomLink?.message}
                />
              )}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={6}>
          <NERButton
            variant="contained"
            color="success"
            onClick={() => {
              setChooseModalShow(true);
            }}
          >
            Edit Availability
          </NERButton>
        </Grid>
      </Grid>
    </form>
  );
};

export default UserSchedulePrefEdit;
