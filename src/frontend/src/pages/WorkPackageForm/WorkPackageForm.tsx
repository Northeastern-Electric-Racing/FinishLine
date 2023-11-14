import { UseMutationResult } from 'react-query';
import { WbsNumber, WorkPackage, isGuest, validateWBS, wbsPipe } from 'shared';
import WorkPackageFormView, { WorkPackageFormViewPayload } from './WorkPackageFormView';
import { bulletsToObject } from '../../utils/form';
import { useSingleWorkPackage } from '../../hooks/work-packages.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { useAllUsers } from '../../hooks/users.hooks';
import { useSingleProject } from '../../hooks/projects.hooks';

interface WorkPackageFormProps {
  wbsNum: WbsNumber;
  operation: (wbsNum: WbsNumber) => UseMutationResult;
  exitActiveMode: () => void;
}

const WorkPackageForm: React.FC<WorkPackageFormProps> = ({ wbsNum, operation, exitActiveMode }) => {
  const { data: workPackage, isLoading, isError, error } = useSingleWorkPackage(validateWBS(wbsPipe(wbsNum)));
  const { data: users, isLoading: usersIsLoading, isError: usersIsError, error: usersError } = useAllUsers();
  const {
    data: project,
    isLoading: projectIsLoading,
    isError: projectIsError,
    error: projectError
  } = useSingleProject({ ...wbsNum, workPackageNumber: 0 });
  const { mutateAsync } = operation(wbsNum);

  if (isLoading || usersIsLoading || !users || !workPackage || projectIsLoading || !project) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error.message} />;
  if (usersIsError) return <ErrorPage message={usersError.message} />;
  if (projectIsError) return <ErrorPage message={projectError.message} />;

  const defaultValues: WorkPackageFormViewPayload = {
    ...workPackage,
    workPackageId: workPackage.id,
    crId: workPackage.changes[0].changeRequestId.toString(),
    stage: workPackage.stage!,
    blockedBy: workPackage.blockedBy.map(wbsPipe),
    expectedActivities: bulletsToObject(workPackage.expectedActivities),
    deliverables: bulletsToObject(workPackage.deliverables)
  };

  const blockedByToAutocompleteOption = (workPackage: WorkPackage) => {
    return { id: wbsPipe(workPackage.wbsNum), label: `${wbsPipe(workPackage.wbsNum)} - ${workPackage.name}` };
  };

  const leadOrManagerOptions = users.filter((user) => !isGuest(user.role));
  const blockedByOptions =
    project.workPackages.filter((wp) => wp.id !== workPackage.id).map(blockedByToAutocompleteOption) || [];

  return (
    <WorkPackageFormView
      exitActiveMode={exitActiveMode}
      mutateAsync={mutateAsync}
      defaultValues={defaultValues}
      workPackage={workPackage}
      leadOrManagerOptions={leadOrManagerOptions}
      blockedByOptions={blockedByOptions}
    />
  );
};

export default WorkPackageForm;
