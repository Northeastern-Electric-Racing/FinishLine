import NERFormModal from '../../components/NERFormModal';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import {
  Autocomplete,
  Box,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { useToast } from '../../hooks/toasts.hooks';
import { useState } from 'react';
import { meetingStartTimePipe, wbsNamePipe } from '../../utils/pipes';
import { TeamType, WorkPackage, validateWBS, wbsNumComparator, wbsPipe } from 'shared';
import { useCreateDesignReviews } from '../../hooks/design-reviews.hooks';
import { useAllUsers } from '../../hooks/users.hooks';
import ErrorPage from '../ErrorPage';
import LoadingIndicator from '../../components/LoadingIndicator';
import { userToAutocompleteOption } from '../../utils/teams.utils';
import { useQuery } from '../../hooks/utils.hooks';
import NERAutocomplete from '../../components/NERAutocomplete';
import { useAllWorkPackages } from '../../hooks/work-packages.hooks';

const schema = yup.object().shape({
  date: yup.date().required('Date is required'),
  startTime: yup.number().required('Start time is required'),
  teamTypeId: yup.string().required('Team Type is required'),
  endTime: yup
    .number()
    .moreThan(yup.ref('startTime'), `End time must be after the start time`)
    .required('End time is required'),
  wbsNum: yup.string().required('Work Package is required')
});

interface CreateDesignReviewFormInput {
  date: Date;
  startTime: number;
  endTime: number;
  teamTypeId: string;
  requiredMemberIds: number[];
  optionalMemberIds: number[];
  wbsNum: string;
}

interface DesignReviewCreateModalProps {
  showModal: boolean;
  handleClose: () => void;
  teamTypes: TeamType[];
  defaultDate: Date;
}

export const DesignReviewCreateModal: React.FC<DesignReviewCreateModalProps> = ({
  showModal,
  handleClose,
  teamTypes,
  defaultDate
}) => {
  const HOURS: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const query = useQuery();

  const toast = useToast();
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [requiredMembers, setRequiredMembers] = useState([].map(userToAutocompleteOption));
  const [optionalMembers, setOptionalMembers] = useState([].map(userToAutocompleteOption));
  const { isLoading: allUsersIsLoading, isError: allUsersIsError, error: allUsersError, data: users } = useAllUsers();
  const {
    isLoading: allWorkPackagesIsLoading,
    isError: allWorkPackagesIsError,
    error: allWorkPackagesError,
    data: allWorkPackages
  } = useAllWorkPackages();

  const { mutateAsync, isLoading } = useCreateDesignReviews();

  const onSubmit = async (data: CreateDesignReviewFormInput) => {
    const day = data.date.getDay();
    const times = [];
    for (let i = day * 12 + data.startTime; i <= day * 12 + data.endTime; i++) {
      times.push(i);
    }
    try {
      await mutateAsync({
        dateScheduled: data.date,
        teamTypeId: data.teamTypeId,
        requiredMemberIds: requiredMembers.map((member) => parseInt(member.id)),
        optionalMemberIds: optionalMembers.map((member) => parseInt(member.id)),
        wbsNum: validateWBS(data.wbsNum),
        meetingTimes: times
      });
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
    setValue,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      date: defaultDate,
      startTime: 0,
      endTime: 1,
      teamTypeId: '',
      wbsNum: query.get('wbsNum') || ''
    }
  });

  if (allUsersIsError) return <ErrorPage error={allUsersError} message={allUsersError?.message} />;
  if (allWorkPackagesIsError) return <ErrorPage error={allWorkPackagesError} message={allWorkPackagesError?.message} />;
  if (allUsersIsLoading || !users || allWorkPackagesIsLoading || !allWorkPackages || isLoading) return <LoadingIndicator />;

  const memberOptions = users.map(userToAutocompleteOption);

  const wbsDropdownOptions: { label: string; id: string }[] = [];

  allWorkPackages.forEach((workPackage: WorkPackage) => {
    wbsDropdownOptions.push({
      label: `${wbsNamePipe(workPackage)}`,
      id: wbsPipe(workPackage.wbsNum)
    });
  });

  wbsDropdownOptions.sort((wp1, wp2) => wbsNumComparator(wp1.id, wp2.id));

  return (
    <NERFormModal
      open={showModal}
      onHide={handleClose}
      title="Create Design Review"
      reset={() => reset({ date: defaultDate })}
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
                  onChange(newValue ?? defaultDate);
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
          <FormHelperText error>{errors.date?.message}</FormHelperText>
        </FormControl>
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
          <FormHelperText error>{errors.startTime?.message}</FormHelperText>
        </FormControl>
        <FormControl>
          <FormLabel sx={{ alignSelf: 'start', paddingTop: '10px' }}>Meeting End Time</FormLabel>
          <Controller
            name={'endTime'}
            control={control}
            render={({ field: { onChange, value } }) => (
              <Select
                id="end-time-autocomplete"
                displayEmpty
                renderValue={(value) => meetingStartTimePipe([value])}
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
                {HOURS.slice(1).map((hour) => {
                  return (
                    <MenuItem key={hour} value={hour}>
                      {meetingStartTimePipe([hour])}
                    </MenuItem>
                  );
                })}
              </Select>
            )}
          />
          <FormHelperText error>{errors.endTime?.message}</FormHelperText>
        </FormControl>
      </Box>
      <Grid container gap={1}>
        <Grid item xs={8} sx={{ alignSelf: 'start', paddingTop: '10px', width: '100%' }}>
          <FormLabel>Work Package</FormLabel>
          <Controller
            name="wbsNum"
            control={control}
            render={({ field: { onChange, value } }) => {
              const onClear = () => {
                setValue('wbsNum', '');
                onChange('');
              };
              return (
                <NERAutocomplete
                  id="wbs-autocomplete"
                  sx={{ bgcolor: 'inherit' }}
                  onChange={(_event, newValue) => {
                    newValue ? onChange(newValue.id) : onClear();
                  }}
                  options={wbsDropdownOptions}
                  size="medium"
                  placeholder="Select a work package"
                  value={wbsDropdownOptions.find((element) => element.id === value) || null}
                />
              );
            }}
          />
          <FormHelperText error>{errors.wbsNum?.message}</FormHelperText>
        </Grid>
        <Grid item xs={3}>
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
            <FormHelperText error>{errors.teamTypeId?.message}</FormHelperText>
          </FormControl>
        </Grid>
      </Grid>
      <Box sx={{ alignSelf: 'start', paddingTop: '10px' }}>
        <FormLabel> Required Members</FormLabel>
        <Autocomplete
          isOptionEqualToValue={(option, value) => option.id === value.id}
          filterSelectedOptions
          multiple
          id="tags-standard"
          options={memberOptions}
          value={requiredMembers}
          onChange={(_event, newValue) => setRequiredMembers(newValue)}
          getOptionLabel={(option) => option.label}
          renderInput={(params) => <TextField {...params} variant="standard" placeholder="Select A User" />}
        />
      </Box>
      <Box sx={{ alignSelf: 'start', paddingTop: '10px' }}>
        <FormLabel> Optional Members</FormLabel>
        <Autocomplete
          isOptionEqualToValue={(option, value) => option.id === value.id}
          filterSelectedOptions
          multiple
          id="tags-standard"
          options={memberOptions}
          value={optionalMembers}
          onChange={(_event, newValue) => setOptionalMembers(newValue)}
          getOptionLabel={(option) => option.label}
          renderInput={(params) => <TextField {...params} variant="standard" placeholder="Select A User" />}
        />
      </Box>
    </NERFormModal>
  );
};
