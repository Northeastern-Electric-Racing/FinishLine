/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Project } from 'shared';
import { useEditSingleProject } from '../../../hooks/projects.hooks';
import { useQuery } from '../../../hooks/utils.hooks';
import { bulletsToObject, mapBulletsToPayload } from '../../../utils/form';
import { useToast } from '../../../hooks/toasts.hooks';
import { EditSingleProjectPayload } from '../../../utils/types';
import { useState } from 'react';
import ProjectFormContainer from './ProjectForm';
import { ProjectFormInput } from './ProjectForm';

interface ProjectEditContainerProps {
  project: Project;
  requiredLinkTypeNames: string[];
  exitEditMode: () => void;
}

const ProjectEditContainer: React.FC<ProjectEditContainerProps> = ({ project, exitEditMode, requiredLinkTypeNames }) => {
  const query = useQuery();
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
  const [projectManagerId, setProjectManagerId] = useState<string | undefined>(project.projectManager?.userId.toString());
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
    projectLeadId: projectLeadId,
    projectManagerId
  };

  const onSubmit = async (data: ProjectFormInput) => {
    const { name, budget, summary, links } = data;
    const rules = data.rules.map((rule) => rule.rule);
    const changeRequestId = data.crId;

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
        crId: changeRequestId,
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
        setProjectManagerId={setProjectManagerId}
        setProjectLeadId={setProjectLeadId}
        defaultValues={defaultValues}
        projectLeadId={projectLeadId}
        projectManagerId={projectManagerId}
      />
    </>
  );
};

export default ProjectEditContainer;
