import { WbsNumber, WorkPackage, isGuest, wbsPipe } from 'shared';
import WorkPackageFormView, { WorkPackageFormViewPayload } from './WorkPackageFormView';
import { bulletsToObject } from '../../utils/form';
import { useAllWorkPackages } from '../../hooks/work-packages.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { useAllUsers } from '../../hooks/users.hooks';
import { useSingleProject } from '../../hooks/projects.hooks';
import { useQuery } from '../../hooks/utils.hooks';
import { WorkPackageApiInputs } from '../../apis/work-packages.api';
import { ObjectSchema } from 'yup';
import { CreateStandardChangeRequestPayload } from '../../hooks/change-requests.hooks';

interface WorkPackageFormProps {
  wbsNum: WbsNumber;
  exitActiveMode: () => void;
  crId?: string;
  workPackageMutateAsync: (data: WorkPackageApiInputs) => void;
  createWorkPackageScopeCR: (data: CreateStandardChangeRequestPayload) => void;
  schema: ObjectSchema<any>;
  breadcrumbs: { name: string; route: string }[];
}

const WorkPackageForm: React.FC<WorkPackageFormProps> = ({
  wbsNum,
  workPackageMutateAsync,
  createWorkPackageScopeCR,
  exitActiveMode,
  crId,
  schema,
  breadcrumbs
}) => {
  const { data: users, isLoading: usersIsLoading, isError: usersIsError, error: usersError } = useAllUsers();
  const {
    data: project,
    isLoading: projectIsLoading,
    isError: projectIsError,
    error: projectError
  } = useSingleProject({ ...wbsNum, workPackageNumber: 0 });
  const { data: workPackages, isLoading: wpIsLoading, isError: wpIsError, error: wpError } = useAllWorkPackages();
  const query = useQuery();

  if (wpIsLoading || !workPackages || usersIsLoading || !users || projectIsLoading || !project) return <LoadingIndicator />;
  if (usersIsError) return <ErrorPage message={usersError.message} />;
  if (projectIsError) return <ErrorPage message={projectError.message} />;
  if (wpIsError) return <ErrorPage message={wpError.message} />;

  const workPackage = workPackages.find(
    (wp) =>
      wp.wbsNum.carNumber === wbsNum.carNumber &&
      wp.wbsNum.projectNumber === wbsNum.projectNumber &&
      wp.wbsNum.workPackageNumber === wbsNum.workPackageNumber
  );

  const defaultValues: WorkPackageFormViewPayload | undefined = workPackage
    ? {
        ...workPackage,
        workPackageId: workPackage.id,
        crId: query.get('crId') || '',
        stage: workPackage!.stage ?? 'NONE',
        blockedBy: workPackage!.blockedBy.map(wbsPipe),
        descriptionBullets: bulletsToObject(workPackage.descriptionBullets)
      }
    : undefined;

  const blockedByToAutocompleteOption = (workPackage: WorkPackage) => {
    return { id: wbsPipe(workPackage.wbsNum), label: `${wbsPipe(workPackage.wbsNum)} - ${workPackage.name}` };
  };

  const wbsElement = workPackage ?? project;

  const leadOrManagerOptions = users.filter((user) => !isGuest(user.role));
  const blockedByOptions =
    project.workPackages.filter((wp) => wp.id !== wbsElement.id).map(blockedByToAutocompleteOption) || [];

  return (
    <WorkPackageFormView
      exitActiveMode={exitActiveMode}
      workPackageMutateAsync={workPackageMutateAsync}
      createWorkPackageScopeCR={createWorkPackageScopeCR}
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
