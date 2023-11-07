/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { LinkCreateArgs, Project, User } from 'shared';
import { wbsPipe } from '../../../utils/pipes';
import { routes } from '../../../utils/routes';
import { useEditSingleProject } from '../../../hooks/projects.hooks';
import { useAllUsers } from '../../../hooks/users.hooks';
import PageBlock from '../../../layouts/PageBlock';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useQuery } from '../../../hooks/utils.hooks';
import {
  FieldErrorsImpl,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  UseFormRegister,
  UseFormWatch,
  useFieldArray,
  useForm
} from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Grid, Box, FormControl, Stack, Typography } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import ReactHookEditableList from '../../../components/ReactHookEditableList';
import { bulletsToObject, mapBulletsToPayload } from '../../../utils/form';
import NERSuccessButton from '../../../components/NERSuccessButton';
import NERFailButton from '../../../components/NERFailButton';
import { useToast } from '../../../hooks/toasts.hooks';
import LinksEditView from '../../../components/Link/LinksEditView';
import { EditSingleProjectPayload } from '../../../utils/types';
import { ReactElement, useState } from 'react';
import PageLayout from '../../../components/PageLayout';
import ChangeRequestDropdown from '../../../components/ChangeRequestDropdown';
import { Control } from 'react-hook-form';
import { JsxElement } from 'typescript';

export interface ProjectFormInput {
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

interface ProjectFormContainerProps {
  requiredLinkTypeNames: string[];
  exitEditMode: () => void;
  project: Project;
  control: Control<ProjectFormInput>;
  onSubmit: (data: ProjectFormInput) => void;
  register: UseFormRegister<any>;
  appendLink: UseFieldArrayAppend<any, any>;
  removeLink: UseFieldArrayRemove;
  links: Record<'id', string>[];
  watch: UseFormWatch<ProjectFormInput>;
  goals: Record<'id', string>[];
  appendGoal: UseFieldArrayAppend<any, any>;
  removeGoal: UseFieldArrayRemove;
  features: Record<'id', string>[];
  appendFeature: UseFieldArrayAppend<any, any>;
  removeFeature: UseFieldArrayRemove;
  constraints: Record<'id', string>[];
  appendConstraint: UseFieldArrayAppend<any, any>;
  removeConstraint: UseFieldArrayRemove;
  rules: Record<'id', string>[];
  appendRule: UseFieldArrayAppend<any, any>;
  removeRule: UseFieldArrayRemove;
  handleSubmit: Function;
  users: User[];
  errors: FieldErrorsImpl<ProjectFormInput>;
  projectEditDetails: ReactElement<any, any>;
}

export interface ProjectFormInput {
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

const ProjectFormContainer: React.FC<ProjectFormContainerProps> = ({
  exitEditMode,
  requiredLinkTypeNames,
  project,
  control,
  onSubmit,
  register,
  links,
  appendLink,
  removeLink,
  watch,
  goals,
  appendGoal,
  removeGoal,
  features,
  appendFeature,
  removeFeature,
  constraints,
  appendConstraint,
  removeConstraint,
  rules,
  appendRule,
  removeRule,
  handleSubmit,
  users,
  errors,
  projectEditDetails
}) => {
  return (
    <PageLayout
      title={`${wbsPipe(project.wbsNum)} - ${project.name}`}
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
        {projectEditDetails}
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
