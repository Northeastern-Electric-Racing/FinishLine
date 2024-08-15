import { WorkPackageTemplateApiInputs } from '../../apis/work-packages.api';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import PageLayout from '../../components/PageLayout';
import { Box, Stack } from '@mui/system';
import { NERButton } from '../../components/NERButton';
import NERSuccessButton from '../../components/NERSuccessButton';
import { FormControl, FormLabel, Grid, TextField, Typography } from '@mui/material';
import { useEffect } from 'react';
import { WorkPackageStage } from 'shared';
import ReactHookTextField from '../../components/ReactHookTextField';

interface ProjectLevelTemplateFormViewProps {
  exitActiveMode: () => void;
  mutateAsync: (_: WorkPackageTemplateApiInputs) => void;
  defaultValues?: ProjectLevelTemplateFormViewPayload;
  schema: yup.AnyObjectSchema;
  templateId?: string;
}

interface SmallTemplatePayload {
  workPackageName: string;
  durationWeeks: number;
  stage: WorkPackageStage | undefined;
}

export interface ProjectLevelTemplateFormViewPayload {
  templateName: string;
  templateNotes: string;
  smallTemplates: SmallTemplatePayload[];
}

const ProjectLevelTemplateFormView: React.FC<ProjectLevelTemplateFormViewProps> = ({
  exitActiveMode,
  mutateAsync,
  defaultValues,
  schema,
  templateId
}) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors }
  } = useForm<ProjectLevelTemplateFormViewPayload>({
    resolver: yupResolver(schema),
    defaultValues: {
      templateName: defaultValues?.templateName ?? '',
      templateNotes: defaultValues?.templateNotes ?? '',
      smallTemplates: defaultValues?.smallTemplates ?? [
        {
          workPackageName: '',
          durationWeeks: 0,
          stage: undefined
        }
      ]
    }
  });

  const watchedName = watch('templateNotes');

  const watchedSmallTemplates = watch('smallTemplates');

  useEffect(() => console.log(watchedName));

  return (
    <form id="project-level-template-form">
      <PageLayout
        stickyHeader
        title={defaultValues ? 'Edit Project-Level Template' : 'Create Project-Level Template'}
        headerRight={
          <Box display="inline-flex" alignItems="center" justifyContent={'end'}>
            <Box>
              <NERButton variant="contained" onClick={exitActiveMode} sx={{ mx: 1 }}>
                Cancel
              </NERButton>
              <NERSuccessButton variant="contained" type="submit" sx={{ mx: 1 }}>
                Submit
              </NERSuccessButton>
            </Box>
          </Box>
        }
      >
        <Stack rowGap={2}>
          <Grid container rowSpacing={1} columnSpacing={2}>
            <Grid item xs={12}>
              <Typography variant="h5">Template Details</Typography>
            </Grid>
            <Grid item md={6}>
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
            <Grid item md={6}>
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
          {watchedSmallTemplates.map((_, idx) => (
            <p>Work Package #{idx + 1}</p>
          ))}
        </Stack>
      </PageLayout>
    </form>
  );
};

export default ProjectLevelTemplateFormView;
