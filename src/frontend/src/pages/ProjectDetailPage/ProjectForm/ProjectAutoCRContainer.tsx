/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { useAllLinkTypes, useCreateSingleProject } from '../../../hooks/projects.hooks';
import { mapBulletsToPayload } from '../../../utils/form';
import { useToast } from '../../../hooks/toasts.hooks';
import { CreateSingleProjectPayload } from '../../../utils/types';
import { useState } from 'react';
import ProjectFormContainer from './ProjectForm';
import { ProjectFormInput } from './ProjectForm';
import { useHistory } from 'react-router-dom';
import { routes } from '../../../utils/routes';
import { getRequiredLinkTypeNames } from '../../../utils/link.utils';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useQuery } from '../../../hooks/utils.hooks';

const ProjectAutoCRContainer: React.FC = () => {
  const toast = useToast();
  const history = useHistory();
  const query = useQuery();

  const [projectManagerId, setProjectManagerId] = useState<string | undefined>();
  const [projectLeadId, setProjectLeadId] = useState<string | undefined>();

  const { mutateAsync, isLoading } = useCreateSingleProject();
  const {
    data: allLinkTypes,
    isLoading: allLinkTypesIsLoading,
    isError: allLinkTypesIsError,
    error: allLinkTypesError
  } = useAllLinkTypes();

  if (isLoading) return <LoadingIndicator />;
  if (!allLinkTypes || allLinkTypesIsLoading) return <LoadingIndicator />;
  if (allLinkTypesIsError) return <ErrorPage message={allLinkTypesError.message} />;

  const requiredLinkTypeNames = getRequiredLinkTypeNames(allLinkTypes);

  const defaultValues = {
    name: String(),
    budget: 0,
    summary: String(),
    teamId: String(),
    carNumber: 0,
    links: [],
    crId: query.get('crId') || '',
    goals: [],
    features: [],
    constraints: [],
    rules: [],
    projectLeadId,
    projectManagerId
  };

  const onSubmit = async (data: ProjectFormInput) => {
    const { name, budget, summary, links, crId, teamId, carNumber } = data;

    const rules = data.rules.map((rule) => rule.detail);
    const goals = mapBulletsToPayload(data.goals);
    const features = mapBulletsToPayload(data.features);
    const otherConstraints = mapBulletsToPayload(data.constraints);

    try {
      const payload: CreateSingleProjectPayload = {
        crId: Number(crId),
        name,
        carNumber,
        summary,
        teamIds: [teamId],
        budget,
        rules,
        goals,
        features,
        otherConstraints,
        links,
        projectLeadId: projectLeadId ? parseInt(projectLeadId) : undefined,
        projectManagerId: projectManagerId ? parseInt(projectManagerId) : undefined
      };
      await mutateAsync(payload);
      history.push(routes.CHANGE_REQUESTS_OVERVIEW);
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  return (
    <ProjectFormContainer
      requiredLinkTypeNames={requiredLinkTypeNames}
      exitEditMode={() => history.push(routes.PROJECTS_ALL)}
      onSubmit={onSubmit}
      defaultValues={defaultValues}
      setProjectLeadId={setProjectLeadId}
      setProjectManagerId={setProjectManagerId}
      projectLeadId={projectLeadId}
      projectManagerId={projectManagerId}
      autoCRMode={true}
    />
  );
};

export default ProjectAutoCRContainer;
