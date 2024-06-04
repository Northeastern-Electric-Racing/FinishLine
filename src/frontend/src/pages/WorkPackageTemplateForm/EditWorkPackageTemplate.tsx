import { WbsNumber, wbsPipe } from 'shared';
import { useEditWorkPackage, useEditWorkPackageTemplate } from '../../hooks/work-packages.hooks';
import { useHistory } from 'react-router-dom';
import LoadingIndicator from '../../components/LoadingIndicator';
import { startDateTester } from '../../utils/form';
import * as yup from 'yup';
import { useCreateStandardChangeRequest } from '../../hooks/change-requests.hooks';
import { routes } from '../../utils/routes';
import WorkPackageTemplateForm from './WorkPackageTemplateForm';

interface EditWorkPackageTemplateProps {
  workPackageTemplateId: string;
  setPageMode: (value: React.SetStateAction<boolean>) => void;
}

const EditWorkPackageForm: React.FC<EditWorkPackageTemplateProps> = ({ workPackageTemplateId, setPageMode }) => {
  const history = useHistory();

  const { mutateAsync: editWorkPackageTemplate, isLoading } = useEditWorkPackageTemplate(workPackageTemplateId);

  const schema = yup.object().shape({
    name: yup.string().required('Name is required!'),
    startDate: yup
      .date()
      .required('Start Date is required!')
      .test('start-date-valid', 'Start Date Must be a Monday', startDateTester),
    duration: yup.number().required()
  });
  
  return (
    <WorkPackageTemplateForm
      workPackageTemplateMutateAsync={editWorkPackageTemplate}
      exitActiveMode={() => history.push(routes.ADMIN_TOOLS)}
      schema={schema} breadcrumbs={[]}    />
  );
};

export default EditWorkPackageForm;
