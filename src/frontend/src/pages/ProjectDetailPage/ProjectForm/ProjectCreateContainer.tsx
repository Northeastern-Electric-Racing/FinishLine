/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { useCreateSingleProject } from '../../../hooks/projects.hooks';
import { mapBulletsToPayload } from '../../../utils/form';
import { useToast } from '../../../hooks/toasts.hooks';
import { CreateSingleProjectPayload } from '../../../utils/types';
import { useState } from 'react';
import ProjectFormContainer from './ProjectForm';
import { ProjectFormInput } from './ProjectForm';

interface ProjectCreateContainerProps {
  requiredLinkTypeNames: string[];
  exitEditMode: () => void;
}

const ProjectCreateContainer: React.FC<ProjectCreateContainerProps> = ({ exitEditMode, requiredLinkTypeNames }) => {
  //const query = useQuery();
  const toast = useToast();
  const name = String();
  const budget = 0;
  const summary = String();

  const links: { linkId: string; url: string; linkTypeName: string }[] = [];
  const goals: { bulletId: number; detail: string }[] = [];
  const features: { bulletId: number; detail: string }[] = [];
  const rules: { rule: string }[] = [];
  const constraints: { bulletId: number; detail: string }[] = [];
  const projectLinkTypeNames = links.map((link) => link.linkTypeName);

  const { mutateAsync } = useCreateSingleProject();
  const [projectManagerId, setprojectManagerId] = useState<string | undefined>();
  const [projectLeadId, setProjectLeadId] = useState<string | undefined>();
  const crId = 0;
  const carNumber = 0;

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

  requiredLinkTypeNames
    .filter((name) => !projectLinkTypeNames.includes(name))
    .forEach((name) => {
      links.push({
        linkId: '-1',
        url: '',
        linkTypeName: name
      });
    });

  const onSubmit = async (data: ProjectFormInput) => {
    const { name, budget, summary, links } = data;
    const rules = data.rules.map((rule) => rule.rule);

    const goals = mapBulletsToPayload(data.goals);
    const features = mapBulletsToPayload(data.features);
    const otherConstraints = mapBulletsToPayload(data.constraints);

    try {
      const payload: CreateSingleProjectPayload = {
        crId: crId ?? 0,
        name,
        carNumber: carNumber ?? 0,
        summary,
        budget: budget,
        rules,
        goals,
        features,
        otherConstraints,
        links,
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
        onSubmit={onSubmit}
        defaultValues={defaultValues}
        setProjectLeadId={setProjectLeadId}
        setProjectManagerId={setprojectManagerId}
        createProject={true}
      />
    </>
  );
};

export default ProjectCreateContainer;
