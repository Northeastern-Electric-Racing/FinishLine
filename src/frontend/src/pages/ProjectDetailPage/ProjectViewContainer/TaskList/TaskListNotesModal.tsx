/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { isGuest, TeamPreview } from 'shared';
import { fullNamePipe, datePipe } from '../../../../utils/pipes';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Task, TaskPriority } from 'shared';
import {
  Dialog,
  Autocomplete,
  DialogContent,
  DialogTitle,
  Box,
  TextField,
  Grid,
  FormControl,
  FormLabel,
  Breakpoint,
  MenuItem,
  Typography,
  IconButton,
  useTheme
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import NERSuccessButton from '../../../../components/NERSuccessButton';
import NERFailButton from '../../../../components/NERFailButton';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import { isUnderWordCount, countWords } from 'shared';
import { useAuth } from '../../../../hooks/auth.hooks';
import { useState } from 'react';
import { Close, Edit } from '@mui/icons-material';
import { getTaskAssigneeOptions, taskUserToAutocompleteOption } from '../../../../utils/task.utils';

interface TaskListNotesModalProps {
  task: Task;
  teams: TeamPreview[];
  modalShow: boolean;
  onHide: () => void;
  onSubmit: (data: FormInput) => Promise<void>;
  hasEditPermissions: boolean;
}

export interface FormInput {
  taskId: string;
  title: string;
  notes: string;
  assignees: number[];
  deadline: Date;
  priority: TaskPriority;
}

const schema = yup.object().shape({
  notes: yup.string(),
  deadline: yup.date().required(),
  priority: yup.string().required(),
  assignees: yup.array(),
  title: yup.string().required()
});

const TaskListNotesModal: React.FC<TaskListNotesModalProps> = ({
  task,
  teams,
  modalShow,
  onHide,
  onSubmit,
  hasEditPermissions
}: TaskListNotesModalProps) => {
  const auth = useAuth();
  const theme = useTheme();
  const [isEditMode, setIsEditMode] = useState(false);
  const {
    handleSubmit,
    control,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: task.title,
      taskId: task.taskId,
      notes: task.notes,
      deadline: task.deadline,
      priority: task.priority,
      assignees: task.assignees.map((assignee) => assignee.userId)
    }
  });
  if (!auth.user) return <LoadingIndicator />;

  const options: { label: string; id: number }[] = getTaskAssigneeOptions(teams).map(taskUserToAutocompleteOption);

  const dialogWidth: Breakpoint = 'md';
  const priorityColor = task.priority === 'HIGH' ? '#ef4345' : task.priority === 'LOW' ? '#00ab41' : '#FFA500';
  const ViewModal: React.FC = () => {
    return (
      <Dialog fullWidth maxWidth={dialogWidth} open={modalShow} onClose={onHide}>
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '30' }}>
          {task.title}{' '}
          <IconButton
            aria-label="close"
            onClick={onHide}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500]
            }}
          >
            <Close />
          </IconButton>
          <IconButton
            onClick={() => setIsEditMode(true)}
            aria-label="edit"
            disabled={!hasEditPermissions}
            sx={{
              position: 'absolute',
              right: 40,
              top: 8,
              color: (theme) => theme.palette.grey[500]
            }}
          >
            <Edit />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            '&::-webkit-scrollbar': {
              height: '20px'
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'transparent'
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: theme.palette.divider,
              borderRadius: '20px',
              border: '6px solid transparent',
              backgroundClip: 'content-box'
            }
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography fontWeight={'bold'}>
                Priority:{' '}
                <Typography display={'inline'} color={priorityColor}>
                  {' '}
                  {task.priority}
                </Typography>
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography fontWeight={'bold'}>
                Deadline:
                <Typography display={'inline'}> {datePipe(task.deadline)}</Typography>
              </Typography>
            </Grid>
            <Grid item xs={12} md={12}>
              <Typography fontWeight={'bold'}>
                Assignee(s):
                <Typography display={'inline'}> {task.assignees.map((user) => fullNamePipe(user)).join(', ')}</Typography>
              </Typography>
            </Grid>
            <Grid item xs={12} md={12}>
              <Typography fontWeight={'bold'}>Notes:</Typography>
              <Box sx={{ height: '200px', overflow: 'auto' }}>
                <Typography> {task.notes}</Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    );
  };

  const EditModal: React.FC = () => {
    return (
      <Dialog fullWidth maxWidth={dialogWidth} open={modalShow} onClose={onHide}>
        <DialogTitle className={'font-weight-bold'}>{task.title}</DialogTitle>
        <DialogContent
          sx={{
            '&::-webkit-scrollbar': {
              height: '20px'
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'transparent'
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: theme.palette.divider,
              borderRadius: '20px',
              border: '6px solid transparent',
              backgroundClip: 'content-box'
            }
          }}
        >
          <form
            id={'create-work-package-form'}
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSubmit(onSubmit)(e);
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
            <Box textAlign="right" gap={2} sx={{ mt: 2 }}>
              <NERFailButton
                variant="outlined"
                onClick={() => {
                  setIsEditMode(false);
                }}
                sx={{ mx: 1 }}
              >
                Cancel
              </NERFailButton>
              <NERSuccessButton variant="contained" disabled={isGuest(auth.user?.role)} type="submit" sx={{ mx: 1 }}>
                Confirm
              </NERSuccessButton>
            </Box>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  return isEditMode ? <EditModal /> : <ViewModal />;
};

export default TaskListNotesModal;
