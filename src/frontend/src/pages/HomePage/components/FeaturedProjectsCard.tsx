import { alpha, Box, Card, CardContent, Chip, Stack, Typography, useTheme, useMediaQuery } from '@mui/material';
import { wbsNamePipe, ProjectPreview } from 'shared';
import { datePipe } from '../../../utils/pipes';

interface ProjectCardProps {
  project: ProjectPreview;
}

const FeaturedProjectsCard: React.FC<ProjectCardProps> = ({ project }) => {
  const theme = useTheme();
  const isMobilePortrait = useMediaQuery('(max-width:600px)');

  return (
    <Card
      variant="outlined"
      sx={{
        minWidth: 'fit-content',
        minHeight: 'fit-content',
        width: isMobilePortrait ? '100%' : 'auto',
        background: theme.palette.mode === 'dark' ? '#000000' : 'rgb(255, 255, 255)',
        borderRadius: 2
      }}
    >
      <CardContent sx={{ padding: 2 }}>
        <Stack direction="row" justifyContent="space-between">
          <Box>
            <Typography
              fontWeight={'regular'}
              variant="h5"
              sx={{ marginBottom: '0.3rem', fontSize: { xs: '1.15rem', sm: '1.5rem' } }}
            >
              {wbsNamePipe(project)}
            </Typography>
            <Typography fontWeight={'regular'} fontSize={{ xs: 14, sm: 16 }} noWrap>
              Budget: ${project.budget}
            </Typography>
            <Typography fontWeight={'regular'} fontSize={{ xs: 14, sm: 16 }} noWrap>
              {datePipe(project.startDate) + ' ⟝ ' + project.duration + ' wks ⟞ ' + datePipe(project.endDate)}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" sx={{ marginTop: 1 }}>
          {project.teams.map((team) => (
            <Chip
              sx={{
                marginTop: 1,
                marginRight: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.45),
                color: theme.palette.primary.light
              }}
              label={team.teamName}
              size="medium"
            />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default FeaturedProjectsCard;
