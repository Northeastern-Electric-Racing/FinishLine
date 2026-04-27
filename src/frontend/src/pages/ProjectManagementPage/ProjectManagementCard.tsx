import { Box, Card, CardContent, Icon, Link, Typography, useTheme } from '@mui/material';
import { GuestDefinition } from 'shared';
import { NERButton } from '../../components/NERButton';
import { Link as RouterLink } from 'react-router-dom';

interface ProjectManagementCardProps {
  definition: GuestDefinition;
}

const ProjectManagementCard: React.FC<ProjectManagementCardProps> = ({ definition }) => {
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
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          {definition.icon && <Icon>{definition.icon}</Icon>}
          <Typography variant="h6" fontWeight="regular">
            {definition.term}
          </Typography>
        </Box>
        <Typography fontSize={14} color="text.secondary" sx={{ flexGrow: 1 }}>
          {definition.description}
        </Typography>
        {definition.buttonText && definition.buttonLink && (
          <Link component={RouterLink} to={definition.buttonLink} sx={{ width: '100%', textDecoration: 'none' }}>
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
              {definition.buttonText}
            </NERButton>
          </Link>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectManagementCard;
