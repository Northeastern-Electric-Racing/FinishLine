import { Box, Card, CardContent, Stack, Typography, useTheme, Link } from '@mui/material';
import { TeamPreview } from 'shared';
import { NERButton } from '../../components/NERButton';
import { Link as RouterLink } from 'react-router-dom';

interface GuestSubteamCardProps {
  team: TeamPreview;
}

const GuestSubteamCard: React.FC<GuestSubteamCardProps> = ({ team }) => {
  const theme = useTheme();

  return (
    <Card
      variant="outlined"
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: theme.palette.background.paper,
        borderRadius: 2
      }}
    >
      <CardContent sx={{ padding: 2, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <Stack direction="row" justifyContent="space-between">
          <Box width={'100%'}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography
                fontWeight={'regular'}
                variant="h5"
                sx={{ marginBottom: '0.2rem', fontSize: { xs: '1.15rem', sm: '1.5rem' }, flexGrow: 1 }}
              >
                {team.teamName}
              </Typography>
            </Box>
            <Typography fontSize={12} color="text.secondary" sx={{ marginBottom: 1 }}>
              Project Lead:{' '}
              {team.head?.firstName && team.head?.lastName ? `${team.head.firstName} ${team.head.lastName}` : 'N/A'}
              {' • '}
              {team.leads.length} {team.leads.length === 1 ? 'lead' : 'leads'}
              {' • '}
              {team.members.length} {team.members.length === 1 ? 'member' : 'members'}
            </Typography>
          </Box>
        </Stack>
        <Typography
          sx={{
            fontSize: 15,
            lineHeight: 1.4,
            flexGrow: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical'
          }}
        >
          {team.description}
        </Typography>
        <Link component={RouterLink} to={`/teams/${team.teamId}`} sx={{ width: '100%', textDecoration: 'none' }}>
          <NERButton
            fullWidth
            sx={{
              marginTop: 2,
              backgroundColor: theme.palette.error.main,
              color: theme.palette.error.contrastText,
              '&:hover': {
                backgroundColor: theme.palette.error.dark
              }
            }}
          >
            Learn more
          </NERButton>
        </Link>
      </CardContent>
    </Card>
  );
};

export default GuestSubteamCard;
