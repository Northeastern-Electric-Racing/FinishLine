/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { DescriptionBulletPreview, LinkCreateArgs, Project, ProjectTemplate } from 'shared';
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
import { useAllMembers } from '../../../hooks/users.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import CreateChangeRequestModal from '../../CreateChangeRequestPage/CreateChangeRequestModal';
import { ProjectCreateChangeRequestFormInput } from './ProjectEditContainer';
import { useEffect, useState } from 'react';
import { FormInput as ChangeRequestFormInput } from '../../CreateChangeRequestPage/CreateChangeRequestView';
import { NERButton } from '../../../components/NERButton';
import HelpIcon from '@mui/icons-material/Help';
import DescriptionBulletsEditView from '../../../components/DescriptionBulletEditView';
import ProjectTemplateSection from './ProjectTemplateSection';
import { WorkPackageFormViewPayload } from '../../WorkPackageForm/WorkPackageFormView';
import ProjectFormWorkPackageSection from './ProjectFormWorkPackageSection';
import { useToast } from '../../../hooks/toasts.hooks';
import { generateUUID } from '../../../utils/form';
import { getMonday } from '../../../utils/datetime.utils';
import { ChangeRequestFormReturn } from '../../CreateChangeRequestPage/CreateChangeRequestView';

export interface ProjectFormInput {
  name: string;
  budget: number;
  summary: string;
  links: LinkCreateArgs[];
  crId?: string;
  carNumber?: number;
  teamIds: string[];
  descriptionBullets: DescriptionBulletPreview[];
  workPackages: WorkPackageFormViewPayload[];
}

interface ProjectFormContainerProps {
  requiredLinkTypeNames: string[];
  exitEditMode: () => void;
  project?: Project;
  onSubmit: (data: ProjectFormInput) => void;
  defaultValues: ProjectFormInput;
  setManagerId: (id?: string) => void;
  setLeadId: (id?: string) => void;
  schema: yup.ObjectSchema<any>;
  leadId?: string;
  managerId?: string;
  onSubmitChangeRequest?: (data: ProjectCreateChangeRequestFormInput) => void;
  setCarNumber: (carNumber: number) => void;
  carNumber?: number;
  changeRequestFormReturn: ChangeRequestFormReturn;
  onlyLeadershipChanged?: boolean;
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
  onSubmitChangeRequest,
  setCarNumber,
  changeRequestFormReturn,
  onlyLeadershipChanged
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  let changeRequestFormInput: ChangeRequestFormInput | undefined = undefined;

  const toast = useToast();

  const { data: users, isLoading: usersIsLoading, isError: usersIsError, error: usersError } = useAllMembers();
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    setValue
  } = useForm<ProjectFormInput>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: defaultValues?.name,
      budget: defaultValues?.budget,
      summary: defaultValues?.summary,
      crId: defaultValues?.crId,
      carNumber: defaultValues?.carNumber,
      links: defaultValues?.links,
      descriptionBullets: defaultValues?.descriptionBullets ?? [],
      teamIds: defaultValues?.teamIds
    }
  });

  const {
    fields: descriptionBullets,
    append: appendDescriptionBullet,
    remove: removeDescriptionBullet
  } = useFieldArray({ control, name: 'descriptionBullets' });

  const { fields: links, append: appendLink, remove: removeLink } = useFieldArray({ control, name: 'links' });

  const {
    fields: workPackages,
    append: appendWorkPackage,
    remove: removeWorkPackage
  } = useFieldArray({ control, name: 'workPackages' });

  const [selectedProjectTemplate, setSelectedProjectTemplate] = useState<ProjectTemplate>();

  const watchedName = watch('name');
  const watchedTeams = watch('teamIds');
  const watchedBudget = watch('budget');
  const watchedSummary = watch('summary');
  const watchedDescriptionBullets = watch('descriptionBullets');

  useEffect(() => {
    if (selectedProjectTemplate) {
      setValue('crId', '');

      let { projectName, teams, budget, descriptionBullets, summary } = selectedProjectTemplate;

      projectName = projectName || '';
      budget = budget || 0;
      teams = teams || [];
      descriptionBullets = descriptionBullets || [];
      summary = summary || '';

      if (
        watchedName !== projectName ||
        watchedBudget !== budget ||
        JSON.stringify(watchedTeams) !== JSON.stringify(teams.map((t) => t.teamId)) ||
        watchedSummary !== summary ||
        JSON.stringify(watchedDescriptionBullets) !== JSON.stringify(descriptionBullets)
      ) {
        setSelectedProjectTemplate(undefined);
      }
    }
  }, [
    selectedProjectTemplate,
    watchedName,
    watchedBudget,
    watchedTeams,
    watchedDescriptionBullets,
    watchedSummary,
    setValue
  ]);

  if (usersIsLoading || !users) return <LoadingIndicator />;
  if (usersIsError) {
    return <ErrorPage message={usersError?.message} />;
  }

  const crWatch = watch('crId');
  const changeRequestInputExists = !!crWatch && crWatch !== 'null' && crWatch !== '';

  const handleCreateChangeRequest = async (data: ProjectFormInput) => {
    if (onSubmitChangeRequest && changeRequestFormInput) {
      onSubmitChangeRequest({ ...changeRequestFormInput, ...data });
    }
  };

  const detectCycle = (workPackages: WorkPackageFormViewPayload[]): boolean => {
    const visited = new Set<string>();
    const stack = new Set<string>();

    const hasCycle = (wpId: string): boolean => {
      if (stack.has(wpId)) return true;
      if (visited.has(wpId)) return false;

      visited.add(wpId);
      stack.add(wpId);

      const workPackage = workPackages.find((wp) => wp.workPackageId === wpId);
      if (workPackage) {
        for (const blockedById of workPackage.blockedBy) {
          if (hasCycle(blockedById)) return true;
        }
      }

      stack.delete(wpId);
      return false;
    };

    for (const wp of workPackages) {
      if (hasCycle(wp.workPackageId)) return true;
    }

    return false;
  };

  return (
    <form
      noValidate
      id="project-edit-form"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (detectCycle(watch('workPackages'))) {
          toast.error('Error: Circular blocker relationship detected in work packages');
          return;
        }
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
                  disabled={changeRequestInputExists || !onlyLeadershipChanged}
                >
                  Create Change Request
                </NERButton>
              </Box>
            )}
            <NERFailButton variant="contained" onClick={exitEditMode} sx={{ mx: 1 }}>
              Cancel
            </NERFailButton>
            <NERSuccessButton
              disabled={!changeRequestInputExists && !!project && onlyLeadershipChanged}
              variant="contained"
              type="submit"
              sx={{ mx: 1 }}
            >
              Submit
            </NERSuccessButton>
          </Box>
        }
      >
        {!project && (
          <ProjectTemplateSection
            selectedProjectTemplate={selectedProjectTemplate}
            setSelectedProjectTemplate={(template) => {
              setValue('name', template?.projectName || '');
              setValue('budget', template?.budget || 0);
              setValue('summary', template?.summary || '');
              setValue('descriptionBullets', template?.descriptionBullets || []);
              setValue(
                'teamIds',
                (template?.teams || []).map((t) => t.teamId)
              );

              const templateToIdMap = new Map<string, string>();
              template?.workPackageTemplates?.forEach((wp) => {
                const id = generateUUID();
                templateToIdMap.set(wp.workPackageTemplateId, id);
              });

              const workPackages = (template?.workPackageTemplates || []).map((wp) => {
                return {
                  ...wp,
                  name: wp.workPackageName ?? '',
                  stage: wp.stage ?? 'NONE',
                  startDate: getMonday(new Date()),
                  workPackageId: templateToIdMap.get(wp.workPackageTemplateId)!,
                  duration: wp.duration ?? 0,
                  blockedBy: wp.blockedBy.map((blocker) => templateToIdMap.get(blocker.workPackageTemplateId)!)
                };
              });

              setValue('workPackages', workPackages);

              setSelectedProjectTemplate(template);
            }}
          />
        )}
        <ProjectFormDetails
          users={users}
          control={control}
          errors={errors}
          setManagerId={setManagerId}
          setLeadId={setLeadId}
          leadId={leadId}
          managerId={managerId}
          project={project}
          setCarNumber={setCarNumber}
        />
        <Stack spacing={4}>
          <Box>
            <Typography variant="h5" sx={{ mb: 2, mt: 2 }}>
              {!!project ? 'Links' : 'Links (optional)'}
            </Typography>
            <LinksEditView
              watch={watch}
              control={control}
              ls={links}
              register={register}
              append={appendLink}
              remove={removeLink}
              enforceRequired={!!project}
              errors={errors}
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
          {!project && (
            <Box>
              <ProjectFormWorkPackageSection
                workPackages={workPackages ?? []}
                watch={watch}
                register={register}
                append={appendWorkPackage}
                remove={removeWorkPackage}
                control={control}
                errors={errors}
              />
            </Box>
          )}
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
          changeRequestFormReturn={changeRequestFormReturn}
        />
      )}
    </form>
  );
};

export default ProjectFormContainer;
