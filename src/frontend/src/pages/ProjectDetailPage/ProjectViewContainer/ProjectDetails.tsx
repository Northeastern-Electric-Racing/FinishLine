/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Construction, Work } from '@mui/icons-material';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { Folder, FormatListBulleted, FormatListNumbered, CoPresent } from '@mui/icons-material';
import Link from '@mui/material/Link';
import { Project, WorkPackage, wbsPipe } from 'shared';
import { datePipe, dollarsPipe, fullNamePipe, weeksPipe } from '../../../utils/pipes';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Box, useTheme } from '@mui/material';
import WorkPackageSummary from './WorkPackageSummary';

interface ProjectDetailsProps {
  project: Project;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project }) => {
  const theme = useTheme();
  return (
    <Box>
      <div style={{ display: 'flex', flexDirection: 'row', marginTop: '10px' }}>
        <Box width="50%" sx={{ paddingRight: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography
              variant="h5"
              sx={{
                cursor: 'pointer'
              }}
            >
              Details
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid style={{ display: 'flex', alignItems: 'center' }} item display="flex" xs={12} md={6} xl={4}>
              <Box width="50%" justifyContent="space-between" style={{ display: 'flex', alignItems: 'center' }}>
                <Construction />
                <Typography sx={{ fontWeight: 'bold' }} display="inline" textAlign={'right'}>
                  Project Lead:
                </Typography>
              </Box>
              <Box textAlign={'center'} width="50%">
                <Typography sx={{ fontWeight: 'normal', display: 'inline' }} textAlign={'center'}>
                  {fullNamePipe(project.projectLead)}
                </Typography>
              </Box>
            </Grid>

            <Grid display="flex" item xs={12} md={6} xl={4} style={{ display: 'flex', alignItems: 'center' }}>
              <Box width="50%" justifyContent="space-between" style={{ display: 'flex', alignItems: 'center' }}>
                <ScheduleIcon />
                <Typography sx={{ fontWeight: 'bold' }} display="inline" textAlign={'right'}>
                  Start Date:
                </Typography>
              </Box>
              <Box textAlign={'center'} width="50%">
                <Typography sx={{ fontWeight: 'normal', display: 'inline' }} textAlign={'center'}>
                  {datePipe(project.startDate) || 'n/a'}
                </Typography>
              </Box>
            </Grid>

            <Grid display="flex" item xs={12} md={6} xl={4} style={{ display: 'flex', alignItems: 'center' }}>
              <Box width="50%" justifyContent="space-between" style={{ display: 'flex', alignItems: 'center' }}>
                <ScheduleIcon />
                <Typography sx={{ fontWeight: 'bold' }} display="inline" textAlign={'center'}>
                  Duration:
                </Typography>
              </Box>
              <Box textAlign={'center'} width="50%">
                <Typography sx={{ fontWeight: 'normal', display: 'inline' }}>{weeksPipe(project.duration)}</Typography>
              </Box>
            </Grid>

            <Grid item display="flex" xs={12} md={6} xl={4} style={{ display: 'flex', alignItems: 'center' }}>
              <Box width="50%" justifyContent="space-between" style={{ display: 'flex', alignItems: 'center' }}>
                <Work />
                <Typography sx={{ fontWeight: 'bold' }} display="inline" textAlign={'right'}>
                  Project Manager:
                </Typography>
              </Box>
              <Box textAlign={'center'} width="50%">
                <Typography sx={{ fontWeight: 'normal', display: 'inline' }}>
                  {fullNamePipe(project.projectManager)}
                </Typography>
              </Box>
            </Grid>

            <Grid display="flex" item xs={12} md={6} xl={4} style={{ display: 'flex', alignItems: 'center' }}>
              <Box width="50%" justifyContent="space-between" style={{ display: 'flex', alignItems: 'center' }}>
                <ScheduleIcon />
                <Typography sx={{ fontWeight: 'bold' }} display="inline" textAlign={'center'}>
                  End Date:
                </Typography>
              </Box>
              <Box textAlign={'center'} width="50%">
                <Typography sx={{ fontWeight: 'normal', display: 'inline' }}>
                  {datePipe(project.endDate) || 'n/a'}
                </Typography>
              </Box>
            </Grid>

            <Grid display="flex" item xs={12} md={6} xl={4} style={{ display: 'flex', alignItems: 'center' }}>
              <Box width="50%" justifyContent="space-between" style={{ display: 'flex', alignItems: 'center' }}>
                <AttachMoneyIcon />
                <Typography sx={{ fontWeight: 'bold' }} display="inline" textAlign={'center'}>
                  Budget:
                </Typography>
              </Box>
              <Box textAlign={'center'} width="50%">
                <Typography sx={{ fontWeight: 'normal', display: 'inline' }} textAlign={'center'}>
                  {dollarsPipe(project.budget)}
                </Typography>
              </Box>
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
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography
                  variant="h5"
                  sx={{
                    cursor: 'pointer'
                  }}
                >
                  Links
                </Typography>
              </Box>
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
    </Box>
  );
};

export default ProjectDetails;
