/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import * as yup from 'yup';
import { FormControl, FormLabel, Grid, TextField, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { NERButton } from '../../../components/NERButton';
import { ScheduleSettingsFormInput, ScheduleSettingsPayload } from './UserScheduleSettings';
import AvailabilityEditModal from './Availability/AvailabilityEditModal';
import { useState } from 'react';
import { Availability, SetUserScheduleSettingsArgs } from 'shared';
import ExternalLink from '../../../components/ExternalLink';
import { useToast } from '../../../hooks/toasts.hooks';

interface UserScheduleSettingsEditProps {
  onSubmit: (data: ScheduleSettingsPayload) => Promise<void>;
  totalAvailabilities: Availability[];
  defaultValues?: SetUserScheduleSettingsArgs;
}

const schema = yup.object().shape({
  personalGmail: yup.string().email('Must be an email address').optional(),
  personalZoomLink: yup.string().optional()
});

const UserScheduleSettingsEdit: React.FC<UserScheduleSettingsEditProps> = ({
  onSubmit,
  defaultValues,
  totalAvailabilities
}) => {
  const [editAvailabilityOpen, setEditAvailability] = useState(false);
  const [availabilities, setAvailabilities] = useState<Availability[]>(defaultValues?.availability || []);
  const toast = useToast();

  const onFormSubmit = (data: ScheduleSettingsFormInput) => {
    if (data.personalZoomLink !== '' && !data.personalZoomLink.startsWith('https://zoom.us/j/')) {
      toast.error('Invalid Zoom Link Format. Must start with "https://zoom.us/j/"');
      return;
    }
    onSubmit({ availability: availabilities, ...data });
  };

  const {
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<ScheduleSettingsFormInput>({
    resolver: yupResolver(schema),
    defaultValues: {
      personalGmail: defaultValues?.personalGmail,
      personalZoomLink: defaultValues?.personalZoomLink
    }
  });

  return (
    <form id={'update-user-schedule-settings'} onSubmit={handleSubmit(onFormSubmit)}>
      <Grid container spacing={2}>
        <AvailabilityEditModal
          open={editAvailabilityOpen}
          onHide={() => setEditAvailability(false)}
          onSubmit={() => setEditAvailability(false)}
          header="Edit Availability"
          confirmedAvailabilities={availabilities}
          totalAvailabilities={totalAvailabilities}
          setConfirmedAvailabilities={setAvailabilities}
        />
        <Grid item sx={{ mb: 1 }} xs={12} sm={4}>
          <FormControl fullWidth>
            <FormLabel sx={{ display: 'flex' }}>
              <Typography sx={{ whiteSpace: 'nowrap' }}>Personal Google Email</Typography>
            </FormLabel>
            <Controller
              name="personalGmail"
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextField
                  id="email-input"
                  autoComplete="off"
                  onChange={onChange}
                  value={value}
                  error={!!errors.personalGmail}
                  helperText={errors.personalGmail?.message}
                />
              )}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <FormLabel sx={{ display: 'flex' }}>
              <Typography sx={{ whiteSpace: 'nowrap' }}>Personal Zoom Link</Typography>
              <ExternalLink
                link="https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0065760#:~:text=Sign%20in%20to%20the%20Zoom,Click%20Copy%20Invitation."
                description="(Find your Personal Zoom Link)"
              />
            </FormLabel>
            <Controller
              name="personalZoomLink"
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextField
                  id="zoom-link-input"
                  autoComplete="off"
                  onChange={onChange}
                  value={value}
                  error={!!errors.personalZoomLink}
                  helperText={errors.personalZoomLink?.message}
                />
              )}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={2} display={'flex'} alignItems={'center'} justifyContent={'end'}>
          <NERButton variant="contained" onClick={() => setEditAvailability(true)}>
            Edit Availability
          </NERButton>
        </Grid>
      </Grid>
    </form>
  );
};

export default UserScheduleSettingsEdit;
