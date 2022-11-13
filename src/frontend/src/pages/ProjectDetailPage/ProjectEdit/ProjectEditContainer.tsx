/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { DescriptionBullet, Project } from 'shared';
import { wbsPipe } from '../../../utils/Pipes';
import { routes } from '../../../utils/Routes';
import { useEditSingleProject } from '../../../hooks/projects.hooks';
import { useAllUsers } from '../../../hooks/users.hooks';
import { useAuth } from '../../../hooks/auth.hooks';
import PageTitle from '../../../layouts/PageTitle/PageTitle';
import PageBlock from '../../../layouts/PageBlock';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useQuery } from '../../../hooks/utils.hooks';
import { useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Grid, Button, Box, TextField } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { NERButton } from '../../../components/NERButton';
import ProjectEditDetails from './ProjectEditDetails';
import ReactHookEditableList from '../../../components/ReactHookEditableList';

const bulletsToObject = (bullets: DescriptionBullet[]) =>
  bullets
    .filter((bullet) => !bullet.dateDeleted)
    .map((bullet) => {
      return { bulletId: bullet.id, detail: bullet.detail };
    });

const isValidURL = (url: string | undefined) => {
  if (url) {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  }
  return false;
};

const mapBulletsToPayload = (ls: { bulletId: number; detail: string }[]) => {
  return ls.map((ele) => {
    return { id: ele.bulletId !== -1 ? ele.bulletId : undefined, detail: ele.detail };
  });
};

const schema = yup.object().shape({
  slideDeckLink: yup
    .string()
    .required('Slide deck link is required!')
    .test('slide-deck-is-url', 'Slide deck is not a valid link!', isValidURL),
  googleDriveFolderLink: yup
    .string()
    .required('Google Drive folder link is required!')
    .test('google-drive-folder-is-url', 'Google Drive folder is not a valid link!', isValidURL),
  bomLink: yup
    .string()
    .required('Bom link is required!')
    .test('bom-link-is-url', 'Bom link is not a valid link!', isValidURL),
  taskListLink: yup
    .string()
    .required('Task list link is required!')
    .test('task-list-is-url', 'Task list is not a valid link!', isValidURL)
});

interface ProjectEditContainerProps {
  project: Project;
  exitEditMode: () => void;
}

const ProjectEditContainer: React.FC<ProjectEditContainerProps> = ({ project, exitEditMode }) => {
  const auth = useAuth();
  const query = useQuery();
  const allUsers = useAllUsers();
  const { slideDeckLink, bomLink, gDriveLink, taskListLink, name, budget, summary } = project;
  const { register, handleSubmit, control } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name,
      budget,
      slideDeckLink,
      bomLink,
      taskListLink,
      googleDriveFolderLink: gDriveLink,
      summary,
      wbsElementStatus: project.status,
      projectLeadId: project.projectLead?.userId,
      projectManagerId: project.projectManager?.userId,
      crId: query.get('crId') || '',
      rules: project.rules.map((rule) => {
        return { rule };
      }),
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
  const { mutateAsync } = useEditSingleProject(project.wbsNum);

  if (allUsers.isLoading || !allUsers.data || !auth.user) return <LoadingIndicator />;
  if (allUsers.isError) {
    return <ErrorPage message={allUsers.error?.message} />;
  }

  const users = allUsers.data.filter((u) => u.role !== 'GUEST');

  const onSubmit = async (data: any, e: any) => {
    const { userId } = auth.user!;
    const { name, budget, summary, wbsElementStatus, bomLink, googleDriveFolderLink, taskListLink, slideDeckLink } = data;
    const rules = data.rules.map((rule: any) => rule.rule || rule);
    const goals = mapBulletsToPayload(data.goals);
    const features = mapBulletsToPayload(data.features);
    const otherConstraints = mapBulletsToPayload(data.constraints);

    const payload = {
      name,
      budget: parseInt(budget),
      summary,
      bomLink,
      googleDriveFolderLink,
      taskListLink,
      slideDeckLink,
      userId,
      wbsElementStatus,
      projectId: project.id,
      crId: parseInt(data.crId),
      rules,
      goals,
      features,
      otherConstraints,
      projectLead: data.projectLeadId,
      projectManager: data.projectManagerId
    };

    try {
      await mutateAsync(payload);
      exitEditMode();
    } catch (e) {
      if (e instanceof Error) {
        alert(e.message);
      }
    }
  };

  return (
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
      <PageTitle
        title={`${wbsPipe(project.wbsNum)} - ${project.name}`}
        previousPages={[{ name: 'Projects', route: routes.PROJECTS }]}
        actionButton={
          <ReactHookTextField name="crId" control={control} label="Change Request Id" type="number" size="small" />
        }
      />
      <ProjectEditDetails project={project} users={users} control={control} />
      <PageBlock title="Project Summary">
        <Grid item>
          <ReactHookTextField
            name="summary"
            control={control}
            sx={{ width: '50%' }}
            label="Summary"
            multiline={true}
            rows={5}
          />
        </Grid>
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
            <Grid item>
              <TextField required {...register(`rules.${i}.rule`)} />
              <Button type="button" onClick={() => removeRule(i)}>
                X
              </Button>
            </Grid>
          );
        })}
        <Button variant="contained" color="success" onClick={() => appendRule({ rule: '' })}>
          New Rule
        </Button>
      </PageBlock>

      <Box display="flex">
        <Button variant="contained" color="success" type="submit">
          Submit
        </Button>
        <NERButton variant="contained" color="error" onClick={exitEditMode}>
          Cancel
        </NERButton>
      </Box>
    </form>
  );
};

export default ProjectEditContainer;
