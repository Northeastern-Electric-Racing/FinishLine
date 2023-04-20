import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DescriptionIcon from '@mui/icons-material/Description';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { Box, Card, CardContent, Link, Typography } from '@mui/material';
import { Project, wbsPipe } from 'shared';

interface ProjectDetailProps {
  project: Project;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project }) => {
  const containsWorkPackages = project.workPackages.length > 0;

  return (
    <Card>
      <CardContent>
        <Link href={`/projects/${wbsPipe(project.wbsNum)}`}>
          <Typography variant="h5">
            {wbsPipe(project.wbsNum)} {project.name}
          </Typography>
        </Link>

        <Box sx={{ marginTop: '0.5rem' }}>
          <Box display="flex" sx={{ marginTop: 0.5 }}>
            <ScheduleIcon sx={{ marginRight: 0.5 }} />
            <div>{project.duration}</div>
          </Box>
          <Box display="flex" sx={{ marginTop: 0.5 }}>
            <AttachMoneyIcon sx={{ marginRight: 0.5 }} /> <div>{project.budget}</div>
          </Box>
          <Box display="flex" sx={{ marginTop: 0.5 }}>
            <DescriptionIcon sx={{ marginRight: 0.5 }} />
            <Link href={project.gDriveLink} target="_blank" underline="hover">
              Link
            </Link>
          </Box>
        </Box>

        {containsWorkPackages && (
          <Box sx={{ marginTop: 1 }}>
            <Typography variant="h6">Active Work Package:</Typography>

            {project.workPackages.map((workPackage) => {
              return (
                <Box sx={{ marginTop: 0.5 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Link>
                      {wbsPipe(workPackage.wbsNum)} - {workPackage.name}
                    </Link>
                    <Box
                      sx={{
                        backgroundColor: 'primary.main',
                        paddingX: 1,
                        paddingY: 0.15,
                        borderRadius: 3,
                        // Align center vertically and horizontally
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Typography fontSize={8}>Active</Typography>
                    </Box>
                  </Box>
                  <Box display="flex">
                    <Box display="flex">
                      <ScheduleIcon sx={{ marginRight: 0.5 }} /> <div>{workPackage.duration}</div>
                    </Box>
                    <Box sx={{ marginLeft: 1 }} display="flex">
                      <AttachMoneyIcon sx={{ marginRight: 0.5 }} /> <div>{0}</div>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectDetail;
