import { yupResolver } from '@hookform/resolvers/yup';
import { Autocomplete, FormControl, FormLabel, Grid, MenuItem, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Controller, useForm } from 'react-hook-form';
import { countWords, isGuest, isUnderWordCount, Task, TaskPriority, TeamPreview } from 'shared';
import { useCurrentUser } from '../../../../hooks/users.hooks';
import * as yup from 'yup';
import { getTaskAssigneeOptions, taskUserToAutocompleteOption } from '../../../../utils/task.utils';
import NERFormModal from '../../../../components/NERFormModal';

const schema = yup.object().shape({
  notes: yup.string(),
  deadline: yup.date().required(),
  priority: yup.string().required(),
  assignees: yup.array(),
  title: yup.string().required()
});

export interface EditTaskFormInput {
  taskId: string;
  title: string;
  notes: string;
  assignees: string[];
  deadline: Date;
  priority: TaskPriority;
}

interface TaskFormModalProps {
  task?: Task;
  teams: TeamPreview[];
  modalShow: boolean;
  onHide: () => void;
  onSubmit: (data: EditTaskFormInput) => Promise<void>;
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({ task, onSubmit, modalShow, onHide, teams }) => {
  const user = useCurrentUser();

  const options: { label: string; id: string }[] = getTaskAssigneeOptions(teams).map(taskUserToAutocompleteOption);

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: task?.title ?? '',
      taskId: task?.taskId ?? '-1',
      notes: task?.notes ?? '',
      deadline: task?.deadline ?? new Date(),
      priority: task?.priority ?? TaskPriority.Low,
      assignees: task?.assignees.map((assignee) => assignee.userId) ?? []
    }
  });

  return (
    <NERFormModal
      open={modalShow}
      onHide={onHide}
      formId={'edit-task-form'}
      title={task?.title ?? ''}
      reset={() => reset()}
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
          e.key === 'Enter' && e.preventDefault();
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
                        {p}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} md={8}>
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
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <FormLabel>Deadline (YYYY-MM-DD)</FormLabel>
              <Controller
                name="deadline"
                control={control}
                rules={{ required: true }}
                render={({ field: { onChange, value } }) => (
                  <DatePicker
                    format="yyyy-MM-dd"
                    onChange={(event) => onChange(event ?? new Date())}
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
                      maxLength: isUnderWordCount(value, 250) ? null : 0
                    }}
                    helperText={`${countWords(value)}/250 words`}
                    error={!isUnderWordCount(value, 250)}
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
