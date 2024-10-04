import { Card, CardContent, useTheme, Stack, Link, Typography, Box, Chip } from '@mui/material';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { Task, wbsPipe } from 'shared';
import { Link as RouterLink } from 'react-router-dom';
import { routes } from '../../../utils/routes';
import { taskPriorityColor } from '../../../utils/task.utils';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useState } from 'react';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { styled } from '@mui/material/styles';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { useSingleProject } from '../../../hooks/projects.hooks';
import { daysOverdue, formatDate } from '../../../utils/datetime.utils';

interface TaskDetailCardProps {
  task: Task;
  taskNumber: number;
}

const NERToolTip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.error.dark
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.error.dark
  }
}));

const TaskDetailCard: React.FC<TaskDetailCardProps> = ({ task, taskNumber }) => {
  const theme = useTheme();
  const taskDaysOverdue = daysOverdue(new Date(task.deadline));
  const taskOverdue = taskDaysOverdue > 0;
  const [hover, setHover] = useState<boolean>(false);
  const { data: project, isLoading, isError, error } = useSingleProject(task.wbsNum);

  if (isLoading || !project) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error.message} />;

  return (
    <NERToolTip
      title={
        <Stack direction={'row'}>
          <WarningAmberIcon />
          <Typography ml={1}>
            Task #{taskNumber} is {taskDaysOverdue} Days Overdue!
          </Typography>
        </Stack>
      }
      open={taskOverdue && hover}
      placement="right"
      arrow
    >
      <Card
        variant="outlined"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        sx={{
          minWidth: 'fit-content',
          mr: 3,
          background: theme.palette.background.default,
          border: taskOverdue && hover ? '1px solid red' : undefined
        }}
      >
        <CardContent>
          <Box display="flex" justifyContent={'space-between'}>
            <Stack direction="row" spacing={1}>
              <Stack direction="column">
                <Box display="flex">
                  <Typography fontWeight={'regular'} variant="h5">
                    Task #{taskNumber} - {task.title}
                  </Typography>
                  {taskOverdue && (
                    <Chip
                      color="error"
                      label={'OVERDUE'}
                      sx={{
                        ml: 1
                      }}
                    />
                  )}
                </Box>
                <Link component={RouterLink} to={`${routes.PROJECTS}/${wbsPipe(task.wbsNum)}`} noWrap>
                  <Typography fontWeight={'regular'} variant="subtitle2">
                    {wbsPipe(task.wbsNum)} - {project.name}
                  </Typography>
                </Link>
              </Stack>
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
              <Chip icon={<CalendarMonthIcon />} label={formatDate(new Date(task.deadline))} size="small" />
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
    </NERToolTip>
  );
};

export default TaskDetailCard;
