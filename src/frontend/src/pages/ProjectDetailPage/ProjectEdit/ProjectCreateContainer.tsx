/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { LinkCreateArgs, Project } from 'shared';
import { useCreateSingleProject } from '../../../hooks/projects.hooks';
import { useAllUsers } from '../../../hooks/users.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useQuery } from '../../../hooks/utils.hooks';
import { useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import ProjectEditDetails from './ProjectEditDetails';
import { bulletsToObject, mapBulletsToPayload } from '../../../utils/form';
import { useToast } from '../../../hooks/toasts.hooks';
import { CreateSingleProjectPayload } from '../../../utils/types';
import { useState } from 'react';
import ProjectFormContainer from './ProjectFormContainer';
import { ProjectFormInput } from './ProjectFormContainer';

const schema = yup.object().shape({
  name: yup.string().required('Name is required!'),
  budget: yup.number().required('Budget is required!').min(0).integer('Budget must be an even dollar amount!'),
  links: yup.array().of(
    yup.object().shape({
      linkTypeName: yup.string().required('Link Type is required!'),
      url: yup.string().required('URL is required!').url('Invalid URL')
    })
  ),
  summary: yup.string().required('Summary is required!')
});

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

  const projectLinks: { linkId: string; url: string; linkTypeName: string }[] = [];
  const projectLinkTypeNames = projectLinks.map((link) => link.linkTypeName);

  requiredLinkTypeNames
    .filter((name) => !projectLinkTypeNames.includes(name))
    .forEach((name) => {
      projectLinks.push({
        linkId: '-1',
        url: '',
        linkTypeName: name
      });
    });

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name,
      budget,
      summary,
      crId: '',
      rules: [],
      links: projectLinks,
      goals: [],
      features: [],
      constraints: []
    }
  });
  const { fields: rules, append: appendRule, remove: removeRule } = useFieldArray({ control, name: 'rules' });
  const { fields: goals, append: appendGoal, remove: removeGoal } = useFieldArray({ control, name: 'goals' });
  const { fields: features, append: appendFeature, remove: removeFeature } = useFieldArray({ control, name: 'features' });
  const {
    fields: constraints,
    append: appendConstraint,
    remove: removeConstraint
  } = useFieldArray({ control, name: 'constraints' });
  const { fields: links, append: appendLink, remove: removeLink } = useFieldArray({ control, name: 'links' });
  const { mutateAsync } = useCreateSingleProject();
  const [projectManagerId, setprojectManagerId] = useState<string | undefined>();
  const [projectLeadId, setProjectLeadId] = useState<string | undefined>();
  const [crid, setcrid] = useState<number | undefined>();
  const [carNumber, setCarNumber] = useState<number | undefined>();

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
        crId: parseInt(crid),
        name,
        carNumber,
        summary,
        projectId,
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
        //project={project}
        control={control}
        onSubmit={onSubmit}
        register={register}
        links={links}
        appendLink={appendLink}
        removeLink={removeLink}
        watch={watch}
        goals={goals}
        appendGoal={appendGoal}
        removeGoal={removeGoal}
        features={features}
        appendFeature={appendFeature}
        removeFeature={removeFeature}
        constraints={constraints}
        appendConstraint={appendConstraint}
        removeConstraint={removeConstraint}
        rules={rules}
        appendRule={appendRule}
        removeRule={removeRule}
        handleSubmit={handleSubmit}
        users={users}
        errors={errors}
        projectEditDetails={
          <ProjectEditDetails
            users={users}
            control={control}
            errors={errors}
            projectLead={projectLeadId}
            projectManager={projectManagerId}
            setProjectLead={setProjectLeadId}
            setProjectManager={setprojectManagerId}
            creatingProject={true}
            setcrId={setcrid}
            setCarNumber={setCarNumber}
          />
        }
      />
    </>
  );
};

export default ProjectCreateContainer;
