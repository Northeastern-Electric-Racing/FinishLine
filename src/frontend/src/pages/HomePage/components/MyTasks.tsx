import { Stack } from '@mui/material';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useCurrentUser, useUserTasks } from '../../../hooks/users.hooks';
import { useGetManyWorkPackages } from '../../../hooks/work-packages.hooks';
import PageBlock from '../../../layouts/PageBlock';
import TaskDetailCard from './TaskDetailCard';

const MyTasks: React.FC = () => {
  const currentUser = useCurrentUser();
  const {
    data: userTasks,
    isLoading: userTasksIsLoading,
    error: userTasksError,
    isError: userTasksIsError
  } = useUserTasks(currentUser.userId);

  if (userTasksIsLoading || !userTasks) return <LoadingIndicator />;
  return (
    <PageBlock title={`My Tasks (${userTasks.length})`}>
      <Stack spacing={2}>
        {userTasks.map((task, index) => {
          return <TaskDetailCard task={task} taskNumber={index + 1} />;
        })}
      </Stack>
    </PageBlock>
  );
};

export default MyTasks;
