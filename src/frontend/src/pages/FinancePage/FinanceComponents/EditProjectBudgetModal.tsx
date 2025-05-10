import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import NERFormModal from '../../../components/NERFormModal';
import { Box, FormControl, FormHelperText, FormLabel, MenuItem, Select, Typography } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { useGetAllIndexCodes } from '../../../hooks/finance.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { CreateStandardChangeRequestPayload, useCreateStandardChangeRequest } from '../../../hooks/change-requests.hooks';
import { ChangeRequestType, Project } from 'shared';
import { useSingleTeam } from '../../../hooks/teams.hooks';
import { useQuery } from 'react-query';
import { getSingleProject } from '../../../apis/projects.api';

const schema = yup.object().shape({
  project: yup.string().required('Project is required'),
  account: yup.string().required('Account is required'),
  budget: yup
    .number()
    .typeError('Amount must be a number')
    .positive('Amount must be positive')
    .required('Amount is required')
});

interface EditProjectBudgetModalInputs {
  project: string;
  account: string;
  budget: number;
}

interface EditProjectBudgetModalProps {
  showModal: boolean;
  handleClose: () => void;
  teamId: string;
  project?: Project;
}

export const EditProjectBudgetModal: React.FC<EditProjectBudgetModalProps> = ({
  showModal,
  handleClose,
  teamId,
  project
}: EditProjectBudgetModalProps) => {
  const {
    watch,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<EditProjectBudgetModalInputs>({
    resolver: yupResolver(schema),
    defaultValues: {
      project: project?.id || '',
      account: '',
      budget: project?.budget || 0
    }
  });

  const currentProjectId = watch('project');

  const {
    data: indexCodes,
    isLoading: indexCodesIsLoading,
    isError: indexCodeIsError,
    error: indexCodeError
  } = useGetAllIndexCodes();

  const { isLoading: crIsLoading, mutateAsync: createCR } = useCreateStandardChangeRequest();

  const { data: team, isLoading: teamIsLoading, isError: teamsIsError, error: teamError } = useSingleTeam(teamId);

  const projectsQuery = useQuery(
    ['projects', team?.teamId],
    async () => {
      if (!team?.projects) return [];
      const projectPromises = team.projects.map((project) => getSingleProject(project.wbsNum));
      const responses = await Promise.all(projectPromises);
      return responses.map((res) => res.data);
    },
    {
      enabled: !!team?.projects
    }
  );

  const projects: Project[] = projectsQuery.data ?? [];

  if (!indexCodes || indexCodesIsLoading || crIsLoading) {
    return <LoadingIndicator />;
  }
  if (indexCodeIsError) {
    return <ErrorPage message={indexCodeError.message} />;
  }

  if (!team || teamIsLoading) {
    return <LoadingIndicator />;
  }
  if (teamsIsError) {
    return <ErrorPage message={teamError.message} />;
  }

  const onSubmit = async (data: EditProjectBudgetModalInputs) => {
    if (!currentProjectId) return;
    const currentProject = projects.find((project) => project.id === currentProjectId);
    if (!currentProject) return;

    const payload: CreateStandardChangeRequestPayload = {
      wbsNum: currentProject.wbsNum,
      type: ChangeRequestType.Other,
      what: 'project',
      why: [],
      proposedSolutions: [],
      projectProposedChanges: {
        leadId: currentProject.lead?.userId,
        managerId: currentProject.manager?.userId,
        name: currentProject.name,
        descriptionBullets: currentProject.descriptionBullets.map((bullet) => ({
          id: bullet.id,
          detail: bullet.detail,
          type: bullet.type
        })),
        links: currentProject.links.map((link) => ({
          linkTypeName: link.linkType.name,
          url: link.url,
          linkId: link.linkId
        })),
        budget: data.budget,
        summary: currentProject.summary,
        teamIds: currentProject.teams.map((team) => team.teamId),
        workPackageProposedChanges: []
      }
    };

    await createCR(payload);

    handleClose();
  };

  return (
    <NERFormModal
      open={showModal}
      onHide={handleClose}
      formId="edit-project-budget-form"
      title="Edit Budget"
      reset={() => reset()}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      cancelText="Cancel"
      submitText="Create Change Request"
      showCloseButton
    >
      <Box display="flex" flexDirection={'column'} minWidth={400}>
        <FormControl fullWidth>
          <FormLabel sx={{ alignSelf: 'start' }}>Project</FormLabel>
          <Controller
            control={control}
            name={'project'}
            render={({ field: { onChange, value, onBlur, ref } }) => (
              <Select
                displayEmpty
                value={value !== undefined ? value : ''}
                onChange={onChange}
                onBlur={onBlur}
                inputRef={ref}
                error={!!errors.project}
                renderValue={(selected) => {
                  const selectedReason = projects.find((project) => project.id === selected);
                  return selectedReason ? (
                    selectedReason.name
                  ) : (
                    <Typography sx={{ color: 'gray' }}>Select project to allocate to</Typography>
                  );
                }}
                sx={{ height: 56, width: '100%', textAlign: 'left' }}
                fullWidth
                MenuProps={{
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'right'
                  },
                  transformOrigin: {
                    vertical: 'top',
                    horizontal: 'right'
                  }
                }}
              >
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
          <FormHelperText error>{errors.project?.message}</FormHelperText>
        </FormControl>

        <FormControl fullWidth>
          <FormLabel sx={{ alignSelf: 'start' }}>Account</FormLabel>
          <Controller
            control={control}
            name={'account'}
            render={({ field: { onChange, value } }) => (
              <Select
                displayEmpty
                value={value !== undefined ? value : ''}
                onChange={onChange}
                renderValue={(selected) => {
                  const code = indexCodes.find((c) => c.indexCodeId === selected);
                  return code ? code.name : <Typography sx={{ color: 'gray' }}>Select account</Typography>;
                }}
                sx={{ height: 56, width: '100%', textAlign: 'left' }}
                fullWidth
                MenuProps={{
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'right'
                  },
                  transformOrigin: {
                    vertical: 'top',
                    horizontal: 'right'
                  }
                }}
              >
                {indexCodes.map((code) => (
                  <MenuItem key={code.indexCodeId} value={code.indexCodeId}>
                    {code.name}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
          <FormHelperText error>{errors.account?.message}</FormHelperText>
        </FormControl>

        <FormControl>
          <FormLabel>Amount</FormLabel>
          <ReactHookTextField
            placeholder={'New Amount'}
            name="budget"
            type="number"
            control={control}
            sx={{ width: 1 }}
            startAdornment={<AttachMoneyIcon />}
            errorMessage={errors.budget}
          />
        </FormControl>
      </Box>
    </NERFormModal>
  );
};
