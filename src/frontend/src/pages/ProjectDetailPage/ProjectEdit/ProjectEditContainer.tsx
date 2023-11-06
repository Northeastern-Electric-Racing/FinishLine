/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { LinkCreateArgs, Project } from 'shared';
import { wbsPipe } from '../../../utils/pipes';
import { routes } from '../../../utils/routes';
import { useEditSingleProject } from '../../../hooks/projects.hooks';
import { useAllUsers } from '../../../hooks/users.hooks';
import PageBlock from '../../../layouts/PageBlock';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useQuery } from '../../../hooks/utils.hooks';
import { useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Grid, Button, Box, TextField, IconButton, FormControl } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ReactHookTextField from '../../../components/ReactHookTextField';
import ProjectEditDetails from './ProjectEditDetails';
import ReactHookEditableList from '../../../components/ReactHookEditableList';
import { bulletsToObject, mapBulletsToPayload } from '../../../utils/form';
import NERSuccessButton from '../../../components/NERSuccessButton';
import NERFailButton from '../../../components/NERFailButton';
import { useToast } from '../../../hooks/toasts.hooks';
import LinksEditView from '../../../components/Link/LinksEditView';
import { EditSingleProjectPayload } from '../../../utils/types';
import { useState } from 'react';
import PageLayout from '../../../components/PageLayout';
import ChangeRequestDropdown from '../../../components/ChangeRequestDropdown';

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

interface ProjectEditContainerProps {
  project: Project;
  requiredLinkTypeNames: string[];
  exitEditMode: () => void;
}

export interface ProjectEditFormInput {
  name: string;
  budget: number;
  summary: string;
  links: LinkCreateArgs[];
  crId: string;
  goals: {
    bulletId: number;
    detail: string;
  }[];
  features: {
    bulletId: number;
    detail: string;
  }[];
  constraints: {
    bulletId: number;
    detail: string;
  }[];
  rules: {
    rule: string;
  }[];
}

const ProjectEditContainer: React.FC<ProjectEditContainerProps> = ({ project, exitEditMode, requiredLinkTypeNames }) => {
  const query = useQuery();
  const allUsers = useAllUsers();
  const toast = useToast();
  const { name, budget, summary } = project;

  const projectLinks = project.links.map((link) => {
    return {
      linkId: link.linkId,
      url: link.url,
      linkTypeName: link.linkType.name
    };
  });

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
      crId: query.get('crId') || '',
      rules: project.rules.map((rule) => {
        return { rule };
      }),
      links: projectLinks,
      goals: bulletsToObject(project.goals),
      features: bulletsToObject(project.features),
      constraints: bulletsToObject(project.otherConstraints)
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
  const { mutateAsync } = useEditSingleProject(project.wbsNum);
  const [projectManagerId, setprojectManagerId] = useState<string | undefined>(project.projectManager?.userId.toString());
  const [projectLeadId, setProjectLeadId] = useState<string | undefined>(project.projectLead?.userId.toString());

  if (allUsers.isLoading || !allUsers.data) return <LoadingIndicator />;
  if (allUsers.isError) {
    return <ErrorPage message={allUsers.error?.message} />;
  }

  const users = allUsers.data.filter((u) => u.role !== 'GUEST');
  const onSubmit = async (data: ProjectEditFormInput) => {
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
        crId: parseInt(data.crId),
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
    <PageLayout
      title={`${wbsPipe(project.wbsNum)} - ${project.name}`}
      previousPages={[{ name: 'Projects', route: routes.PROJECTS }]}
      headerRight={<ChangeRequestDropdown control={control} name="crId" errors={errors} />}
    >
      <form
        id="project-edit-form"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleSubmit(onSubmit)(e);
        }}
        onKeyPress={(e) => {
          e.key === 'Enter' && e.preventDefault();
        }}
      >
        <ProjectEditDetails
          users={users}
          control={control}
          errors={errors}
          projectLead={projectLeadId}
          projectManager={projectManagerId}
          setProjectLead={setProjectLeadId}
          setProjectManager={setprojectManagerId}
        />
        <PageBlock title="Project Summary">
          <Grid item sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <ReactHookTextField
                name="summary"
                control={control}
                placeholder="Summary"
                multiline={true}
                rows={5}
                errorMessage={errors.summary}
              />
            </FormControl>
          </Grid>
        </PageBlock>
        <PageBlock title="Links">
          <LinksEditView watch={watch} ls={links} register={register} append={appendLink} remove={removeLink} />
        </PageBlock>
        <PageBlock title="Goals">
          <ReactHookEditableList name="goals" register={register} ls={goals} append={appendGoal} remove={removeGoal} />
        </PageBlock>
        <PageBlock title="Features">
          <ReactHookEditableList
            name="features"
            register={register}
            ls={features}
            append={appendFeature}
            remove={removeFeature}
          />
        </PageBlock>
        <PageBlock title="Other Constraints">
          <ReactHookEditableList
            name="constraints"
            register={register}
            ls={constraints}
            append={appendConstraint}
            remove={removeConstraint}
          />
        </PageBlock>
        <PageBlock title="Rules">
          {rules.map((_rule, i) => {
            return (
              <Grid item sx={{ display: 'flex', alignItems: 'center' }}>
                <TextField required autoComplete="off" {...register(`rules.${i}.rule`)} sx={{ width: 5 / 10 }} />
                <IconButton type="button" onClick={() => removeRule(i)} sx={{ mx: 1, my: 0 }}>
                  <DeleteIcon />
                </IconButton>
              </Grid>
            );
          })}
          <Button variant="contained" color="success" onClick={() => appendRule({ rule: '' })} sx={{ mt: 2 }}>
            + ADD NEW RULE
          </Button>
        </PageBlock>
        <Box textAlign="right" sx={{ my: 2 }}>
          <NERFailButton variant="contained" onClick={exitEditMode} sx={{ mx: 1 }}>
            Cancel
          </NERFailButton>
          <NERSuccessButton variant="contained" type="submit" sx={{ mx: 1 }}>
            Submit
          </NERSuccessButton>
        </Box>
      </form>
    </PageLayout>
  );
};

export default ProjectEditContainer;
