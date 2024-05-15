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
import { Box, Stack, Tooltip, Typography } from '@mui/material';
import ReactHookEditableList from '../../../components/ReactHookEditableList';
import NERSuccessButton from '../../../components/NERSuccessButton';
import NERFailButton from '../../../components/NERFailButton';
import LinksEditView from './LinksEditView';
import PageLayout from '../../../components/PageLayout';
import ProjectFormDetails from './ProjectFormDetails';
import { useAllUsers } from '../../../hooks/users.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { ObjectShape } from 'yup/lib/object';
import CreateChangeRequestModal from '../../CreateChangeRequestPage/CreateChangeRequestModal';
import { ProjectCreateChangeRequestFormInput } from './ProjectEditContainer';
import { useState } from 'react';
import { FormInput as ChangeRequestFormInput } from '../../CreateChangeRequestPage/CreateChangeRequest';
import { NERButton } from '../../../components/NERButton';
import HelpIcon from '@mui/icons-material/Help';

export interface ProjectFormInput {
  name: string;
  budget: number;
  summary: string;
  links: LinkCreateArgs[];
  crId: string;
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
    bulletId: number;
    detail: string;
  }[];
  teamIds: number[];
}

interface ProjectFormContainerProps {
  requiredLinkTypeNames: string[];
  exitEditMode: () => void;
  project?: Project;
  onSubmit: (data: ProjectFormInput) => void;
  defaultValues: ProjectFormInput;
  setProjectManagerId: (id?: string) => void;
  setProjectLeadId: (id?: string) => void;
  schema: yup.ObjectSchema<ObjectShape>;
  projectLeadId?: string;
  projectManagerId?: string;
  onSubmitChangeRequest?: (data: ProjectCreateChangeRequestFormInput) => void;
}

const ProjectFormContainer: React.FC<ProjectFormContainerProps> = ({
  exitEditMode,
  project,
  onSubmit,
  defaultValues,
  setProjectManagerId,
  setProjectLeadId,
  schema,
  projectLeadId,
  projectManagerId,
  onSubmitChangeRequest
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  let changeRequestFormInput: ChangeRequestFormInput | undefined = undefined;

  const allUsers = useAllUsers();
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
      teamIds: defaultValues?.teamIds
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

  const crWatch = watch('crId');
  const changeRequestInputExists = crWatch !== 'null' && crWatch !== '';

  const users = allUsers.data.filter((u) => u.role !== 'GUEST');

  const handleCreateChangeRequest = async (data: ProjectFormInput) => {
    if (onSubmitChangeRequest && changeRequestFormInput) {
      onSubmitChangeRequest({
        ...changeRequestFormInput,
        ...data
      });
    }
  };

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
          <Box display="inline-flex" alignItems="center" justifyContent={'end'}>
            {onSubmitChangeRequest && (
              <Box display="inline-flex" alignItems="center">
                <Tooltip
                  title={
                    <Typography fontSize={'16px'}>
                      {`If you don't enter a Change Request ID into this form, you can create one here that when accepted will
                      ${project ? `edit the selected Project` : `create a new Project`} with the inputted values`}
                    </Typography>
                  }
                  placement="left"
                >
                  <HelpIcon style={{ fontSize: '1.5em', color: 'lightgray' }} />
                </Tooltip>
                <NERButton
                  variant="contained"
                  onClick={() => setIsModalOpen(true)}
                  sx={{ mx: 1 }}
                  disabled={changeRequestInputExists}
                >
                  Create Change Request
                </NERButton>
              </Box>
            )}
            <NERFailButton variant="contained" onClick={exitEditMode} sx={{ mx: 1 }}>
              Cancel
            </NERFailButton>
            <NERSuccessButton disabled={!changeRequestInputExists} variant="contained" type="submit" sx={{ mx: 1 }}>
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
          project={project}
        />
        <Stack spacing={4}>
          <Box>
            <Typography variant="h5" sx={{ mb: 2, mt: 2 }}>
              Links
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
              ls={constraints}
              append={appendConstraint}
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
      {onSubmitChangeRequest && (
        <CreateChangeRequestModal
          onConfirm={async (crFormInput: ChangeRequestFormInput) => {
            changeRequestFormInput = crFormInput;
            await handleSubmit(handleCreateChangeRequest)();
          }}
          onHide={() => setIsModalOpen(false)}
          wbsNum={project ? wbsPipe(project!.wbsNum) : '0.0.0'}
          open={isModalOpen}
        />
      )}
    </form>
  );
};

export default ProjectFormContainer;
