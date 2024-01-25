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
import { useCreateSingleProject } from '../../../hooks/projects.hooks';
import CreateChangeRequest from '../../CreateChangeRequestPage/CreateChangeRequest';
import { createSingleProject } from '../../../apis/projects.api';
import CreateChangeRequestsView from '../../CreateChangeRequestPage/CreateChangeRequestView';
import { getSingleChangeRequest } from '../../../apis/change-requests.api';

export interface ProjectFormInput {
  name: string;
  budget: number;
  summary: string;
  links: LinkCreateArgs[];
  crId: string;
  carNumber: number;
  goals: {
    id: number;
    detail: string;
  }[];
  features: {
    id: number;
    detail: string;
  }[];
  constraints: {
    id: number;
    detail: string;
  }[];
  rules: {
    id: number;
    detail: string;
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
  projectLeadId,
  projectManagerId
}) => {
  const allUsers = useAllUsers();
  const schema = !project
    ? yup.object().shape({
        name: yup.string().required('Name is required!'),
        crId: yup.number().min(1).required('crId must be a non-zero number!'),
        carNumber: yup.number().min(0).required('A car number is required!'),
        teamId: yup.string().required('A Team Id is required'),
        budget: yup.number().optional(),
        summary: yup.string().required('Summary is required!'),
        projectLeadId: yup.number().optional(),
        projectManagerId: yup.number().optional(),
        links: yup
          .array()
          .optional()
          .of(
            yup
              .object()
              .optional()
              .shape({
                linkTypeName: yup.string().optional(),
                url: yup.string().optional().url('Invalid URL')
              })
          )
      })
    : yup.object().shape({
        name: yup.string().required('Name is required!'),
        crId: yup.number().min(1).required('crId must be a non-zero number!'),
        budget: yup.number().required('Budget is required!').min(0).integer('Budget must be an even dollar amount!'),
        summary: yup.string().required('Summary is required!'),
        links: yup.array().of(
          yup.object().shape({
            linkTypeName: yup.string().required('Link Type is required!'),
            url: yup.string().required('URL is required!').url('Invalid URL')
          })
        ),
        teamId: yup.string().optional(),
        carNumber: yup.number().optional()
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
      noValidate
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
        stickyHeader
        title={project ? `${wbsPipe(project.wbsNum)} - ${project.name}` : 'New Project'}
        previousPages={[{ name: 'Projects', route: routes.PROJECTS }]}
        headerRight={
          <Box textAlign="right">
            <NERSuccessButton variant="contained" onClick={() => createSingleProject({
                crId: parseInt(defaultValues.crId),
                name: defaultValues.name,
                carNumber: defaultValues.carNumber || 0,
                summary: defaultValues.summary,
                teamIds: [],
                budget: defaultValues.budget || 0,
                rules: defaultValues.rules.map(rule => rule.detail.toString()),
                goals: defaultValues.goals,
                features: defaultValues.features || [{ bulletId: 0, detail: 'string' }],
                otherConstraints: defaultValues.constraints || [{ bulletId: 0, detail: 'string' }],
                links: defaultValues.links || [],
                projectLeadId: parseInt(projectLeadId),
                projectManagerId: parseInt(projectManagerId)
                crStatus: 'pending' // Set the crStatus to 'pending'
              })}>
              Create Change Request
            </NERSuccessButton>
            <NERFailButton variant="contained" onClick={exitEditMode}
              sx={{ mx: 1 }}>
              Cancel
            </NERFailButton>
            <NERSuccessButton variant="contained" onClick={(event) => handleSubmit} type="submit" sx={{ mx: 1 }}>
              Submit
            </NERSuccessButton>
          </Box>        }
      >
        <ProjectFormDetails
          users={users}
          control={control}
          errors={errors}
          setProjectManagerId={setProjectManagerId}
          setProjectLeadId={setProjectLeadId}
          projectLead={projectLeadId}
          projectManager={projectManagerId}
          project={project}
        />
        <Stack spacing={4}>
          <Box>
            <Typography variant="h5" sx={{ mb: 2, mt: 2 }}>
              {!project ? 'Links (optional)' : 'Links'}
            </Typography>
            <LinksEditView watch={watch} ls={links} register={register} append={appendLink} remove={removeLink} />
          </Box>
          <Box>
            <Typography variant="h5">{!project ? 'Goals (optional)' : 'Goals'}</Typography>
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
            <Typography variant="h5">{!project ? 'Features (optional)' : 'Features'}</Typography>
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
            <Typography variant="h5">{!project ? 'Constraints (optional)' : 'Constraints'}</Typography>
            <ReactHookEditableList
              name="constraints"
              register={register}
              ls={constraints}              append={appendConstraint}
              remove={removeConstraint}
              bulletName="Constraint"
            />
          </Box>
          <Box>
            <Typography variant="h5">{!project ? 'Rules (optional)' : 'Rules'}</Typography>
            <ReactHookEditableList
              name="rules"
              register={register}
              ls={rules}
              append={appendRule}
              remove={removeRule}
              bulletName="Rule"
            />
          </Box>
        </Stack>
      </PageLayout>
    </form>
  );
};

export default ProjectFormContainer;
type undefined is not assignable to type string
