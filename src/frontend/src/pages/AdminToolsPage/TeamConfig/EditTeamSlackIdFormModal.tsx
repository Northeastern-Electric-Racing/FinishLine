import { useForm } from 'react-hook-form';
import NERFormModal from '../../../components/NERFormModal';
import { FormControl, FormLabel, FormHelperText } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { TeamPreview } from 'shared';
import { useEffect } from 'react';
import { useEditTeamSlackId } from '../../../hooks/teams.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useToast } from '../../../hooks/toasts.hooks';

interface EditTeamSlackIdFormModalProps {
  open: boolean;
  handleClose: () => void;
  team: TeamPreview;
}

const schema = yup.object().shape({
  slackId: yup.string().required('Slack id is required')
});

const EditTeamSlackIdFormModal: React.FC<EditTeamSlackIdFormModalProps> = ({ open, handleClose, team }) => {
  const { isLoading, mutateAsync } = useEditTeamSlackId(team.teamId);

  const toast = useToast();

  const onFormSubmit = async (data: { slackId: string }) => {
    try {
      await mutateAsync(data.slackId);
      toast.success('Slack id updated successfully!');
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
    handleClose();
  };

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      slackId: team.slackId
    }
  });

  useEffect(() => {
    reset({
      slackId: team.slackId
    });
  }, [team, reset]);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <NERFormModal
      open={open}
      onHide={handleClose}
      title={`${team.teamName} Slack ID`}
      reset={() => reset({ slackId: team.slackId })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      formId="team-slackId-form"
      showCloseButton
    >
      <FormControl>
        <FormLabel>Slack ID</FormLabel>
        <ReactHookTextField name="slackId" control={control} sx={{ width: 1 }} />
        <FormHelperText error>{errors.slackId?.message}</FormHelperText>
      </FormControl>
    </NERFormModal>
  );
};

export default EditTeamSlackIdFormModal;
