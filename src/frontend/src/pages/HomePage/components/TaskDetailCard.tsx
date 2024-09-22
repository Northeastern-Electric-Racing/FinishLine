import { Card, CardContent, useTheme, Stack, Link, Typography, Box, Chip } from '@mui/material';
import { Task, wbsPipe, WorkPackage } from 'shared';
import { Link as RouterLink } from 'react-router-dom';
import { routes } from '../../../utils/routes';
import { borderRadius } from '@mui/system';
import { useSingleWorkPackage } from '../../../hooks/work-packages.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { isTaskOverdue, taskPriorityColor } from '../../../utils/task.utils';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { formateDate, transformDate } from '../../../../../backend/src/utils/datetime.utils';

interface TaskDetailCardProps {
  task: Task;
  taskNumber: number;
}

const TaskDetailCard: React.FC<TaskDetailCardProps> = ({ task, taskNumber }) => {
  const theme = useTheme();
  const taskOverdue = isTaskOverdue(task);
  return (
    <Card
      variant="outlined"
      sx={{
        minWidth: 'fit-content',
        mr: 3,
        background: theme.palette.background.default
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent={'space-between'}>
          <Stack direction="row" spacing={1}>
            <Stack direction="column">
              <Typography fontWeight={'regular'} variant="h5">
                Task #{taskNumber}
              </Typography>
              <Link component={RouterLink} to={`${routes.PROJECTS}/${wbsPipe(task.wbsNum)}`} noWrap>
                <Typography fontWeight={'regular'} variant="subtitle2">
                  {wbsPipe(task.wbsNum)} -
                </Typography>
              </Link>
            </Stack>
            {taskOverdue && <Chip color="error" label={'OVERDUE'} />}
          </Stack>
          <Stack direction="column" spacing={1}>
            <Chip
              color="error"
              sx={{
                background: taskPriorityColor(task)
              }}
              label={task.priority}
              size="small"
            />
            <Chip icon={<CalendarMonthIcon />} label={formateDate(new Date(task.deadline))} size="small" />
          </Stack>
        </Box>
        <Box
          sx={{
            background: theme.palette.background.paper,
            borderRadius: 2,
            padding: 3,
            mt: 2
          }}
        >
          <Typography>
            Notes: <br /> {task.notes}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TaskDetailCard;
