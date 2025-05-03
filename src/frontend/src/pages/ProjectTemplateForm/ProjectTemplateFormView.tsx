import { yupResolver } from '@hookform/resolvers/yup';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { Box, Stack } from '@mui/system';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';
import { ProjectTemplateApiInputs, WorkPackageTemplateApiInputs } from '../../apis/wbs-templates.api';
import { NERButton } from '../../components/NERButton';
import NERSuccessButton from '../../components/NERSuccessButton';
import PageLayout from '../../components/PageLayout';
import { useToast } from '../../hooks/toasts.hooks';
import { routes } from '../../utils/routes';
import { ObjectSchema } from 'yup';
import ReactHookTextField from '../../components/ReactHookTextField';
import React, { useCallback } from 'react';
import ProjectTemplateWorkPackageSection from './ProjectTemplateWorkPackageSection';
import { generateUUID } from '../../utils/form';
import { AttachMoney } from '@mui/icons-material';
import { useAllTeams } from '../../hooks/teams.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { WorkPackageTemplate } from 'shared';

export interface ProjectTemplateFormViewProps {
  exitActiveMode: () => void;
  projectTemplateMutateAsync: (data: ProjectTemplateApiInputs) => void;
  defaultValues?: ProjectTemplateApiInputs;
  schema: ObjectSchema<any>;
}

const ProjectTemplateFormView: React.FC<ProjectTemplateFormViewProps> = ({
  exitActiveMode,
  projectTemplateMutateAsync,
  defaultValues,
  schema
}) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors }
  } = useForm<ProjectTemplateApiInputs>({
    resolver: yupResolver(schema),
    defaultValues: {
      projectName: defaultValues?.projectName,
      templateName: defaultValues?.templateName ?? '',
      templateNotes: defaultValues?.templateNotes ?? '',
      workPackageTemplates: defaultValues?.workPackageTemplates ?? [],
      descriptionBullets: defaultValues?.descriptionBullets ?? [],
      budget: defaultValues?.budget,
      teams: defaultValues?.teams ?? [],
      summary: defaultValues?.summary
    }
  });

  const watchedWorkPackageTemplates = watch('workPackageTemplates');

  const toast = useToast();

  const history = useHistory();

  const { data: teams, isLoading: teamsLoading, isError: teamsIsError, error: teamsError } = useAllTeams();

  const pageTitle = defaultValues ? 'Edit Project Template' : 'Create Project Template';

  const {
    fields: workPackageTemplates,
    append: appendWorkPackageTemplate,
    remove: removeWorkPackageTemplate
  } = useFieldArray({ control, name: 'workPackageTemplates' });

  if (!teams || teamsLoading) return <LoadingIndicator />;

  if (teamsIsError) return <ErrorPage message={teamsError.message} />;

  const onSubmit = async (data: ProjectTemplateApiInputs) => {
    const { templateName, templateNotes, projectName, workPackageTemplates, descriptionBullets, budget, teams, summary } =
      data;

    let sortedTemplates;

    try {
      // Topologically sort the templates by blocking relationships
      sortedTemplates = (() => {
        const templateMap = new Map<string, WorkPackageTemplateApiInputs[][0]>();
        const inDegree = new Map<string, number>();
        const result: WorkPackageTemplateApiInputs[] = [];

        // Initialize the maps
        workPackageTemplates.forEach((template) => {
          templateMap.set(template.workPackageTemplateId!, template);
          inDegree.set(template.workPackageTemplateId!, 0);
        });

        // Calculate in-degrees
        workPackageTemplates.forEach((template) => {
          template.blockedBy.forEach((blockerId) => {
            inDegree.set(blockerId, (inDegree.get(blockerId) || 0) + 1);
          });
        });

        // Collect work packages with no blockers
        const queue = workPackageTemplates.filter((template) => inDegree.get(template.workPackageTemplateId!) === 0);

        // Process the queue
        while (queue.length > 0) {
          const template = queue.shift()!;
          result.push(template);

          template.blockedBy.forEach((blockerId) => {
            const degree = inDegree.get(blockerId)! - 1;
            inDegree.set(blockerId, degree);
            if (degree === 0) {
              queue.push(templateMap.get(blockerId)!);
            }
          });
        }

        // Check for cycles
        if (result.length !== workPackageTemplates.length) {
          throw new Error('Circular blockers detected in WP templates');
        }

        return result;
      })().reverse();
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
        return;
      }
    }

    try {
      const payload: ProjectTemplateApiInputs = {
        templateName,
        templateNotes,
        projectName,
        workPackageTemplates: sortedTemplates!,
        descriptionBullets,
        budget,
        teams,
        summary
      };

      await projectTemplateMutateAsync(payload);
      toast.success(`Project template ${defaultValues ? 'edited' : 'created'} successfully`);
      history.push(routes.ADMIN_TOOLS + '/project-configuration/work-package-templates');
    } catch (error) {
      toast.error(`Error ${defaultValues ? 'editing' : 'creating'} project template`);
    }
  };

  return (
    <form
      id="work-package-template-edit-form"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleSubmit((data) => {
          onSubmit(data);
        })(e);
      }}
      onKeyPress={(e) => {
        e.key === 'Enter' && e.preventDefault();
      }}
    >
      <PageLayout
        stickyHeader
        title={pageTitle}
        headerRight={
          <Box display="inline-flex" alignItems="center" justifyContent={'end'}>
            <Box>
              <NERButton variant="contained" onClick={exitActiveMode} sx={{ mx: 1 }}>
                Cancel
              </NERButton>
              <NERSuccessButton variant="contained" type="submit" sx={{ mx: 1 }} disabled={Object.keys(errors).length > 0}>
                Submit
              </NERSuccessButton>
            </Box>
          </Box>
        }
      >
        <Stack spacing={2}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <ReactHookTextField
                  label="Template Name"
                  control={control}
                  name="templateName"
                  placeholder="Enter template name..."
                  required={false}
                  errorMessage={errors.templateName}
                />
              </FormControl>
              <FormControl fullWidth>
                <ReactHookTextField
                  label="Template Notes"
                  control={control}
                  name="templateNotes"
                  placeholder="Enter template notes..."
                  required={false}
                  errorMessage={errors.templateNotes}
                />
              </FormControl>
            </Stack>
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <ReactHookTextField
                  label="Project Name"
                  control={control}
                  name="projectName"
                  placeholder="Enter project name..."
                  required={false}
                  errorMessage={errors.projectName}
                />
              </FormControl>
              <FormControl fullWidth>
                <ReactHookTextField
                  required={false}
                  label="Project Budget"
                  name="budget"
                  startAdornment={<AttachMoney />}
                  control={control}
                  type="number"
                  placeholder="Enter budget..."
                  errorMessage={errors.budget}
                />
              </FormControl>
            </Stack>
            <FormControl fullWidth>
              <ReactHookTextField
                label="Project Summary"
                control={control}
                name="summary"
                placeholder="Enter summary..."
                required={false}
                errorMessage={errors.summary}
              />
            </FormControl>
            <FormControl>
              <InputLabel id={`teams-label`}>Project Teams</InputLabel>
              <Controller
                name="teams"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Select
                    labelId={'teams-label'}
                    id="teams"
                    multiple
                    fullWidth
                    value={value}
                    label="Project Teams"
                    onChange={(e) => onChange(e.target.value as string[])}
                  >
                    {teams.map((team) => (
                      <MenuItem key={team.teamId} value={team.teamId}>
                        {team.teamName}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
          </Stack>
          {watchedWorkPackageTemplates.map((_workPackageTemplate, index) => (
            <ProjectTemplateWorkPackageSection
              errors={errors}
              workPackages={watchedWorkPackageTemplates}
              index={index}
              register={register}
              control={control}
              removeWorkPackageTemplate={removeWorkPackageTemplate}
            />
          ))}
          <NERButton
            variant="contained"
            onClick={() => {
              const id = generateUUID();
              appendWorkPackageTemplate({
                workPackageTemplateId: id,
                blockedBy: [],
                templateName: `${watch('templateName')} - Work Package ${workPackageTemplates.length + 1}`,
                templateNotes: watch('templateNotes'),
                duration: undefined,
                descriptionBullets: []
              });
            }}
          >
            Add Work Package
          </NERButton>
        </Stack>
      </PageLayout>
    </form>
  );
};

export default ProjectTemplateFormView;
