/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { DescriptionBulletPreview, User, validateWBS, WbsElement, wbsPipe } from 'shared';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, TextField, Autocomplete, FormControl, Typography, Tooltip } from '@mui/material';
import { useState } from 'react';
import WorkPackageFormDetails from './WorkPackageFormDetails';
import NERFailButton from '../../components/NERFailButton';
import NERSuccessButton from '../../components/NERSuccessButton';
import PageLayout from '../../components/PageLayout';
import { useToast } from '../../hooks/toasts.hooks';
import { useCurrentUser } from '../../hooks/users.hooks';
import PageBreadcrumbs from '../../layouts/PageTitle/PageBreadcrumbs';
import { WorkPackageApiInputs } from '../../apis/work-packages.api';
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

interface WorkPackageFormViewProps {
  exitActiveMode: () => void;
  workPackageMutateAsync: (data: WorkPackageApiInputs) => void;
  createWorkPackageScopeCR: (data: CreateStandardChangeRequestPayload) => void;
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
  crId: string;
  stage: string;
  blockedBy: string[];
  descriptionBullets: DescriptionBulletPreview[];
}

const WorkPackageFormView: React.FC<WorkPackageFormViewProps> = ({
  exitActiveMode,
  workPackageMutateAsync,
  createWorkPackageScopeCR,
  defaultValues,
  wbsElement,
  leadOrManagerOptions,
  blockedByOptions,
  crId,
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
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      workPackageId: defaultValues?.workPackageId ?? '',
      startDate: defaultValues?.startDate ?? getMonday(new Date()),
      duration: defaultValues?.duration ?? 0,
      crId: crId ?? defaultValues?.crId ?? '',
      blockedBy: defaultValues?.blockedBy ?? [],
      descriptionBullets: defaultValues?.descriptionBullets ?? [],
      stage: defaultValues?.stage ?? 'NONE'
    }
  });

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

  const onSubmit = async (data: WorkPackageFormViewPayload) => {
    const { name, startDate, duration, blockedBy, crId, stage, descriptionBullets } = data;
    const blockedByWbsNums = blockedBy.map((blocker) => validateWBS(blocker));
    try {
      const payload = {
        leadId,
        managerId,
        projectWbsNum: wbsElement.wbsNum,
        workPackageId: defaultValues?.workPackageId,
        userId,
        name,
        crId,
        startDate: transformDate(startDate),
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

        history.push(routes.CHANGE_REQUESTS);
      } else if (crId !== 'null' && crId !== '') {
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
  const changeRequestInputExists = crWatch !== 'null' && crWatch !== '';
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
    >
      <Box mb={-1}>
        <PageBreadcrumbs currentPageTitle={pageTitle} previousPages={breadcrumbs} />
      </Box>
      <PageLayout
        stickyHeader
        title={pageTitle}
        headerRight={
          <Box display="inline-flex" alignItems="center" justifyContent={'end'}>
            {!changeRequestInputExists && (
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
                <NERButton variant="contained" onClick={() => setIsModalOpen(true)} sx={{ mx: 1 }}>
                  Create Change Request
                </NERButton>
              </Box>
            )}
            <Box>
              <NERFailButton variant="contained" onClick={exitActiveMode} sx={{ mx: 1 }}>
                Cancel
              </NERFailButton>
              <NERSuccessButton variant="contained" type="submit" sx={{ mx: 1 }} disabled={!changeRequestInputExists}>
                Submit
              </NERSuccessButton>
            </Box>
          </Box>
        }
      >
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
      />
    </form>
  );
};

export default WorkPackageFormView;
