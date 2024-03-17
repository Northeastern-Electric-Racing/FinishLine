import NERFormModal from '../../components/NERFormModal';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { Box, FormControl, FormLabel, MenuItem, Select, SelectChangeEvent, TextField, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { useToast } from '../../hooks/toasts.hooks';
import { useState } from 'react';
import { meetingStartTimePipe } from '../../utils/pipes';
import { TeamType } from 'shared';

const schema = yup.object().shape({
  date: yup.date().required('Date is required'),
  startTime: yup.number().required('Start time is required'),
  teamTypeId: yup.string().required('Team Type is required'),
  endTime: yup.number().min(yup.ref('startTime'), `End time can't be before start time`).required('End time is required')
});

interface CreateDesignReviewFormInput {
  date: Date;
  startTime: number;
  endTime: number;
  teamTypeId: string;
}

interface DesignReviewCreateModalProps {
  showModal: boolean;
  handleClose: () => void;
  teamTypes: TeamType[];
}

export const DesignReviewCreateModal: React.FC<DesignReviewCreateModalProps> = ({ showModal, handleClose, teamTypes }) => {
  const HOURS: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  const toast = useToast();
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // create design review hook

  const onSubmit = async (data: CreateDesignReviewFormInput) => {
    try {
      // await mutateAsync(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
    handleClose();
  };

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      date: new Date(),
      startTime: 0,
      endTime: 0,
      teamTypeId: ''
    }
  });

  return (
    <NERFormModal
      open={showModal}
      onHide={handleClose}
      title="Create Design Review"
      reset={() => reset({ date: new Date() })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      formId="create-design-review-form"
      showCloseButton
    >
      <Box display="flex" flexDirection="row" gap={2}>
        <FormControl>
          <FormLabel sx={{ alignSelf: 'start', paddingTop: '10px' }}>Design Review Date</FormLabel>
          <Controller
            name="date"
            control={control}
            render={({ field: { onChange, value } }) => (
              <DatePicker
                value={value}
                open={datePickerOpen}
                onClose={() => setDatePickerOpen(false)}
                onOpen={() => setDatePickerOpen(true)}
                onChange={(newValue) => {
                  onChange(newValue ?? new Date());
                }}
                PopperProps={{
                  placement: 'right'
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    inputProps={{ ...params.inputProps, readOnly: true }}
                    error={!!errors.date}
                    helperText={errors.date?.message}
                    onClick={(e) => setDatePickerOpen(true)}
                  />
                )}
              />
            )}
          />
        </FormControl>
        <FormControl>
          <FormLabel sx={{ alignSelf: 'start', paddingTop: '10px' }}>Team</FormLabel>
          <Controller
            name={'teamTypeId'}
            control={control}
            render={({ field: { onChange, value } }) => (
              <Select
                id="teamType-select"
                value={value}
                displayEmpty
                renderValue={() => {
                  console.log(value);
                  return value ? (
                    <Typography>{teamTypes.find((teamType) => teamType.teamTypeId === value)?.name} </Typography>
                  ) : (
                    <Typography style={{ color: 'gray' }}>Select Subteam</Typography>
                  );
                }}
                onChange={(event: SelectChangeEvent<string>) => onChange(event.target.value)}
                sx={{ height: 56, width: '100%', textAlign: 'left' }}
                MenuProps={{
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'right'
                  },
                  transformOrigin: {
                    vertical: 'top',
                    horizontal: 'right'
                  }
                }}
              >
                {teamTypes.map((teamType) => {
                  return (
                    <MenuItem key={teamType.teamTypeId} value={teamType.teamTypeId}>
                      {teamType.name}
                    </MenuItem>
                  );
                })}
              </Select>
            )}
          />
        </FormControl>
      </Box>
      <Box display="flex" flexDirection={'row'} gap={2}>
        <FormControl>
          <FormLabel sx={{ alignSelf: 'start', paddingTop: '10px' }}>Meeting Start Time</FormLabel>
          <Controller
            name={'startTime'}
            control={control}
            render={({ field: { onChange, value } }) => (
              <Select
                id="start-time-autocomplete"
                displayEmpty
                renderValue={(value) => meetingStartTimePipe([value])}
                value={value}
                onChange={(event: SelectChangeEvent<number>) => onChange(Number(event.target.value))}
                size={'small'}
                placeholder={'Start Time'}
                sx={{ height: 56, width: '100%', textAlign: 'left' }}
                MenuProps={{
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'right'
                  },
                  transformOrigin: {
                    vertical: 'top',
                    horizontal: 'right'
                  }
                }}
              >
                {HOURS.map((hour) => {
                  return (
                    <MenuItem key={hour} value={hour}>
                      {meetingStartTimePipe([hour])}
                    </MenuItem>
                  );
                })}
              </Select>
            )}
          />
        </FormControl>
        <FormControl>
          <FormLabel sx={{ alignSelf: 'start', paddingTop: '10px' }}>Meeting End Time</FormLabel>
          <Controller
            name={'endTime'}
            control={control}
            render={({ field: { onChange, value } }) => (
              <Select
                id="start-time-autocomplete"
                displayEmpty
                renderValue={(value) => meetingStartTimePipe([value + 1])}
                value={value}
                onChange={(event: SelectChangeEvent<number>) => onChange(Number(event.target.value))}
                size={'small'}
                placeholder={'End Time'}
                sx={{ height: 56, width: '100%', textAlign: 'left' }}
                MenuProps={{
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'right'
                  },
                  transformOrigin: {
                    vertical: 'top',
                    horizontal: 'right'
                  }
                }}
              >
                {HOURS.map((hour) => {
                  return (
                    <MenuItem key={hour} value={hour}>
                      {meetingStartTimePipe([hour + 1])}
                    </MenuItem>
                  );
                })}
              </Select>
            )}
          />
        </FormControl>
      </Box>
    </NERFormModal>
  );
};
