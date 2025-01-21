/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Grid } from '@mui/material';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { useForm } from 'react-hook-form';
import { UserSettings } from 'shared';
import ExternalLink from '../../../components/ExternalLink';
import LoadingIndicator from '../../../components/LoadingIndicator';
import NERSuccessButton from '../../../components/NERSuccessButton';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { useToast } from '../../../hooks/toasts.hooks';
import { useUpdateUserSettings } from '../../../hooks/users.hooks';
import ErrorPage from '../../ErrorPage';

interface SetUserPreferencesProps {
  userSettings: UserSettings;
}

const SetUserPreferences: React.FC<SetUserPreferencesProps> = ({ userSettings }) => {
  const toast = useToast();
  const { mutateAsync, isLoading, isError, error } = useUpdateUserSettings();
  const { handleSubmit, control } = useForm<{ slackId: string }>({
    defaultValues: { slackId: userSettings.slackId }
  });

  if (isLoading) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

  const onSubmit = async ({ slackId }: { slackId: string }) => {
    try {
      await mutateAsync({ ...userSettings, slackId });
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <Card sx={{ marginX: 'auto', maxWidth: '25em', marginTop: 5 }}>
      <CardContent>
        <Typography variant="h5">FinishLine by NER</Typography>
        <Typography variant="body1" sx={{ my: 1 }}>
          Slack Id is required. Please set it below.
        </Typography>
        <Box sx={{ ml: -1 }}>
          <ExternalLink
            link="https://www.workast.com/help/article/how-to-find-a-slack-user-id/"
            description="(How to find your Slack ID)"
          />
        </Box>
        <form id="set-slack-id" onSubmit={handleSubmit(onSubmit)}>
          <Grid container display="flex" alignItems="center">
            <ReactHookTextField name="slackId" control={control} />
            <NERSuccessButton sx={{ ml: 2 }} type="submit" form="set-slack-id">
              Save
            </NERSuccessButton>
          </Grid>
        </form>
      </CardContent>
      <CardActions>
        <Typography variant="caption">
          By using this app, you consent to FinishLine sending you Slack messages on the NER Slack.
        </Typography>
      </CardActions>
    </Card>
  );
};

export default SetUserPreferences;
