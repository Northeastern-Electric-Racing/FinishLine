import { Box, Card, CardContent, Chip, Link, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTheme } from '@mui/system';
import React from 'react';
import { Task, TaskCardPreview, wbsPipe } from 'shared';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { useSingleProject } from '../../../hooks/projects.hooks';
import { routes } from '../../../utils/routes';
import { fullNamePipe } from '../../../utils/pipes';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { taskPriorityColor } from '../../../utils/task.utils';
import { formatDate } from '../../../utils/datetime.utils';

interface TeamTaskCardProps {
  task: TaskCardPreview;
  taskNumber: number;
}

const TeamTaskCard: React.FC<TeamTaskCardProps> = ({ task, taskNumber }) => {
  const theme = useTheme();

  return (
    <Card
      variant="outlined"
      sx={{
        width: '100%',
        height: 'fit-content',
        minHeight: 'fit-content',
        mr: 3,
        background: theme.palette.background.default,
        borderRadius: 2
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between'
          }}
        >
          <Stack>
            <Typography fontWeight={'regular'} variant="h5">
              Task #{taskNumber} - {task.title}
            </Typography>
            <Link component={RouterLink} to={`${routes.PROJECTS}/${wbsPipe(task.wbsNum)}`} noWrap>
              <Typography fontWeight={'regular'} variant="subtitle2">
                {wbsPipe(task.wbsNum)} - {task.projectName}
              </Typography>
            </Link>
            <Stack direction={'row'} spacing={1}>
              <PeopleAltIcon />
              <Typography>{task.assignees.map(fullNamePipe).join(', ')}</Typography>
            </Stack>
          </Stack>
          <Stack spacing={1}>
            <Chip
              sx={{
                background: taskPriorityColor({ priority: task.priority } as Task)
              }}
              label={task.priority}
              size="medium"
            />
            <Chip
              icon={<CalendarMonthIcon />}
              label={task.deadline ? formatDate(new Date(task.deadline)) : 'No Deadline'}
              size="medium"
            />
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TeamTaskCard;
