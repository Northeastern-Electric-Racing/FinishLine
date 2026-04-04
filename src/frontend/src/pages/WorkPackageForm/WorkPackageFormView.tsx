/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import {
  ChangeRequestReason,
  ChangeRequestType,
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
import { Box, TextField, Autocomplete, FormControl, Typography, Tooltip } from '@mui/material';
import { useState, useEffect } from 'react';
import WorkPackageFormDetails from './WorkPackageFormDetails';
import NERSuccessButton from '../../components/NERSuccessButton';
import PageLayout from '../../components/PageLayout';
import { useToast } from '../../hooks/toasts.hooks';
import { useCurrentUser } from '../../hooks/users.hooks';
import PageBreadcrumbs from '../../layouts/PageTitle/PageBreadcrumbs';
import { WorkPackageApiInputs } from '../../apis/work-packages.api';
import { ObjectSchema } from 'yup';
import { getMonday } from '../../utils/datetime.utils';
import { toDateString } from 'shared';
import { CreateStandardChangeRequestPayload } from '../../hooks/change-requests.hooks';
import { StandardChangeRequestType } from '../CreateChangeRequestPage/CreateChangeRequestView';
import { FormInput } from '../CreateChangeRequestPage/CreateChangeRequestView';
import { useHistory } from 'react-router-dom';
import { routes } from '../../utils/routes';
import HelpIcon from '@mui/icons-material/Help';
import { NERButton } from '../../components/NERButton';
import dayjs from 'dayjs';
import DescriptionBulletsEditView from '../../components/DescriptionBulletEditView';
import { useAllWorkPackageTemplates } from '../../hooks/wbs-templates.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { WorkPackageTemplateSection } from './WorkPackageTemplateSection';
import { useQuery } from '../../hooks/utils.hooks';
import { wbsTester } from '../../utils/form';
import * as yup from 'yup';
import CreateChangeRequestModal from '../CreateChangeRequestPage/CreateChangeRequestModal';
import { useQueryClient } from 'react-query';

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
  crId?: string;
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
  const { reset: resetWorkPackageForm, ...workPackageFormMethods } = useForm<WorkPackageFormViewPayload>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      workPackageId: defaultValues?.workPackageId ?? '',
      startDate: defaultValues?.startDate ?? getMonday(new Date()),
      duration: defaultValues?.duration ?? 0,
      crId: crId ?? defaultValues?.crId,
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

  const history = useHistory();

  const [managerId, setManagerId] = useState<string | undefined>(
    defaultValues ? wbsElement.manager?.userId.toString() : undefined
  );
  const [leadId, setLeadId] = useState<string | undefined>(defaultValues ? wbsElement.lead?.userId.toString() : undefined);

  const [isModalOpen, setIsModalOpen] = useState(false);
  let changeRequestFormInput: FormInput | undefined = undefined;
  const pageTitle = defaultValues ? 'Edit Work Package' : 'Create Work Package';

  // lists of stuff
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

  const changeRequestSchema = yup.object().shape({
    type: yup.mixed<StandardChangeRequestType>().required('Type is required'),
    what: yup.string().required('What is required'),
    why: yup
      .array()
      .min(1, 'At least one Why is required')
      .required('Why is required')
      .of(
        yup.object().shape({
          type: yup.mixed<ChangeRequestReason>().required('Why Type is required'),
          explain: yup
            .string()
            .required('Why Explain is required')
            .when('type', ([type], schema) =>
              type === ChangeRequestReason.OtherProject
                ? schema.required().test('wbs-num-valid', 'WBS Number is not valid', wbsTester)
                : yup.string()
            )
        })
      )
  });

  const { reset: resetChangeRequestForm, ...changeRequestFormMethods } = useForm<FormInput>({
    resolver: yupResolver(changeRequestSchema),
    defaultValues: query.get('budgetChange')
      ? {
          what: 'Increase the budget to account for the cost of materials',
          why: [{ type: ChangeRequestReason.Other, explain: 'The cost of materials ended up exceeding the initial budget' }],
          type: ChangeRequestType.Issue
        }
      : query.get('timelineDelay')
        ? {
            what: 'Timeline delay',
            why: [{ type: ChangeRequestReason.Other, explain: 'Decided to extend timeline after design review' }],
            type: ChangeRequestType.Redefinition
          }
        : query.get('createWP')
          ? {
              what: '',
              why: [{ type: ChangeRequestReason.Initialization, explain: 'Creating a Work Package on this Project' }],
              type: ChangeRequestType.Redefinition
            }
          : {
              what: '',
              why: [{ type: ChangeRequestReason.Other, explain: '' }],
              type: ChangeRequestType.Issue
            }
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

  // Check if only lead/manager changed
  const checkOnlyLeadershipChanged = (
    formName: string,
    formStartDate: Date,
    formDuration: number,
    formBlockedBy: string[],
    formStage: string,
    formDescriptionBullets: DescriptionBulletPreview[]
  ) => {
    if (!defaultValues) return false; // Only relevant for edits

    return (
      formName === defaultValues.name &&
      isSameDay(formStartDate, defaultValues.startDate) &&
      formDuration === defaultValues.duration &&
      JSON.stringify(formBlockedBy.sort()) === JSON.stringify((defaultValues.blockedBy || []).sort()) &&
      formStage === defaultValues.stage &&
      JSON.stringify(formDescriptionBullets) === JSON.stringify(defaultValues.descriptionBullets) &&
      (leadId !== wbsElement.lead?.userId.toString() || managerId !== wbsElement.manager?.userId.toString())
    );
  };

  const onSubmit = async (data: WorkPackageFormViewPayload) => {
    const { name, startDate, duration, blockedBy, crId, stage, descriptionBullets } = data;
    const blockedByWbsNums = blockedBy.map((blocker) => validateWBS(blocker));
    try {
      const onlyLeadershipChanged = checkOnlyLeadershipChanged(
        name,
        startDate,
        duration,
        blockedBy,
        stage,
        descriptionBullets
      );

      if (onlyLeadershipChanged) {
        const autoCRPayload = {
          submitterId: user.userId,
          wbsNum: wbsElement.wbsNum,
          leadId,
          managerId
        };
        await createLeadershipCR(autoCRPayload);
        // fixes cache issue
        await queryClient.refetchQueries(['work packages']);
        exitActiveMode();
        return;
      }

      const payload = {
        leadId,
        managerId,
        projectWbsNum: wbsElement.wbsNum,
        workPackageId: defaultValues?.workPackageId,
        userId,
        name,
        crId: crId === 'null' ? undefined : crId,
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
          workPackageProposedChanges: {
            ...payload
          },
          proposedSolutions: []
        });

        history.push(`${routes.PROJECTS}/${wbsPipe(wbsElement.wbsNum)}/change-requests`);
      } else {
        await workPackageMutateAsync(payload);
        exitActiveMode();
      }
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
        return;
      }
    }
  };

  const crWatch = watch('crId');
  const changeRequestInputExists = crWatch && crWatch !== 'null' && crWatch !== '';
  const startDate = watch('startDate');
  const duration = watch('duration');

  // Calculate for submit button status
  const onlyLeadershipChanged = defaultValues
    ? checkOnlyLeadershipChanged(
        watch('name'),
        watch('startDate'),
        watch('duration'),
        watch('blockedBy'),
        watch('stage'),
        watch('descriptionBullets')
      )
    : false;

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
          <Box display="inline-flex" alignItems="center" justifyContent={'end'}>
            {
              <Box display="inline-flex" alignItems="center">
                <Tooltip
                  title={
                    <Typography fontSize={'16px'}>
                      {`If you don't enter a Change Request ID into this form, you can create one here that when accepted will
                      ${
                        defaultValues ? `edit the selected Work Package` : `create a new Work Package`
                      } with the inputted values`}
                    </Typography>
                  }
                  placement="left"
                >
                  <HelpIcon style={{ fontSize: '1.5em', color: 'lightgray' }} />
                </Tooltip>
                <NERButton
                  disabled={!!changeRequestInputExists || onlyLeadershipChanged}
                  variant="contained"
                  onClick={() => setIsModalOpen(true)}
                  sx={{ mx: 1 }}
                >
                  Create Change Request
                </NERButton>
              </Box>
            }
            <Box>
              <NERButton variant="contained" onClick={exitActiveMode} sx={{ mx: 1 }}>
                Cancel
              </NERButton>
              <NERSuccessButton
                variant="contained"
                type="submit"
                sx={{ mx: 1 }}
                disabled={!changeRequestInputExists && !!defaultValues && !onlyLeadershipChanged}
              >
                Submit
              </NERSuccessButton>
            </Box>
          </Box>
        }
      >
        <WorkPackageTemplateSection
          workPackageTemplates={workPackageTemplates}
          currentWorkPackageTemplate={currentWorkPackageTemplate}
          setCurrentWorkPackageTemplate={(WorkPackageTemplate) => {
            setValue('name', WorkPackageTemplate.workPackageName ?? '');
            setValue('stage', WorkPackageTemplate.stage ?? 'NONE');
            setValue('duration', WorkPackageTemplate.duration ?? 0);
            setValue('descriptionBullets', WorkPackageTemplate.descriptionBullets ?? []);
            setValue('workPackageId', WorkPackageTemplate.workPackageTemplateId);
            setCurrentWorkPackageTemplate(WorkPackageTemplate);
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
        }}
        onHide={() => setIsModalOpen(false)}
        wbsNum={wbsPipe(wbsElement.wbsNum)}
        open={isModalOpen}
        changeRequestFormReturn={changeRequestFormMethods}
      />
    </form>
  );
};

export default WorkPackageFormView;
