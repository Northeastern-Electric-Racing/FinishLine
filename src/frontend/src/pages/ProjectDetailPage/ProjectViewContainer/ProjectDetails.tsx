/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Folder, FormatListBulleted, FormatListNumbered, CoPresent } from '@mui/icons-material';
import Link from '@mui/material/Link';
import { Project, WorkPackage, wbsPipe } from 'shared';
import { datePipe, dollarsPipe, fullNamePipe, weeksPipe } from '../../../utils/pipes';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import DetailDisplay from '../../../components/DetailDisplay';
import { Box, Card, CardContent, useTheme } from '@mui/material';
import WorkPackageSummary from './WorkPackageSummary';

interface ProjectDetailsProps {
  project: Project;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project }) => {
  const theme = useTheme();
  return (
    <Card sx={{ my: 2, background: theme.palette.background.paper }} variant="outlined">
      <CardContent>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <Box width="50%">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography
                variant="h5"
                sx={{
                  cursor: 'pointer'
                }}
              >
                Project Details
              </Typography>
            </Box>
            <Grid container spacing={1}>
              <Grid item sm={12} md={6}>
                <DetailDisplay label="Project Lead" content={fullNamePipe(project.projectLead)} paddingRight={2} />
              </Grid>

              <Grid item sm={12} md={6}>
                <DetailDisplay label="Start Date" content={datePipe(project.startDate) || 'n/a'} paddingRight={2} />
              </Grid>

              <Grid item sm={12} md={6}>
                <DetailDisplay label="Duration" content={weeksPipe(project.duration)} paddingRight={2} />
              </Grid>

              <Grid item sm={12} md={6}>
                <DetailDisplay label="Project Manager" content={fullNamePipe(project.projectManager)} paddingRight={2} />
              </Grid>

              <Grid item sm={12} md={6}>
                <DetailDisplay label="End Date" content={datePipe(project.endDate) || 'n/a'} paddingRight={2} />
              </Grid>
              <Grid item sm={12} md={6}>
                <DetailDisplay label="Budget" content={dollarsPipe(project.budget)} paddingRight={2} />
              </Grid>
              <Grid item xs={12}>
                <Typography sx={{ fontWeight: 'bold', paddingRight: 2, display: 'inline' }}>Links: </Typography>
              </Grid>
              <Grid item xs={6}>
                <Stack direction="row" alignItems="center">
                  <CoPresent sx={{ fontSize: 22, color: theme.palette.text.primary }} />
                  <Link href={project.slideDeckLink!} target="_blank" underline="always" fontSize={19} sx={{ pl: 1 }}>
                    Slide Deck
                  </Link>
                </Stack>
              </Grid>
              <Grid item xs={6}>
                <Stack direction="row" alignItems="center">
                  <FormatListBulleted sx={{ fontSize: 22, color: theme.palette.text.primary }} />
                  <Link href={project.taskListLink!} target="_blank" underline="always" fontSize={19} sx={{ pl: 1 }}>
                    Task List
                  </Link>
                </Stack>
              </Grid>
              <Grid item xs={6}>
                <Stack direction="row" alignItems="center">
                  <FormatListNumbered sx={{ fontSize: 22, color: theme.palette.text.primary }} />
                  <Link href={project.bomLink!} target="_blank" underline="always" fontSize={19} sx={{ pl: 1 }}>
                    BOM
                  </Link>
                </Stack>
              </Grid>
              <Grid item xs={6}>
                <Stack direction="row" alignItems="center">
                  <Folder sx={{ fontSize: 22, color: theme.palette.text.primary }} />
                  <Link href={project.gDriveLink!} target="_blank" underline="always" fontSize={19} sx={{ pl: 1 }}>
                    Google Drive
                  </Link>
                </Stack>
              </Grid>
            </Grid>
          </Box>
          <Box width="50%">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography
                variant="h5"
                sx={{
                  cursor: 'pointer'
                }}
              >
                Summary
              </Typography>
            </Box>
            {project.summary}
          </Box>
        </div>
        <Box sx={{ marginTop: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography
              variant="h5"
              sx={{
                cursor: 'pointer'
              }}
            >
              Work Packages
            </Typography>
          </Box>
          {project.workPackages.map((ele: WorkPackage) => (
            <div key={wbsPipe(ele.wbsNum)} className="mt-3">
              <WorkPackageSummary workPackage={ele} />
            </div>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProjectDetails;
