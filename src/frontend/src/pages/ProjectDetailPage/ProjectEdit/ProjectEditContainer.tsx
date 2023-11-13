/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { LinkCreateArgs, Project } from 'shared';
import { useEditSingleProject } from '../../../hooks/projects.hooks';
import { useAllUsers } from '../../../hooks/users.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useQuery } from '../../../hooks/utils.hooks';
import { bulletsToObject, mapBulletsToPayload } from '../../../utils/form';
import { useToast } from '../../../hooks/toasts.hooks';
import { EditSingleProjectPayload } from '../../../utils/types';
import { useState } from 'react';
import ProjectFormContainer from './ProjectFormContainer';
import { ProjectFormInput } from './ProjectFormContainer';

interface ProjectEditContainerProps {
  project: Project;
  requiredLinkTypeNames: string[];
  exitEditMode: () => void;
}

const ProjectEditContainer: React.FC<ProjectEditContainerProps> = ({ project, exitEditMode, requiredLinkTypeNames }) => {
  const query = useQuery();
  const allUsers = useAllUsers();
  const toast = useToast();
  const { name, budget, summary } = project;
  const { mutateAsync } = useEditSingleProject(project.wbsNum);

  const links = project.links.map((link) => {
    return {
      linkId: link.linkId,
      url: link.url,
      linkTypeName: link.linkType.name
    };
  });

  const projectLinkTypeNames = links.map((link) => link.linkTypeName);
  const [projectManagerId, setprojectManagerId] = useState<string | undefined>(project.projectManager?.userId.toString());
  const [projectLeadId, setProjectLeadId] = useState<string | undefined>(project.projectLead?.userId.toString());
  const goals = bulletsToObject(project.goals);
  const features = bulletsToObject(project.features);
  const constraints = bulletsToObject(project.otherConstraints);
  const rules = project.rules.map((rule) => {
    return { rule };
  });
  const crId = parseInt(query.get('crId') || '');

  requiredLinkTypeNames
    .filter((name) => !projectLinkTypeNames.includes(name))
    .forEach((name) => {
      links.push({
        linkId: '-1',
        url: '',
        linkTypeName: name
      });
    });

  if (allUsers.isLoading || !allUsers.data) return <LoadingIndicator />;
  if (allUsers.isError) {
    return <ErrorPage message={allUsers.error?.message} />;
  }

  const defaultValues = {
    name,
    budget,
    summary,
    links,
    crId,
    goals,
    features,
    constraints,
    rules,
    projectLeadId,
    projectManagerId
  };

  const users = allUsers.data.filter((u) => u.role !== 'GUEST');
  const onSubmit = async (data: ProjectFormInput) => {
    const { name, budget, summary, links } = data;
    const rules = data.rules.map((rule) => rule.rule);

    const goals = mapBulletsToPayload(data.goals);
    const features = mapBulletsToPayload(data.features);
    const otherConstraints = mapBulletsToPayload(data.constraints);

    try {
      const payload: EditSingleProjectPayload = {
        name,
        budget: budget,
        summary,
        links,
        projectId: project.id,
        crId: crId,
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

  return (
    <>
      <ProjectFormContainer
        exitEditMode={exitEditMode}
        requiredLinkTypeNames={requiredLinkTypeNames}
        project={project}
        onSubmit={onSubmit}
        users={users}
        setProjectManagerId={setprojectManagerId}
        setProjectLeadId={setProjectLeadId}
        defaultValues={defaultValues}
      />
    </>
  );
};

export default ProjectEditContainer;
