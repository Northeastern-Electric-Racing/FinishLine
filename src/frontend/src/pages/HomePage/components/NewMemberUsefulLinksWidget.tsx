import { Box, Button, Grid, Typography, useTheme } from '@mui/material';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useAllUsefulLinks } from '../../../hooks/projects.hooks';

interface NewMemberUsefulLinksWidgetProps {
  dashboardFlag?: 'isOnNewMemberDashboard' | 'isOnOnboardingDashboard';
}

const NewMemberUsefulLinksWidget: React.FC<NewMemberUsefulLinksWidgetProps> = ({
  dashboardFlag = 'isOnNewMemberDashboard'
}) => {
  const theme = useTheme();
  const { data: usefulLinks, isLoading, isError, error } = useAllUsefulLinks();

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading || !usefulLinks) return <LoadingIndicator />;

  const links = usefulLinks.filter((link) => link.linkType[dashboardFlag]);

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.paper,
        borderRadius: '10px',
        width: '100%',
        overflow: 'hidden',
        overflowY: 'auto',
        paddingBottom: 2,
        minHeight: '150px'
      }}
    >
      <Typography variant="h5" sx={{ mb: 2, px: 2, pt: 2 }}>
        Useful Links
      </Typography>
      {links.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 2, textAlign: 'center' }}>
          No useful links yet
        </Typography>
      ) : (
        <Grid container spacing={2} justifyContent="center" sx={{ px: 2 }}>
          {links.map((link) => (
            <Grid item xs={6} key={link.linkId}>
              <Button
                variant="contained"
                fullWidth
                sx={{
                  backgroundColor: '#616161',
                  color: 'white',
                  borderRadius: '10px',
                  padding: 2.5,
                  '&:hover': { backgroundColor: '#ef4345' }
                }}
                href={link.url}
                target="_blank"
              >
                {link.linkType.name}
              </Button>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default NewMemberUsefulLinksWidget;
