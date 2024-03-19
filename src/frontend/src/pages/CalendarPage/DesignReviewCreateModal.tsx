import NERFormModal from '../../components/NERFormModal';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import {
  Autocomplete,
  Box,
  FormControl,
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
import { Project, TeamType, WbsNumber, WorkPackage, validateWBS, wbsPipe } from 'shared';
import { useCreateDesignReviews } from '../../hooks/design-reviews.hooks';
import { useAllUsers } from '../../hooks/users.hooks';
import ErrorPage from '../ErrorPage';
import LoadingIndicator from '../../components/LoadingIndicator';
import { userToAutocompleteOption } from '../../utils/teams.utils';
import { useQuery } from '../../hooks/utils.hooks';
import NERAutocomplete from '../../components/NERAutocomplete';
import { useAllProjects } from '../../hooks/projects.hooks';

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
  requiredMemberIds: number[];
  optionalMemberIds: number[];
  wbsNum: WbsNumber;
}

interface DesignReviewCreateModalProps {
  showModal: boolean;
  handleClose: () => void;
  teamTypes: TeamType[];
}

export const DesignReviewCreateModal: React.FC<DesignReviewCreateModalProps> = ({ showModal, handleClose, teamTypes }) => {
  const HOURS: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const query = useQuery();

  const toast = useToast();
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [requiredMembers, setRequiredMembers] = useState([].map(userToAutocompleteOption));
  const [optionalMembers, setOptionalMembers] = useState([].map(userToAutocompleteOption));
  const [wbsNum, setWbsNum] = useState(query.get('wbsNum') || '');
  const { isLoading: allUsersIsLoading, isError: allUsersIsError, error: allUsersError, data: users } = useAllUsers();
  const { data: projects } = useAllProjects();

  const { mutateAsync } = useCreateDesignReviews();

  const onSubmit = async (data: CreateDesignReviewFormInput) => {
    const day = data.date.getDay();
    console.log('Day: ' + day);
    const times = [];
    for (let i = day * 12 + data.startTime; i <= day * 12 + data.endTime; i++) {
      times.push(i);
    }
    console.log('times: ' + times);
    try {
      await mutateAsync({
        dateScheduled: data.date,
        teamTypeId: data.teamTypeId,
        requiredMemberIds: requiredMembers.map((member) => parseInt(member.id)),
        optionalMemberIds: optionalMembers.map((member) => parseInt(member.id)),
        wbsNum: validateWBS(wbsNum),
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

  if (allUsersIsError) return <ErrorPage message={allUsersError?.message} />;
  if (allUsersIsLoading || !users || !projects) return <LoadingIndicator />;

  const memberOptions = users.map(userToAutocompleteOption);

  const projectOptions: { label: string; id: string }[] = [];

  const wbsDropdownOptions: { label: string; id: string }[] = [];

  projects.forEach((project: Project) => {
    wbsDropdownOptions.push({
      label: `${wbsNamePipe(project)}`,
      id: wbsPipe(project.wbsNum)
    });
    projectOptions.push({
      label: `${wbsNamePipe(project)}`,
      id: wbsPipe(project.wbsNum)
    });
    project.workPackages.forEach((workPackage: WorkPackage) => {
      wbsDropdownOptions.push({
        label: `${wbsNamePipe(workPackage)}`,
        id: wbsPipe(workPackage.wbsNum)
      });
    });
  });

  const wbsAutocompleteOnChange = (
    _event: React.SyntheticEvent<Element, Event>,
    value: { label: string; id: string } | null
  ) => {
    if (value) {
      setWbsNum(value.id);
    } else {
      setWbsNum('');
    }
  };

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
      <Box>
        <Typography sx={{ fontWeight: 'bold' }} display="inline">
          Required Members:
        </Typography>
        <Grid container direction={'row'}>
          <Grid item xs={9} md={10} lg={11}>
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
          </Grid>
        </Grid>
      </Box>
      <Box>
        <Typography sx={{ fontWeight: 'bold' }} display="inline">
          Optional Members:
        </Typography>
        <Grid container direction={'row'}>
          <Grid item xs={9} md={10} lg={11}>
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
          </Grid>
        </Grid>
      </Box>
      <Grid item xs={12}>
        <FormLabel>WBS</FormLabel>
        <NERAutocomplete
          id="wbs-autocomplete"
          onChange={wbsAutocompleteOnChange}
          options={wbsDropdownOptions}
          size="small"
          placeholder="Select a project or work package"
          value={wbsDropdownOptions.find((element) => element.id === wbsNum) || null}
        />
      </Grid>
    </NERFormModal>
  );
};
