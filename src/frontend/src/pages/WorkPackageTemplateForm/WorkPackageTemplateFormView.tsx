import {
  DescriptionBulletPreview,
  OtherProductReason,
  User,
  validateWBS,
  WbsElement,
  wbsPipe,
  WorkPackageTemplatePreview
} from 'shared';
import { Controller, useFieldArray, useForm, Control, UseFormReset } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box,
  TextField,
  Autocomplete,
  FormControl,
  Typography,
  Tooltip,
  TableRow,
  Button,
  FormHelperText,
  FormLabel,
  IconButton,
  InputAdornment,
  ListItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  Stack
} from '@mui/material';
import { useState } from 'react';
import NERSuccessButton from '../../components/NERSuccessButton';
import PageLayout from '../../components/PageLayout';
import { useToast } from '../../hooks/toasts.hooks';
import { useCurrentUser } from '../../hooks/users.hooks';
import PageBreadcrumbs from '../../layouts/PageTitle/PageBreadcrumbs';
import { WorkPackageApiInputs, WorkPackageTemplateApiInputs } from '../../apis/work-packages.api';
import { WorkPackageStage } from 'shared';
import { ObjectSchema } from 'yup';
import { getMonday, transformDate } from '../../utils/datetime.utils';
import { CreateStandardChangeRequestPayload } from '../../hooks/change-requests.hooks';
import CreateChangeRequestModal from '../CreateChangeRequestPage/CreateChangeRequestModal';
import { FormInput } from '../CreateChangeRequestPage/CreateChangeRequest';
import { useHistory } from 'react-router-dom';
import { routes } from '../../utils/routes';
import HelpIcon from '@mui/icons-material/Help';
import { NERButton } from '../../components/NERButton';
import dayjs from 'dayjs';
import DescriptionBulletsEditView from '../../components/DescriptionBulletEditView';
import { Delete, Add } from '@mui/icons-material';
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
  name?: string;
  templateName: string;
  templateNotes: string;
  workPackageTemplateId: string;
  duration?: number;
  stage: string;
  blockedBy: { id: string; label: string }[];
  descriptionBullets: DescriptionBulletPreview[];
  deliverables: DescriptionBulletPreview[];
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
    formState: { errors }
  } = useForm<WorkPackageTemplateFormViewPayload>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      workPackageTemplateId: defaultValues?.workPackageTemplateId ?? '',
      duration: defaultValues?.duration ?? 0,
      blockedBy: defaultValues?.blockedBy.map((blocker) => ({ id: blocker.id, label: blocker.label })) ?? [],
      stage: defaultValues?.stage ?? 'NONE',
      descriptionBullets: defaultValues?.descriptionBullets,
      deliverables: defaultValues?.deliverables
    }
  });

  const history = useHistory();

  const [isModalOpen, setIsModalOpen] = useState(false);
  let changeRequestFormInput: FormInput | undefined = undefined;
  const pageTitle = defaultValues ? 'Edit Work Package Template' : 'Create Work Package Template';

  const { userId } = user;

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
    // Destructure the required fields from the data object
    const { name, workPackageTemplateId, templateName, templateNotes, duration, blockedBy, stage, descriptionBullets } =
      data;

    // Transform blockedBy into an array of strings
    const blockedByWbsNums = blockedBy.map((blocker) => blocker.id); // Use the id property

    try {
      const payload = {
        workPackageTemplateId,
        templateName,
        templateNotes,
        userId,
        name,
        duration,
        blockedBy: blockedByWbsNums,
        descriptionBullets: descriptionBullets,
        stage: stage as WorkPackageStage,
        links: []
      };

      // Call your mutation function
      await workPackageTemplateMutateAsync(payload);
    } catch (error) {
      console.error('Error submitting work package template:', error);
    }
  };

  return (
    <form
      id="work-package-template-edit-form"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleSubmit(onSubmit)(e);
      }}
      onKeyPress={(e) => {
        e.key === 'Enter' && e.preventDefault();
      }}
    >
      <Box mb={-1}>
        <PageBreadcrumbs currentPageTitle={pageTitle} previousPages={breadcrumbs} />
      </Box>
      <PageLayout stickyHeader title={pageTitle}>
        <WorkPackageTemplateFormDetails2 control={control} errors={errors} />
        <Box my={2}>
          <WorkPackageTemplateFormDetails control={control} errors={errors} />
        </Box>
        <Box my={2}>
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
        </Box>

        <Stack spacing={4}>
          <Box>
            <Typography variant="h5" sx={{ mb: 2, mt: 2 }}>
              {'Expected Activities'}
            </Typography>
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

        <Stack spacing={4}>
          <Box>
            <Typography variant="h5" sx={{ mb: 2, mt: 2 }}>
              {'Deliverables'}
            </Typography>
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
