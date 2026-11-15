/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Box from '@mui/material/Box';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { Link as RouterLink } from 'react-router-dom';
import { calculateEndDate, ProjectDetailWorkPackage } from 'shared';
import { weeksPipe, wbsPipe, datePipe } from '../../../utils/pipes';
import { routes } from '../../../utils/routes';
import WbsStatus from '../../../components/WbsStatus';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material';
import DetailDisplay from '../../../components/DetailDisplay';
import WorkPackageStageChip from '../../../components/WorkPackageStageChip';

interface WorkPackageSummaryProps {
  workPackage: ProjectDetailWorkPackage;
}

const WorkPackageSummary: React.FC<WorkPackageSummaryProps> = ({ workPackage }) => {
  const theme = useTheme();
  // blockers come back named with the project, so there's nothing to fetch per work package
  const dependencies = workPackage.blockedBy;

  const numMoreDescriptionBullets = workPackage.descriptionBullets.length - 3;
  const descriptionBulletList = (
    <ul>
      {workPackage.descriptionBullets.slice(0, 3).map((item, idx) => (
        <li key={idx}>
          <Typography>{item.detail}</Typography>
        </li>
      ))}
    </ul>
  );

  const DependencyList = () => (
    <Box sx={{ fontWeight: 'normal', display: 'inline' }}>
      {dependencies.map((blocker, idx) => (
        <Typography display="inline" key={idx}>
          <Link component={RouterLink} fontWeight="bold" to={`${routes.PROJECTS}/${wbsPipe(blocker.wbsNum)}`}>
            {`${wbsPipe(blocker.wbsNum)} - ${blocker.name}`}
          </Link>
          {idx !== dependencies.length - 1 ? ', ' : ''}
        </Typography>
      ))}
    </Box>
  );

  return (
    <Accordion sx={{ border: '1px solid ' + theme.palette.divider, background: theme.palette.background.default }}>
      <AccordionSummary
        id={`${wbsPipe(workPackage.wbsNum)}-summary-header`}
        aria-controls={`${wbsPipe(workPackage.wbsNum)}-summary-content`}
      >
        <Typography>{wbsPipe(workPackage.wbsNum)}</Typography>
        <Box flexGrow={1} paddingLeft={2}>
          <Link component={RouterLink} to={`${routes.PROJECTS}/${wbsPipe(workPackage.wbsNum)}`}>
            <Typography variant="body1">{workPackage.name}</Typography>
          </Link>
        </Box>
        {workPackage.stage ? <WorkPackageStageChip stage={workPackage.stage} /> : null}
        <WbsStatus status={workPackage.status} />
        <Typography paddingLeft={2}>{weeksPipe(workPackage.duration)}</Typography>
      </AccordionSummary>

      <AccordionDetails>
        <Box flexGrow={1}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box display="flex" flexDirection="row" flexGrow={0.5}>
                <Box display="flex" flexDirection="row" paddingRight={2}>
                  <DetailDisplay label="Start Date" content={datePipe(workPackage.startDate)} paddingRight={1} />
                </Box>
                <Box display="flex" flexDirection="row">
                  <DetailDisplay
                    label="End Date"
                    content={datePipe(calculateEndDate(workPackage.startDate, workPackage.duration))}
                    paddingRight={1}
                  />
                </Box>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Typography fontWeight="bold" paddingRight={1} display="inline">
                {'Blocked By: '}
              </Typography>
              <DependencyList></DependencyList>
            </Grid>
            <Grid item xs={6}>
              <Typography fontWeight="bold">Expected Activities:</Typography>
              {descriptionBulletList}
              {numMoreDescriptionBullets > 0 && (
                <Link component={RouterLink} to={`${routes.PROJECTS}/${wbsPipe(workPackage.wbsNum)}`}>
                  Show {numMoreDescriptionBullets} more...
                </Link>
              )}
            </Grid>
          </Grid>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default WorkPackageSummary;
