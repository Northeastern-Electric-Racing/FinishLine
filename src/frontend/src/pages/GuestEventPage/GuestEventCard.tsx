import { alpha, Box, Card, CardContent, Chip, Stack, Typography, useTheme } from '@mui/material';
import { EventInstance, formatEventDate, formatEventTime } from 'shared';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';

interface GuestEventCardProps {
  event: EventInstance;
}

const GuestEventCard: React.FC<GuestEventCardProps> = ({ event }) => {
  const theme = useTheme();

  const displayDate = new Date(event.startTime);
  const formattedDate = formatEventDate(displayDate);
  const formattedTime = formatEventTime(displayDate);

  const wbsLabels = event.workPackages.map(
    (wp) =>
      `${wp.wbsElement.carNumber}.${wp.wbsElement.projectNumber}.${wp.wbsElement.workPackageNumber} - ${wp.wbsElement.name}`
  );

  const title = wbsLabels.length > 0 ? wbsLabels[0] : event.title;
  const extraWbs = wbsLabels.slice(1);

  return (
    <Card
      variant="outlined"
      sx={{
        width: '100%',
        background: theme.palette.background.paper,
        borderRadius: 2
      }}
    >
      <CardContent>
        <Stack gap={1}>
          <Box>
            <Typography fontWeight="bold" variant="h6" sx={{ wordBreak: 'break-word' }}>
              {title}
            </Typography>
            {extraWbs.map((label) => (
              <Typography key={label} variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                {label}
              </Typography>
            ))}
          </Box>

          <Stack direction="row" flexWrap="wrap" gap={1}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <ScheduleOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary', flexShrink: 0 }} />
              <Typography variant="body2" color="text.secondary" noWrap>
                {formattedDate} @ {formattedTime}
              </Typography>
            </Stack>
          </Stack>

          {event.teams.length > 0 && (
            <Stack direction="row" flexWrap="wrap" gap={0.5}>
              {event.teams.map((team) => (
                <Chip
                  key={team.teamId}
                  label={team.teamName}
                  size="small"
                  variant="filled"
                  sx={{ bgcolor: alpha(theme.palette.primary.main, 0.45), color: theme.palette.primary.light }}
                />
              ))}
            </Stack>
          )}

          {event.description && (
            <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
              {event.description}
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default GuestEventCard;
