/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Project } from 'shared';
import { useAllLinkTypes, useEditSingleProject } from '../../../hooks/projects.hooks';
import { bulletsToObject, mapBulletsToPayload, rulesToObject } from '../../../utils/form';
import { useToast } from '../../../hooks/toasts.hooks';
import { EditSingleProjectPayload } from '../../../utils/types';
import { useState } from 'react';
import ProjectFormContainer from './ProjectForm';
import { ProjectFormInput } from './ProjectForm';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { getRequiredLinkTypeNames } from '../../../utils/link.utils';
import { useQuery } from '../../../hooks/utils.hooks';
import { useCreateStandardChangeRequest } from '../../../hooks/change-requests.hooks';
import { FormInput } from '../../CreateChangeRequestPage/CreateChangeRequest';

interface ProjectEditContainerProps {
  project: Project;
  exitEditMode: () => void;
}

export type ProjectCreateChangeRequestFormInput = ProjectFormInput & FormInput;

const ProjectEditContainer: React.FC<ProjectEditContainerProps> = ({ project, exitEditMode }) => {
  const toast = useToast();
  const query = useQuery();

  const { name, budget, summary, teams, status } = project;
  const [projectManagerId, setProjectManagerId] = useState<string | undefined>(project.manager?.userId.toString());
  const [projectLeadId, setProjectLeadId] = useState<string | undefined>(project.lead?.userId.toString());
  const goals = bulletsToObject(project.goals);
  const features = bulletsToObject(project.features);
  const constraints = bulletsToObject(project.otherConstraints);
  const rules = rulesToObject(project.rules);

  const { mutateAsync, isLoading } = useEditSingleProject(project.wbsNum);
  const { mutateAsync: createScopeCRMutateAsync } = useCreateStandardChangeRequest();
  const {
    data: allLinkTypes,
    isLoading: allLinkTypesIsLoading,
    isError: allLinkTypesIsError,
    error: allLinkTypesError
  } = useAllLinkTypes();

  const links = project.links.map((link) => {
    return {
      linkId: link.linkId,
      url: link.url,
      linkTypeName: link.linkType.name
    };
  });

  if (isLoading) return <LoadingIndicator />;
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
    // teamId and carNumber aren't used for projectEdit
    teamId: '',
    carNumber: 0,
    links,
    crId: query.get('crId') || project.changes[0].changeRequestId.toString(),
    goals,
    features,
    constraints,
    rules,
    projectLeadId,
    projectManagerId
  };

  const onSubmit = async (data: ProjectFormInput) => {
    const { name, budget, summary, links } = data;
    const rules = data.rules.map((rule) => rule.detail);
    const crId = data.crId;

    const goals = mapBulletsToPayload(data.goals);
    const features = mapBulletsToPayload(data.features);
    const otherConstraints = mapBulletsToPayload(data.constraints);

    try {
      const payload: EditSingleProjectPayload = {
        name,
        budget,
        summary,
        links,
        projectId: project.id,
        crId: Number(crId),
        rules,
        goals,
        features,
        otherConstraints,
        projectLeadId: projectLeadId ? parseInt(projectLeadId) : undefined,
        projectManagerId: projectManagerId ? parseInt(projectManagerId) : undefined
      };
      await mutateAsync(payload);
      exitEditMode();
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  const onSubmitCreateChangeRequest = async (data: ProjectCreateChangeRequestFormInput) => {
    const { name, budget, summary, links, goals, features, constraints, type, what, why } = data;
    const rules = data.rules.map((rule) => rule.detail);

    try {
      await createScopeCRMutateAsync({
        wbsNum: project.wbsNum,
        type,
        what,
        why,
        proposedSolutions: [],
        projectProposedChanges: {
          name,
          status: status,
          projectLeadId: projectLeadId ? parseInt(projectLeadId) : undefined,
          projectManagerId: projectManagerId ? parseInt(projectManagerId) : undefined,
          links,
          budget,
          summary,
          newProject: false,
          goals: goals.map((g) => g.detail),
          features: features.map((f) => f.detail),
          otherConstraints: constraints.map((c) => c.detail),
          rules,
          teamIds: teams.map((t) => t.teamId)
        }
      });
      exitEditMode();
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  return (
    <ProjectFormContainer
      requiredLinkTypeNames={requiredLinkTypeNames}
      exitEditMode={exitEditMode}
      project={project}
      onSubmit={onSubmit}
      setProjectManagerId={setProjectManagerId}
      setProjectLeadId={setProjectLeadId}
      defaultValues={defaultValues}
      projectLeadId={projectLeadId}
      projectManagerId={projectManagerId}
      onSubmitSecondary={onSubmitCreateChangeRequest}
    />
  );
};

export default ProjectEditContainer;
