/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { DescriptionBullet, Project, WbsElementStatus } from 'shared';
import { fullNamePipe, wbsPipe } from '../../../utils/Pipes';
import { routes } from '../../../utils/Routes';
import { useEditSingleProject } from '../../../hooks/projects.hooks';
import { useAllUsers } from '../../../hooks/users.hooks';
import { useAuth } from '../../../hooks/auth.hooks';
import PageTitle from '../../../layouts/PageTitle/PageTitle';
import PageBlock from '../../../layouts/PageBlock';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useQuery } from '../../../hooks/utils.hooks';
import { Controller, FieldArrayWithId, useFieldArray, UseFieldArrayRemove, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Grid, Select, MenuItem, Button, Box, TextField } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { NERButton } from '../../../components/NERButton';

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

const buildEditableBulletList = (
  title: string,
  ls: FieldArrayWithId[],
  register: any,
  name: string,
  append: any,
  remove: UseFieldArrayRemove
) => {
  return (
    <PageBlock title={title}>
      {ls.map((_element, i) => {
        return (
          <Grid item>
            <TextField required sx={{ width: 9 / 10 }} {...register(`${name}.${i}.detail`)} />
            <Button type="button" onClick={() => remove(i)}>
              X
            </Button>
          </Grid>
        );
      })}
      <Button variant="contained" color="success" onClick={() => append({ bulletId: -1, detail: '' })}>
        New Goal
      </Button>
    </PageBlock>
  );
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
  const { register, handleSubmit, control, formState } = useForm({
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
  const statuses = Object.values(WbsElementStatus);

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
      id={'project-edit-form'}
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
      <PageBlock title="Project Details">
        <Grid item xs={12} sm={12}>
          <Grid item sx={{ mb: 1 }}>
            <Controller
              name="wbsElementStatus"
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <Select onChange={onChange} value={value}>
                  {statuses.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </Grid>
        </Grid>
        <Grid item xs={12} md={6}>
          <ReactHookTextField name="name" control={control} sx={{ width: '50%' }} label="Project Name" />
        </Grid>
        <Grid item xs={12} md={6}>
          <ReactHookTextField
            name="budget"
            control={control}
            sx={{ width: '15%' }}
            type="number"
            label="Budget"
            icon={<AttachMoneyIcon />}
          />
        </Grid>
        <Grid item>
          <Controller
            name="projectLeadId"
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <Select onChange={onChange} value={value}>
                {users.map((t) => (
                  <MenuItem key={t.userId} value={t.userId}>
                    {fullNamePipe(t)}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
          <Controller
            name="projectManagerId"
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <Select onChange={onChange} value={value}>
                {users.map((t) => (
                  <MenuItem key={t.userId} value={t.userId}>
                    {fullNamePipe(t)}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
        </Grid>
        <Grid item>
          <ReactHookTextField name="slideDeckLink" control={control} sx={{ width: '50%' }} label="Slide Deck Link" />
        </Grid>
        <Grid item>
          <ReactHookTextField
            name="googleDriveFolderLink"
            control={control}
            sx={{ width: '50%' }}
            label="Google Drive Folder Link"
          />
        </Grid>
        <Grid item>
          <ReactHookTextField
            name="bomLink"
            control={control}
            sx={{ width: '50%' }}
            label="Bom Link"
            errorMessage={formState.errors.bomLink}
          />
        </Grid>
        <Grid item>
          <ReactHookTextField name="taskListLink" control={control} sx={{ width: '50%' }} label="Task List Link" />
        </Grid>
      </PageBlock>
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
      {buildEditableBulletList('Goals', goals, register, 'goals', appendGoal, removeGoal)}
      {buildEditableBulletList('Features', features, register, 'features', appendFeature, removeFeature)}
      {buildEditableBulletList(
        'Other Constraints',
        constraints,
        register,
        'constraints',
        appendConstraint,
        removeConstraint
      )}
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
