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
import { Box, Stack, Typography } from '@mui/material';
import NERSuccessButton from '../../../components/NERSuccessButton';
import NERFailButton from '../../../components/NERFailButton';
import LinksEditView from '../../../components/LinksEditView';
import PageLayout from '../../../components/PageLayout';
import ProjectFormDetails from './ProjectFormDetails';
import { useAllMembers } from '../../../hooks/users.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { useEffect, useState } from 'react';
import { FormInput as ChangeRequestFormInput } from '../../CreateChangeRequestPage/CreateChangeRequestView';
import DescriptionBulletsEditView from '../../../components/DescriptionBulletEditView';
import ProjectTemplateSection from './ProjectTemplateSection';
import { WorkPackageFormViewPayload } from '../../WorkPackageForm/WorkPackageFormView';
import ProjectFormWorkPackageSection from './ProjectFormWorkPackageSection';
import { useToast } from '../../../hooks/toasts.hooks';
import { bulletsToObject, generateUUID } from '../../../utils/form';
import { getMonday } from '../../../utils/datetime.utils';
import CreateChangeRequestModal from '../../CreateChangeRequestPage/CreateChangeRequestModal';
import * as React from 'react';
import { useForm as useFormCR } from 'react-hook-form';
import { yupResolver as yupResolverCR } from '@hookform/resolvers/yup';
import { ChangeRequestFormReturn } from '../../CreateChangeRequestPage/CreateChangeRequestView';

export interface ProjectFormInput {
  name: string;
  budget: number;
  summary: string;
  links: LinkCreateArgs[];
  carNumber?: number;
  teamIds: string[];
  descriptionBullets: DescriptionBulletPreview[];
  workPackages: WorkPackageFormViewPayload[];
}

interface ProjectFormContainerProps {
  requiredLinkTypeNames: string[];
  exitEditMode: () => void;
  project?: Project;
  onSubmit: (data: ProjectFormInput, why?: string, requestedReviewerId?: string) => void;
  defaultValues: ProjectFormInput;
  setManagerId: (id?: string) => void;
  setLeadId: (id?: string) => void;
  schema: yup.ObjectSchema<any>;
  leadId?: string;
  managerId?: string;
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
  managerId
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
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
      carNumber: defaultValues?.carNumber,
      links: defaultValues?.links,
      descriptionBullets: defaultValues?.descriptionBullets ?? [],
      teamIds: defaultValues?.teamIds
    }
  });

  const crSchema = yup.object().shape({
    why: yup.string().required('Why is required'),
    requestedReviewerId: yup.string().optional()
  });
  const { reset: resetCRForm, ...crFormMethods } = useFormCR<ChangeRequestFormInput>({
    resolver: yupResolverCR(crSchema),
    defaultValues: { why: '' }
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
  const watchedLinks = watch('links');
  const watchedDescriptionBullets = watch('descriptionBullets');

  const leadershipChanged = project
    ? leadId !== project.lead?.userId.toString() || managerId !== project.manager?.userId.toString()
    : false;

  const otherFieldsChanged = project
    ? watchedName !== project.name ||
      watchedBudget !== project.budget ||
      watchedSummary !== project.summary ||
      JSON.stringify((watchedLinks ?? []).map((l) => `${l.linkTypeName}:${l.url}`).sort()) !==
        JSON.stringify(project.links.map((l) => `${l.linkType.name}:${l.url}`).sort()) ||
      JSON.stringify(watchedDescriptionBullets) !== JSON.stringify(bulletsToObject(project.descriptionBullets))
    : false;

  const liveOnlyLeadershipChanged = leadershipChanged && !otherFieldsChanged;
  const anyChangesMade = leadershipChanged || otherFieldsChanged;

  const getButtonLabel = () => {
    if (!project) return 'Create Project';
    if (liveOnlyLeadershipChanged) return 'Submit & Implement';
    if (otherFieldsChanged) return 'Submit Change Request';
    return 'Submit & Implement';
  };

  const isButtonDisabled = () => {
    if (!project) return false;
    return !anyChangesMade;
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    if (project && otherFieldsChanged) {
      e.preventDefault();
      e.stopPropagation();
      setIsModalOpen(true);
    }
  };

  useEffect(() => {
    if (selectedProjectTemplate) {
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
  }, [selectedProjectTemplate, watchedName, watchedBudget, watchedTeams, watchedDescriptionBullets, watchedSummary]);

  if (usersIsLoading || !users) return <LoadingIndicator />;
  if (usersIsError) return <ErrorPage message={usersError?.message} />;

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
        handleSubmit((data) => onSubmit(data))(e);
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
          <Box display="inline-flex" alignItems="center" justifyContent="end" flexWrap="nowrap" gap={1}>
            <NERFailButton variant="contained" onClick={exitEditMode}>
              Cancel
            </NERFailButton>
            <NERSuccessButton variant="contained" type="submit" disabled={isButtonDisabled()} onClick={handleButtonClick}>
              {getButtonLabel()}
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

              const workPackages = (template?.workPackageTemplates || []).map((wp) => ({
                ...wp,
                name: wp.workPackageName ?? '',
                stage: wp.stage ?? 'NONE',
                startDate: getMonday(new Date()),
                workPackageId: templateToIdMap.get(wp.workPackageTemplateId)!,
                duration: wp.duration ?? 0,
                blockedBy: wp.blockedBy.map((blocker) => templateToIdMap.get(blocker.workPackageTemplateId)!)
              }));

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

      {project && (
        <CreateChangeRequestModal
          onConfirm={async (crFormInput: ChangeRequestFormInput) => {
            await handleSubmit((data) => onSubmit(data, crFormInput.why, crFormInput.requestedReviewerId))();
            setIsModalOpen(false);
            resetCRForm();
          }}
          onHide={() => {
            setIsModalOpen(false);
            resetCRForm();
          }}
          wbsNum={wbsPipe(project.wbsNum)}
          open={isModalOpen}
          changeRequestFormReturn={crFormMethods}
        />
      )}
    </form>
  );
};

export default ProjectFormContainer;
