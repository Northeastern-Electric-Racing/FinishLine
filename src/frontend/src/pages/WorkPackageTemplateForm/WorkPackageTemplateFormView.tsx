import React from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, TextField, Autocomplete, Typography, Stack, FormControl } from '@mui/material';
import NERSuccessButton from '../../components/NERSuccessButton';
import PageLayout from '../../components/PageLayout';
import { useToast } from '../../hooks/toasts.hooks';
import { WorkPackageTemplateApiInputs } from '../../apis/work-packages.api';
import { DescriptionBulletPreview, WorkPackageStage } from 'shared';
import { ObjectSchema } from 'yup';
import { useHistory } from 'react-router-dom';
import { routes } from '../../utils/routes';
import DescriptionBulletsEditView from '../../components/DescriptionBulletEditView';
import { NERButton } from '../../components/NERButton';
import WorkPackageTemplateFormDetails from './WorkPackageTemplateFormDetails';

interface WorkPackageTemplateFormViewProps {
  exitActiveMode: () => void;
  workPackageTemplateMutateAsync: (data: WorkPackageTemplateApiInputs) => void;
  defaultValues?: WorkPackageTemplateFormViewPayload;
  blockedByOptions: { id: string; label: string }[];
  schema: ObjectSchema<any>;
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
  schema
}) => {
  const toast = useToast();
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors }
  } = useForm<WorkPackageTemplateFormViewPayload>({
    resolver: yupResolver(schema),
    defaultValues: {
      workPackageName: defaultValues?.workPackageName ?? '',
      templateName: defaultValues?.templateName ?? '',
      templateNotes: defaultValues?.templateNotes ?? '',
      workPackageTemplateId: defaultValues?.workPackageTemplateId ?? '',
      duration: defaultValues?.duration,
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

  const onSubmit = async (data: WorkPackageTemplateFormViewPayload) => {
    const { workPackageName, templateName, templateNotes, duration, blockedBy, stage, descriptionBullets } = data;

    const blockedByIds = blockedBy.map((blocker) => blocker.id);

    try {
      const payload: WorkPackageTemplateApiInputs = {
        templateName,
        templateNotes,
        duration,
        stage: stage as WorkPackageStage,
        blockedBy: blockedByIds,
        descriptionBullets,
        workPackageName
      };

      await workPackageTemplateMutateAsync(payload);
      toast.success('Work package template edited successfully');
      history.push(routes.ADMIN_TOOLS + '/project-configuration/work-package-templates');
    } catch (error) {
      toast.error('Error submitting work package template');
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
              <NERSuccessButton variant="contained" type="submit" sx={{ mx: 1 }}>
                Submit
              </NERSuccessButton>
            </Box>
          </Box>
        }
      >
        <Stack spacing={2}>
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
            <DescriptionBulletsEditView
              type="workPackage"
              watch={watch}
              ls={descriptionBullets}
              register={register}
              append={appendDescriptionBullet}
              remove={removeDescriptionBullet}
            />
          </Box>
        </Stack>
      </PageLayout>
    </form>
  );
};

export default WorkPackageTemplateFormView;
