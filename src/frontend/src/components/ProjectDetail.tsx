import { Card, CardContent, Link, Typography } from '@mui/material';
import { Project, wbsPipe } from 'shared';
import DescriptionIcon from '@mui/icons-material/Description';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { Box } from '@mui/material';

interface ProjectDetailProps {
  project: Project;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5">
          {wbsPipe(project.wbsNum)} {project.name}
        </Typography>

        <section>
          <Box display="flex">
            <ScheduleIcon />
            <div>{project.duration}</div>
          </Box>
          <Box display="flex">
            <AttachMoneyIcon /> <div>{project.budget}</div>
          </Box>
        </section>

        <Box display="flex">
          <DescriptionIcon />
          <Link href={project.gDriveLink} target="_blank" underline="hover">
            Link
          </Link>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProjectDetail;
