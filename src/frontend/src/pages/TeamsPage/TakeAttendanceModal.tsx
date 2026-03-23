import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { useToast } from '../../hooks/toasts.hooks';
import * as yup from 'yup';
import NERFormModal from '../../components/NERFormModal';
import { Alert, Box, CircularProgress, FormControl, FormLabel, TextField, Typography } from '@mui/material';
import { useCheckChannelName, useTakeAttendance } from '../../hooks/attendance.hooks';

interface TakeAttendanceInputs {
  message: string;
}

interface TakeAttendanceModalProps {
  teamId: string;
  teamName: string;
  showModal: boolean;
  onHide: () => void;
}

const TakeAttendanceModal: React.FC<TakeAttendanceModalProps> = ({ teamId, teamName, showModal, onHide }) => {
  const toast = useToast();
  const { mutateAsync: takeAttendance } = useTakeAttendance();
  const { data: channelData, isLoading: channelLoading } = useCheckChannelName(teamId, showModal);

  const schema = yup.object().shape({
    message: yup.string().required('Message is required')
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { isValid }
  } = useForm<TakeAttendanceInputs>({
    resolver: yupResolver(schema),
    defaultValues: {
      message: `Please react to this message to confirm your attendance at today's ${teamName} meeting!`
    }
  });

  const handleConfirm = async ({ message }: TakeAttendanceInputs) => {
    try {
      await takeAttendance({ teamId, message });
      onHide();
      toast.success('Attendance session started!');
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  const channelValid = channelData?.valid;
  const channelName = channelData?.channelName;

  return (
    <NERFormModal
      open={showModal}
      onHide={onHide}
      title="Take Attendance"
      reset={reset}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={handleConfirm}
      formId="take-attendance"
      submitText="Send"
      disabled={!isValid || channelLoading || !channelValid}
      showCloseButton
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 400 }}>
        {channelLoading ? (
          <Box display="flex" alignItems="center" gap={1}>
            <CircularProgress size={16} />
            <Typography variant="body2">Checking Slack channel...</Typography>
          </Box>
        ) : channelValid ? (
          <Alert severity="info">
            This will send a message in <strong>#{channelName}</strong>
          </Alert>
        ) : (
          <Alert severity="warning">
            The Slack ID for this team is invalid or the bot is not in the channel. Please update it in Admin Tools &gt;
            Miscellaneous and add the FinishLine bot to the channel.
          </Alert>
        )}
        <FormControl fullWidth>
          <FormLabel>Message</FormLabel>
          <Controller
            name="message"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                multiline
                rows={4}
                error={!!error}
                helperText={error?.message}
                placeholder="Enter the attendance message to send to Slack"
              />
            )}
          />
        </FormControl>
      </Box>
    </NERFormModal>
  );
};

export default TakeAttendanceModal;
