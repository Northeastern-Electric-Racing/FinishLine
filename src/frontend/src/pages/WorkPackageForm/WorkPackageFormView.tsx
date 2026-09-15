/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import {
  DescriptionBulletPreview,
  User,
  validateWBS,
  WbsElement,
  wbsPipe,
  WorkPackageTemplate,
  WorkPackageStage,
  LeadershipChangeCreateArgs,
  isSameDay
} from 'shared';
import {
  Control,
  Controller,
  FormState,
  useFieldArray,
  useForm,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch
} from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, TextField, Autocomplete, FormControl, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import WorkPackageFormDetails from './WorkPackageFormDetails';
import NERSuccessButton from '../../components/NERSuccessButton';
import NERFailButton from '../../components/NERFailButton';
import PageLayout from '../../components/PageLayout';
import { useToast } from '../../hooks/toasts.hooks';
import { useCurrentUser } from '../../hooks/users.hooks';
import PageBreadcrumbs from '../../layouts/PageTitle/PageBreadcrumbs';
import { WorkPackageApiInputs } from '../../apis/work-packages.api';
import { ObjectSchema } from 'yup';
import { getMonday } from '../../utils/datetime.utils';
import { toDateString } from 'shared';
import { CreateStandardChangeRequestPayload } from '../../hooks/change-requests.hooks';
import { FormInput } from '../CreateChangeRequestPage/CreateChangeRequestView';
import { useHistory } from 'react-router-dom';
import { routes } from '../../utils/routes';
import dayjs from 'dayjs';
import DescriptionBulletsEditView from '../../components/DescriptionBulletEditView';
import { useAllWorkPackageTemplates } from '../../hooks/wbs-templates.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { WorkPackageTemplateSection } from './WorkPackageTemplateSection';
import { useQuery } from '../../hooks/utils.hooks';
import * as yup from 'yup';
import CreateChangeRequestModal from '../CreateChangeRequestPage/CreateChangeRequestModal';
import { useQueryClient } from 'react-query';
import * as React from 'react';

export interface WorkPackageFormReturn {
  register: UseFormRegister<WorkPackageFormViewPayload>;
  handleSubmit: UseFormHandleSubmit<WorkPackageFormViewPayload, WorkPackageFormViewPayload>;
  control: Control<WorkPackageFormViewPayload, any, WorkPackageFormViewPayload>;
  watch: UseFormWatch<WorkPackageFormViewPayload>;
  formState: FormState<WorkPackageFormViewPayload>;
  setValue: UseFormSetValue<WorkPackageFormViewPayload>;
}

interface WorkPackageFormViewProps {
  exitActiveMode: () => void;
  workPackageMutateAsync: (data: WorkPackageApiInputs) => void;
  createWorkPackageScopeCR: (data: CreateStandardChangeRequestPayload) => void;
  createLeadershipCR: (data: LeadershipChangeCreateArgs) => void;
  defaultValues?: WorkPackageFormViewPayload;
  wbsElement: WbsElement;
  leadOrManagerOptions: User[];
  blockedByOptions: { id: string; label: string }[];
  crId?: string;
  schema: ObjectSchema<any>;
  breadcrumbs: { name: string; route: string }[];
}

export interface WorkPackageFormViewPayload {
  name: string;
  workPackageId: string;
  startDate: Date;
  duration: number;
  stage: string;
  blockedBy: string[];
  descriptionBullets: DescriptionBulletPreview[];
}

const WorkPackageFormView: React.FC<WorkPackageFormViewProps> = ({
  exitActiveMode,
  workPackageMutateAsync,
  createWorkPackageScopeCR,
  createLeadershipCR,
  defaultValues,
  wbsElement,
  leadOrManagerOptions,
  blockedByOptions,
  crId,
  schema,
  breadcrumbs
}) => {
  const query = useQuery();
  const toast = useToast();
  const user = useCurrentUser();
  const queryClient = useQueryClient();
  const history = useHistory();

  const { ...workPackageFormMethods } = useForm<WorkPackageFormViewPayload>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      workPackageId: defaultValues?.workPackageId ?? '',
      startDate: defaultValues?.startDate ?? getMonday(new Date()),
      duration: defaultValues?.duration ?? 0,
      blockedBy: defaultValues?.blockedBy ?? [],
      descriptionBullets: defaultValues?.descriptionBullets ?? [],
      stage: defaultValues?.stage ?? 'NONE'
    }
  });

  const {
    control,
    watch,
    handleSubmit,
    setValue,
    register,
    formState: { errors }
  } = workPackageFormMethods;

  const [managerId, setManagerId] = useState<string | undefined>(
    defaultValues ? wbsElement.manager?.userId.toString() : undefined
  );
  const [leadId, setLeadId] = useState<string | undefined>(defaultValues ? wbsElement.lead?.userId.toString() : undefined);

  const [isModalOpen, setIsModalOpen] = useState(false);
  let changeRequestFormInput: FormInput | undefined = undefined;
  const pageTitle = defaultValues ? 'Edit Work Package' : 'Create Work Package';

  const {
    fields: descriptionBullets,
    append: appendDescriptionBullet,
    remove: removeDescriptionBullet
  } = useFieldArray({ control, name: 'descriptionBullets' });

  const { userId } = user;

  const {
    data: workPackageTemplates,
    isLoading: workPackageTemplateisLoading,
    isError: workPackageTemplateisError,
    error: workPackageTemplateError
  } = useAllWorkPackageTemplates();

  const [currentWorkPackageTemplate, setCurrentWorkPackageTemplate] = useState<WorkPackageTemplate>();

  const watchedName = watch('name');
  const watchedStage = watch('stage');
  const watchedDuration = watch('duration');
  const watchedDescriptionBullets = watch('descriptionBullets');
  const watchedBlockedBy = watch('blockedBy');
  const watchedStartDate = watch('startDate');

  const changeRequestSchema = yup.object().shape({
    why: yup.string().required('Why is required'),
    requestedReviewerId: yup.string().optional()
  });

  const { reset: resetCRForm, ...changeRequestFormMethods } = useForm<FormInput>({
    resolver: yupResolver(changeRequestSchema),
    defaultValues: query.get('budgetChange')
      ? { why: 'The cost of materials ended up exceeding the initial budget' }
      : query.get('timelineDelay')
        ? { why: 'Decided to extend timeline after design review' }
        : query.get('createWP')
          ? { why: 'Creating a Work Package on this Project' }
          : { why: '' }
  });

  useEffect(() => {
    if (currentWorkPackageTemplate) {
      const { workPackageName, stage, duration, descriptionBullets } = currentWorkPackageTemplate;
      if (
        watchedName !== workPackageName ||
        watchedStage !== stage ||
        watchedDuration !== duration ||
        JSON.stringify(watchedDescriptionBullets) !== JSON.stringify(descriptionBullets)
      ) {
        setCurrentWorkPackageTemplate(undefined);
      }
    }
  }, [currentWorkPackageTemplate, watchedName, watchedStage, watchedDuration, watchedDescriptionBullets]);

  if (workPackageTemplateisLoading || !workPackageTemplates) return <LoadingIndicator />;
  if (workPackageTemplateisError) return <ErrorPage message={workPackageTemplateError.message} />;

  const leadershipChanged = defaultValues
    ? leadId !== wbsElement.lead?.userId.toString() || managerId !== wbsElement.manager?.userId.toString()
    : false;

  const otherFieldsChanged = defaultValues
    ? watchedName !== defaultValues.name ||
      !isSameDay(watchedStartDate, defaultValues.startDate) ||
      watchedDuration !== defaultValues.duration ||
      JSON.stringify([...watchedBlockedBy].sort()) !== JSON.stringify([...(defaultValues.blockedBy || [])].sort()) ||
      watchedStage !== defaultValues.stage ||
      JSON.stringify(watchedDescriptionBullets) !== JSON.stringify(defaultValues.descriptionBullets)
    : false;

  const liveOnlyLeadershipChanged = leadershipChanged && !otherFieldsChanged;

  const getButtonLabel = () => {
    if (!defaultValues) return 'Create Work Package';
    if (liveOnlyLeadershipChanged) return 'Submit & Implement';
    if (otherFieldsChanged) return 'Submit Change Request';
    return 'Submit & Implement';
  };

  const isButtonDisabled = () => {
    if (!defaultValues) return false;
    return !leadershipChanged && !otherFieldsChanged;
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    if (defaultValues && otherFieldsChanged) {
      e.preventDefault();
      e.stopPropagation();
      setIsModalOpen(true);
    }
  };

  const onSubmit = async (data: WorkPackageFormViewPayload) => {
    const { name, startDate, duration, blockedBy, stage, descriptionBullets } = data;
    const blockedByWbsNums = blockedBy.map((blocker) => validateWBS(blocker));

    try {
      if (liveOnlyLeadershipChanged) {
        await createLeadershipCR({
          submitterId: user.userId,
          wbsNum: wbsElement.wbsNum,
          leadId,
          managerId
        });
        toast.success('Changes submitted successfully');
        await queryClient.refetchQueries(['work packages']);
        exitActiveMode();
        return;
      }

      if (leadershipChanged && otherFieldsChanged) {
        await createLeadershipCR({
          submitterId: user.userId,
          wbsNum: wbsElement.wbsNum,
          leadId,
          managerId
        });
      }

      const payload = {
        leadId,
        managerId,
        projectWbsNum: wbsElement.wbsNum,
        workPackageId: defaultValues?.workPackageId,
        userId,
        name,
        startDate: toDateString(startDate),
        duration,
        blockedBy: blockedByWbsNums,
        descriptionBullets,
        stage: stage as WorkPackageStage,
        links: []
      };

      if (changeRequestFormInput) {
        await createWorkPackageScopeCR({
          ...changeRequestFormInput,
          wbsNum: wbsElement.wbsNum,
          workPackageProposedChanges: { ...payload }
        });
        toast.success('Change request submitted successfully');
        history.push(routes.CHANGE_REQUESTS_OVERVIEW);
      } else {
        await workPackageMutateAsync({ ...payload, crId });
        toast.success('Work package updated successfully');
        exitActiveMode();
      }
    } catch (e) {
      if (e instanceof Error) toast.error(e.message);
    }
  };

  const startDate = watch('startDate');
  const duration = watch('duration');
  const calculatedEndDate = dayjs(startDate)
    .add(7 * duration, 'day')
    .toDate();

  return (
    <form
      id="work-package-edit-form"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleSubmit(onSubmit)(e);
      }}
      onKeyPress={(e) => {
        e.key === 'Enter' && e.preventDefault();
      }}
      noValidate
    >
      <Box mb={-1}>
        <PageBreadcrumbs currentPageTitle={pageTitle} previousPages={breadcrumbs} />
      </Box>
      <PageLayout
        stickyHeader
        title={pageTitle}
        headerRight={
          <Box display="inline-flex" alignItems="center" justifyContent="end" flexWrap="nowrap" gap={1}>
            <NERFailButton variant="contained" onClick={exitActiveMode}>
              Cancel
            </NERFailButton>
            <NERSuccessButton variant="contained" type="submit" disabled={isButtonDisabled()} onClick={handleButtonClick}>
              {getButtonLabel()}
            </NERSuccessButton>
          </Box>
        }
      >
        <WorkPackageTemplateSection
          workPackageTemplates={workPackageTemplates}
          currentWorkPackageTemplate={currentWorkPackageTemplate}
          setCurrentWorkPackageTemplate={(template) => {
            setValue('name', template.workPackageName ?? '');
            setValue('stage', template.stage ?? 'NONE');
            setValue('duration', template.duration ?? 0);
            setValue('descriptionBullets', template.descriptionBullets ?? []);
            setValue('workPackageId', template.workPackageTemplateId);
            setCurrentWorkPackageTemplate(template);
          }}
        />
        <WorkPackageFormDetails
          control={control}
          errors={errors}
          usersForLead={leadOrManagerOptions}
          usersForManager={leadOrManagerOptions}
          lead={leadId}
          manager={managerId}
          setLead={setLeadId}
          setManager={setManagerId}
          createForm={!defaultValues}
          endDate={calculatedEndDate}
        />
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
                  onChange={(_, value) => onChange(value.map((v) => v.id))}
                  value={formValue.map((v: string) => blockedByOptions.find((o) => o.id === v)!)}
                  renderInput={(params) => (
                    <TextField {...params} variant="standard" placeholder="Select Blockers" error={!!errors.blockedBy} />
                  )}
                />
              )}
            />
          </FormControl>
        </Box>
        <DescriptionBulletsEditView
          watch={watch}
          ls={descriptionBullets}
          register={register}
          append={appendDescriptionBullet}
          remove={removeDescriptionBullet}
          type="workPackage"
        />
      </PageLayout>
      <CreateChangeRequestModal
        onConfirm={async (crFormInput: FormInput) => {
          changeRequestFormInput = crFormInput;
          await handleSubmit(onSubmit)();
          setIsModalOpen(false);
          resetCRForm();
        }}
        onHide={() => {
          setIsModalOpen(false);
          resetCRForm();
        }}
        wbsNum={wbsPipe(wbsElement.wbsNum)}
        open={isModalOpen}
        changeRequestFormReturn={changeRequestFormMethods}
      />
    </form>
  );
};

export default WorkPackageFormView;
