import { WbsNumber, wbsPipe } from 'shared';
import WorkPackageForm from './WorkPackageForm';
import { useEditWorkPackage } from '../../hooks/work-packages.hooks';
import { useHistory } from 'react-router-dom';
import LoadingIndicator from '../../components/LoadingIndicator';
import * as yup from 'yup';
import { useCreateStandardChangeRequest } from '../../hooks/change-requests.hooks';
import { routes } from '../../utils/routes';
import { WorkPackageApiInputs } from '../../apis/work-packages.api';

interface EditWorkPackageFormProps {
  wbsNum: WbsNumber;
  workPackageName: string;
  setPageMode: (value: React.SetStateAction<boolean>) => void;
}

const EditWorkPackageForm: React.FC<EditWorkPackageFormProps> = ({ wbsNum, workPackageName, setPageMode }) => {
  const history = useHistory();

  const { mutateAsync: editWorkPackage, isLoading } = useEditWorkPackage(wbsNum);
  const { mutateAsync: createWorkPackageScopeCR, isLoading: createStandardChangeRequestIsLoading } =
    useCreateStandardChangeRequest();
  // TODO: Create auto-approved leadership CR hook for work packages
  // const { mutateAsync: createAutoApprovedWPLeadershipCR, isLoading: createAutoApprovedWPIsLoading } =
  //   useCreateAutoApprovedWPLeadershipCR();

  if (isLoading || createStandardChangeRequestIsLoading) return <LoadingIndicator />;
  // if (isLoading || createStandardChangeRequestIsLoading || createAutoApprovedWPIsLoading) return <LoadingIndicator />;

  const schema = yup.object().shape({
    name: yup.string().required('Name is required!'),
    startDate: yup.date().required('Start Date is required!'),
    duration: yup.number().required()
  });

  const breadcrumbs = [
    {
      name: 'Projects',
      route: `${routes.PROJECTS}`
    },
    {
      name: `${wbsPipe(wbsNum)} - ${workPackageName}`,
      route: `${routes.PROJECTS}/${wbsNum.carNumber}.${wbsNum.projectNumber}.${wbsNum.workPackageNumber}`
    }
  ];

  const editWorkPackageWrapper = (data: WorkPackageApiInputs) => {
    const { crId } = data;
    if (!crId) {
      throw new Error('Change Request is Required');
    }
    return editWorkPackage({ ...data, crId });
  };

  return (
    <WorkPackageForm
      wbsNum={wbsNum}
      workPackageMutateAsync={editWorkPackageWrapper}
      createWorkPackageScopeCR={createWorkPackageScopeCR}
      createAutoApprovedLeadershipCR={/*createAutoApprovedWPLeadershipCR*/ () => {}}
      exitActiveMode={() => {
        setPageMode(false);
        history.push(`${history.location.pathname}`);
      }}
      schema={schema}
      breadcrumbs={breadcrumbs}
    />
  );
};

export default EditWorkPackageForm;
