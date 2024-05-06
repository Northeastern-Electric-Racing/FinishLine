import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { useToast } from '../../hooks/toasts.hooks';
import * as yup from 'yup';
import { useDeleteTeam, useSetTeamType, useSingleTeam } from '../../hooks/teams.hooks';
import { useHistory } from 'react-router-dom';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import NERFormModal from '../../components/NERFormModal';
import { Typography, FormControl, FormLabel, Select, MenuItem } from '@mui/material';
import ReactHookTextField from '../../components/ReactHookTextField';
import { useAllTeamTypes } from '../../hooks/design-reviews.hooks';
import { isTemplateMiddleOrTemplateTail } from 'typescript';

interface SetTeamTypeInputs {
  teamId: string;
}

interface SetTeamTypeModelProps {
  teamId: string;
  showModal: boolean;
  onHide: () => void;
}

const { data: teamTypeOptions } = useAllTeamTypes();

const SetTeamTypeModal: React.FC<SetTeamTypeModelProps> = ({ teamId, showModal, onHide }: SetTeamTypeModelProps) => {
  const { data: team, isLoading: teamIsLoading, isError: teamIsError, error: teamError } = useSingleTeam(teamId);
  const { isLoading: deleteIsLoading, isError: deleteIsError, error: deleteError, mutateAsync } = useSetTeamType(teamId);
  const toast = useToast();
  const teamNameTester = (teamName: string | undefined) =>
    team !== undefined && teamName !== undefined && teamName.toLowerCase() === team.teamName.toLowerCase();
  const schema = yup.object().shape({
    teamName: yup.string().required().test('team-name-test', 'Team name does not match', teamNameTester)
  });
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isValid }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      teamType: ''
    },
    mode: 'onChange'
  });
  const history = useHistory();

  const handleConfirm = async ({ teamId }: SetTeamTypeInputs) => {
      try {
        await mutateAsync(teamId);
        onHide();
        history.goBack();
        toast.success('Team type set successfully!');
      } catch (e) {
        if (e instanceof Error) {
          toast.error(e.message);
        }
      }
  };

  if (!team || teamIsLoading || deleteIsLoading) return <LoadingIndicator />;
  if (teamIsError) return <ErrorPage message={teamError.message} />;
  if (deleteIsError) return <ErrorPage message={deleteError?.message} />;

  return (
    <NERFormModal
      open={showModal}
      onHide={onHide}
      title={'Set Team Type'}
      reset={() => reset({ teamType: '' })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={handleConfirm}
      formId="set-team-type"
      submitText="Submit"
      disabled={!isValid}
      showCloseButton
    >
      <FormControl fullWidth>
        <FormLabel>Team Type</FormLabel>
        <Controller
          name="teamType"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Select value={value} onChange={(event) => onChange(event.target.value)}>
              {teamTypeOptions
                ?.filter((teamType) => teamType.name)
                .map((teamType) => (
                  <MenuItem key={teamType.teamTypeId} value={teamType.name}>
                    {teamType.name}
                  </MenuItem>
                ))}
            </Select>
          )}
        />
      </FormControl>
    </NERFormModal>
  );
};

export default SetTeamTypeModal;
