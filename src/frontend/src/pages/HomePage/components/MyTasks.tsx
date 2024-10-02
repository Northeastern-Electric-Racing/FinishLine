import { Box, Stack } from '@mui/material';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useCurrentUser, useUserTasks } from '../../../hooks/users.hooks';
import TaskDetailCard from './TaskDetailCard';
import ErrorPage from '../../ErrorPage';
import CompleteDisplay from './CompleteDisplay';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import ScrollablePageBlock from './ScrollablePageBlock';

const NoTasksDisplay: React.FC = () => {
  return (
    <Box
      sx={{
        height: `calc(100vh - 200px)`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <CompleteDisplay
        icon={<CheckCircleOutlineOutlinedIcon sx={{ fontSize: 128 }} />}
        heading={"You're all caught up!"}
        message={"You've completed all of your assigned tasks!"}
      />
    </Box>
  );
};

const MyTasks: React.FC = () => {
  const currentUser = useCurrentUser();

  const {
    data: userTasks,
    isLoading: userTasksIsLoading,
    error: userTasksError,
    isError: userTasksIsError
  } = useUserTasks(currentUser.userId);

  if (userTasksIsLoading || !userTasks) return <LoadingIndicator />;
  if (userTasksIsError) return <ErrorPage message={userTasksError.message} />;
  return (
    <ScrollablePageBlock title={`My Tasks (${userTasks.length})`}>
      {userTasks.length === 0 ? (
        <NoTasksDisplay />
      ) : (
        <Stack spacing={2}>
          {userTasks.map((task, index) => {
            return <TaskDetailCard task={task} taskNumber={index + 1} />;
          })}
        </Stack>
      )}
    </ScrollablePageBlock>
  );
};

export default MyTasks;
