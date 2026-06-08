import React from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { Autocomplete, FormControl, FormHelperText, FormLabel, Grid, MenuItem, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Controller, useForm } from 'react-hook-form';
import { countWords, dateToMidnightUTC, isUnderWordCount, ProjectPreview, TaskPriority, TaskStatus, wbsPipe } from 'shared';
import { useAllMembers } from '../../../hooks/users.hooks';
import { useAllProjects } from '../../../hooks/projects.hooks';
import { useCreateTask } from '../../../hooks/tasks.hooks';
import { useToast } from '../../../hooks/toasts.hooks';
import { taskUserToAutocompleteOption } from '../../../utils/task.utils';
import * as yup from 'yup';
import NERFormModal from '../../../components/NERFormModal';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';

const schema = yup.object().shape({
  project: yup.mixed<ProjectPreview>().required('Project is required'),
  title: yup.string().required('Title is required'),
  priority: yup.mixed<TaskPriority>().oneOf(Object.values(TaskPriority)).required(),
  status: yup.mixed<TaskStatus>().oneOf(Object.values(TaskStatus)).required(),
  assignees: yup.array().of(yup.string().required()).required(),
  startDate: yup.date().optional(),
  deadline: yup
    .date()
    .optional()
    .test('deadline-after-start', 'Deadline must be on or after the start date', function (deadline) {
      const { startDate } = this.parent;
      if (!startDate || !deadline) return true;
      return deadline >= startDate;
    }),
  notes: yup.string().optional()
});

interface CreateTaskFormInput {
  project: ProjectPreview | null;
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignees: string[];
  startDate?: Date;
  deadline?: Date;
  notes?: string;
}

interface CalendarCreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  defaultDeadline?: Date;
}

const CalendarCreateTaskModal: React.FC<CalendarCreateTaskModalProps> = ({ open, onClose, defaultDeadline }) => {
  const toast = useToast();
  const { mutateAsync: createTask, isLoading } = useCreateTask();
  const { data: users, isLoading: usersLoading, isError: usersError, error: usersErr } = useAllMembers();
  const { data: projects, isLoading: projectsLoading, isError: projectsError, error: projectsErr } = useAllProjects();

  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
    reset
  } = useForm<CreateTaskFormInput>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      project: null,
      title: '',
      priority: TaskPriority.Medium,
      status: TaskStatus.IN_BACKLOG,
      assignees: [],
      startDate: undefined,
      deadline: defaultDeadline,
      notes: ''
    }
  });

  const startDate = watch('startDate');

  if (usersError) return <ErrorPage error={usersErr} />;
  if (projectsError) return <ErrorPage error={projectsErr} />;
  if (usersLoading || !users || projectsLoading || !projects) return <LoadingIndicator />;

  const userOptions = users.map(taskUserToAutocompleteOption);

  const unUpperCase = (str: string) => str.charAt(0) + str.slice(1).toLowerCase();

  const onSubmit = async (data: CreateTaskFormInput) => {
    if (!data.project) return;
    try {
      await createTask({
        wbsNum: data.project.wbsNum,
        title: data.title,
        priority: data.priority,
        status: data.status,
        assignees: data.assignees,
        notes: data.notes,
        deadline: data.deadline ? dateToMidnightUTC(data.deadline).toISOString() : undefined,
        startDate: data.startDate ? dateToMidnightUTC(data.startDate).toISOString() : undefined
      });
      toast.success('Task created successfully!');
      onClose();
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message, 5000);
      }
    }
  };

  return (
    <NERFormModal
      open={open}
      onHide={() => {
        reset();
        onClose();
      }}
      formId="calendar-create-task-form"
      title="Create Task"
      reset={() => reset()}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      submitText="Create"
      showCloseButton
      disabled={isLoading}
    >
      <Grid container spacing={2} sx={{ minWidth: 450 }}>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <FormLabel>Project</FormLabel>
            <Controller
              name="project"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Autocomplete
                  options={projects}
                  getOptionLabel={(option) => `${wbsPipe(option.wbsNum)} - ${option.name}`}
                  isOptionEqualToValue={(option, val) => wbsPipe(option.wbsNum) === wbsPipe(val.wbsNum)}
                  value={value}
                  onChange={(_, newValue) => onChange(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select a project"
                      error={!!errors.project}
                      helperText={errors.project?.message}
                    />
                  )}
                />
              )}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} md={7}>
          <FormControl sx={{ width: '100%' }}>
            <FormLabel>Title</FormLabel>
            <Controller
              name="title"
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextField
                  required
                  onChange={onChange}
                  value={value}
                  inputProps={{
                    maxLength: isUnderWordCount(value, 15) ? null : 0
                  }}
                  helperText={`${countWords(value)}/15 words`}
                  error={!isUnderWordCount(value, 15) || !!errors.title}
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
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <FormLabel>Status</FormLabel>
            <Controller
              name="status"
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextField select onChange={onChange} value={value} error={!!errors.status}>
                  {Object.values(TaskStatus).map((s) => (
                    <MenuItem key={s} value={s}>
                      {s.replace(/_/g, ' ')}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <FormLabel>Assignees</FormLabel>
            <Controller
              name="assignees"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Autocomplete
                  isOptionEqualToValue={(option, val) => option.id === val.id}
                  filterSelectedOptions
                  multiple
                  options={userOptions}
                  getOptionLabel={(option) => option.label}
                  onChange={(_, newVal) => onChange(newVal.map((v) => v.id))}
                  value={value.map((v) => userOptions.find((o) => o.id === v)!).filter(Boolean)}
                  renderInput={(params) => (
                    <TextField {...params} variant="standard" placeholder="Select users" error={!!errors.assignees} />
                  )}
                />
              )}
            />
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <FormLabel>Start Date</FormLabel>
            <Controller
              name="startDate"
              control={control}
              render={({ field: { onChange, value } }) => (
                <DatePicker
                  format="MM-dd-yyyy"
                  onChange={(event) => onChange(event ?? undefined)}
                  value={value ?? null}
                  slotProps={{ textField: { autoComplete: 'off' } }}
                />
              )}
            />
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <FormLabel>Deadline</FormLabel>
            <Controller
              name="deadline"
              control={control}
              render={({ field: { onChange, value } }) => (
                <DatePicker
                  format="MM-dd-yyyy"
                  onChange={(event) => onChange(event ?? undefined)}
                  value={value ?? null}
                  minDate={startDate ?? undefined}
                  slotProps={{ textField: { autoComplete: 'off', error: !!errors.deadline } }}
                />
              )}
            />
            {errors.deadline && <FormHelperText error>{errors.deadline.message}</FormHelperText>}
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <FormLabel>Notes</FormLabel>
            <Controller
              name="notes"
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextField
                  onChange={onChange}
                  value={value}
                  multiline
                  rows={3}
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

export default CalendarCreateTaskModal;
