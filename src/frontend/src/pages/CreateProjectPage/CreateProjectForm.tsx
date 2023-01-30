/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useHistory } from 'react-router-dom';
import { useAuth } from '../../hooks/auth.hooks';
import { useCreateSingleProject } from '../../hooks/projects.hooks';
import { routes } from '../../utils/routes';
import LoadingIndicator from '../../components/LoadingIndicator';
import CreateProjectFormView from './CreateProjectFormView';

export interface CreateProjectFormInputs {
  name: string;
  carNumber: number;
  crId: number;
  summary: string;
  teamId: string;
}

const CreateProjectForm: React.FC = () => {
  const auth = useAuth();
  const history = useHistory();
  const { isLoading, mutateAsync } = useCreateSingleProject();

  if (isLoading || !auth.user) return <LoadingIndicator />;

  const handleCancel = () => history.goBack();

  const handleSubmit = async (project: CreateProjectFormInputs) => {
    const { name, carNumber, crId, summary, teamId } = project;

    const payload = {
      crId,
      name,
      carNumber,
      summary,
      teamId
    };

    try {
      const createdWbsNum = await mutateAsync(payload);

      history.push(`${routes.PROJECTS}/${createdWbsNum}`);
    } catch (error) {
      alert(error);
    }
  };

  return <CreateProjectFormView onCancel={handleCancel} onSubmit={handleSubmit} allowSubmit={auth.user.role !== 'GUEST'} />;
};

export default CreateProjectForm;
