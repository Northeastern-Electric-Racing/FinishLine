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

const ProjectCreateContainer: React.FC = () => {
  const toast = useToast();
  const history = useHistory();

  const name = String();
  const budget = 0;
  const summary = String();
  const links: { linkId: string; url: string; linkTypeName: string }[] = [];
  const goals: { bulletId: number; detail: string }[] = [];
  const features: { bulletId: number; detail: string }[] = [];
  const rules: { bulletId: number; detail: string }[] = [];
  const constraints: { bulletId: number; detail: string }[] = [];
  const teamId = '';
  const [projectManagerId, setProjectManagerId] = useState<string | undefined>();
  const [projectLeadId, setProjectLeadId] = useState<string | undefined>();
  const crId = 0;
  const carNumber = 0;

  const { mutateAsync } = useCreateSingleProject();
  const {
    data: allLinkTypes,
    isLoading: allLinkTypesIsLoading,
    isError: allLinkTypesIsError,
    error: allLinkTypesError
  } = useAllLinkTypes();

  if (!allLinkTypes || allLinkTypesIsLoading) return <LoadingIndicator />;
  if (allLinkTypesIsError) return <ErrorPage message={allLinkTypesError.message} />;

  const requiredLinkTypeNames = getRequiredLinkTypeNames(allLinkTypes);

  const projectLinkTypeNames = links.map((link) => link.linkTypeName);

  requiredLinkTypeNames
    .filter((name) => !projectLinkTypeNames.includes(name))
    .forEach((name) => {
      links.push({
        linkId: '-1',
        url: '',
        linkTypeName: name
      });
    });

  const defaultValues = {
    name,
    budget,
    summary,
    teamId,
    carNumber,
    links,
    crId,
    goals,
    features,
    constraints,
    rules,
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
        crId,
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
      history.push(routes.PROJECTS_ALL);
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
      createProject={true}
    />
  );
};

export default ProjectCreateContainer;
