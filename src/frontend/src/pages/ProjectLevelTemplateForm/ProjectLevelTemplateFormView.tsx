import { ProjectLevelTemplateApiInputs } from '../../apis/work-packages.api';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useFieldArray, useForm } from 'react-hook-form';
import PageLayout from '../../components/PageLayout';
import { Box, Stack } from '@mui/system';
import { NERButton } from '../../components/NERButton';
import NERSuccessButton from '../../components/NERSuccessButton';
import { FormControl, FormLabel, Grid, Typography } from '@mui/material';
import { useEffect } from 'react';
import { WorkPackageStage } from 'shared';
import ReactHookTextField from '../../components/ReactHookTextField';
import ProjectLevelTemplateFormDetails from './ProjectLevelTemplateFormDetails';
import { generateUUID } from '../../utils/form';

interface ProjectLevelTemplateFormViewProps {
  exitActiveMode: () => void;
  mutateAsync: (_: ProjectLevelTemplateApiInputs) => void;
  defaultValues?: ProjectLevelTemplateFormViewPayload;
  schema: yup.AnyObjectSchema;
}

interface SmallTemplatePayload {
  templateId: string;
  workPackageName: string;
  durationWeeks: number;
  stage: WorkPackageStage | 'NONE';
  blockedBy: string[];
}

export interface ProjectLevelTemplateFormViewPayload {
  templateName: string;
  templateNotes: string;
  smallTemplates: SmallTemplatePayload[];
}

const ProjectLevelTemplateFormView: React.FC<ProjectLevelTemplateFormViewProps> = ({
  exitActiveMode,
  defaultValues,
  schema,
  mutateAsync
}) => {
  const {
    handleSubmit,
    control,
    watch,
    formState: { errors, isValid },
    reset
  } = useForm<ProjectLevelTemplateFormViewPayload>({
    resolver: yupResolver(schema),
    defaultValues: {
      templateName: defaultValues?.templateName ?? '',
      templateNotes: defaultValues?.templateNotes ?? '',
      smallTemplates: defaultValues?.smallTemplates ?? [
        {
          templateId: generateUUID(),
          workPackageName: '',
          durationWeeks: 1,
          stage: 'NONE',
          blockedBy: []
        }
      ]
    }
  });

  const {
    fields: smallTemplates,
    append: smallTemplateAppend,
    remove: smallTemplateRemove
  } = useFieldArray({
    control,
    name: 'smallTemplates'
  });

  const watchedSmallTemplates = watch('smallTemplates');

  useEffect(() => {}, [watchedSmallTemplates]);

  const onSubmit = handleSubmit(async (data: any) => {
    await mutateAsync(data);

    exitActiveMode();
    reset();
  });

  return (
    <form id="project-level-template-form" onSubmit={onSubmit}>
      <PageLayout
        stickyHeader
        title={defaultValues ? 'Edit Project-Level Template' : 'Create Project-Level Template'}
        headerRight={
          <Box display="inline-flex" alignItems="center" justifyContent={'end'}>
            <Box>
              <NERButton variant="contained" onClick={exitActiveMode} sx={{ mx: 1 }}>
                Cancel
              </NERButton>
              <NERSuccessButton variant="contained" type="submit" sx={{ mx: 1 }} disabled={!isValid}>
                Submit
              </NERSuccessButton>
            </Box>
          </Box>
        }
      >
        <Stack rowGap={4}>
          <Grid container rowSpacing={1} columnSpacing={2}>
            <Grid item xs={12}>
              <Typography variant="h5">Template Details</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <FormLabel>Template Name</FormLabel>
                <ReactHookTextField
                  name="templateName"
                  required
                  control={control}
                  placeholder="Enter template name..."
                  errorMessage={errors.templateName}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <FormLabel>Template Notes</FormLabel>
                <ReactHookTextField
                  name="templateNotes"
                  required
                  control={control}
                  placeholder="Add a brief description for the template..."
                  errorMessage={errors.templateNotes}
                />
              </FormControl>
            </Grid>
          </Grid>
          {watchedSmallTemplates.map((_, index) => (
            <ProjectLevelTemplateFormDetails
              index={index}
              control={control}
              errors={errors}
              firstTemplate={index === 0}
              lastTemplate={index === smallTemplates.length - 1}
              smallTemplateAppend={smallTemplateAppend}
              onRemove={smallTemplateRemove}
              blockedByOptions={watchedSmallTemplates.slice(0, index).map((option, optionIndex) => {
                return {
                  id: option.templateId,
                  label: option.workPackageName === '' ? `Work Package ${optionIndex + 1}` : option.workPackageName
                };
              })}
              isValid={isValid}
            />
          ))}
        </Stack>
      </PageLayout>
    </form>
  );
};

export default ProjectLevelTemplateFormView;
