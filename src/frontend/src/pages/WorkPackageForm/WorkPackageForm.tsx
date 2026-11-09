import { WbsNumber, isGuest, isWorkPackageWbs, wbsPipe } from 'shared';
import WorkPackageFormView, { WorkPackageFormViewPayload } from './WorkPackageFormView';
import { bulletsToObject } from '../../utils/form';
import { useSingleWorkPackage } from '../../hooks/work-packages.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { useAllMembers } from '../../hooks/users.hooks';
import { useSingleProject } from '../../hooks/projects.hooks';
import { WorkPackageApiInputs } from '../../apis/work-packages.api';
import { ObjectSchema } from 'yup';
import { CreateStandardChangeRequestPayload } from '../../hooks/change-requests.hooks';
import { LeadershipChangeCreateArgs } from '../../../../shared';

interface WorkPackageFormProps {
  wbsNum: WbsNumber;
  exitActiveMode: () => void;
  crId?: string;
  workPackageMutateAsync: (data: WorkPackageApiInputs) => void;
  createWorkPackageScopeCR: (data: CreateStandardChangeRequestPayload) => void;
  createLeadershipCR: (data: LeadershipChangeCreateArgs) => void;
  schema: ObjectSchema<any>;
  breadcrumbs: { name: string; route: string }[];
}

const WorkPackageForm: React.FC<WorkPackageFormProps> = ({
  wbsNum,
  workPackageMutateAsync,
  createWorkPackageScopeCR,
  createLeadershipCR,
  exitActiveMode,
  crId,
  schema,
  breadcrumbs
}) => {
  const { data: users, isLoading: usersIsLoading, isError: usersIsError, error: usersError } = useAllMembers();
  const {
    data: project,
    isLoading: projectIsLoading,
    isError: projectIsError,
    error: projectError
  } = useSingleProject({ ...wbsNum, workPackageNumber: 0 });
  // creating hands in the project's wbs number, so there's only a work package to load when editing
  const isEdit = isWorkPackageWbs(wbsNum);
  const {
    data: workPackage,
    isLoading: wpIsLoading,
    isError: wpIsError,
    error: wpError
  } = useSingleWorkPackage(wbsNum, isEdit);

  if (usersIsError) return <ErrorPage message={usersError.message} />;
  if (projectIsError) return <ErrorPage message={projectError.message} />;
  if (isEdit && wpIsError) return <ErrorPage message={wpError.message} />;
  if ((isEdit && (wpIsLoading || !workPackage)) || usersIsLoading || !users || projectIsLoading || !project)
    return <LoadingIndicator />;

  const defaultValues: WorkPackageFormViewPayload | undefined = workPackage
    ? {
        ...workPackage,
        workPackageId: workPackage.id,
        stage: workPackage.stage ?? 'NONE',
        blockedBy: workPackage.blockedBy.map((blocker) => wbsPipe(blocker.wbsNum)),
        descriptionBullets: bulletsToObject(workPackage.descriptionBullets)
      }
    : undefined;

  const blockedByToAutocompleteOption = (workPackage: { wbsNum: WbsNumber; name: string }) => {
    return { id: wbsPipe(workPackage.wbsNum), label: `${wbsPipe(workPackage.wbsNum)} - ${workPackage.name}` };
  };

  const wbsElement = isEdit && workPackage ? workPackage : project;

  const leadOrManagerOptions = users.filter((user) => !isGuest(user.role));
  const blockedByOptions =
    project.workPackages.filter((wp) => wp.id !== wbsElement.id).map(blockedByToAutocompleteOption) || [];

  return (
    <WorkPackageFormView
      exitActiveMode={exitActiveMode}
      workPackageMutateAsync={workPackageMutateAsync}
      createWorkPackageScopeCR={createWorkPackageScopeCR}
      createLeadershipCR={createLeadershipCR}
      defaultValues={defaultValues}
      wbsElement={wbsElement}
      leadOrManagerOptions={leadOrManagerOptions}
      blockedByOptions={blockedByOptions}
      crId={crId}
      schema={schema}
      breadcrumbs={breadcrumbs}
    />
  );
};

export default WorkPackageForm;
