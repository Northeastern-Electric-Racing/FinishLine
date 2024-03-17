/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import * as yup from 'yup';
import { FormControl, FormLabel, Grid, TextField, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { NERButton } from '../../../components/NERButton';
import { ScheduleSettingsFormInput } from './UserScheduleSettings';
import AvailabilityEditModal from '../../CalendarPage/SchedulingComponents/AvailabilityEditModal';
import { useState } from 'react';
import { UserScheduleSettings } from 'shared';

interface UserScheduleSettingsEditProps {
  onSubmit: (data: { email: string; zoomLink: string; availabilities: number[] }) => Promise<void>;
  defaultValues?: UserScheduleSettings;
}

const schema = yup.object().shape({
  email: yup.string().required('Personal Gmail is required'),
  zoomLink: yup.string().required('Slack ID is required')
});

const UserScheduleSettingsEdit: React.FC<UserScheduleSettingsEditProps> = ({ onSubmit, defaultValues }) => {
  const [editAvailabilityOpen, setEditAvailability] = useState(false);
  const [availabilities, setAvailabilities] = useState<number[]>(defaultValues?.availability || []);

  const onFormSubmit = (data: ScheduleSettingsFormInput) => {
    onSubmit({ availabilities: availabilities, ...data });
  };

  const {
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<ScheduleSettingsFormInput>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: defaultValues?.personalGmail,
      zoomLink: defaultValues?.personalZoomLink
    }
  });

  return (
    <form id={'update-user-schedule-settings'} onSubmit={handleSubmit(onFormSubmit)}>
      <Grid container spacing={2}>
        <AvailabilityEditModal
          open={editAvailabilityOpen}
          onHide={() => setEditAvailability(false)}
          header="Edit Availability"
          availabilites={availabilities}
          setAvailabilities={setAvailabilities}
        />
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
          <NERButton variant="contained" color="success" onClick={() => setEditAvailability(true)}>
            Edit Availability
          </NERButton>
        </Grid>
      </Grid>
    </form>
  );
};

export default UserScheduleSettingsEdit;
