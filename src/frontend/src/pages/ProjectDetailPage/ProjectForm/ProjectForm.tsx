/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { LinkCreateArgs, Project } from 'shared';
import { wbsPipe } from '../../../utils/pipes';
import { routes } from '../../../utils/routes';
import { useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Box, Stack, Typography } from '@mui/material';
import ReactHookEditableList from '../../../components/ReactHookEditableList';
import NERSuccessButton from '../../../components/NERSuccessButton';
import NERFailButton from '../../../components/NERFailButton';
import LinksEditView from '../../../components/Link/LinksEditView';
import PageLayout from '../../../components/PageLayout';
import ProjectFormDetails from './ProjectFormDetails';
import { useAllUsers } from '../../../hooks/users.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';

export interface ProjectFormInput {
  name: string;
  budget: number;
  summary: string;
  links: LinkCreateArgs[];
  crId: number;
  carNumber: number;
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
  teamId: string;
}

interface ProjectFormContainerProps {
  requiredLinkTypeNames: string[];
  exitEditMode: () => void;
  project?: Project;
  onSubmit: (data: ProjectFormInput) => void;
  defaultValues: ProjectFormInput;
  setProjectManagerId: (id?: string) => void;
  setProjectLeadId: (id?: string) => void;
  createProject?: boolean;
  projectLeadId?: string;
  projectManagerId?: string;
}

const ProjectFormContainer: React.FC<ProjectFormContainerProps> = ({
  exitEditMode,
  requiredLinkTypeNames,
  project,
  onSubmit,
  defaultValues,
  setProjectManagerId,
  setProjectLeadId,
  createProject,
  projectLeadId,
  projectManagerId
}) => {
  const allUsers = useAllUsers();

  const schema = yup.object().shape({
    name: yup.string().required('Name is required!'),
    budget: createProject
      ? yup.number().optional()
      : yup.number().required('Budget is required!').min(0).integer('Budget must be an even dollar amount!'),
    links: createProject
      ? yup.array().of(
          yup
            .object()
            .optional()
            .shape({
              linkTypeName: yup.string().optional(),
              url: yup.string().optional().url('Invalid URL')
            })
        )
      : yup.array().of(
          yup.object().shape({
            linkTypeName: yup.string().required('Link Type is required!'),
            url: yup.string().required('URL is required!').url('Invalid URL')
          })
        ),
    summary: yup.string().required('Summary is required!'),
    crId: yup.number().min(1).required('crId must be a non-zero number!'),
    teamId: createProject ? yup.string().required('A Team Id is required') : yup.string().optional(),
    carNumber: createProject ? yup.number().min(0).required('A car number is required!') : yup.number().optional()
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
      name: defaultValues?.name,
      budget: defaultValues?.budget,
      summary: defaultValues?.summary,
      crId: defaultValues?.crId,
      carNumber: defaultValues?.carNumber,
      rules: defaultValues?.rules,
      links: defaultValues?.links,
      goals: defaultValues?.goals,
      features: defaultValues?.features,
      constraints: defaultValues?.constraints,
      teamId: defaultValues?.teamId
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

  if (allUsers.isLoading || !allUsers.data) return <LoadingIndicator />;
  if (allUsers.isError) {
    return <ErrorPage message={allUsers.error?.message} />;
  }

  const users = allUsers.data.filter((u) => u.role !== 'GUEST');

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
      <PageLayout
        title={project ? `${wbsPipe(project.wbsNum)} - ${project.name}` : 'New Project'}
        previousPages={[{ name: 'Projects', route: routes.PROJECTS }]}
        headerRight={
          <Box textAlign="right">
            <NERFailButton variant="contained" onClick={exitEditMode} sx={{ mx: 1 }}>
              Cancel
            </NERFailButton>
            <NERSuccessButton variant="contained" onClick={(event) => handleSubmit} type="submit" sx={{ mx: 1 }}>
              Submit
            </NERSuccessButton>
          </Box>
        }
      >
        <ProjectFormDetails
          users={users}
          control={control}
          errors={errors}
          setProjectManagerId={setProjectManagerId}
          setProjectLeadId={setProjectLeadId}
          projectLead={projectLeadId}
          projectManager={projectManagerId}
          createProject={createProject}
        />
        <Stack spacing={4}>
          <Box>
            <Typography variant="h5" sx={{ mb: 2 }}>
              {'Links'}
            </Typography>
            <LinksEditView watch={watch} ls={links} register={register} append={appendLink} remove={removeLink} />
          </Box>
          <Box>
            <Typography variant="h5">{'Goals'}</Typography>
            <ReactHookEditableList
              name="goals"
              register={register}
              ls={goals}
              append={appendGoal}
              remove={removeGoal}
              bulletName="Goal"
            />
          </Box>
          <Box>
            <Typography variant="h5">{'Features'}</Typography>
            <ReactHookEditableList
              name="features"
              register={register}
              ls={features}
              append={appendFeature}
              remove={removeFeature}
              bulletName="Feature"
            />
          </Box>
          <Box>
            <Typography variant="h5">{'Constraints'}</Typography>
            <ReactHookEditableList
              name="constraints"
              register={register}
              ls={constraints}
              append={appendConstraint}
              remove={removeConstraint}
              bulletName="Constraint"
            />
          </Box>
          {!createProject && (
            <Box>
              <Typography variant="h5">{'Rules'}</Typography>
              <ReactHookEditableList
                name="rules"
                register={register}
                ls={rules}
                append={appendRule}
                remove={removeRule}
                bulletName="Rule"
              />
            </Box>
          )}
        </Stack>
      </PageLayout>
    </form>
  );
};

export default ProjectFormContainer;
