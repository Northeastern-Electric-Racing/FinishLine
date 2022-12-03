/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Project } from 'shared';
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
import { Grid, Button, Box, TextField, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ReactHookTextField from '../../../components/ReactHookTextField';
import ProjectEditDetails from './ProjectEditDetails';
import ReactHookEditableList from '../../../components/ReactHookEditableList';
import { bulletsToObject, mapBulletsToPayload } from '../../../utils/form';

const schema = yup.object().shape({
  name: yup.string().required('Name is required!'),
  budget: yup.number().required('Budget is required!').min(0).integer('Budget must be an even dollar amount!'),
  slideDeckLink: yup.string().required('Slide deck link is required!').url('Invalid URL'),
  googleDriveFolderLink: yup.string().required('Google Drive folder link is required!').url('Invalid URL'),
  bomLink: yup.string().url('Invalid URL').required('Bom link is required!'),
  taskListLink: yup.string().required('Task list link is required!').url('Invalid URL'),
  summary: yup.string().required('Summary is required!')
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
  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm({
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

  const { userId } = auth.user;
  const users = allUsers.data.filter((u) => u.role !== 'GUEST');

  const onSubmit = async (data: any) => {
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
      <ProjectEditDetails users={users} control={control} errors={errors} />
      <PageBlock title="Project Summary">
        <Grid item sx={{ mt: 2 }}>
          <ReactHookTextField
            name="summary"
            control={control}
            sx={{ width: '50%' }}
            label="Summary"
            multiline={true}
            rows={5}
            errorMessage={errors.summary}
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

      <Box textAlign="center" sx={{ my: 2 }}>
        <Button variant="contained" color="success" type="submit" sx={{ mx: 2 }}>
          Submit
        </Button>
        <Button variant="contained" color="error" onClick={exitEditMode} sx={{ mx: 2 }}>
          Cancel
        </Button>
      </Box>
    </form>
  );
};

export default ProjectEditContainer;
