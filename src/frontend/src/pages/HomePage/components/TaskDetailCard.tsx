import { Card, CardContent, useTheme, Stack, Link, Typography, Box, Chip } from '@mui/material';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { Task, wbsPipe } from 'shared';
import { Link as RouterLink } from 'react-router-dom';
import { routes } from '../../../utils/routes';
import { isTaskOverdue, taskPriorityColor } from '../../../utils/task.utils';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { formateDate } from '../../../../../backend/src/utils/datetime.utils';
import { useState } from 'react';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { styled } from '@mui/material/styles';
import { useSingleWorkPackage } from '../../../hooks/work-packages.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';

interface TaskDetailCardProps {
  task: Task;
  taskNumber: number;
}

const NERToolTip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
))(() => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: 'red'
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: 'red'
  }
}));

const TaskDetailCard: React.FC<TaskDetailCardProps> = ({ task, taskNumber }) => {
  const theme = useTheme();
  const taskOverdue = isTaskOverdue(task);
  const [hover, setHover] = useState<boolean>(false);
  const { data: wp, isLoading, isError, error } = useSingleWorkPackage(task.wbsNum);

  if (isLoading || !wp) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error.message} />;
  return (
    <NERToolTip
      title={
        <Stack direction={'row'}>
          <WarningAmberIcon />
          <Typography ml={1}>Task #{taskNumber} is Overdue!</Typography>
        </Stack>
      }
      open={hover}
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
          border: hover ? '1px solid red' : undefined
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
                    {wbsPipe(task.wbsNum)} - {wp.name}
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
    </NERToolTip>
  );
};

export default TaskDetailCard;
