import { yupResolver } from '@hookform/resolvers/yup';
import { Autocomplete, FormControl, FormHelperText, FormLabel, Grid, MenuItem, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Controller, useForm } from 'react-hook-form';
import { countWords, isGuest, isUnderWordCount, Task, TaskPriority, TaskStatus, TeamPreview } from 'shared';
import { useAllMembers, useCurrentUser } from '../../../../hooks/users.hooks';
import * as yup from 'yup';
import { taskUserToAutocompleteOption } from '../../../../utils/task.utils';
import NERFormModal from '../../../../components/NERFormModal';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import ErrorPage from '../../../ErrorPage';

export interface EditTaskFormInput {
  taskId: string;
  title: string;
  notes?: string;
  assignees: string[];
  startDate?: Date;
  deadline?: Date;
  priority: TaskPriority;
}

interface TaskFormModalProps {
  task?: Task;
  status?: Task['status'];
  teams: TeamPreview[];
  modalShow: boolean;
  onHide: () => void;
  onSubmit: (data: EditTaskFormInput) => Promise<void>;
  onReset?: () => void;
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({ task, status, onSubmit, modalShow, onHide, onReset }) => {
  let schema;

  if (status === TaskStatus.IN_PROGRESS) {
    schema = yup.object().shape({
      notes: yup
        .string()
        .optional()
        .test((value) => {
          if (!value) return true;
          const wordCount = countWords(value);
          return wordCount < 250;
        }),
      startDate: yup.date().optional(),
      deadline: yup.date().required('Deadline is required for In Progress tasks'),
      priority: yup.mixed<TaskPriority>().oneOf(Object.values(TaskPriority)).required(),
      assignees: yup.array().required().min(1, 'At least one assignee is required for In Progress tasks'),
      title: yup.string().required(),
      taskId: yup.string().required()
    });
  } else {
    schema = yup.object().shape({
      notes: yup
        .string()
        .optional()
        .test((value) => {
          if (!value) return true;
          const wordCount = countWords(value);
          return wordCount < 250;
        }),
      startDate: yup.date().optional(),
      deadline: yup.date().optional(),
      priority: yup.mixed<TaskPriority>().oneOf(Object.values(TaskPriority)).required(),
      assignees: yup.array().required(),
      title: yup.string().required(),
      taskId: yup.string().required()
    });
  }

  const user = useCurrentUser();

  const { data: users, isLoading, isError, error } = useAllMembers();

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset
  } = useForm<EditTaskFormInput>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: task?.title ?? '',
      taskId: task?.taskId ?? '-1',
      notes: task?.notes ?? '',
      startDate: task?.startDate ?? undefined,
      deadline: task?.deadline ?? undefined,
      priority: task?.priority ?? TaskPriority.Low,
      assignees: task?.assignees.map((assignee) => assignee.userId) ?? []
    }
  });

  if (isError) return <ErrorPage error={error} />;
  if (isLoading || !users) return <LoadingIndicator />;

  const options: { label: string; id: string }[] = users.map(taskUserToAutocompleteOption);

  const unUpperCase = (str: string) => str.charAt(0) + str.slice(1).toLowerCase();

  return (
    <NERFormModal
      open={modalShow}
      onHide={onHide}
      formId={'edit-task-form'}
      title={task?.title ? 'Edit Task' : 'New Task'}
      reset={() => {
        if (onReset) onReset();
        reset();
      }}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      submitText="Save"
    >
      <form
        onSubmit={(e) => {
          if (isGuest(user.role)) return;
          e.preventDefault();
          e.stopPropagation();
          handleSubmit(onSubmit)(e);
          reset();
        }}
        onKeyPress={(e) => {
          const target = e.target as HTMLElement;
          if (e.key === 'Enter' && target.tagName !== 'TEXTAREA') {
            e.preventDefault();
          }
        }}
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
                    value={value.map((v) => options.find((o) => o.id === v)!)}
                    renderInput={(params) => (
                      <TextField {...params} variant="standard" placeholder="Select A User" error={!!errors.assignees} />
                    )}
                  />
                )}
              />
              <FormHelperText error={!!errors.assignees}>{errors.assignees?.message}</FormHelperText>
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
              <FormHelperText error={!!errors.deadline}>{errors.deadline?.message}</FormHelperText>
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
      </form>
    </NERFormModal>
  );
};

export default TaskFormModal;
