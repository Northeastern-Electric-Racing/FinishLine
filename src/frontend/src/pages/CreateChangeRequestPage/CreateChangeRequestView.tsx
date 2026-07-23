/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { ProjectPreview, WbsElementPreview, wbsNamePipe, wbsPipe } from 'shared';
import { routes } from '../../utils/routes';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { FormControl, FormLabel } from '@mui/material';
import ReactHookTextField from '../../components/ReactHookTextField';
import NERAutocomplete from '../../components/NERAutocomplete';
import { useAllProjects } from '../../hooks/projects.hooks';
import { useAllMembers } from '../../hooks/users.hooks';
import { userToAutocompleteOption } from '../../utils/teams.utils';
import ErrorPage from '../ErrorPage';
import LoadingIndicator from '../../components/LoadingIndicator';
import NERFailButton from '../../components/NERFailButton';
import NERSuccessButton from '../../components/NERSuccessButton';
import PageLayout from '../../components/PageLayout';
import { wbsNumComparator } from 'shared';
import { UseFormRegister, UseFormHandleSubmit, UseFormWatch, UseFormSetValue, FormState, Control } from 'react-hook-form';

export interface FormInput {
  why: string;
  requestedReviewerId?: string;
}

export interface ChangeRequestFormReturn {
  register: UseFormRegister<FormInput>;
  handleSubmit: UseFormHandleSubmit<FormInput, FormInput>;
  control: Control<FormInput, any, FormInput>;
  watch: UseFormWatch<FormInput>;
  formState: FormState<FormInput>;
  setValue: UseFormSetValue<FormInput>;
}

interface CreateChangeRequestViewProps {
  wbsNum: string;
  setWbsNum: (val: string) => void;
  onSubmit: (data: FormInput) => Promise<void>;
  handleCancel: () => void;
  modalView?: boolean;
  changeRequestFormReturn: ChangeRequestFormReturn;
}

const CreateChangeRequestsView: React.FC<CreateChangeRequestViewProps> = ({
  wbsNum,
  setWbsNum,
  onSubmit,
  handleCancel,
  modalView = false,
  changeRequestFormReturn
}) => {
  const {
    handleSubmit,
    control,
    formState: { errors }
  } = changeRequestFormReturn;

  const { isLoading, isError, error, data: projects } = useAllProjects();
  const { isLoading: membersIsLoading, isError: membersIsError, error: membersError, data: members } = useAllMembers();

  if (isError) return <ErrorPage message={error?.message} />;
  if (membersIsError) return <ErrorPage message={membersError?.message} />;
  if (isLoading || !projects || membersIsLoading || !members) return <LoadingIndicator />;

  const memberOptions = members.map(userToAutocompleteOption);

  const wbsDropdownOptions: { label: string; id: string }[] = [];

  projects.forEach((project: ProjectPreview) => {
    wbsDropdownOptions.push({
      label: `${wbsNamePipe(project)}`,
      id: wbsPipe(project.wbsNum)
    });
    project.workPackages.forEach((workPackage: WbsElementPreview) => {
      wbsDropdownOptions.push({
        label: `${wbsNamePipe({
          wbsNum: workPackage.wbsNum,
          name: workPackage.name,
          projectName: project.name
        })}`,
        id: wbsPipe(workPackage.wbsNum)
      });
    });
  });

  wbsDropdownOptions.sort((wbsNum1, wbsNum2) => wbsNumComparator(wbsNum1.id, wbsNum2.id));

  const wbsAutocompleteOnChange = (
    _event: React.SyntheticEvent<Element, Event>,
    value: { label: string; id: string } | null
  ) => {
    if (value) {
      setWbsNum(value.id);
    } else {
      setWbsNum('');
    }
  };

  return (
    <form
      id={'create-standard-change-request-form'}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleSubmit(onSubmit)(e);
      }}
      onKeyPress={(e) => {
        e.key === 'Enter' && e.preventDefault();
      }}
    >
      <PageLayout
        stickyHeader
        title="New Change Request"
        previousPages={[{ name: 'Change Requests', route: routes.CHANGE_REQUESTS }]}
        headerRight={
          <Box textAlign="right" sx={{ mb: 2 }}>
            {!modalView && (
              <NERFailButton variant="contained" onClick={handleCancel} sx={{ mx: 1, width: 90 }}>
                Cancel
              </NERFailButton>
            )}
            <NERSuccessButton variant="contained" type="submit" sx={{ mx: 1, mt: { xs: 1, md: 0 } }}>
              {'Submit'}
            </NERSuccessButton>
          </Box>
        }
      >
        <Grid container spacing={2}>
          <Grid container item spacing={2} xs={12} md={modalView ? 12 : 6} height="fit-content">
            {!modalView && (
              <Grid item xs={12}>
                <FormLabel>WBS</FormLabel>
                <NERAutocomplete
                  id="wbs-autocomplete"
                  onChange={wbsAutocompleteOnChange}
                  options={wbsDropdownOptions}
                  size="small"
                  placeholder="Select a project or work package"
                  value={wbsDropdownOptions.find((element) => element.id === wbsNum) || null}
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <FormLabel required>Why are you making this change?</FormLabel>
                <ReactHookTextField
                  name="why"
                  control={control}
                  multiline
                  rows={4}
                  errorMessage={errors.why}
                  placeholder="Explain the reason for this change *"
                  rules={{ required: 'This field is required' }}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormLabel>Requested Reviewer (optional)</FormLabel>
              <NERAutocomplete
                id="requested-reviewer-autocomplete"
                onChange={(_event, value) => {
                  changeRequestFormReturn.setValue('requestedReviewerId', value?.id ?? undefined);
                }}
                options={memberOptions}
                size="small"
                placeholder="Select a reviewer"
                value={memberOptions.find((m) => m.id === changeRequestFormReturn.watch('requestedReviewerId')) ?? null}
                required={false}
              />
            </Grid>
          </Grid>
        </Grid>
      </PageLayout>
    </form>
  );
};

export default CreateChangeRequestsView;
