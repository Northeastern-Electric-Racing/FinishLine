import { WbsNumber, WorkPackage, isGuest, wbsPipe } from 'shared';
import WorkPackageFormView, { WorkPackageFormViewPayload } from './WorkPackageFormView';
import { bulletsToObject } from '../../utils/form';
import { useAllWorkPackages } from '../../hooks/work-packages.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { useAllUsers } from '../../hooks/users.hooks';
import { useSingleProject } from '../../hooks/projects.hooks';
import { useQuery } from '../../hooks/utils.hooks';
import { WPFormType } from '../../utils/form';
import { WorkPackageApiInputs } from '../../apis/work-packages.api';
import { ObjectSchema } from 'yup';

interface WorkPackageFormProps {
  wbsNum: WbsNumber;
  exitActiveMode: () => void;
  crId?: string;
  mutateAsync: (data: WorkPackageApiInputs) => void;
  formType: WPFormType;
  schema: ObjectSchema<any>;
}

const WorkPackageForm: React.FC<WorkPackageFormProps> = ({
  wbsNum,
  mutateAsync,
  exitActiveMode,
  crId,
  formType,
  schema
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

  const defaultValues: WorkPackageFormViewPayload | undefined =
    formType === WPFormType.EDIT && workPackage
      ? {
          ...workPackage,
          workPackageId: workPackage.id,
          crId: query.get('crId') || workPackage!.changes[0].changeRequestId.toString(),
          stage: workPackage!.stage ?? 'NONE',
          blockedBy: workPackage!.blockedBy.map(wbsPipe),
          expectedActivities: bulletsToObject(workPackage!.expectedActivities),
          deliverables: bulletsToObject(workPackage!.deliverables)
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
      mutateAsync={mutateAsync}
      defaultValues={defaultValues}
      wbsElement={wbsElement}
      leadOrManagerOptions={leadOrManagerOptions}
      blockedByOptions={blockedByOptions}
      crId={crId}
      formType={formType}
      schema={schema}
    />
  );
};

export default WorkPackageForm;
