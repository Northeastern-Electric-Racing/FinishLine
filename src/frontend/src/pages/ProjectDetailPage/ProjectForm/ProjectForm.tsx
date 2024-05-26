/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { DescriptionBulletPreview, LinkCreateArgs, Project } from 'shared';
import { wbsPipe } from '../../../utils/pipes';
import { routes } from '../../../utils/routes';
import { useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Box, Stack, Tooltip, Typography } from '@mui/material';
import NERSuccessButton from '../../../components/NERSuccessButton';
import NERFailButton from '../../../components/NERFailButton';
import LinksEditView from '../../../components/LinksEditView';
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
import DescriptionBulletsEditView from '../../../components/DescriptionBulletEditView';

export interface ProjectFormInput {
  name: string;
  budget: number;
  summary: string;
  links: LinkCreateArgs[];
  crId: string;
  carNumber: number;
  teamIds: number[];
  descriptionBullets: DescriptionBulletPreview[];
}

interface ProjectFormContainerProps {
  requiredLinkTypeNames: string[];
  exitEditMode: () => void;
  project?: Project;
  onSubmit: (data: ProjectFormInput) => void;
  defaultValues: ProjectFormInput;
  setManagerId: (id?: string) => void;
  setLeadId: (id?: string) => void;
  schema: yup.ObjectSchema<ObjectShape>;
  leadId?: string;
  managerId?: string;
  onSubmitChangeRequest?: (data: ProjectCreateChangeRequestFormInput) => void;
}

const ProjectFormContainer: React.FC<ProjectFormContainerProps> = ({
  exitEditMode,
  project,
  onSubmit,
  defaultValues,
  setLeadId,
  setManagerId,
  schema,
  leadId,
  managerId,
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
      links: defaultValues?.links,
      descriptionBullets: defaultValues?.descriptionBullets,
      teamIds: defaultValues?.teamIds
    }
  });

  const {
    fields: descriptionBullets,
    append: appendDescriptionBullet,
    remove: removeDescriptionBullet
  } = useFieldArray({ control, name: 'descriptionBullets' });

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
          setManagerId={setManagerId}
          setLeadId={setLeadId}
          leadId={leadId}
          managerId={managerId}
          project={project}
        />
        <Stack spacing={4}>
          <Box>
            <Typography variant="h5" sx={{ mb: 2, mt: 2 }}>
              {!!project ? 'Links' : 'Links (optional)'}
            </Typography>
            <LinksEditView
              watch={watch}
              ls={links}
              register={register}
              append={appendLink}
              remove={removeLink}
              enforceRequired={!!project}
            />
          </Box>
          <Box>
            <DescriptionBulletsEditView
              type="project"
              watch={watch}
              ls={descriptionBullets}
              register={register}
              append={appendDescriptionBullet}
              remove={removeDescriptionBullet}
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
