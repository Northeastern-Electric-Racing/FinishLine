import { useEditWorkPackageTemplate } from '../../hooks/work-packages.hooks';
import { useHistory } from 'react-router-dom';
import * as yup from 'yup';
import { routes } from '../../utils/routes';
import WorkPackageTemplateForm from './WorkPackageTemplateForm';
import { useQuery } from '../../hooks/utils.hooks';

interface EditWorkPackageTemplateProps {
  setPageMode: (value: React.SetStateAction<boolean>) => void;
}

const EditWorkPackageForm: React.FC<EditWorkPackageTemplateProps> = ({ setPageMode }) => {
  const history = useHistory();

  const query = useQuery();

  const workPackageTemplateId = query.get('workPackageTemplateId');

  const { mutateAsync: editWorkPackageTemplate } = useEditWorkPackageTemplate(workPackageTemplateId!);

  const schema = yup.object().shape({
    workPackageName: yup.string().required('Name is required!'),
    duration: yup.number().required()
  });

  return (
    <WorkPackageTemplateForm
      workPackageTemplateId={workPackageTemplateId!}
      workPackageTemplateMutateAsync={editWorkPackageTemplate}
      exitActiveMode={() => {
        setPageMode(false);
        history.push(routes.ADMIN_TOOLS);
      }}
      schema={schema}
      breadcrumbs={[]}
    />
  );
};

export default EditWorkPackageForm;
