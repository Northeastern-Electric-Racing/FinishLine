/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { LinkCreateArgs, Project, User } from 'shared';
import { wbsPipe } from '../../../utils/pipes';
import { routes } from '../../../utils/routes';
import PageBlock from '../../../layouts/PageBlock';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useQuery } from '../../../hooks/utils.hooks';
import { useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Grid, Box, FormControl, Stack, Typography } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import ReactHookEditableList from '../../../components/ReactHookEditableList';
import NERSuccessButton from '../../../components/NERSuccessButton';
import NERFailButton from '../../../components/NERFailButton';
import LinksEditView from '../../../components/Link/LinksEditView';
import PageLayout from '../../../components/PageLayout';
import ChangeRequestDropdown from '../../../components/ChangeRequestDropdown';
import ProjectEditDetails from './ProjectEditDetails';

export interface ProjectFormInput {
  name: string;
  budget: number;
  summary: string;
  links: LinkCreateArgs[];
  crId: number | undefined;
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
  projectLeadId: string | undefined;
  projectManagerId: string | undefined;
}

const schema = yup.object().shape({
  name: yup.string().required('Name is required!'),
  budget: yup.number().required('Budget is required!').min(0).integer('Budget must be an even dollar amount!'),
  links: yup.array().of(
    yup.object().shape({
      linkTypeName: yup.string().required('Link Type is required!'),
      url: yup.string().required('URL is required!').url('Invalid URL')
    })
  ),
  summary: yup.string().required('Summary is required!'),
  crId: yup.number().min(1).required('crId must be a non-zero number!'),
  carNumber: yup.number().min(0).required('A car number is required!')
});

interface ProjectFormContainerProps {
  requiredLinkTypeNames: string[];
  exitEditMode: () => void;
  project?: Project;
  //TODO make this not any?
  onSubmit: (data: any) => void;
  users: User[];
  defaultValues: ProjectFormInput;
  setProjectManagerId: (id: string) => void;
  setProjectLeadId: (id: string) => void;
}

const ProjectFormContainer: React.FC<ProjectFormContainerProps> = ({
  exitEditMode,
  requiredLinkTypeNames,
  project,
  onSubmit,
  users,
  defaultValues,
  setProjectManagerId,
  setProjectLeadId
}) => {
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
      crId: defaultValues.crId,
      rules: defaultValues?.rules.map((rule) => {
        return { rule };
      }),
      links: defaultValues?.links,
      goals: defaultValues?.goals,
      features: defaultValues?.features,
      constraints: defaultValues?.constraints,
      projectLeadId: defaultValues?.projectLeadId,
      projectManagerId: defaultValues?.projectManagerId
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

  return (
    <PageLayout
      title={project ? `${wbsPipe(project.wbsNum)} - ${project.name}` : 'New Project'}
      previousPages={[{ name: 'Projects', route: routes.PROJECTS }]}
      headerRight={<ChangeRequestDropdown control={control} name="crId" />}
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
          setProjectManagerId={setProjectManagerId}
          setProjectLeadId={setProjectLeadId}
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
        <Stack spacing={4}>
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
        </Stack>
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

export default ProjectFormContainer;
