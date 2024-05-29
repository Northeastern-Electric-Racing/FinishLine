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
  TableHead
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
import WorkPackageTemplateFormDetails from './WorkPackageTemplateFormDetails';
import { Delete, Add } from '@mui/icons-material';
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
  templateName: string,
  templateNotes: string,
  workPackageTemplateId: string;
  duration?: number;
  stage: string;
  blockedBy: WorkPackageTemplatePreview[],
  expectedActivities: DescriptionBulletPreview[]
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
      blockedBy: defaultValues?.blockedBy ?? [],
      stage: defaultValues?.stage ?? 'NONE'
    }
  });

  const history = useHistory();

  const [isModalOpen, setIsModalOpen] = useState(false);
  let changeRequestFormInput: FormInput | undefined = undefined;
  const pageTitle = defaultValues ? 'Edit Work Package Template' : 'Create Work Package Template';

  const { userId } = user;

  const onSubmit = async (data: WorkPackageTemplateFormViewPayload) => {
    // Destructure the required fields from the data object
    const { name, workPackageTemplateId, templateName, templateNotes, duration, blockedBy, stage, expectedActivities } = data;

    // Transform blockedBy into an array of strings
    const blockedByWbsNums = blockedBy.map((blocker) => blocker.workPackageTemplateId); // Use the id property

    try {
      const payload = {
        workPackageTemplateId,
        templateName,
        templateNotes,
        userId,
        name,
        duration,
        blockedBy: blockedByWbsNums,
        descriptionBullets: expectedActivities,
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
      </PageLayout>
    </form>
  );
};

export default WorkPackageTemplateFormView;
