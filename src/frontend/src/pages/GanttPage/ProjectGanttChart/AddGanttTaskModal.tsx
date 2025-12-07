import React from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormControl, FormHelperText, FormLabel, MenuItem, TextField, Autocomplete, Grid } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { countWords, isUnderWordCount, TaskPriority, TaskStatus } from 'shared';
import * as yup from 'yup';
import NERFormModal from '../../../components/NERFormModal';
import { useAllMembers } from '../../../hooks/users.hooks';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { taskUserToAutocompleteOption } from '../../../utils/task.utils';

const schema = yup.object().shape({
  title: yup.string().required('Task title is required'),
  priority: yup.string().required('Priority is required'),
  status: yup.string().required('Status is required'),
  assignees: yup.array().of(yup.string()).min(0, 'At least 0 assignees are required'),
  notes: yup.string(),
  startDate: yup.date().nullable(),
  deadline: yup.date().nullable()
});

interface CreateTaskFormData {
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignees: string[];
  notes: string;
  startDate: Date | null;
  deadline: Date | null;
}

interface AddGanttTaskModalProps {
  showModal: boolean;
  handleClose: () => void;
  addTask: (task: CreateTaskFormData) => void;
}

const AddGanttTaskModal: React.FC<AddGanttTaskModalProps> = ({ showModal, handleClose, addTask }) => {
  const { isLoading: usersIsLoading, isError: usersIsError, data: users, error: usersError } = useAllMembers();

  const unUpperCase = (str: string) => str.charAt(0) + str.slice(1).toLowerCase();

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      priority: TaskPriority.Medium,
      status: TaskStatus.IN_BACKLOG,
      assignees: [],
      notes: '',
      startDate: null,
      deadline: null
    }
  });

  if (!users || usersIsLoading) return <LoadingIndicator />;
  if (usersIsError) return <ErrorPage message={usersError?.message} />;

  const options: { label: string; id: string }[] = users
    .map(taskUserToAutocompleteOption);

  const onSubmit = async (data: CreateTaskFormData) => {
    addTask(data);
    handleClose();
  };

  const handleModalClose = () => {
    reset();
    handleClose();
  };

  if (usersIsError) return <ErrorPage message={usersError} />;
  if (usersIsLoading) return <LoadingIndicator />;

  return (
    <NERFormModal
      open={showModal}
      onHide={handleModalClose}
      title="New Task"
      reset={() => reset()}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      formId="new-task-form"
      showCloseButton
    >
      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <FormControl sx={{ width: '100%' }}>
            <FormLabel>Title</FormLabel>
            <Controller
              name={'title'}
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <TextField
                  required
                  onChange={onChange}
                  value={value}
                  inputProps={{
                    maxLength: isUnderWordCount(value, 15) ? null : 0
                  }}
                  helperText={`${countWords(value)}/15 words`}
                  error={!isUnderWordCount(value, 15)}
                />
              )}
            />
            <FormHelperText error={!!errors.title}>{errors.title?.message}</FormHelperText>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={5}>
          <FormControl fullWidth>
            <FormLabel>Priority</FormLabel>
            <Controller
              name="priority"
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextField select onChange={onChange} value={value} error={!!errors.priority}>
                  {Object.values(TaskPriority).map((p) => (
                    <MenuItem key={p} value={p}>
                      {unUpperCase(p)}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </FormControl>
        </Grid>
        <Grid item md={12}>
          <FormControl fullWidth>
            <FormLabel>Assignees</FormLabel>
            <Controller
              name="assignees"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Autocomplete
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  filterSelectedOptions
                  multiple
                  id="tags-standard"
                  options={options}
                  getOptionLabel={(option) => option.label}
                  onChange={(_, value) => onChange(value.map((v) => v.id))}
                  value={value?.map((v) => options.find((o) => o.id === v)!)}
                  renderInput={(params) => (
                    <TextField {...params} variant="standard" placeholder="Select A User" error={!!errors.assignees} />
                  )}
                />
              )}
            />
          </FormControl>
        </Grid>
        <Grid item md={6}>
          <FormControl fullWidth>
            <FormLabel>Start Date (MM-DD-YYYY)</FormLabel>
            <Controller
              name="startDate"
              control={control}
              rules={{ required: false }}
              render={({ field: { onChange, value } }) => (
                <DatePicker
                  format="MM-dd-yyyy"
                  onChange={(event) => onChange(event ?? undefined)}
                  className={'padding: 10'}
                  value={value}
                  slotProps={{ textField: { autoComplete: 'off', error: !!errors.startDate } }}
                />
              )}
            />
          </FormControl>
        </Grid>
        <Grid item md={6}>
          <FormControl fullWidth>
            <FormLabel>Deadline (MM-DD-YYYY)</FormLabel>
            <Controller
              name="deadline"
              control={control}
              rules={{ required: false }}
              render={({ field: { onChange, value } }) => (
                <DatePicker
                  format="MM-dd-yyyy"
                  onChange={(event) => onChange(event ?? undefined)}
                  className={'padding: 10'}
                  value={value}
                  slotProps={{ textField: { autoComplete: 'off', error: !!errors.deadline } }}
                />
              )}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} md={12}>
          <FormControl fullWidth>
            <FormLabel>Notes</FormLabel>
            <Controller
              name={'notes'}
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextField
                  onChange={onChange}
                  value={value}
                  multiline
                  rows={5}
                  inputProps={{
                    maxLength: isUnderWordCount(value ?? '', 250) ? null : 0
                  }}
                  helperText={`${countWords(value ?? '')}/250 words`}
                  error={!isUnderWordCount(value ?? '', 250)}
                />
              )}
            />
          </FormControl>
        </Grid>
      </Grid>
    </NERFormModal>
  );
};

export default AddGanttTaskModal;
