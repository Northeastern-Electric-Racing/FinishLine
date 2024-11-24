import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { useToast } from '../../hooks/toasts.hooks';
import * as yup from 'yup';
import { useSingleTeam } from '../../hooks/teams.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import NERFormModal from '../../components/NERFormModal';
import { FormControl, FormLabel, Select, MenuItem } from '@mui/material';
import { useAllTeamTypes, useSetTeamType } from '../../hooks/team-types.hooks';

interface SetTeamTypeInputs {
  teamId: string;
  teamType: string;
}

interface SetTeamTypeModelProps {
  teamId: string;
  showModal: boolean;
  onHide: () => void;
}

const SetTeamTypeModal: React.FC<SetTeamTypeModelProps> = ({ teamId, showModal, onHide }: SetTeamTypeModelProps) => {
  const { data: team, isLoading: teamIsLoading, isError: teamIsError, error: teamError } = useSingleTeam(teamId);
  const { isLoading, isError: deleteIsError, error: deleteError, mutateAsync } = useSetTeamType(teamId);
  const { data: teamTypeOptions } = useAllTeamTypes();
  const toast = useToast();
  const schema = yup.object().shape({
    teamType: yup.string().required()
  });
  const {
    handleSubmit,
    control,
    reset,
    formState: { isValid }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      teamType: team && team.teamType?.teamTypeId ? team.teamType.teamTypeId : ''
    }
  });

  const handleConfirm = async ({ teamType }: SetTeamTypeInputs) => {
    try {
      await mutateAsync(teamType);
      onHide();
      toast.success('Team type set successfully!');
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  if (!team || teamIsLoading || isLoading) return <LoadingIndicator />;
  if (teamIsError) return <ErrorPage message={teamError.message} />;
  if (deleteIsError) return <ErrorPage message={deleteError?.message} />;

  return (
    <NERFormModal
      open={showModal}
      onHide={onHide}
      title={'Set Team Type'}
      reset={() => reset}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={handleConfirm}
      formId="set-team-type"
      submitText="Submit"
      disabled={!isValid || isLoading}
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
                  <MenuItem key={teamType.teamTypeId} value={teamType.teamTypeId}>
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
