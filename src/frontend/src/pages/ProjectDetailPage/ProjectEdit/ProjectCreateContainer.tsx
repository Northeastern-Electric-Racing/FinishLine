/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { LinkCreateArgs } from 'shared';
import { useCreateSingleProject } from '../../../hooks/projects.hooks';
import { useAllUsers } from '../../../hooks/users.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { mapBulletsToPayload } from '../../../utils/form';
import { useToast } from '../../../hooks/toasts.hooks';
import { CreateSingleProjectPayload } from '../../../utils/types';
import { useState } from 'react';
import ProjectFormContainer from './ProjectFormContainer';
import { ProjectFormInput } from './ProjectFormContainer';

interface ProjectCreateContainerProps {
  requiredLinkTypeNames: string[];
  exitEditMode: () => void;
}

const ProjectCreateContainer: React.FC<ProjectCreateContainerProps> = ({ exitEditMode, requiredLinkTypeNames }) => {
  //const query = useQuery();
  const allUsers = useAllUsers();
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
  const [crId, setcrId] = useState<number>();
  const [carNumber, setCarNumber] = useState<number>();

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

  if (allUsers.isLoading || !allUsers.data) return <LoadingIndicator />;
  if (allUsers.isError) {
    return <ErrorPage message={allUsers.error?.message} />;
  }

  const users = allUsers.data.filter((u) => u.role !== 'GUEST');
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
        users={users}
        defaultValues={defaultValues}
        setProjectLeadId={setProjectLeadId}
        setProjectManagerId={setprojectManagerId}
      />
    </>
  );
};

export default ProjectCreateContainer;
