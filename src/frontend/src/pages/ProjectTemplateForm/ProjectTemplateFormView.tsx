import { yupResolver } from '@hookform/resolvers/yup';
import { Typography, FormControl, Autocomplete, TextField, FormLabel } from '@mui/material';
import { Box, Stack } from '@mui/system';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';
import { WorkPackageStage } from 'shared';
import schema from 'yup/lib/schema';
import { ProjectTemplateApiInputs } from '../../apis/wbs-templates.api';
import DescriptionBulletsEditView from '../../components/DescriptionBulletEditView';
import { NERButton } from '../../components/NERButton';
import NERSuccessButton from '../../components/NERSuccessButton';
import PageLayout from '../../components/PageLayout';
import { useToast } from '../../hooks/toasts.hooks';
import { routes } from '../../utils/routes';
import { ObjectSchema } from 'yup';
import WorkPackageTemplateFormDetails from '../WorkPackageTemplateForm/WorkPackageTemplateFormDetails';
import { WorkPackageTemplateFormViewPayload } from '../WorkPackageTemplateForm/WorkPackageTemplateFormView';
import ReactHookTextField from '../../components/ReactHookTextField';

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
      workPackageTemplates: defaultValues?.workPackageTemplates ?? []
    }
  });

  const toast = useToast();

  const history = useHistory();
  const pageTitle = defaultValues ? 'Edit Project Template' : 'Create Project Template';

  const {
    fields: workPackageTemplates,
    append: appendWorkPackageTemplate,
    remove: removeWorkPackageTemplate
  } = useFieldArray({ control, name: 'workPackageTemplates' });

  const onSubmit = async (data: ProjectTemplateApiInputs) => {
    const { templateName, templateNotes, projectName, workPackageTemplates } = data;

    try {
      const payload: ProjectTemplateApiInputs = {
        templateName,
        templateNotes,
        projectName,
        workPackageTemplates
      };

      await projectTemplateMutateAsync(payload);
      toast.success('Work package template edited successfully');
      history.push(routes.ADMIN_TOOLS + '/project-configuration/work-package-templates');
    } catch (error) {
      toast.error('Error submitting work package template');
    }
  };
console.log(defaultValues);
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
        <Stack direction='row' spacing={2}>
        <FormControl fullWidth>
            <ReactHookTextField control={control} name="templateName" placeholder="Enter template name..." required={false} errorMessage={errors.templateName} />
            </FormControl>
          <FormControl fullWidth>
            <ReactHookTextField control={control} name="templateNotes" placeholder="Enter template notes..." required={false} errorMessage={errors.templateNotes} />
          </FormControl>
        </Stack>
      </PageLayout>
    </form>
  );
};

export default ProjectTemplateFormView;
