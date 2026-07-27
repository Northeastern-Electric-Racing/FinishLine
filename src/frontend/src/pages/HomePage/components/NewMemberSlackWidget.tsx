import { Box, Typography, useTheme } from '@mui/material';
import { SlackMessagePreview } from 'shared';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useCurrentOrganization, useNewMemberSlackMessages } from '../../../hooks/organizations.hooks';

const MessageBlock: React.FC<{ message: SlackMessagePreview }> = ({ message }) => {
  const theme = useTheme();

  return (
    <Box
      component="a"
      href={message.permalink}
      target="_blank"
      rel="noopener noreferrer"
      sx={{
        display: 'block',
        p: 1,
        borderRadius: '8px',
        textDecoration: 'none',
        color: 'inherit',
        '&:hover': { backgroundColor: theme.palette.action.hover }
      }}
    >
      <Typography variant="body2" fontWeight="bold">
        {message.userName || 'Someone'}
      </Typography>
      <Typography variant="body2" color="text.secondary" noWrap>
        {message.text}
      </Typography>
    </Box>
  );
};

const NewMemberSlackWidget: React.FC = () => {
  const theme = useTheme();
  const { data: messages, isLoading, isError, error } = useNewMemberSlackMessages();
  // decorative only -- if this hasn't loaded yet, just fall back to a generic title
  const { data: organization } = useCurrentOrganization();

  const widgetTitle = organization?.newMemberSlackChannelName
    ? `#${organization.newMemberSlackChannelName} on Slack`
    : 'New Member Slack';

  const cardSx = {
    backgroundColor: theme.palette.background.paper,
    borderRadius: '10px',
    width: '100%',
    overflow: 'hidden',
    paddingBottom: 2,
    minHeight: '150px'
  };

  const fallback = (text: string, errorDetail?: string) => (
    <Box sx={cardSx}>
      <Typography variant="h5" sx={{ mb: 1, px: 2, pt: 2 }}>
        {widgetTitle}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 2, textAlign: 'center' }} title={errorDetail}>
        {text}
      </Typography>
    </Box>
  );

  if (isError) return fallback("Couldn't load Slack messages right now", error?.message);

  if (isLoading || !messages) return <LoadingIndicator />;

  if (messages.length === 0) return fallback('No messages yet');

  return (
    <Box sx={cardSx}>
      <Typography variant="h5" sx={{ mb: 1, px: 2, pt: 2 }}>
        {widgetTitle}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, px: 1 }}>
        {messages.map((message) => (
          <MessageBlock key={message.permalink} message={message} />
        ))}
      </Box>
    </Box>
  );
};

export default NewMemberSlackWidget;
