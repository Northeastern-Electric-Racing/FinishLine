import { Box, Card, CardContent, Stack, Typography, useTheme, Link } from '@mui/material';
import { TeamType } from 'shared';
import { NERButton } from '../../components/NERButton';
import { Link as RouterLink } from 'react-router-dom';
import NERMarkdown from '../../components/NERMarkdown';

interface GuestTeamCardProps {
  teamType: TeamType;
}

const GuestTeamCard: React.FC<GuestTeamCardProps> = ({ teamType }) => {
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
                {teamType.name}
              </Typography>
            </Box>
          </Box>
        </Stack>
        <NERMarkdown markdown={teamType.description} />
        <Link component={RouterLink} to={`/teams/${teamType.teamTypeId}`} sx={{ width: '100%', textDecoration: 'none' }}>
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

export default GuestTeamCard;
