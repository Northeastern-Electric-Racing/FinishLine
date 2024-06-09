import React from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, TextField, Autocomplete, Typography, Stack, FormControl } from '@mui/material';
import NERSuccessButton from '../../components/NERSuccessButton';
import PageLayout from '../../components/PageLayout';
import { useToast } from '../../hooks/toasts.hooks';
import { useCurrentUser } from '../../hooks/users.hooks';
import PageBreadcrumbs from '../../layouts/PageTitle/PageBreadcrumbs';
import { WorkPackageTemplateApiInputs } from '../../apis/work-packages.api';
import { DescriptionBulletPreview, WorkPackageStage } from 'shared';
import { ObjectSchema } from 'yup';
import { useHistory } from 'react-router-dom';
import { routes } from '../../utils/routes';
import DescriptionBulletsEditView from '../../components/DescriptionBulletEditView';
import { NERButton } from '../../components/NERButton';
import WorkPackageTemplateFormDetails from './WorkPackageTemplateFormDetails';
import WorkPackageTemplateFormDetails2 from './WorkPackageTemplateFormDetails2';

interface WorkPackageTemplateFormViewProps {
  exitActiveMode: () => void;
  workPackageTemplateMutateAsync: (data: WorkPackageTemplateApiInputs) => void;
  defaultValues?: WorkPackageTemplateFormViewPayload;
  blockedByOptions: { id: string; label: string }[];
  schema: ObjectSchema<any>;
  breadcrumbs: { name: string; route: string }[];
}

export interface WorkPackageTemplateFormViewPayload {
  workPackageName?: string;
  templateName: string;
  templateNotes: string;
  workPackageTemplateId: string;
  duration?: number;
  stage: string;
  blockedBy: { id: string; label: string }[];
  descriptionBullets: DescriptionBulletPreview[];
}

const WorkPackageTemplateFormView: React.FC<WorkPackageTemplateFormViewProps> = ({
  exitActiveMode,
  workPackageTemplateMutateAsync,
  defaultValues,
  blockedByOptions,
  schema,
  breadcrumbs
}) => {
  const toast = useToast();
  const user = useCurrentUser();
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting, isSubmitted, isSubmitSuccessful }
  } = useForm<WorkPackageTemplateFormViewPayload>({
    resolver: yupResolver(schema),
    defaultValues: {
      workPackageName: defaultValues?.workPackageName ?? '',
      templateName: defaultValues?.templateName ?? '',
      templateNotes: defaultValues?.templateNotes ?? '',
      workPackageTemplateId: defaultValues?.workPackageTemplateId ?? '',
      duration: defaultValues?.duration ?? 0,
      blockedBy: defaultValues?.blockedBy ?? [],
      stage: defaultValues?.stage ?? 'NONE',
      descriptionBullets: defaultValues?.descriptionBullets ?? []
    }
  });

  const history = useHistory();
  const pageTitle = defaultValues ? 'Edit Work Package Template' : 'Create Work Package Template';

  const {
    fields: descriptionBullets,
    append: appendDescriptionBullet,
    remove: removeDescriptionBullet
  } = useFieldArray({ control, name: 'descriptionBullets' });

  const {
    fields: deliverables,
    append: appendDeliverable,
    remove: removeDeliverable
  } = useFieldArray({ control, name: 'descriptionBullets' });

  const onSubmit = async (data: WorkPackageTemplateFormViewPayload) => {
    const { workPackageName, templateName, templateNotes, duration, blockedBy, stage, descriptionBullets } = data;

    const blockedByWbsNums = blockedBy.map((blocker) => blocker.id);

    try {
      const payload: WorkPackageTemplateApiInputs = {
        templateName,
        templateNotes,
        duration,
        stage: stage as WorkPackageStage,
        blockedBy: blockedByWbsNums,
        descriptionBullets,
        workPackageName
      };

      await workPackageTemplateMutateAsync(payload);
      toast.success('Work Package Template submitted successfully');
      history.push(routes.ADMIN_TOOLS + '/project-configuration/work-package-templates');
    } catch (error) {
      toast.error('Error submitting work package template');
      console.error('Error submitting work package template:', error);
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
      <Box mb={-1}>
        <PageBreadcrumbs currentPageTitle={pageTitle} previousPages={breadcrumbs} />
      </Box>
      <PageLayout
        stickyHeader
        title={pageTitle}
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
        <Stack spacing={2}>
          <WorkPackageTemplateFormDetails2 control={control} errors={errors} />
          <Box my={2}>
            <WorkPackageTemplateFormDetails control={control} errors={errors} />
          </Box>
          <Typography variant="h5">Blocked By</Typography>
          <FormControl fullWidth>
            <Controller
              name="blockedBy"
              control={control}
              render={({ field: { onChange, value: formValue } }) => (
                <Autocomplete
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  filterSelectedOptions
                  multiple
                  options={blockedByOptions}
                  getOptionLabel={(option) => option.label}
                  onChange={(_, value) => onChange(value)}
                  value={formValue}
                  renderInput={(params) => (
                    <TextField {...params} variant="standard" placeholder="Select Blockers" error={!!errors.blockedBy} />
                  )}
                />
              )}
            />
          </FormControl>
          <Box>
            <Typography variant="h5">Expected Activities</Typography>
            <DescriptionBulletsEditView
              type="workPackage"
              watch={watch}
              ls={descriptionBullets}
              register={register}
              append={appendDescriptionBullet}
              remove={removeDescriptionBullet}
            />
          </Box>
          <Box>
            <Typography variant="h5">Deliverables</Typography>
            <DescriptionBulletsEditView
              type="workPackage"
              watch={watch}
              ls={deliverables}
              register={register}
              append={appendDeliverable}
              remove={removeDeliverable}
            />
          </Box>
        </Stack>
      </PageLayout>
    </form>
  );
};

export default WorkPackageTemplateFormView;
